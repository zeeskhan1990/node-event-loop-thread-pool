const fs = require("fs");
const crypto = require('crypto');

class StringIdGenerator {
    constructor(chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      this._chars = chars;
      this._nextId = [0];
    }
  
    next() {
      const r = [];
      for (const char of this._nextId) {
        r.unshift(this._chars[char]);
      }
      this._increment();
      return r.join('');
    }
  
    _increment() {
      for (let i = 0; i < this._nextId.length; i++) {
        const val = ++this._nextId[i];
        if (val >= this._chars.length) {
          this._nextId[i] = 0;
        } else {
          return;
        }
      }
      this._nextId.push(0);
    }
  
    *[Symbol.iterator]() {
      while (true) {
        yield this.next();
      }
    }
  }

let timeoutQueueCounter = 0
let immediateQueueCounter = 0
//let ioQueueCounter = 0

const timeoutIds = new StringIdGenerator()
const immediateIds = new StringIdGenerator()
const ioIds = new StringIdGenerator()

let lastActiveQueue
const start = Date.now();

const setCustomImmediate = (callback) => {
    const currentId = `i${immediateIds.next().toUpperCase()}`

    setImmediate(() => {
        if(lastActiveQueue!=='immediate')
            console.log(`\n\t\t | NEW PHASE [immediate-Queue], no of queue items to be executed this cycle -- ${immediateQueueCounter} |`)

        console.log(`\n[immediate-Queue] -- ${currentId} -- START, pending in the queue now --`,--immediateQueueCounter)
        if(typeof callback === 'function')
            callback()
        console.log(`[immediate-Queue] -- ${currentId} -- FINISH`)

        lastActiveQueue = 'immediate'
    })

    console.log(`  ${currentId} --Added to immediate-Queue, total in the queue now --`,++immediateQueueCounter)
}

const setCustomTimeout = (callback) => {
    const currentId = `t${timeoutIds.next().toUpperCase()}`
    setTimeout(() => {
        if(lastActiveQueue!=='timeout')
        console.log(`\n\t\t | NEW PHASE [timeout-Queue], no of queue items to be executed this cycle -- ${timeoutQueueCounter} |`)

        console.log(`\n[timeout-Queue] -- ${currentId} -- START, pending in the queue now --`,--timeoutQueueCounter)
        if(typeof callback === 'function')
            callback()
        console.log(`[timeout-Queue] -- ${currentId} -- FINISH`)

        lastActiveQueue = 'timeout'
    }, 0)

    /*In practice, what this means is that the callback from the above mentioned setTimeout function would get
    * added to the timeout callback queue after 0 second, that's instantaneously.
    */
    console.log(`  ${currentId} --Added to timeout-Queue, total in the queue now --`,++timeoutQueueCounter)
}

const setCustomFileIO = (operationType, callback) => {
    const currentIoId = `${operationType === 'read' ? 'r': 'w'}${ioIds.next().toUpperCase()}`
    const customCallback = (err, data) => {
        if(lastActiveQueue!=='io')
        console.log(`\n\t\t | NEW PHASE [io-Queue] |`)

        console.log(`\n[io-Queue] -- ${currentIoId} -- START`)
        callback(err, data)
        console.log(`[io-Queue] -- ${currentIoId} -- FINISH`)

        lastActiveQueue = 'io'
    }
    if(operationType === 'read') {
        fs.readFile("test-file.txt", (err, data) => customCallback(err, data));
    } else {
        fs.writeFile(`${__dirname}/sample-loop-output.txt`, ' Test event loop',  'utf-8', (err, data) => customCallback(err, data));
    }
    console.log(`  ${currentIoId} --Would be added to io-Queue when file ${operationType === 'read' ? 'read': 'write'} ends.`)
}

const encrypt = (times=1) => {
  for(let i=1; i<=times; i++) {
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
      const current = Date.now()
      console.log( `  ${i} - ASYNC Password encryption done in -- ${current - start} -- milliseconds after the whole program started`);
    });
  }
  console.log(`\n  ${times} ASYNC encryption callbacks are set, threadpool size is - ${process.env["UV_THREADPOOL_SIZE"]}`)
}

const encryptSync = (times=1) => {
  console.log(`\n  ${times} SYNC encryption callbacks are set, would block and run on the main thread\n`)
  for(let i=1; i<=times; i++) {    
    const encryptionStart = Date.now()
    crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
    console.log( `  ${i} - SYNC Password encryption done, main thread blocked for -- ${Date.now() - encryptionStart} -- milliseconds \n`);
  }
}


module.exports = {StringIdGenerator, setCustomImmediate, setCustomTimeout, setCustomFileIO, encrypt, encryptSync}