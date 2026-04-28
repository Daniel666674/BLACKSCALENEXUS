import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/db/users";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ acknowledged: true }); // Don't show modal to unauthenticated

  const user = getUserById(session.user.id);
  return NextResponse.json({ acknowledged: user?.policyAcknowledged ?? false });
}
