import { listStoreCharms } from "@/lib/catalog";
import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const charms = await listStoreCharms();
    return NextResponse.json({ charms });
  } catch {
    return NextResponse.json(
      { message: "Failed to load charms." },
      { status: 500 },
    );
  }
}
