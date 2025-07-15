// src/app/api/sumsub/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

const APP_TOKEN = process.env.SUMSUB_APP_TOKEN!;
const SECRET_KEY = process.env.SUMSUB_SECRET_KEY!;
const SUMSUB_BASE_URL = "https://api.sumsub.com";

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

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { levelName } = body;

  if (!levelName) {
    return NextResponse.json({ error: "Missing levelName" }, { status: 400 });
  }

  const ts = Math.floor(Date.now() / 1000).toString();
  const path = "/resources/sdkIntegrations/levels/-/websdkLink";

  const payload = JSON.stringify({
    levelName,
    userId,
    ttlInSecs: 1800,
  });

  const signature = generateSignature(ts, "POST", path, payload);

  const response = await fetch(`${SUMSUB_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-App-Token": APP_TOKEN,
      "X-App-Access-Sig": signature,
      "X-App-Access-Ts": ts,
    },
    body: payload,
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message || "Failed to get external link" },
      { status: response.status }
    );
  }

  // ⬅️ Save applicantId in Clerk public metadata
  const clerk = await clerkClient();
  console.log("=== SAVING APPLICANT ID ===");
  console.log("User ID:", userId);
  console.log("Full Sumsub response:", JSON.stringify(data, null, 2));

  // Extract applicantId from the URL or make additional API call
  // The applicantId will be available in the webhook when the applicant is created
  // For now, we'll save a temporary identifier and update it when we receive the webhook
  const tempApplicantId = `temp_${userId}_${Date.now()}`;

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      applicantId: tempApplicantId,
      externalUserId: userId,
      kycVerified: false,
      levelName: levelName,
    },
  });

  console.log("✅ Temporary applicantId saved:", tempApplicantId);
  console.log(
    "Note: Real applicantId will be updated when webhook is received"
  );

  return NextResponse.json(data);
}
