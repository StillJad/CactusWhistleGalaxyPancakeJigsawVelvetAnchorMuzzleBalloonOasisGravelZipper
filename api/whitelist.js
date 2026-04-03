export function GET(request) {
  const sentKey = request.headers.get("x-api-key");
  const apiKey = process.env.API_SHARED_SECRET;

  return Response.json({
    sentKey,
    apiKey,
    match: sentKey === apiKey
  });
}
