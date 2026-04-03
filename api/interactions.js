import nacl from "tweetnacl";

function verifyDiscordRequest(request, rawBody) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !publicKey) {
    return false;
  }

  const isValid = nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );

  return isValid;
}

export async function POST(request) {
  const rawBody = await request.text();

  if (!verifyDiscordRequest(request, rawBody)) {
    return new Response("Bad request signature", { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
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
