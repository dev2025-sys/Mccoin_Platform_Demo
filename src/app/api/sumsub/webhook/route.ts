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
  console.log("=== WEBHOOK RECEIVED ===");
  console.log("Full webhook data:", JSON.stringify(data, null, 2));
  console.log("Webhook type:", data.type);
  console.log("Applicant ID:", data.applicantId);
  console.log("Review result:", data.reviewResult);
  console.log("Review status:", data.reviewStatus);

  // Handle different webhook types based on Sumsub documentation
  if (data.type === "applicantReviewed") {
    console.log("✅ Applicant reviewed webhook received!");

    // Check if verification was successful
    if (
      data.reviewResult?.reviewAnswer === "GREEN" &&
      data.reviewStatus === "completed"
    ) {
      console.log("✅ GREEN verification detected!");

      // 🔁 Search all users to find who has this applicantId
      const clerk = await clerkClient();
      const { data: users } = await clerk.users.getUserList();
      console.log(`Searching for user with applicantId: ${data.applicantId}`);
      console.log(`Total users found: ${users.length}`);

      let userFound = false;
      for (const user of users) {
        console.log(
          `Checking user: ${user.id}, applicantId: ${user.publicMetadata?.applicantId}`
        );
        if (user.publicMetadata?.applicantId === data.applicantId) {
          console.log(`✅ Found matching user: ${user.id}`);
          await clerk.users.updateUserMetadata(user.id, {
            publicMetadata: { ...user.publicMetadata, kycVerified: true },
          });
          console.log(`✅ User ${user.id} KYC verified successfully`);
          userFound = true;
          break;
        }
      }

      if (!userFound) {
        console.log("❌ No user found with matching applicantId");
        console.log("Available users and their applicantIds:");
        users.forEach((user) => {
          console.log(
            `User: ${user.id}, ApplicantId: ${user.publicMetadata?.applicantId}`
          );
        });
      }
    } else if (data.reviewResult?.reviewAnswer === "RED") {
      console.log("❌ RED verification detected!");

      // Handle rejected verification
      const clerk = await clerkClient();
      const { data: users } = await clerk.users.getUserList();
      for (const user of users) {
        if (user.publicMetadata?.applicantId === data.applicantId) {
          await clerk.users.updateUserMetadata(user.id, {
            publicMetadata: { ...user.publicMetadata, kycVerified: false },
          });
          console.log(`❌ User ${user.id} KYC verification rejected`);
          break;
        }
      }
    } else {
      console.log(
        `ℹ️ Other review result: ${data.reviewResult?.reviewAnswer}, status: ${data.reviewStatus}`
      );
    }
  } else if (data.type === "applicantPending") {
    console.log("⏳ Applicant pending webhook received");
  } else if (data.type === "applicantCreated") {
    console.log("🆕 Applicant created webhook received");
  } else {
    console.log(`ℹ️ Other webhook type: ${data.type}`);
  }

  return new Response("ok");
}
