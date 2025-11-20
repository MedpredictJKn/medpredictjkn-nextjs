-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "bloodPressure" TEXT,
    "bloodSugar" DOUBLE PRECISION,
    "cholesterol" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diagnosisICD10" TEXT,
    "diagnosisName" TEXT,
    "medicationName" TEXT,
    "medicationDose" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "visitType" TEXT NOT NULL,
    "labTestName" TEXT,
    "labValue" DOUBLE PRECISION,
    "labUnit" TEXT,
    "labNormalRange" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disease_risk_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diabetes2Score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hypertensionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coronaryHeartScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "strokeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskThreshold" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "highRiskDiseases" TEXT[],
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "lastAlertDate" TIMESTAMP(3),
    "alertedToFaskes" BOOLEAN NOT NULL DEFAULT false,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextCalculationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disease_risk_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "screeningTests" TEXT[],
    "priorityLevel" TEXT NOT NULL,
    "lifestyleAdvice" TEXT[],
    "faskhesRecommended" TEXT,
    "completionStatus" TEXT NOT NULL DEFAULT 'pending',
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screening_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "staffCount" INTEGER,
    "hasLab" BOOLEAN NOT NULL DEFAULT false,
    "hasDiagnostics" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_facility_users" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "healthWorkerEmail" TEXT NOT NULL,
    "healthWorkerName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_facility_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faskes_alerts" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionTaken" TEXT,
    "actionDate" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faskes_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_alert_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_alert_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "disease_risk_scores_userId_key" ON "disease_risk_scores"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "health_facilities_code_key" ON "health_facilities"("code");

-- AddForeignKey
ALTER TABLE "health_data" ADD CONSTRAINT "health_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disease_risk_scores" ADD CONSTRAINT "disease_risk_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_recommendations" ADD CONSTRAINT "screening_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_facility_users" ADD CONSTRAINT "health_facility_users_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "health_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faskes_alerts" ADD CONSTRAINT "faskes_alerts_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "health_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
