import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    // const cases = await listStoreCases();
    // return NextResponse.json({ cases });
  } catch {
    return NextResponse.json(
      { message: "Failed to load cases." },
      { status: 500 },
    );
  }
}
