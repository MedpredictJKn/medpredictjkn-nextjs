import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/utils";
import { createHealthData, getHealthHistory, getLatestHealth } from "@/lib/services/health";
import { sendHealthNotification } from "@/lib/services/wa";
import { HealthCheckPayload, ApiResponse } from "@/types";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
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

    try {
      // Create health data dengan timeout
      const healthData = await Promise.race([
        createHealthData(decoded.userId, body),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Database operation timeout")), 15000)
        ),
      ]);

      // Get user info untuk WA notification
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { name: true, phone: true },
      });

      // Send WA notification ASYNC (jangan tunggu)
      if (user?.phone) {
        // Pastikan nomor lengkap dengan kode negara (62)
        let phoneNumber = user.phone.trim();
        
        // Jika nomor dimulai dengan 0, ganti dengan 62
        if (phoneNumber.startsWith("0")) {
          phoneNumber = "62" + phoneNumber.slice(1);
        }
        
        // Jika belum punya 62, tambahkan
        if (!phoneNumber.startsWith("62")) {
          phoneNumber = "62" + phoneNumber;
        }

        console.log(`[Health API] Sending WA to: ${phoneNumber}`);

        sendHealthNotification(phoneNumber, user.name, {
          bmi: healthData.bmi,
          status: healthData.status,
          height: healthData.height,
          weight: healthData.weight,
        }).catch((err) => {
          console.error("[Health API] WA notification failed:", err);
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
    } catch (dbError) {
      console.error("[DB Error]", dbError);

      // Handle specific Prisma errors
      if ((dbError as Record<string, string>).code === "P2024") {
        return NextResponse.json(
          {
            success: false,
            message: "Database sedang busy. Silakan coba lagi dalam beberapa detik.",
            error: "Connection pool timeout",
          } as ApiResponse<null>,
          { status: 503 }
        );
      }

      throw dbError;
    }
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

    try {
      const latest = await Promise.race([
        getLatestHealth(decoded.userId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout")), 10000)
        ),
      ]);

      const history = await Promise.race([
        getHealthHistory(decoded.userId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout")), 10000)
        ),
      ]);

      return NextResponse.json(
        {
          success: true,
          message: "Data kesehatan berhasil diambil",
          data: { latest, history },
        } as ApiResponse<{ latest: typeof latest; history: typeof history }>,
        { status: 200 }
      );
    } catch (queryError) {
      console.error("[Query Error]", queryError);
      return NextResponse.json(
        {
          success: false,
          message: "Timeout mengambil data dari database",
          error: String(queryError),
        } as ApiResponse<null>,
        { status: 504 }
      );
    }
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
