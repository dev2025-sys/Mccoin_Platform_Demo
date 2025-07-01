// src/app/api/user/kyc-status/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const verified = user.publicMetadata?.kycVerified === true;

  return Response.json({ verified });
}
