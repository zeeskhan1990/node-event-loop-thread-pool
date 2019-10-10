const EventEmitter = require("events");
const http = require("http");

class Sales extends EventEmitter { }

const myEmitter = new Sales();

myEmitter.on("newSale", () => {
  console.log("There was a new sale!");
});

myEmitter.on("newSale", () => {
  console.log("Costumer name: Jonas");
});

myEmitter.on("newSale", (stock) => {
  console.log(`There are now ${stock} items left in stock.`);
});

myEmitter.emit("newSale", 9);

//////////////////

const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request received!");
  console.log(req.url);
  res.end("Request received");
});

server.on("request", (req, res) => {
  console.log("Another request 😀");
  server.close()
});

server.on("close", () => {
  console.log("Server closed");
});

//This is a callback for opening a socket at a particular port & host, and the callback is executed when the port 
//is successfully opened. It's similar to opening a file. This particular event emit->listen->callback path ends here.
//Reading from a port (file) is a different event path.
server.listen(8000, "127.0.0.1", () => {
  console.log("Waiting for requests...");
});
