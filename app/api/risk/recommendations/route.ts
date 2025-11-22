import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/utils";
import { generateAIAnalysis } from "@/lib/services/aiAnalyzer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthData {
  height: number;
  weight: number;
  bloodPressure?: string;
  bloodSugar?: number;
  cholesterol?: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { healthData, bmi } = body as { healthData: HealthData; bmi: number };

    if (!healthData || !bmi) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const analysis = await generateAIAnalysis(healthData, bmi);

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Risk recommendation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menganalisis risiko",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
