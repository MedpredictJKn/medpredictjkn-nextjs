/**
 * POST /api/health/analyze
 * Analyze health data menggunakan Gemini API dengan fetch
 */

import { NextRequest, NextResponse } from "next/server";

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

interface AnalysisResponse {
  riskPrediction: {
    diabetes: { score: number; level: string; risk: number };
    hypertension: { score: number; level: string; risk: number };
    heartDisease: { score: number; level: string; risk: number };
  };
  alerts: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    action?: string;
  }>;
  screeningRecommendations: Array<{
    type: string;
    description: string;
    priority: string;
    reason: string;
    estimatedCost?: string;
    location?: string;
  }>;
  lifestyleRecommendations: Array<{
    category: string;
    tips: string[];
  }>;
  riskLevel: string;
  interventionRequired: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Get JWT token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request
    const body = await request.json();
    const { healthData, bmi } = body;

    if (!healthData || !bmi) {
      return NextResponse.json(
        { success: false, message: "Missing healthData or bmi" },
        { status: 400 }
      );
    }

    // Get Gemini API credentials
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;
    
    if (!apiKey || !apiUrl) {
      console.error("GEMINI_API_KEY or GEMINI_API_URL not configured");
      return NextResponse.json(
        { success: false, message: "AI service not configured" },
        { status: 500 }
      );
    }

    // Build prompt untuk Gemini
    const prompt = buildAnalysisPrompt(healthData, bmi);

    // Call Gemini API dengan fetch
    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiResponse.statusText);
      return NextResponse.json(
        { success: false, message: "AI service error" },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!responseText) {
      console.error("Empty response from Gemini API");
      return NextResponse.json(
        { success: false, message: "Empty AI response" },
        { status: 500 }
      );
    }

    // Parse response dari Gemini
    const analysis = parseGeminiResponse(responseText);

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error analyzing health data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(healthData: HealthData, bmi: number): string {
  const bloodPressureParts = healthData.bloodPressure?.split("/") || [];
  const _systole = bloodPressureParts[0] || "tidak diukur";
  const _diastole = bloodPressureParts[1] || "tidak diukur";

  return `Anda adalah ahli kesehatan profesional. Analisis data kesehatan pasien berikut dan berikan rekomendasi komprehensif dalam format JSON yang sangat terstruktur.

DATA KESEHATAN PASIEN:
- BMI: ${bmi.toFixed(1)}
- Tinggi Badan: ${healthData.height} cm
- Berat Badan: ${healthData.weight} kg
- Tekanan Darah: ${healthData.bloodPressure || "tidak diukur"} mmHg
- Gula Darah: ${healthData.bloodSugar || "tidak diukur"} mg/dL
- Kolesterol: ${healthData.cholesterol || "tidak diukur"} mg/dL
- Catatan Tambahan: ${healthData.notes || "tidak ada"}

INSTRUKSI:
Berikan analisis dalam JSON yang valid dengan struktur berikut. HARUS JSON yang bisa di-parse, tanpa teks tambahan:

{
  "riskPrediction": {
    "diabetes": {
      "score": 0,
      "level": "Low",
      "risk": 0
    },
    "hypertension": {
      "score": 0,
      "level": "Low",
      "risk": 0
    },
    "heartDisease": {
      "score": 0,
      "level": "Low",
      "risk": 0
    }
  },
  "alerts": [
    {
      "type": "Alert Type",
      "severity": "low",
      "message": "Alert message",
      "action": "Recommended action"
    }
  ],
  "screeningRecommendations": [
    {
      "type": "Test Type",
      "description": "Test description",
      "priority": "High",
      "reason": "Why this test",
      "estimatedCost": "Cost estimate",
      "location": "Where to get test"
    }
  ],
  "lifestyleRecommendations": [
    {
      "category": "Category",
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "riskLevel": "Low",
  "interventionRequired": false
}

PANDUAN PENILAIAN RISIKO DAN SCORING:

DIABETES:
- Rendah (Low): Score 0-30, Risk 0-30%
- Sedang (Medium): Score 31-60, Risk 31-60%
- Tinggi (High): Score 61-100, Risk 61-100%
Faktor: BMI >= 25 (+20), BMI >= 30 (+30), Gula >= 100 (+30), Gula >= 126 (+40)

HIPERTENSI:
- Rendah (Low): Score 0-25, Risk 0-25%
- Sedang (Medium): Score 26-60, Risk 26-60%
- Tinggi (High): Score 61-100, Risk 61-100%
Faktor: BMI >= 25 (+15), BMI >= 30 (+20), TD >= 130/85 (+30), TD >= 140/90 (+50)

PENYAKIT JANTUNG:
- Rendah (Low): Score 0-30, Risk 0-30%
- Sedang (Medium): Score 31-60, Risk 31-60%
- Tinggi (High): Score 61-100, Risk 61-100%
Faktor: BMI >= 25 (+15), BMI >= 30 (+25), Kolesterol >= 200 (+30), Kolesterol >= 240 (+40)

PENTING:
- Score dan Risk HARUS angka 0-100
- Level HARUS salah satu: "Rendah", "Sedang", "Tinggi"
- riskLevel keseluruhan adalah "Tinggi" jika salah satu prediksi >= 60, "Sedang" jika salah satu >= 30, "Rendah" jika semua < 30
- interventionRequired = true jika riskLevel = "Tinggi"
- Buatlah alert yang REALISTIS sesuai dengan risiko yang teridentifikasi
- Rekomendasi skrining kesehatan HARUS MINIMAL 4 REKOMENDASI yang spesifik dan relevan dengan risiko yang teridentifikasi
- Setiap rekomendasi harus memiliki type, description, priority, reason, estimatedCost, dan location yang jelas
- Semua teks harus dalam bahasa Indonesia yang baik dan profesional
- JANGAN tambahkan teks apapun di luar JSON.`;
}

