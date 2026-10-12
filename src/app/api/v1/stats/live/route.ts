import { NextResponse } from "next/server";
import { recentDonations } from "@/lib/demo-data";
import { getDemoStats } from "@/lib/demo-store";

export async function GET() {
  return NextResponse.json({ ...getDemoStats(), currency: "USD", recentDonations, mode: "demo" });
}
