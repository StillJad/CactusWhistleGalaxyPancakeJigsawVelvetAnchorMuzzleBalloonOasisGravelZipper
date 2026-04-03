function getApiKey(request) {
  return request.headers.get("x-api-key");
}

function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export async function POST(request) {
  const apiKey = process.env.API_SHARED_SECRET;
  const sentKey = getApiKey(request);

  if (!apiKey || sentKey !== apiKey) {
    return unauthorized();
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return Response.json(
      { error: "missing DISCORD_WEBHOOK_URL env var" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json body" }, { status: 400 });
  }

  const player = typeof body.player === "string" ? body.player : "Unknown";
  const placeId = String(body.placeId ?? "");
  const jobId = typeof body.jobId === "string" ? body.jobId : "Unknown";
  const kind = typeof body.kind === "string" ? body.kind : "join";

  const message =
    `Roblox event: ${kind}\n` +
    `Player: ${player}\n` +
    `PlaceId: ${placeId}\n` +
    `Server JobId: ${jobId}\n` +
    `Game: https://www.roblox.com/games/${placeId}`;

  const discordRes = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: message
    })
  });

  if (!discordRes.ok) {
    const text = await discordRes.text().catch(() => "");
    return Response.json(
      {
        error: "discord webhook failed",
        status: discordRes.status,
        details: text
      },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
