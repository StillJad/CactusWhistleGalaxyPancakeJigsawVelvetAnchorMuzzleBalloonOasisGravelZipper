import { kv } from "@vercel/kv";

export async function POST(request) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== process.env.API_SHARED_SECRET) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    return Response.json({
      debug: true,
      body
    });
  } catch (err) {
    return Response.json({
      error: "crash",
      message: err.message
    }, { status: 500 });
  }
}
