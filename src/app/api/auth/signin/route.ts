import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { generateToken, setTokenCookie } from "@/lib/auth";
import { SignInDto } from "@/lib/dtos/auth/signin.dto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = SignInDto.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isPasswordHashed = user.password.startsWith("$2");
    let isPasswordValid = false;

    if (isPasswordHashed) {
      // Verify hashed password with bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // For backward compatibility: compare plain text passwords
      // TODO: Remove this after migrating all passwords to bcrypt
      isPasswordValid = password === user.password;

      // If plain text password matches, hash it and update in database
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.is_blocked) {
      return NextResponse.json(
        { error: "Your account has been blocked" },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return token in response body for client-side cookie handling
    return NextResponse.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
