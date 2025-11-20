import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/utils";
import { createHealthData, getHealthHistory, getLatestHealth } from "@/lib/services/health";
import { sendHealthNotification } from "@/lib/services/wa";
import { HealthCheckPayload, ApiResponse } from "@/types";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Try both lowercase and original case for the header
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    const token = extractToken(authHeader);

    if (!token) {
      console.error("No token found in headers");
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.error("Token invalid or expired");
      return NextResponse.json(
        { success: false, message: "Token tidak valid" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const body: HealthCheckPayload = await request.json();

    if (!body.height || !body.weight) {
      return NextResponse.json(
        {
          success: false,
          message: "Tinggi dan berat badan harus diisi",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create health data
    const healthData = await createHealthData(decoded.userId, body);

    // Get user info for WA notification
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true, phone: true },
    });

    // Send WA notification if phone is available
    if (user?.phone) {
      await sendHealthNotification(user.phone, user.name, {
        bmi: healthData.bmi,
        status: healthData.status,
        height: healthData.height,
        weight: healthData.weight,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Data kesehatan berhasil disimpan",
        data: healthData,
      } as ApiResponse<typeof healthData>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menyimpan data kesehatan",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));

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

    const latest = await getLatestHealth(decoded.userId);
    const history = await getHealthHistory(decoded.userId);

    return NextResponse.json(
      {
        success: true,
        message: "Data kesehatan berhasil diambil",
        data: { latest, history },
      } as ApiResponse<{ latest: typeof latest; history: typeof history }>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Get health error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
