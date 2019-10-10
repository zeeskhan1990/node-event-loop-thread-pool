const {
    setCustomTimeout,
    setCustomImmediate,
    setCustomFileIO,
    encryptSync
  } = require('./event-thread-utils');

  const http = require("http");
process.on('exit', () => console.log('\n'+rch))

if (process.stdout._handle) {
    process.stdout._handle.setBlocking(true)
}
process.stdout.write("Hello world")

/**
 * Long And short of it -
 * Every new timeout & immediate added in a nested manner runs in the next iteration.
 */

setTimeout(() => {
    process.stdout.write("\nTimeout 1")
    setTimeout(() => process.stdout.write("\nTimeout 1-1"), 0)
    setImmediate(() => {
        process.stdout.write("\nImmediate 1")
        setImmediate(() => process.stdout.write("\nImmediate 1-1"))
        setTimeout(() => {
            process.stdout.write("\nTimeout 2")
            setTimeout(() => process.stdout.write("\nTimeout 2-1"), 0)
            setImmediate(() => {
                process.stdout.write("\nImmediate 2")
                setImmediate(() => process.stdout.write("\nImmediate 2-1"))
                setTimeout(() => {
                    process.stdout.write("\nTimeout 3")
                    setTimeout(() => process.stdout.write("\nTimeout 3-1"), 0)
                }, 0)
            })
        }, 0)
    })
}, 0)