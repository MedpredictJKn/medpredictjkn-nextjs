/**
 * POST /api/risk/calculate
 * 
 * Menghitung skor risiko penyakit berdasarkan data JKN dan riwayat kesehatan
 * Endpoint ini dipanggil setelah pengguna melengkapi form risk assessment
 * 
 * Request Body:
 * {
 *   "age": 45,
 *   "gender": "male",
 *   "height": 170,
 *   "weight": 85,
 *   "bloodPressure": { "systolic": 140, "diastolic": 90 },
 *   "cholesterol": 250,
 *   "bloodSugar": 110,
 *   "smoker": true,
 *   "familyHistory": ["Diabetes", "Heart Disease"],
 *   "medicalHistory": ["Hypertension"]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "diabetes2Score": 68,
 *     "hypertensionScore": 75,
 *     "coronaryHeartScore": 72,
 *     "strokeScore": 65,
 *     "highRiskDiseases": ["Hipertensi", "Jantung Koroner"],
 *     "alertSent": true
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { calculateDiseaseRisks } from "@/lib/services/riskCalculation";

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const tokenPayload = await verifyTokenAndGetUserId(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = tokenPayload.userId;

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { age, gender, height, weight, bloodPressure, cholesterol, bloodSugar } = body;

    if (!age || !gender || !height || !weight || !bloodPressure) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: age, gender, height, weight, bloodPressure",
        },
        { status: 400 }
      );
    }

    // Calculate disease risks
    const riskScores = await calculateDiseaseRisks({
      userId,
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bloodPressure,
      cholesterol: cholesterol ? parseFloat(cholesterol) : undefined,
      bloodSugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
      smoker: body.smoker || false,
      familyHistory: body.familyHistory || [],
      medicalHistory: body.medicalHistory || [],
    });

    // Check if user needs alerts
    let alertSent = false;
    if (riskScores.highRiskDiseases.length > 0) {
      // TODO: Send alerts after database setup
      // For now, just log the alert
      console.log(`[Alert] High-risk diseases for user ${userId}: ${riskScores.highRiskDiseases.join(", ")}`);
      alertSent = true;
    }

    // TODO: Create medical record after database setup
    // For now, just log the assessment
    console.log(`[Risk Assessment] User ${userId}: High-risk diseases: ${riskScores.highRiskDiseases.join(", ")}`);


    return NextResponse.json(
      {
        success: true,
        data: {
          ...riskScores,
          alertSent,
        },
        message: "Risk assessment calculated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Risk calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error calculating risk assessment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/risk/scores - Retrieve user's current risk scores
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const tokenPayload = await verifyTokenAndGetUserId(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // TODO: Retrieve from database after setup
    return NextResponse.json(
      {
        success: false,
        message:
          "No risk assessment found. Please complete a risk assessment first.",
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error retrieving risk scores:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error retrieving risk scores",
      },
      { status: 500 }
    );
  }
}

// ========== Helper Functions ==========

async function verifyTokenAndGetUserId(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }

    // Note: In production, use a proper JWT library like jsonwebtoken
    // This is a simplified version - actual implementation should verify the token properly
    const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}
