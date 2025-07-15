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

  const data = JSON.parse(rawBody);
  console.log("Webhook data:", data);

  // Handle the new object structure
  if (
    data.review?.reviewAnswer === "GREEN" &&
    data.review?.reviewStatus === "completed"
  ) {
    // 🔁 Search all users to find who has this applicantId
    const clerk = await clerkClient();
    const { data: users } = await clerk.users.getUserList();
    for (const user of users) {
      if (user.publicMetadata?.applicantId === data.id) {
        await clerk.users.updateUserMetadata(user.id, {
          publicMetadata: { ...user.publicMetadata, kycVerified: true },
        });
        console.log(`User ${user.id} KYC verified successfully`);
        break;
      }
    }
  } else if (data.review?.reviewAnswer === "RED") {
    // Handle rejected verification
    const clerk = await clerkClient();
    const { data: users } = await clerk.users.getUserList();
    for (const user of users) {
      if (user.publicMetadata?.applicantId === data.id) {
        await clerk.users.updateUserMetadata(user.id, {
          publicMetadata: { ...user.publicMetadata, kycVerified: false },
        });
        console.log(`User ${user.id} KYC verification rejected`);
        break;
      }
    }
  }

  return new Response("ok");
}
