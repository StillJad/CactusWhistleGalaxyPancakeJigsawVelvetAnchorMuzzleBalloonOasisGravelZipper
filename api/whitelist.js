import { kv } from "@vercel/kv";

export async function GET(request) {
  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== process.env.API_SHARED_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const users = await kv.get("whitelist") || [];

  return Response.json({ users });
}
