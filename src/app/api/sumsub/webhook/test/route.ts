export async function GET() {
  console.log("=== WEBHOOK TEST ENDPOINT HIT ===");
  return new Response("Webhook endpoint is accessible", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

export async function POST(req: Request) {
  console.log("=== WEBHOOK TEST POST ENDPOINT HIT ===");
  const body = await req.text();
  console.log("Test webhook body:", body);

  return new Response("Test webhook received", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
