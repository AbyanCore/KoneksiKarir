import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [Session API] Checking session");
    const cookieStore = await cookies();
    const token = cookieStore.get("koneksi_karir_token")?.value;

    console.log(
      "🍪 [Session API] Token from cookie:",
      token ? `${token.substring(0, 20)}...` : "null"
    );

    if (!token) {
      // Return 200 with authenticated: false (stateless)
      console.log("❌ [Session API] No token found");
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    console.log("🔐 [Session API] Verifying token...");
    const user = verifyToken(token);

    if (!user) {
      // Token invalid or expired, return 200 with authenticated: false
      console.log("❌ [Session API] Token verification failed");
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // User authenticated, return user data
    console.log("✅ [Session API] User authenticated:", user);
    return NextResponse.json({
      authenticated: true,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ [Session API] Error:", error);
    // Even on error, return 200 (stateless)
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}
