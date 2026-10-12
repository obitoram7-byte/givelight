import { NextResponse } from "next/server";
import { causes } from "@/lib/demo-data";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const cause = causes.find((item) => item.slug === slug);
  if (!cause) return NextResponse.json({ error: "Cause not found" }, { status: 404 });
  return NextResponse.json({ data: cause, mode: "demo" });
}
