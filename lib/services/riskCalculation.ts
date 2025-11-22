/**
 * Disease Risk Prediction Engine
 * Menggunakan data JKN untuk menghitung skor risiko penyakit
 * 
 * Model Prediksi:
 * - Diabetes Mellitus Tipe 2
 * - Hipertensi
 * - Jantung Koroner (Coronary Heart Disease)
 * - Stroke
 * 
 * Database persistence akan diimplementasikan setelah Prisma migration selesai
 */

import { RiskCalculationPayload, DiseaseRiskScoreData } from "@/types";

// ========== Risk Calculation Models ==========

interface RiskFactors {
  age: number;
  gender?: string;
  bmi?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  cholesterol?: number;
  bloodSugar?: number;
  smoker?: boolean;
  familyHistory?: string[];
  medicalHistory?: string[];
  hasHypertension?: boolean;
  hasDiabetes?: boolean;
  hasHeartDisease?: boolean;
}

// Diabetes Mellitus Tipe 2 Risk Calculation (Finnish Diabetes Risk Score variant)
export function calculateDiabetesRisk(factors: RiskFactors): number {
  let score = 0;

  // Age (0-3 points)
  if (factors.age >= 45) score += 2;
  if (factors.age >= 55) score += 1;

  // BMI (0-3 points)
  if (factors.bmi) {
    if (factors.bmi >= 25 && factors.bmi < 30) score += 1;
    if (factors.bmi >= 30 && factors.bmi < 35) score += 2;
    if (factors.bmi >= 35) score += 3;
  }

  // Waist Circumference (estimated from BMI)
  if (factors.bmi && factors.bmi >= 30) {
    score += 1;
  }

  // Fasting Blood Sugar
  if (factors.bloodSugar) {
    if (factors.bloodSugar >= 100 && factors.bloodSugar < 126) score += 3;
    if (factors.bloodSugar >= 126) score += 5;
  }

  // Hypertension History
  if (factors.hasHypertension) score += 2;

  // Family History
  if (factors.familyHistory?.includes("Diabetes")) score += 3;

  // Medication for High BP
  if (factors.medicalHistory?.includes("Antihypertensive")) score += 2;

  // Regular Physical Activity (assumed No)
  score += 2;

  // Convert to percentage (0-100)
  const maxScore = 20;
  const percentage = (score / maxScore) * 100;
  return Math.min(100, Math.max(0, percentage));
}

// Hypertension Risk Calculation
export function calculateHypertensionRisk(factors: RiskFactors): number {
  let score = 0;

  // Age
  if (factors.age >= 40) score += 1;
  if (factors.age >= 50) score += 1;
  if (factors.age >= 60) score += 2;

  // Gender (Men higher risk)
  if (factors.gender === "male" && factors.age < 55) score += 2;
  if (factors.gender === "female" && factors.age >= 55) score += 1;

  // BMI
  if (factors.bmi) {
    if (factors.bmi >= 25 && factors.bmi < 30) score += 1;
    if (factors.bmi >= 30) score += 2;
  }

  // Current Blood Pressure
  if (factors.bloodPressure) {
    const { systolic, diastolic } = factors.bloodPressure;
    if (systolic >= 120 || diastolic >= 80) score += 1;
    if (systolic >= 130 || diastolic >= 85) score += 2;
    if (systolic >= 140 || diastolic >= 90) score += 3;
  }

  // Family History
  if (factors.familyHistory?.includes("Hypertension")) score += 2;

  // Diabetes
  if (factors.hasDiabetes) score += 2;

  // Cholesterol
  if (factors.cholesterol && factors.cholesterol >= 240) score += 1;

  // Smoking
  if (factors.smoker) score += 2;

  const maxScore = 18;
  const percentage = (score / maxScore) * 100;
  return Math.min(100, Math.max(0, percentage));
}

// Coronary Heart Disease Risk Calculation (Framingham-inspired)
export function calculateCoronaryHeartRisk(factors: RiskFactors): number {
  let score = 0;

  // Age and Gender
  if (factors.gender === "male") {
    if (factors.age >= 40) score += 1;
    if (factors.age >= 50) score += 2;
  } else {
    if (factors.age >= 50) score += 1;
    if (factors.age >= 60) score += 2;
  }

  // Total Cholesterol
  if (factors.cholesterol) {
    if (factors.cholesterol >= 240) score += 3;
    if (factors.cholesterol >= 200 && factors.cholesterol < 240) score += 1;
  }

  // HDL Cholesterol (assumed low if high cholesterol)
  if (factors.cholesterol && factors.cholesterol >= 240) score += 1;

  // Blood Pressure
  if (factors.bloodPressure) {
    const { systolic } = factors.bloodPressure;
    if (systolic >= 140) score += 2;
    if (systolic >= 130 && systolic < 140) score += 1;
  }

  // Diabetes
  if (factors.hasDiabetes) score += 3;

  // Smoking
  if (factors.smoker) score += 3;

  // Family History
  if (factors.familyHistory?.includes("Heart Disease")) score += 3;

  // BMI
  if (factors.bmi && factors.bmi >= 30) score += 2;

  // Previous Heart Disease
  if (factors.hasHeartDisease) score += 5;

  const maxScore = 25;
  const percentage = (score / maxScore) * 100;
  return Math.min(100, Math.max(0, percentage));
}

