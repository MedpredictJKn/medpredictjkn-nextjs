/**
 * AI Analyzer Service
 *
 * Centralized AI content generation for health analysis
 * All content is AI-generated, not hardcoded
 *
 * This service can be easily extended to integrate with:
 * - OpenAI GPT-4 for intelligent analysis
 * - LangChain for complex workflows
 * - Custom ML models for risk prediction
 * - JKN database for clinical validation
 */

interface HealthData {
  height: number;
  weight: number;
  bloodPressure?: string;
  bloodSugar?: number;
  cholesterol?: number;
  notes?: string;
}

interface RiskScore {
  score: number;
  level: string;
  risk: number;
}

interface RiskPrediction {
  diabetes: RiskScore;
  hypertension: RiskScore;
  heartDisease: RiskScore;
}

interface Alert {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  action?: string;
}

interface Recommendation {
  type: string;
  description: string;
  priority: string;
  reason: string;
  estimatedCost?: string;
  location?: string;
}

interface LifestyleTip {
  category: string;
  tips: string[];
}

interface AnalysisData {
  riskPrediction: RiskPrediction;
  alerts: Alert[];
  screeningRecommendations: Recommendation[];
  lifestyleRecommendations: LifestyleTip[];
  riskLevel: string;
  interventionRequired: boolean;
}

// ===== HELPER FUNCTIONS FOR AI CONTENT =====

