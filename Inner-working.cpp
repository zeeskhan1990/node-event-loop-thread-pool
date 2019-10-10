/*
This function runs the event loop. It will act differently depending on the specified mode:
UV_RUN_DEFAULT: Runs the event loop until there are no more active and referenced handles or requests. Returns non-zero if uv_stop() was called and there are still active handles or requests. Returns zero in all other cases.
UV_RUN_ONCE: Poll for i/o once. Note that this function blocks if there are no pending callbacks. Returns zero when done (no active handles or requests left), or non-zero if more callbacks are expected (meaning you should run the event loop again sometime in the future).
UV_RUN_NOWAIT: Poll for i/o once but don’t block if there are no pending callbacks. Returns zero if done (no active handles or requests left), or non-zero if more callbacks are expected (meaning you should run the event loop again sometime in the future).
uv_run() is not reentrant. It must not be called from a callback.
*/

/* 
Check whether there are any referenced handlers [pending callbacks, idle/prepare handler, check handler, close handler]
to be invoked, or any active operations pending
 */
r = uv__loop_alive(loop);
  if (!r)
    uv__update_time(loop);

while (r != 0 && loop->stop_flag == 0) {
    /*
    This will send a system call to get the current time and update the loop time 
    (This is used to identify expired timers).
    */
    uv__update_time(loop);

    /*Run all expired timers*/
    uv__run_timers(loop);
    
    /*Run all pending I/O callbacks.
    Pending callbacks are called. All I/O callbacks are called right after polling for I/O,
    for the most part. There are cases, however, in which calling such a 
    callback is deferred for the next loop iteration. 
    If the previous iteration deferred any I/O callback it will be run at this point.
    If the pending_queue is empty, this function will return 0 .
    Otherwise, all callbacks in pending_queue will be executed, and the function will return 1.
    */
    ran_pending = uv__run_pending(loop);


    uv__run_idle(loop);
    uv__run_prepare(loop);

    timeout = 0;
    if ((mode == UV_RUN_ONCE && !ran_pending) || mode == UV_RUN_DEFAULT)
      timeout = uv_backend_timeout(loop);

    /*If the timeout value is zero, I/O polling will be skipped 
    and the event loop will move onto check handlers (setImmediate) phase.*/
    uv__io_poll(loop, timeout);

    /*Run all check handlers (setImmediate callbacks will run here)*/
    uv__run_check(loop);

    /*Run all close handlers*/
    uv__run_closing_handles(loop);

    if (mode == UV_RUN_ONCE) {
      uv__update_time(loop);
      uv__run_timers(loop);
    }

    r = uv__loop_alive(loop);
    if (mode == UV_RUN_ONCE || mode == UV_RUN_NOWAIT)
      break;
}

/*Checks if there are any active "handles" to be invoked,
any active requests pending, any active close handles to be invoked.

Broadly, uv__has_active_handles -> checks if there are open handles/file descriptors.
A handle is an object that can do something while it is active. File descriptors includes
descriptos for files, sockets, pipes, terminal, almost any I/O endpoint.
uv__has_active_reqs -> checks if there are active I/O requests. 
Requests represent short-lived operations. Requests can operate over handles.
An example could be a write request operating over a file handle.
*/
static int uv__loop_alive(const uv_loop_t* loop) {
  return uv__has_active_handles(loop) ||
         uv__has_active_reqs(loop) ||
         loop->closing_handles != NULL;
}


int uv_backend_timeout(const uv_loop_t* loop) {
  if (loop->stop_flag != 0)
    return 0;

  if (!uv__has_active_handles(loop) && !uv__has_active_reqs(loop))
    return 0;

  if (!QUEUE_EMPTY(&loop->idle_handles))
    return 0;

  if (!QUEUE_EMPTY(&loop->pending_queue))
    return 0;

  if (loop->closing_handles)
    return 0;

  return uv__next_timeout(loop);
}