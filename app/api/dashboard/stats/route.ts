import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DashboardStats {
  totalPemeriksaan: number;
  totalChat: number;
  alertAktif: number;
  latestHealth: {
    bloodPressure: string | null;
    bmi: number;
    bloodSugar: number | null;
    cholesterol: number | null;
    createdAt: Date;
  } | null;
  wellnessScore: number;
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

    // Get total pemeriksaan (health data count)
    const totalPemeriksaan = await prisma.healthData.count({
      where: { userId: decoded.userId },
    });

    // Get total chat
    const totalChat = await prisma.chatHistory.count({
      where: { userId: decoded.userId },
    });

    // Get latest health data with optimized query
    const latestHealth = await prisma.healthData.findFirst({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    // Calculate alerts - berdasarkan kondisi kesehatan
    let alertAktif = 0;
    if (latestHealth) {
      // Check blood pressure
      if (latestHealth.bloodPressure) {
        const [systolic] = latestHealth.bloodPressure.split("/").map(Number);
        if (systolic > 140 || systolic < 90) alertAktif++;
      }
      // Check blood sugar
      if (latestHealth.bloodSugar && (latestHealth.bloodSugar > 200 || latestHealth.bloodSugar < 70)) {
        alertAktif++;
      }
      // Check cholesterol
      if (latestHealth.cholesterol && latestHealth.cholesterol > 200) {
        alertAktif++;
      }
    }

    // Calculate wellness score (0-100)
    let wellnessScore = 80; // Start with default score
    if (latestHealth) {
      let deductions = 0;

      // BMI check (normal: 18.5-24.9)
      if (latestHealth.bmi < 18.5 || latestHealth.bmi > 24.9) {
        deductions += 10;
      }

      // Blood pressure check
      if (latestHealth.bloodPressure) {
        const [systolic] = latestHealth.bloodPressure.split("/").map(Number);
        if (systolic > 140 || systolic < 90) {
          deductions += 20;
        } else if (systolic > 130 || systolic < 100) {
          deductions += 10;
        }
      }

      // Blood sugar check
      if (latestHealth.bloodSugar) {
        if (latestHealth.bloodSugar > 200 || latestHealth.bloodSugar < 70) {
          deductions += 20;
        } else if (latestHealth.bloodSugar > 140 || latestHealth.bloodSugar < 100) {
          deductions += 10;
        }
      }

      // Cholesterol check
      if (latestHealth.cholesterol) {
        if (latestHealth.cholesterol > 240) {
          deductions += 15;
        } else if (latestHealth.cholesterol > 200) {
          deductions += 10;
        }
      }

      wellnessScore = Math.max(0, 80 - deductions);
    }

    const stats: DashboardStats = {
      totalPemeriksaan,
      totalChat,
      alertAktif,
      latestHealth,
      wellnessScore,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Dashboard stats retrieved",
        data: stats,
      } as ApiResponse<DashboardStats>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard stats error:", error);
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
