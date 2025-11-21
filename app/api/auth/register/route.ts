import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/utils";
import { AuthPayload, ApiResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: AuthPayload = await request.json();

    // Validation
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, dan nama harus diisi",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
        phone: body.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        data: {
          user,
          token,
        },
      } as ApiResponse<{ user: typeof user; token: string }>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat registrasi",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
