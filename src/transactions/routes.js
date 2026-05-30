import { readJson } from "../http/request.js";
import { sendJson } from "../http/response.js";

export function createTransactionRoutes(transactionService) {
  return async function transactionRoutes(req, res, url) {
    if (url.pathname === "/api/transactions" && req.method === "GET") {
      return sendJson(res, 200, await transactionService.list());
    }

    if (url.pathname === "/api/transactions" && req.method === "POST") {
      try {
        const input = await readJson(req);
        return sendJson(res, 201, await transactionService.create(input));
      } catch (error) {
        if (error.name === "ValidationError" || error instanceof SyntaxError) {
          return sendJson(res, 400, { error: error.message });
        }

        throw error;
      }
    }

    if (url.pathname === "/api/summary" && req.method === "GET") {
      return sendJson(res, 200, await transactionService.summary());
    }

    const deleteMatch = url.pathname.match(/^\/api\/transactions\/([^/]+)$/);
    if (deleteMatch && req.method === "DELETE") {
      const deleted = await transactionService.delete(deleteMatch[1]);
      return sendJson(res, deleted ? 200 : 404, deleted ? { deleted: true } : { error: "Not found" });
    }

    return sendJson(res, 404, { error: "Not found" });
  };
}