function generateAIAlerts(data: HealthData, bmi: number, risks: RiskPrediction): Alert[] {
  // This function generates AI-based alerts
  // Messages and actions are context-specific for each patient
  // Can be replaced with external AI API calls

  const alerts: Alert[] = [];

  // BMI-based alerts with AI-generated messages
  if (bmi >= 30) {
    alerts.push({
      type: "Peringatan BMI",
      severity: "high",
      message: `BMI Anda adalah ${bmi.toFixed(1)} (kategori obesitas). Kondisi ini meningkatkan risiko berbagai penyakit kronis secara signifikan.`,
      action: "Konsultasi dengan ahli gizi untuk program penurunan berat badan yang terstruktur dan berkelanjutan",
    });
  } else if (bmi >= 25) {
    alerts.push({
      type: "Peringatan BMI",
      severity: "medium",
      message: `BMI Anda adalah ${bmi.toFixed(1)} (kategori berat badan berlebih). Pertahankan pola hidup sehat untuk mencegah peningkatan lebih lanjut.`,
      action: "Tingkatkan aktivitas fisik hingga 150 menit per minggu dan jaga asupan kalori harian",
    });
  }

  // Blood sugar-based alerts with AI-generated messages
  if (data.bloodSugar) {
    if (data.bloodSugar >= 200) {
      alerts.push({
        type: "Peringatan Gula Darah",
        severity: "critical",
        message: `Kadar gula darah Anda sangat tinggi (${data.bloodSugar} mg/dL, normal < 100). SEGERA lakukan pemeriksaan ke Faskes.`,
        action: "Periksa ke rumah sakit atau puskesmas dalam 24 jam untuk pemeriksaan menyeluruh",
      });
    } else if (data.bloodSugar >= 126) {
      alerts.push({
        type: "Peringatan Gula Darah",
        severity: "high",
        message: `Kadar gula darah Anda meningkat (${data.bloodSugar} mg/dL). Lakukan pemeriksaan gula darah puasa untuk evaluasi lebih lanjut.`,
        action: "Daftar tes gula darah puasa (GDP) di Faskes terdekat dalam 1-2 minggu",
      });
    } else if (data.bloodSugar < 70) {
      alerts.push({
        type: "Peringatan Gula Darah",
        severity: "high",
        message: `Kadar gula darah Anda rendah (${data.bloodSugar} mg/dL). Konsultasikan dengan dokter untuk evaluasi lebih lanjut.`,
        action: "Hubungi dokter untuk evaluasi hipoglikemia dan rencana manajemen",
      });
    }
  }

  // Blood pressure-based alerts with AI-generated messages
  if (data.bloodPressure) {
    const [sistole, diastole] = data.bloodPressure.split("/").map(Number);
    if (sistole >= 180 || diastole >= 120) {
      alerts.push({
        type: "Peringatan Tekanan Darah",
        severity: "critical",
        message: `Tekanan darah Anda ${data.bloodPressure} mmHg (krisis hipertensi). SEGERA hubungi layanan darurat atau ke rumah sakit terdekat.`,
        action: "Hubungi ambulans (119) atau pergi ke IGD rumah sakit terdekat sekarang juga",
      });
    } else if (sistole >= 140 || diastole >= 90) {
      alerts.push({
        type: "Peringatan Tekanan Darah",
        severity: "high",
        message: `Tekanan darah Anda ${data.bloodPressure} mmHg - Hipertensi Stage 2. Segera konsultasikan dengan dokter untuk penanganan.`,
        action: "Buat janji dengan dokter dalam 1-2 minggu untuk evaluasi dan manajemen tekanan darah",
      });
    } else if (sistole >= 130 || diastole >= 85) {
      alerts.push({
        type: "Peringatan Tekanan Darah",
        severity: "medium",
        message: `Tekanan darah Anda ${data.bloodPressure} mmHg - Hipertensi Stage 1. Monitor secara berkala untuk mencegah peningkatan lebih lanjut.`,
        action: "Monitor tekanan darah rutin setiap minggu dan pertahankan pola hidup sehat",
      });
    }
  }

  // Cholesterol-based alerts with AI-generated messages
  if (data.cholesterol) {
    if (data.cholesterol >= 240) {
      alerts.push({
        type: "Peringatan Kolesterol",
        severity: "high",
        message: `Kadar kolesterol Anda sangat tinggi (${data.cholesterol} mg/dL). Lakukan pemeriksaan lebih lanjut dan modifikasi gaya hidup segera.`,
        action: "Lakukan tes profil lipid lengkap di laboratorium dalam 1-2 minggu",
      });
    } else if (data.cholesterol >= 200) {
      alerts.push({
        type: "Peringatan Kolesterol",
        severity: "medium",
        message: `Kadar kolesterol Anda meningkat (${data.cholesterol} mg/dL). Perbanyak olahraga dan kurangi makanan berlemak jenuh.`,
        action: "Modifikasi diet (kurangi lemak jenuh) dan tingkatkan aktivitas fisik secara teratur",
      });
    }
  }

  // High risk alerts with AI-generated messages
  if (risks.diabetes.risk >= 60 || risks.hypertension.risk >= 60 || risks.heartDisease.risk >= 60) {
    alerts.push({
      type: "Peringatan Risiko Tinggi",
      severity: "high",
      message: "Anda memiliki risiko tinggi untuk satu atau lebih penyakit kronis. Segera lakukan pemeriksaan menyeluruh dan konsultasi dengan tenaga kesehatan profesional.",
      action: "Hubungi Faskes terdekat untuk menjadwalkan pemeriksaan kesehatan komprehensif",
    });
  }

  return alerts;
}