function parseGeminiResponse(responseText: string): AnalysisResponse {
  try {
    // Extract JSON dari response (kemungkinan ada teks tambahan)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    // Validate dan normalize response
    return {
      riskPrediction: {
        diabetes: {
          score: Math.min(100, Math.max(0, parsed.riskPrediction?.diabetes?.score || 0)),
          level: parsed.riskPrediction?.diabetes?.level || "Low",
          risk: Math.min(100, Math.max(0, parsed.riskPrediction?.diabetes?.risk || 0)),
        },
        hypertension: {
          score: Math.min(100, Math.max(0, parsed.riskPrediction?.hypertension?.score || 0)),
          level: parsed.riskPrediction?.hypertension?.level || "Low",
          risk: Math.min(100, Math.max(0, parsed.riskPrediction?.hypertension?.risk || 0)),
        },
        heartDisease: {
          score: Math.min(100, Math.max(0, parsed.riskPrediction?.heartDisease?.score || 0)),
          level: parsed.riskPrediction?.heartDisease?.level || "Low",
          risk: Math.min(100, Math.max(0, parsed.riskPrediction?.heartDisease?.risk || 0)),
        },
      },
      alerts: (parsed.alerts || []).slice(0, 10),
      screeningRecommendations: (parsed.screeningRecommendations || []).slice(0, 6),
      lifestyleRecommendations: (parsed.lifestyleRecommendations || []).slice(0, 5),
      riskLevel: parsed.riskLevel || "Low",
      interventionRequired: Boolean(parsed.interventionRequired),
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Return fallback response
    return {
      riskPrediction: {
        diabetes: { score: 0, level: "Low", risk: 0 },
        hypertension: { score: 0, level: "Low", risk: 0 },
        heartDisease: { score: 0, level: "Low", risk: 0 },
      },
      alerts: [],
      screeningRecommendations: [],
      lifestyleRecommendations: [],
      riskLevel: "Low",
      interventionRequired: false,
    };
  }
}
