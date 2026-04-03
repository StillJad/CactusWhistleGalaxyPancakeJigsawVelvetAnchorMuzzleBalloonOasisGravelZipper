import nacl from "tweetnacl";
import { kv } from "@vercel/kv";

function verifyDiscordRequest(request, rawBody) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !publicKey) return false;

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );
}

function getOption(body, name) {
  return body.data?.options?.find(opt => opt.name === name)?.value;
}

export async function POST(request) {
  const rawBody = await request.text();

  if (!verifyDiscordRequest(request, rawBody)) {
    return new Response("Bad request signature", { status: 401 });
  }

  const body = JSON.parse(rawBody);

  if (body.type === 1) {
    return Response.json({ type: 1 });
  }

  const command = body.data?.name;

  if (command === "whitelist-list") {
    let users = await kv.get("whitelist");
    if (!Array.isArray(users)) users = [];

    return Response.json({
      type: 4,
      data: {
        content: users.length
          ? `Whitelist: ${users.join(", ")}`
          : "Whitelist is empty."
      }
    });
  }

  if (command === "whitelist-add") {
    const username = getOption(body, "username");
    if (!username) {
      return Response.json({
        type: 4,
        data: { content: "Missing username." }
      });
    }

    let users = await kv.get("whitelist");
    if (!Array.isArray(users)) users = [];

    if (!users.includes(username)) {
      users.push(username);
      await kv.set("whitelist", users);
    }

    return Response.json({
      type: 4,
      data: { content: `Added ${username}.` }
    });
  }

  if (command === "whitelist-remove") {
    const username = getOption(body, "username");
    if (!username) {
      return Response.json({
        type: 4,
        data: { content: "Missing username." }
      });
    }

    let users = await kv.get("whitelist");
    if (!Array.isArray(users)) users = [];

    users = users.filter(u => u !== username);
    await kv.set("whitelist", users);

    return Response.json({
      type: 4,
      data: { content: `Removed ${username}.` }
    });
  }

  return Response.json({
    type: 4,
    data: { content: "Unknown command." }
  });
}
