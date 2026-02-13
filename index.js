import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

// Prevent browsers from caching service worker, HTML, and key JS files.
// On Chromebooks with content filters, blocked responses get cached and
// persist across reloads/restarts — this forces fresh fetches every time.
app.use((req, res, next) => {
  const p = req.path;
  if (p.endsWith(".html") || p === "/" || p.endsWith("worker.js") || p.endsWith("math.mjs")) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  }
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "./public")));

// Add a fallback route to serve index.html for any unmatched routes
// This must come AFTER static files middleware
app.use((req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
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