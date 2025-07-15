import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  console.log("=== DEBUG USER METADATA ===");
  console.log("User ID:", userId);
  console.log(
    "Full user metadata:",
    JSON.stringify(user.publicMetadata, null, 2)
  );
  console.log("KYC Verified:", user.publicMetadata?.kycVerified);
  console.log("Applicant ID:", user.publicMetadata?.applicantId);

  return NextResponse.json({
    userId,
    metadata: user.publicMetadata,
    kycVerified: user.publicMetadata?.kycVerified,
    applicantId: user.publicMetadata?.applicantId,
  });
}
