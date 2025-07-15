import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action } = body; // "verify" or "unverify"

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  console.log("Current user metadata:", user.publicMetadata);

  if (action === "verify") {
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { ...user.publicMetadata, kycVerified: true },
    });
    console.log("Manually verified user:", userId);
  } else if (action === "unverify") {
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { ...user.publicMetadata, kycVerified: false },
    });
    console.log("Manually unverified user:", userId);
  }

  const updatedUser = await clerk.users.getUser(userId);
  console.log("Updated user metadata:", updatedUser.publicMetadata);

  return NextResponse.json({
    success: true,
    action,
    metadata: updatedUser.publicMetadata,
  });
}
