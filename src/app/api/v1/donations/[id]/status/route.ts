import { NextResponse } from "next/server";
import { getDemoDonation } from "@/lib/demo-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const donation = getDemoDonation(id);
  if (!donation) return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  return NextResponse.json({ id: donation.id, status: donation.status, mode: "demo" });
}