// Stroke Risk Calculation
// Stroke Risk Calculation
export function calculateStrokeRisk(factors: RiskFactors): number {
  let score = 0;

  // Age
  if (factors.age >= 55) score += 2;
  if (factors.age >= 65) score += 2;

  // Gender
  if (factors.gender === "male") score += 1;

  // Hypertension (strongest predictor)
  if (factors.hasHypertension) score += 3;
  
  // ✅ FIX: Proper null checking
  if (factors.bloodPressure && factors.bloodPressure.systolic >= 140) {
    score += 2;
  }

  // Diabetes
  if (factors.hasDiabetes) score += 2;

  // Smoking
  if (factors.smoker) score += 3;

  // Atrial Fibrillation (from medical history)
  if (factors.medicalHistory?.includes("Atrial Fibrillation")) score += 4;

  // Left Ventricular Hypertrophy
  if (factors.medicalHistory?.includes("LVH")) score += 2;

  // Family History
  if (factors.familyHistory?.includes("Stroke")) score += 2;

  // Cholesterol
  if (factors.cholesterol && factors.cholesterol >= 240) score += 1;

  const maxScore = 23;
  const percentage = (score / maxScore) * 100;
  return Math.min(100, Math.max(0, percentage));
}

// ========== Main Risk Calculation Function ==========

export async function calculateDiseaseRisks(
  payload: RiskCalculationPayload
): Promise<DiseaseRiskScoreData> {
  const {
    userId,
    age,
    gender,
    height,
    weight,
    bloodPressure,
    cholesterol,
    bloodSugar,
    familyHistory = [],
    smoker = false,
    medicalHistory = [],
  } = payload;

  // Calculate BMI if height and weight provided
  let bmi: number | undefined;
  if (height && weight) {
    const heightInMeters = height / 100;
    bmi = weight / (heightInMeters * heightInMeters);
  }

  // Extract risk factors from medical history
  const hasHypertension = medicalHistory.includes("Hypertension") ||
    medicalHistory.some((h) =>
      h.toLowerCase().includes("tekanan darah tinggi")
    );
  const hasDiabetes = medicalHistory.includes("Diabetes") ||
    medicalHistory.some((h) =>
      h.toLowerCase().includes("diabetes")
    );
  const hasHeartDisease = medicalHistory.includes("Heart Disease") ||
    medicalHistory.some((h) =>
      h.toLowerCase().includes("jantung")
    );

  const riskFactors: RiskFactors = {
    age,
    gender,
    bmi,
    bloodPressure,
    cholesterol,
    bloodSugar,
    smoker,
    familyHistory,
    medicalHistory,
    hasHypertension,
    hasDiabetes,
    hasHeartDisease,
  };

  // Calculate individual disease risks
  const diabetes2Score = calculateDiabetesRisk(riskFactors);
  const hypertensionScore = calculateHypertensionRisk(riskFactors);
  const coronaryHeartScore = calculateCoronaryHeartRisk(riskFactors);
  const strokeScore = calculateStrokeRisk(riskFactors);

  // Identify high-risk diseases (above 70% threshold)
  const riskThreshold = 70;
  const highRiskDiseases: string[] = [];

  if (diabetes2Score >= riskThreshold) highRiskDiseases.push("Diabetes Mellitus Tipe 2");
  if (hypertensionScore >= riskThreshold) highRiskDiseases.push("Hipertensi");
  if (coronaryHeartScore >= riskThreshold) highRiskDiseases.push("Jantung Koroner");
  if (strokeScore >= riskThreshold) highRiskDiseases.push("Stroke");

  // TODO: Save or update risk scores in database after Prisma migration
  const nextCalculationDate = new Date();
  nextCalculationDate.setMonth(nextCalculationDate.getMonth() + 3); // Recalculate in 3 months

  const riskScoreData: DiseaseRiskScoreData = {
    userId,
    diabetes2Score: Math.round(diabetes2Score),
    hypertensionScore: Math.round(hypertensionScore),
    coronaryHeartScore: Math.round(coronaryHeartScore),
    strokeScore: Math.round(strokeScore),
    riskThreshold,
    highRiskDiseases,
    alertSent: false,
    alertedToFaskes: false,
    calculatedAt: new Date(),
    nextCalculationDate,
  };

  return riskScoreData;
}

// Get user's current risk profile
export async function getUserRiskProfile(_userId: string) {
  // TODO: Implement after database setup
  return null;
}