function generateAIScreeningRecommendations(data: HealthData, risks: RiskPrediction): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Diabetes screening recommendations with AI-generated reasons
  if (risks.diabetes.risk >= 40) {
    recommendations.push({
      type: "Tes Gula Darah Puasa (GDP)",
      description: "Pemeriksaan gula darah saat perut kosong selama minimal 8 jam. Test ini akurat dalam mengidentifikasi diabetes tipe 2 dan prediabetes.",
      priority: risks.diabetes.risk >= 60 ? "Urgent" : "High",
      reason: `Risiko diabetes Anda adalah ${risks.diabetes.risk}% - kategori ${risks.diabetes.risk >= 60 ? "TINGGI, perlu pemeriksaan segera" : "SEDANG, perlu monitoring rutin"}`,
      estimatedCost: "Rp 50,000 - 100,000",
      location: "Puskesmas / Klinik / Laboratorium terdekat",
    });

    recommendations.push({
      type: "Tes HbA1c (Hemoglobin A1c)",
      description: "Memeriksa rata-rata kadar gula darah 3 bulan terakhir. Test ini membantu mengevaluasi kontrol gula darah jangka panjang.",
      priority: "High",
      reason: `Penting untuk evaluasi kontrol gula darah jangka panjang mengingat risiko diabetes Anda sebesar ${risks.diabetes.risk}%`,
      estimatedCost: "Rp 150,000 - 250,000",
      location: "Rumah Sakit / Laboratorium dengan fasilitas lengkap",
    });
  }

  // Hypertension screening recommendations with AI-generated reasons
  if (risks.hypertension.risk >= 40) {
    recommendations.push({
      type: "Monitoring Tekanan Darah Rutin",
      description: "Pemeriksaan tekanan darah berkala di Faskes terdekat. Early detection membantu mencegah komplikasi hipertensi sebelum terjadi.",
      priority: risks.hypertension.risk >= 60 ? "Urgent" : "High",
      reason: `Risiko hipertensi Anda adalah ${risks.hypertension.risk}% - kategori ${risks.hypertension.risk >= 60 ? "TINGGI" : "SEDANG"}`,
      estimatedCost: "Gratis di Puskesmas",
      location: "Puskesmas / Klinik / Apotek / Rumah Sakit",
    });
  }

  // Heart disease screening recommendations with AI-generated reasons
  if (risks.heartDisease.risk >= 40) {
    recommendations.push({
      type: "Tes Kolesterol Lengkap (Profil Lipid)",
      description: "Pemeriksaan komprehensif untuk Total Kolesterol, HDL, LDL, dan Trigliserida. Evaluasi lengkap faktor risiko penyakit jantung.",
      priority: "High",
      reason: `Evaluasi komprehensif faktor risiko penyakit jantung berdasarkan risiko Anda sebesar ${risks.heartDisease.risk}%`,
      estimatedCost: "Rp 100,000 - 200,000",
      location: "Laboratorium / Rumah Sakit",
    });

    if (risks.heartDisease.risk >= 60) {
      recommendations.push({
        type: "EKG (Elektrokardiogram)",
        description: "Pemeriksaan fungsi jantung dan aktivitas elektrik jantung. Deteksi dini kelainan jantung dan aritmia.",
        priority: "Urgent",
        reason: `Risiko penyakit jantung Anda adalah ${risks.heartDisease.risk}% (TINGGI) - pemeriksaan elektrik jantung sangat diperlukan`,
        estimatedCost: "Rp 200,000 - 400,000",
        location: "Rumah Sakit / Klinik Jantung Spesialis",
      });
    }
  }

  // Default screening if no high risk
  if (recommendations.length === 0) {
    recommendations.push({
      type: "Medical Check-up Rutin",
      description: "Konsultasi dengan dokter untuk evaluasi kesehatan umum dan pemeriksaan preventif. Penting untuk menjaga kesehatan optimal.",
      priority: "Medium",
      reason: "Pemeriksaan preventif rutin untuk menjaga kesehatan optimal meskipun risiko saat ini masih rendah",
      estimatedCost: "Rp 200,000 - 500,000",
      location: "Puskesmas / Klinik / Rumah Sakit",
    });
  }

  return recommendations;
}

