import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  await context.params;
  return NextResponse.json({ error: "Cause campaigns are not part of this experiment." }, { status: 410 });
}
