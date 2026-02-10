import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import express from "express";
import http from "http"; 

const app = express();
const port = process.env.PORT || 5001;

app.use(express.static("./public"));

const server = http.createServer(app);

server.on("upgrade", (request, socket, head) => {

  if (request.headers['cookie']) {
    delete request.headers['cookie'];
  }

  wisp.routeRequest(request, socket, head, {
    logger: {
      info: (msg) => console.log('Info:', msg), 
      warn: (msg) => console.warn('Warn:', msg), 
      error: (msg) => console.error('Error:', msg), 
    },
  });
});

// cookie cruption fix i think
process.on('uncaughtException', (err) => {
    console.error('Caught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});

setTimeout(() => {
    console.clear();
    console.log(`Server is running on port: ${port}`);
}, 60 * 1000);
