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
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      applicantId: data.applicantId,
      kycVerified: false,
    },
  });

  return NextResponse.json(data);
}
