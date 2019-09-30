const {
  setCustomTimeout,
  setCustomImmediate,
  setCustomFileIO,
  encryptSync
} = require('./event-thread-utils');

console.log(`
Description of actions below:
1) A cycle is composed of multiple phases, each phases having it's own queue.
2) The order of phases are - Timeout -> IO -> SetImmediate -> Close.
3) Each phase has it's own queue, and at the start of the phase the total number of items in the queue are fetched and
are run one by one. 
4) New callbacks that are added to a queue during it's own exeuction phase would be run in the next cycle.
5) Whenever a new item is added to the process.nextTick queue or to the promise queue, they will run
between each individual setTimeout and setImmediate callbacks, even if the timers queue or the immediates 
queue is not empty.
6) Next tick queue has even higher priority over the Other Micro tasks queue. Although, they both are processed
in between two phases of the event loop when libuv communicates back to higher layers of Node at the end of a phase. 
`);

console.log('\n\t\t | Hello from the top-level code | \n');

setCustomImmediate(() => {
  console.log('  ENTER TOP LEVEL IMMEDIATE');
  setCustomImmediate();
  setCustomTimeout();
  //interrupts
  process.nextTick(() =>
    console.log(
      '\n[interrupt] [Process.nextTick-queue] Next tick from top level immediate'
    )
  );
  Promise.resolve().then(() =>
    console.log(
      '\n[interrupt] [Promise-queue] Promise-1 resolved in top level immediate'
    )
  );
  console.log(`  XY --Added to process.nextTick-queue and promise-queue`);

  console.log('  EXIT TOP LEVEL IMMEDIATE');
});

setCustomTimeout(() => {
  console.log('  ENTER TOP LEVEL TIMEOUT');
  setCustomTimeout();
  setCustomImmediate();
  console.log('  EXIT TOP LEVEL TIMEOUT');
});

setCustomFileIO('read', (err, data) => {
  setCustomImmediate(() => console.log('SET IMMEDIATE POST FILE READ'));
  setCustomTimeout(() => console.log('SET TIMEOUT POST FILE READ'));

  Promise.resolve().then(() =>
    console.log(
      '\n[interrupt] [Promise-queue] Promise-1 resolved in file read callback'
    )
  );
  process.nextTick(() =>
    console.log(
      '\n[interrupt] [Process.nextTick-queue] Next tick from file read callback'
    )
  );
  Promise.resolve().then(() =>
    console.log(
      '\n[interrupt] [Promise-queue] Promise-2 resolved in file read callback'
    )
  );
  console.log(`  XY --Added to process.nextTick-queue and promise-queue`);

  encryptSync()
});

setCustomFileIO('write', (err, data) => {
  setCustomImmediate(() => console.log('SET IMMEDIATE POST FILE WRITE'));
  setCustomTimeout(() => console.log('SET TIMEOUT POST FILE WRITE'));
});
