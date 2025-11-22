import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/utils";
import { ApiResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify token
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Check if user is doctor
    const doctor = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!doctor || doctor.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Anda bukan dokter" } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Count total messages sent by this doctor
    const totalMessagesSent = await prisma.doctorMessage.count({
      where: {
        doctorId: decoded.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Total pesan berhasil diambil",
        data: {
          totalMessagesSent,
        },
      } as ApiResponse<{ totalMessagesSent: number }>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Get messages count error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil total pesan",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
