import { kv } from "@vercel/kv";

function getApiKey(request) {
  return request.headers.get("x-api-key");
}

function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(request) {
  const apiKey = process.env.ROBLOX_API_KEY;
  const sentKey = getApiKey(request);

  if (!apiKey || sentKey !== apiKey) {
    return unauthorized();
  }

  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return Response.json({ error: "missing username" }, { status: 400 });
  }

  let users = await kv.get("whitelist");
  if (!Array.isArray(users)) {
    users = [];
  }

  const allowed = users.some(
    name => typeof name === "string" && name.toLowerCase() === username.toLowerCase()
  );

  if (!allowed) {
    return Response.json({
      allowed: false
    });
  }

  return Response.json({
    allowed: true,
    tail: "694",
    func: "xev0rin"
  });
}
