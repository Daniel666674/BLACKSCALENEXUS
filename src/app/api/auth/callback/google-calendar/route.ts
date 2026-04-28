import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOAuthClient, storeTokens } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/settings/calendar?error=no_code", req.url));

  try {
    const oauth = getOAuthClient();
    const { tokens } = await oauth.getToken(code);
    await storeTokens(session.user.id, tokens);
    return NextResponse.redirect(new URL("/settings/calendar?connected=true", req.url));
  } catch {
    return NextResponse.redirect(new URL("/settings/calendar?error=auth_failed", req.url));
  }
}
