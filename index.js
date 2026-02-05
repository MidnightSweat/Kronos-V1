import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import express from "express";

const app = express();
const port = process.env.PORT || 5001;

app.use(express.static("./public"));

const server = app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});

server.on("upgrade", (request, socket, head) => {
  // -------------------------------------------------
  // 🔴 THE FIX: Delete the cookie before Wisp sees it
  // -------------------------------------------------
  if (request.headers['cookie']) {
      delete request.headers['cookie'];
  }
  // Optional: You can also delete the 'user-agent' if that causes issues, 
  // but usually 'cookie' is the only one needed.

  wisp.routeRequest(request, socket, head, {
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
    },
  });
});

setTimeout(() => {
    console.clear();
}, 60 * 1000);