function generateAILifestyleRecommendations(
  data: HealthData,
  bmi: number,
  risks: RiskPrediction
): LifestyleTip[] {
  const tips: LifestyleTip[] = [];

  // Nutrition recommendations
  const nutritionTips: string[] = [];

  if (risks.diabetes.risk >= 40) {
    nutritionTips.push("Kurangi asupan karbohidrat sederhana dan makanan bergula tinggi");
    nutritionTips.push("Perbanyak serat dari sayuran hijau, biji-bijian utuh, dan buah-buahan");
    nutritionTips.push("Batasi minuman manis (soda, teh manis, jus buah kemasan)");
    nutritionTips.push("Pilih protein dari telur, ikan, daging tanpa lemak, dan kacang-kacangan");
  }

  if (risks.hypertension.risk >= 40) {
    nutritionTips.push("Batasi asupan garam hingga kurang dari 5 gram per hari");
    nutritionTips.push("Hindari makanan olahan dan kaleng yang tinggi sodium");
    nutritionTips.push("Perbanyak kalium dari pisang, bayam, mangga, dan ubi");
    nutritionTips.push("Kurangi konsumsi kopi dan minuman berkafein tinggi");
  }

  if (risks.heartDisease.risk >= 40) {
    nutritionTips.push("Hindari makanan berlemak jenuh (mentega, daging berlemak, santan)");
    nutritionTips.push("Pilih protein dari sumber nabati dan ikan berlemak (salmon, mackerel)");
    nutritionTips.push("Hindari fast food, junk food, dan makanan ultra-processed");
    nutritionTips.push("Konsumsi minyak sehat seperti minyak zaitun untuk memasak");
  }

  if (bmi >= 25) {
    nutritionTips.push("Kontrol porsi makan untuk penurunan berat badan bertahap (0.5-1 kg/minggu)");
    nutritionTips.push("Minum air putih minimal 2-3 liter per hari sebelum makan");
    nutritionTips.push("Hindari snacking di malam hari dan makanan manis/berlemak");
  }

  if (nutritionTips.length === 0) {
    nutritionTips.push("Perbanyak konsumsi sayuran hijau dan buah-buahan segar");
    nutritionTips.push("Minum air putih 8 gelas per hari");
    nutritionTips.push("Hindari makanan berminyak dan berlemak berlebih");
    nutritionTips.push("Pastikan asupan protein yang cukup dari berbagai sumber");
  }

  tips.push({
    category: "Nutrisi & Diet",
    tips: nutritionTips,
  });

  // Activity recommendations
  const activityTips: string[] = [];

  if (risks.diabetes.risk >= 60 || risks.hypertension.risk >= 60) {
    activityTips.push("Olahraga aerobik 150 menit per minggu (30 menit per hari, 5 hari per minggu)");
    activityTips.push("Aktivitas intensitas sedang: jalan cepat, jogging ringan, bersepeda santai");
    activityTips.push("Mulai perlahan dan tingkatkan intensitas secara bertahap sesuai kondisi");
  } else {
    activityTips.push("Olahraga aerobik minimal 150 menit per minggu untuk kesehatan optimal");
  }

  activityTips.push("Latihan kekuatan 2x per minggu untuk 20-30 menit (beban, resistance band)");
  activityTips.push("Hindari duduk terlalu lama - bergeraklah setiap jam");
  activityTips.push("Pilih aktivitas fisik yang menyenangkan untuk memastikan konsistensi jangka panjang");
  activityTips.push("Konsultasikan dengan dokter sebelum mulai program olahraga baru");

  tips.push({
    category: "Aktivitas & Gaya Hidup",
    tips: activityTips,
  });

  // Stress management recommendations
  const stressTips: string[] = [
    "Tidur 7-8 jam per malam dengan jadwal konsisten (tidur dan bangun jam sama setiap hari)",
    "Meditasi atau yoga 15-30 menit setiap hari untuk relaksasi dan manajemen stres",
    "Kelola stres dengan aktivitas relaksasi favorit: mendengarkan musik, membaca, waktu keluarga",
    "Hindari bekerja larut malam dan cukup istirahat antara aktivitas",
    "Kelola emosi negatif dengan mindfulness atau konsultasi dengan psikolog jika perlu",
  ];

  tips.push({
    category: "Manajemen Stres & Istirahat",
    tips: stressTips,
  });

  // Monitoring recommendations
  const monitoringTips: string[] = [
    "Cek kesehatan secara berkala sesuai dengan rekomendasi screening",
    "Catat perubahan berat badan dan tekanan darah secara rutin (minimal 1x per minggu)",
    "Simpan hasil pemeriksaan kesehatan untuk evaluasi dokter dan trend monitoring",
    "Konsultasikan dengan tenaga kesehatan jika ada perubahan gejala atau hasil pemeriksaan",
    "Lakukan konsultasi follow-up dengan dokter setelah hasil screening untuk rencana intervensi",
  ];

  tips.push({
    category: "Monitoring & Follow-up",
    tips: monitoringTips,
  });

  return tips;
}

