import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ action: string[] }> };

export async function POST(_request: Request, context: RouteContext) {
  const { action } = await context.params;
  const supported = new Set(["google", "apple", "otp/request", "otp/verify", "register", "login", "claim-guest-donation"]);
  if (!supported.has(action.join("/"))) return NextResponse.json({ error: "Authentication action not found." }, { status: 404 });
  return NextResponse.json({ error: "Authentication is not configured in demo mode. Guest donation remains available." }, { status: 503 });
}
