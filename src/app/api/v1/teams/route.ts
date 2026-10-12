import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Team management requires configured authentication and a database." }, { status: 503 });
}