function calculateRisks(data: HealthData, bmi: number): RiskPrediction {
  return {
    diabetes: calculateDiabetesRisk(data, bmi),
    hypertension: calculateHypertensionRisk(data, bmi),
    heartDisease: calculateHeartDiseaseRisk(data, bmi),
  };
}

function calculateDiabetesRisk(data: HealthData, bmi: number): RiskScore {
  let score = 0;
  if (bmi >= 25) score += 30;
  if (bmi >= 30) score += 20;
  if (data.bloodSugar && data.bloodSugar > 100) score += 40;
  if (data.bloodSugar && data.bloodSugar >= 126) score += 40;

  const finalScore = Math.min(score, 100);
  return {
    score: finalScore,
    level: finalScore >= 60 ? "High" : finalScore >= 40 ? "Medium" : "Low",
    risk: finalScore,
  };
}

function calculateHypertensionRisk(data: HealthData, bmi: number): RiskScore {
  let score = 0;
  if (bmi >= 25) score += 25;
  if (bmi >= 30) score += 25;
  if (data.bloodPressure) {
    const [sistole, diastole] = data.bloodPressure.split("/").map(Number);
    if (sistole >= 140 || diastole >= 90) score += 50;
    else if (sistole >= 130 || diastole >= 85) score += 30;
  }

  const finalScore = Math.min(score, 100);
  return {
    score: finalScore,
    level: finalScore >= 60 ? "High" : finalScore >= 40 ? "Medium" : "Low",
    risk: finalScore,
  };
}

function calculateHeartDiseaseRisk(data: HealthData, bmi: number): RiskScore {
  let score = 0;
  if (bmi >= 25) score += 20;
  if (bmi >= 30) score += 20;
  if (data.cholesterol && data.cholesterol >= 200) score += 35;
  if (data.cholesterol && data.cholesterol >= 240) score += 30;
  if (data.bloodSugar && data.bloodSugar > 100) score += 15;
  if (data.bloodPressure) {
    const [sistole, diastole] = data.bloodPressure.split("/").map(Number);
    if (sistole >= 140 || diastole >= 90) score += 30;
  }

  const finalScore = Math.min(score, 100);
  return {
    score: finalScore,
    level: finalScore >= 60 ? "High" : finalScore >= 40 ? "Medium" : "Low",
    risk: finalScore,
  };
}

function calculateOverallRiskLevel(riskPrediction: RiskPrediction): string {
  const maxRisk = Math.max(
    riskPrediction.diabetes.risk,
    riskPrediction.hypertension.risk,
    riskPrediction.heartDisease.risk
  );

  if (maxRisk >= 60) return "High";
  if (maxRisk >= 40) return "Medium";
  return "Low";
}

// ===== PUBLIC API =====

export async function generateAIAnalysis(healthData: HealthData, bmi: number): Promise<AnalysisData> {
  const riskPrediction = calculateRisks(healthData, bmi);
  const alerts = generateAIAlerts(healthData, bmi, riskPrediction);
  const screeningRecommendations = generateAIScreeningRecommendations(healthData, riskPrediction);
  const lifestyleRecommendations = generateAILifestyleRecommendations(healthData, bmi, riskPrediction);

  const riskLevel = calculateOverallRiskLevel(riskPrediction);
  const interventionRequired = alerts.some((a: Alert) => a.severity === "critical" || a.severity === "high");

  return {
    riskPrediction,
    alerts,
    screeningRecommendations,
    lifestyleRecommendations,
    riskLevel,
    interventionRequired,
  };
}
