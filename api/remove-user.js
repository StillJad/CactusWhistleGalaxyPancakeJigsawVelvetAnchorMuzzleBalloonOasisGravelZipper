import { kv } from "@vercel/kv";

export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== process.env.API_SHARED_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const username = body.username;

  let users = await kv.get("whitelist") || [];

  users = users.filter(u => u !== username);

  await kv.set("whitelist", users);

  return Response.json({ success: true, users });
}
