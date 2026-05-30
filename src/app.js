import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { sendJson, sendText } from "./http/response.js";
import { createTransactionRoutes } from "./transactions/routes.js";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

export function createApp({ transactionService }) {
  const transactionRoutes = createTransactionRoutes(transactionService);

  return async function app(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

      if (url.pathname === "/api/health" && req.method === "GET") {
        return sendJson(res, 200, { status: "ok" });
      }

      if (url.pathname.startsWith("/api/")) {
        return transactionRoutes(req, res, url);
      }

      return serveStatic(req, res, url.pathname);
    } catch (error) {
      console.error(error);
      return sendJson(res, 500, { error: "Something went wrong" });
    }
  };
}

async function serveStatic(_req, res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    return sendText(res, 403, "Forbidden");
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream"
    });
    res.end(body);
  } catch {
    sendText(res, 404, "Not found");
  }
}
