import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/utils";
import { createHealthData, getLatestHealth } from "@/lib/services/health";
import { sendHealthNotification } from "@/lib/services/wa";
import { HealthCheckPayload, ApiResponse } from "@/types";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      let healthData: Awaited<ReturnType<typeof createHealthData>> | undefined;
      let retries = 0;
      const maxRetries = 2;

      // Retry logic for connection issues
      while (retries <= maxRetries) {
        try {
          healthData = await Promise.race([
            createHealthData(decoded.userId, body),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Database operation timeout")), 15000)
            ),
          ]);
          break; // Success, exit retry loop
        } catch (error) {
          retries++;
          if (retries > maxRetries) {
            throw error; // Max retries exceeded
          }
          console.warn(`[Health API] Retry ${retries}/${maxRetries}`, error);
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retries) * 1000)
          );
        }
      }

      if (!healthData) {
        throw new Error("Failed to create health data");
      }

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
      const errorString = String(dbError);
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

      // Check for connection errors
      if (
        errorString.includes("ConnectionReset") ||
        errorString.includes("connection") ||
        errorString.includes("timeout")
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Database connection error. Please try again.",
            error: "Connection issue",
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
      let latest;
      let retries = 0;
      const maxRetries = 2;

      // Retry logic for connection issues
      while (retries <= maxRetries) {
        try {
          latest = await Promise.race([
            getLatestHealth(decoded.userId),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Query timeout")), 10000)
            ),
          ]);
          break; // Success, exit retry loop
        } catch (error) {
          retries++;
          if (retries > maxRetries) {
            throw error; // Max retries exceeded
          }
          console.warn(`[Health API] Retry ${retries}/${maxRetries}`, error);
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retries) * 1000)
          );
        }
      }

      // Return null atau latest jika ada
      return NextResponse.json(
        {
          success: true,
          message: "Data kesehatan berhasil diambil",
          data: latest || null,
        } as ApiResponse<typeof latest>,
        { status: 200 }
      );
    } catch (queryError) {
      console.error("[Query Error]", queryError);
      
      // Check if it's a connection error
      const errorMessage = String(queryError);
      if (
        errorMessage.includes("ConnectionReset") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout")
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Database connection error. Please try again.",
            error: "Connection issue",
          } as ApiResponse<null>,
          { status: 503 } // Service Unavailable
        );
      }

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
