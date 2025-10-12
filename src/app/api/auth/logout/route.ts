import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Stateless logout - just return success
  // Cookie removal is handled by client-side (js-cookie)
  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
