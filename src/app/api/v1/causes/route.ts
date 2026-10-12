import { NextResponse } from "next/server";
import { causes } from "@/lib/demo-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const region = url.searchParams.get("region");
  const category = url.searchParams.get("category");
  const result = causes.filter((cause) => (!region || cause.region.toLowerCase() === region.toLowerCase()) && (!category || cause.category.toLowerCase() === category.toLowerCase()));
  return NextResponse.json({ data: result, mode: "demo" });
}
