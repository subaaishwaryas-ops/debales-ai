const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const app = next({ dev: true, conf: { experimental: {}} });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log("Ready on http://localhost:3000");
  });
});