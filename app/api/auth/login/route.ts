export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { comparePassword, generateToken } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { validateLogin } from "@/lib/validators/auth";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateLogin(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.errors[0],
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Generate token with correct payload
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            age: user.age,
            gender: user.gender,
            role: user.role,
            profilePhoto: user.profilePhoto,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      } as ApiResponse<{
        user: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          age: number | null;
          gender: string | null;
          role: string;
          profilePhoto: string | null;
          createdAt: Date;
          updatedAt: Date;
        };
        token: string;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat login",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
