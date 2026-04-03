import { kv } from "@vercel/kv";

export async function POST(request) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== process.env.API_SHARED_SECRET) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const username = body.username;

    let users = await kv.get("whitelist");

    if (!Array.isArray(users)) {
      users = [];
    }

    if (!users.includes(username)) {
      users.push(username);
      await kv.set("whitelist", users);
    }

    return Response.json({ success: true, users });

  } catch (err) {
    return Response.json({
      error: "crash",
      message: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
