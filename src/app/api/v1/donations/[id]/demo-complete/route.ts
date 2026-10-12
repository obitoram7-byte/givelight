import { NextResponse } from "next/server";
import { confirmDemoDonation } from "@/lib/demo-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  if ((process.env.PAYMENT_MODE ?? "demo") !== "demo") return NextResponse.json({ error: "Demo confirmation is disabled." }, { status: 404 });
  const { id } = await context.params;
  const donation = confirmDemoDonation(id);
  if (!donation) return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  return NextResponse.json({ id: donation.id, status: donation.status, mode: "demo" });
}
