export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface HealthCheckPayload {
  height: number;
  weight: number;
  bloodPressure?: string;
  bloodSugar?: number;
  cholesterol?: number;
  notes?: string;
}

export interface ChatPayload {
  message: string;
  source?: "fastapi" | "gemini";
  sessionId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  age?: number;
  gender?: string;
  role: string; // 'patient' | 'doctor'
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthData {
  id: string;
  userId: string;
  height: number;
  weight: number;
  bmi: number;
  status: string;
  bloodPressure: string | null;
  bloodSugar: number | null;
  cholesterol: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatHistory {
  id: string;
  userId: string;
  sessionId: string;
  message: string;
  response: string;
  source: string;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

// ========== MedpredictJKN Types ==========

export interface MedicalRecord {
  id: string;
  userId: string;
  diagnosisICD10?: string;
  diagnosisName?: string;
  medicationName?: string;
  medicationDose?: string;
  visitDate: Date;
  visitType: string;
  labTestName?: string;
  labValue?: number;
  labUnit?: string;
  labNormalRange?: string;
  createdAt: Date;
}

export interface DiseaseRiskInput {
  userId: string;
  medicalRecords: MedicalRecord[];
  age: number;
  gender?: string;
  bloodPressure?: string;
  cholesterol?: number;
  bloodSugar?: number;
  bmi?: number;
}

export interface DiseaseRiskScoreData {
  userId: string;
  diabetes2Score: number;
  hypertensionScore: number;
  coronaryHeartScore: number;
  strokeScore: number;
  riskThreshold: number;
  highRiskDiseases: string[];
  alertSent: boolean;
  lastAlertDate?: Date;
  alertedToFaskes: boolean;
  calculatedAt: Date;
  nextCalculationDate?: Date;
}

export interface ScreeningRecommendation {
  id: string;
  userId: string;
  disease: string;
  riskScore: number;
  screeningTests: string[];
  priorityLevel: "urgent" | "high" | "medium" | "low";
  lifestyleAdvice: string[];
  faskhesRecommended?: string;
  completionStatus: "pending" | "completed" | "declined";
  completedDate?: Date;
  createdAt: Date;
}

export interface HealthFacility {
  id: string;
  name: string;
  code: string;
  type: "puskesmas" | "klinik" | "rumah_sakit";
  address: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  hasLab: boolean;
  hasDiagnostics: boolean;
  createdAt: Date;
}

export interface FaskesAlert {
  id: string;
  facilityId: string;
  patientId: string;
  disease: string;
  riskScore: number;
  severity: "critical" | "high" | "medium";
  isRead: boolean;
  actionTaken?: string;
  sentAt: Date;
  createdAt: Date;
}

export interface RiskCalculationPayload {
  userId: string;
  age: number;
  gender?: string;
  height?: number;
  weight?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  cholesterol?: number;
  bloodSugar?: number;
  familyHistory?: string[];
  smoker?: boolean;
  medicalHistory?: string[];
}
