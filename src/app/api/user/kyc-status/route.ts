// src/app/api/user/kyc-status/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const verified = user.publicMetadata?.kycVerified === true;

  console.log(
    "KYC Status check for user:",
    userId,
    "verified:",
    verified,
    "metadata:",
    user.publicMetadata
  );

  return Response.json({ verified });
}
