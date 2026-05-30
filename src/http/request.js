export async function readJson(req) {
  let body = "";

  for await (const chunk of req) {
    body += chunk;

    if (body.length > 1_000_000) {
      throw new Error("Request body is too large");
    }
  }

  if (!body.trim()) {
    return {};
  }

  return JSON.parse(body);
}
