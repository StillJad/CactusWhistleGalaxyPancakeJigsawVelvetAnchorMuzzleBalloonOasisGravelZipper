function getApiKey(request) {
  return request.headers.get("x-api-key");
}

function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export function GET(request) {
  const apiKey = process.env.API_SHARED_SECRET;
  const sentKey = getApiKey(request);

  if (!apiKey || sentKey !== apiKey) {
    return unauthorized();
  }

  let parsed;
  try {
    parsed = JSON.parse(process.env.WHITELIST_JSON || '{"users":[]}');
  } catch {
    return Response.json(
      { error: "invalid WHITELIST_JSON env var" },
      { status: 500 }
    );
  }

  if (!parsed || !Array.isArray(parsed.users)) {
    return Response.json(
      { error: "WHITELIST_JSON must be an object with a users array" },
      { status: 500 }
    );
  }

  return Response.json({
    users: parsed.users
  });
}
