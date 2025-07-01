// src/app/api/sumsub/webhook/route.ts
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";

const SECRET_KEY = process.env.SUMSUB_SECRET_KEY!;

function generateSignature(
  ts: string,
  method: string,
  path: string,
  body: string
) {
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(ts + method + path + body)
    .digest("hex");
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headersList = await headers();
  const ts = headersList.get("X-App-Access-Ts");
  const sig = headersList.get("X-App-Access-Sig");

  if (!ts || !sig) return new Response("Missing headers", { status: 400 });

  const computedSig = generateSignature(
    ts,
    "POST",
    "/api/sumsub/webhook",
    rawBody
  );
  if (sig !== computedSig) return new Response("Forbidden", { status: 403 });

  const { type, applicantId, reviewResult } = JSON.parse(rawBody);
  console.log(type, applicantId, reviewResult);

  if (type === "applicantReviewed" && reviewResult?.reviewAnswer === "GREEN") {
    // 🔁 Search all users to find who has this applicantId
    const clerk = await clerkClient();
    const { data: users } = await clerk.users.getUserList();
    for (const user of users) {
      if (user.publicMetadata?.applicantId === applicantId) {
        await clerk.users.updateUserMetadata(user.id, {
          publicMetadata: { ...user.publicMetadata, kycVerified: true },
        });
        break;
      }
    }
  }

  return new Response("ok");
}
