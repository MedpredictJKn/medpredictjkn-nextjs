/**
 * Alert Service (In-Memory Version)
 * Menangani pembuatan dan pengiriman alert untuk risiko penyakit tinggi
 * 
 * Database persistence akan diimplementasikan setelah Prisma migration selesai
 * 
 * Features:
 * - Alert ke faskes (health facility workers)
 * - Alert ke pasien (melalui notifikasi app/WhatsApp)
 * - Tracking status alert (read/unread, action taken)
 */

export interface CreateAlertPayload {
  facilityId: string;
  patientId: string;
  disease: string;
  riskScore: number;
}

export interface AlertSeverity {
  level: "critical" | "high" | "medium";
  threshold: number;
}

// Risk score thresholds for alert severity
const ALERT_SEVERITY_THRESHOLDS: AlertSeverity[] = [
  { level: "critical", threshold: 85 },
  { level: "high", threshold: 70 },
  { level: "medium", threshold: 50 },
];

// Determine alert severity based on risk score
export function determineSeverity(riskScore: number): "critical" | "high" | "medium" {
  for (const threshold of ALERT_SEVERITY_THRESHOLDS) {
    if (riskScore >= threshold.threshold) {
      return threshold.level;
    }
  }
  return "medium";
}

/**
 * Create alert untuk health facility
 * Dipanggil ketika user memiliki risiko penyakit tinggi
 */
export async function createAlertForHighRisk(
  payload: CreateAlertPayload
): Promise<{ success: boolean; severity: "critical" | "high" | "medium" }> {
  try {
    const { facilityId, patientId, disease, riskScore } = payload;

    // Determine severity
    const severity = determineSeverity(riskScore);

    // Log the alert creation
    console.log(`[ALERT] ${disease} risk detected for patient ${patientId} at facility ${facilityId}: ${riskScore}% (${severity})`);

    // Send WhatsApp notification if configured
    await sendWhatsAppNotificationToFaskes(facilityId, disease, riskScore, severity);

    // TODO: Save to database after migration
    // await prisma.faskesAlert.create({ ... })

    return {
      success: true,
      severity,
    };
  } catch (error) {
    console.error("Error creating high-risk alert:", error);
    return {
      success: false,
      severity: "medium",
    };
  }
}

/**
 * Get all active alerts untuk health facility (stub)
 */
export async function getActiveAlertsForFacility(
  _facilityId: string,
  _limit: number = 50
): Promise<unknown[]> {
  // TODO: Implement database queries after migration
  return [];
}

/**
 * Mark alert as read (stub)
 */
export async function markAlertAsRead(_alertId: string): Promise<unknown | null> {
  // TODO: Implement database update after migration
  return null;
}

/**
 * Resolve alert (health worker took action) (stub)
 */
export async function resolveAlert(
  _alertId: string,
  _actionTaken: string,
  _notes?: string
): Promise<unknown | null> {
  // TODO: Implement database update after migration
  return null;
}

/**
 * Get alert statistics untuk health facility (stub)
 */
export async function getAlertStatistics(
  _facilityId: string
): Promise<Record<string, unknown> | null> {
  // TODO: Implement database queries after migration
  return null;
}

/**
 * Get alerts untuk patient (high-risk notifications) (stub)
 */
export async function getPatientRiskAlerts(_userId: string): Promise<unknown[]> {
  // TODO: Implement database queries after migration
  return [];
}

/**
 * Send WhatsApp notification ke health facility
 */
async function sendWhatsAppNotificationToFaskes(
  _facilityId: string,
  disease: string,
  riskScore: number,
  severity: "critical" | "high" | "medium"
): Promise<void> {
  try {
    const fonntteApiKey = process.env.FONNTE_API_KEY;
    const fonntteDeviceId = process.env.FONNTE_DEVICE_ID;

    if (!fonntteApiKey || !fonntteDeviceId) {
      console.warn("WhatsApp notification not configured (FONNTE keys missing)");
      return;
    }

    const severityLabel = severity === "critical" ? "KRITIS" : severity === "high" ? "TINGGI" : "SEDANG";

    const message = `
🚨 *ALERT RISIKO PENYAKIT TINGGI*

Penyakit: ${disease}
Skor Risiko: ${riskScore}%
Tingkat Keparahan: ${severityLabel}

Silakan cek aplikasi MedpredictJKN untuk detail dan tindak lanjut.

---
MedpredictJKN - Sistem Prediksi Risiko Penyakit
    `.trim();

    // TODO: Send actual WhatsApp message after database setup
    console.log(`[WhatsApp] Would send: ${message}`);

    // Example code for future implementation:
    // const response = await fetch("https://api.fonnte.com/send", {
    //   method: "POST",
    //   headers: {
    //     Authorization: fonntteApiKey,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     target: phoneNumber,
    //     message,
    //     device_id: fonntteDeviceId,
    //   }),
    // });
  } catch (error) {
    console.error("Error in sendWhatsAppNotificationToFaskes:", error);
  }
}
