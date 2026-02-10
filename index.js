import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "./public")));

// Add a fallback route to serve index.html for any unmatched routes
// This must come AFTER static files middleware
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

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

// Error handling
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