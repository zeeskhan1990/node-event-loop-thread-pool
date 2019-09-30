const {
    setCustomFileIO,
    encrypt,
    encryptSync
  } = require('./event-thread-utils');

  encryptSync(2)  
  encrypt(4) 

  /* setCustomFileIO('read', (err, data) => {  
    encryptSync(2)  
    encrypt(4)   
  }); */