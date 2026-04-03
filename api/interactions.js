export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  if (body.type === 1) {
    return Response.json({ type: 1 });
  }

  const name = body.data?.name;

  if (name === "whitelist-list") {
    return Response.json({
      type: 4,
      data: {
        content: "Bot route works."
      }
    });
  }

  return Response.json({
    type: 4,
    data: {
      content: "Unknown command."
    }
  });
}
