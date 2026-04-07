import { NextResponse } from "next/server";

export function ensureAdminAuthorized(request: Request) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json(
      {
        message:
          "ADMIN_API_KEY is missing. Set ADMIN_API_KEY in your environment before using admin APIs.",
      },
      { status: 500 },
    );
  }

  const supplied = request.headers.get("x-admin-key");
  if (!supplied || supplied !== adminKey) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}
