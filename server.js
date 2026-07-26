const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = Number(process.env.PORT) || 4173;
const root = __dirname;
const liveReloadClients = new Set();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const server = http.createServer((request, response) => {
  if (request.url === "/__livereload") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    response.write(": connected\n\n");
    liveReloadClients.add(response);
    request.on("close", () => liveReloadClients.delete(response));
    return;
  }

  const urlPath = request.url.split("?")[0];
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    let output = data;
    const isStaticPreview = request.url.includes("__static=1");
    if (path.extname(filePath) === ".html" && !isStaticPreview) {
      const liveReloadScript = `
        <script>
          (() => {
            const source = new EventSource("/__livereload");
            source.onmessage = (event) => {
              if (event.data === "reload") window.location.reload();
            };
          })();
        </script>
      `;
      output = data.toString("utf8").replace("</body>", `${liveReloadScript}</body>`);
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    response.end(output);
  });
});

server.listen(port, host, () => {
  console.log(`SquibNET is running with live reload at http://${host}:${port}`);
});

let reloadTimer;
fs.watch(root, (eventType, filename) => {
  if (!filename || !/\.(html|css|js|svg)$/i.test(filename) || filename === "server.js") {
    return;
  }

  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    liveReloadClients.forEach((client) => client.write("data: reload\n\n"));
  }, 80);
});
