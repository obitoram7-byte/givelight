import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Contribution intake is not configured yet. No payment was recorded." },
    { status: 503 },
  );
}
