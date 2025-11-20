/**
 * WhatsApp Notification Service
 * Menggunakan WhAPI.cloud untuk mengirim notifikasi via WhatsApp
 */

interface WhatsAppMessage {
  to: string;
  body: string;
}

interface WhatsAppResponse {
  sent: boolean;
  message?: {
    id: string;
    from_me: boolean;
    type: string;
    chat_id: string;
    timestamp: number;
    source: string;
    device_id: number;
    status: string;
    text: {
      body: string;
    };
    from: string;
  };
  error?: string;
}

/**
 * Mengirim pesan WhatsApp ke nomor tujuan
 * @param phoneNumber Nomor WhatsApp tujuan (format: 62xxx)
 * @param message Pesan yang akan dikirim
 * @returns Response dari WhAPI.cloud
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    const apiUrl = process.env.WHAT_API_URL;
    const apiToken = process.env.WHAT_API_TOKEN;

    if (!apiUrl || !apiToken) {
      console.error("WhatsApp API credentials not configured");
      return {
        sent: false,
        error: "WhatsApp API credentials not configured",
      };
    }

    const payload: WhatsAppMessage = {
      to: phoneNumber,
      body: message,
    };

    const response = await fetch(`${apiUrl}/messages/text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: WhatsAppResponse = await response.json();

    if (response.ok) {
      console.log(`[WhatsApp] Message sent successfully to ${phoneNumber}`);
      return {
        sent: true,
        message: data.message,
      };
    } else {
      console.error(`[WhatsApp] Failed to send message:`, data);
      return {
        sent: false,
        error: data.error || "Unknown error",
      };
    }
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mengirim notifikasi alert kesehatan ke nomor WhatsApp
 * @param phoneNumber Nomor WhatsApp pasien
 * @param diseaseRisk Penyakit dengan tingkat risiko
 * @param severity Tingkat keparahan (critical/high/medium)
 */
export async function sendHealthAlertNotification(
  phoneNumber: string,
  diseaseRisk: { disease: string; riskScore: number }[],
  severity: "critical" | "high" | "medium"
): Promise<WhatsAppResponse> {
  const severityLabel =
    severity === "critical"
      ? "⛔ KRITIS"
      : severity === "high"
        ? "🔴 TINGGI"
        : "🟡 SEDANG";

  const diseaseList = diseaseRisk
    .map((d) => `• ${d.disease}: ${d.riskScore}%`)
    .join("\n");

  const message = `
${severityLabel} *ALERT KESEHATAN ANDA*

Risiko Penyakit Terdeteksi:
${diseaseList}

⚠️ *Segera lakukan:*
• Konsultasi dengan dokter
• Lakukan pemeriksaan kesehatan
• Ikuti rekomendasi screening

🔗 Buka aplikasi MedpredictJKN untuk detail lengkap

---
MedpredictJKN - Sistem Prediksi Risiko Penyakit
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Mengirim rekomendasi screening ke WhatsApp
 * @param phoneNumber Nomor WhatsApp pasien
 * @param recommendations Daftar rekomendasi screening
 */
export async function sendScreeningRecommendation(
  phoneNumber: string,
  recommendations: Array<{
    disease: string;
    tests: string[];
    frequency: string;
  }>
): Promise<WhatsAppResponse> {
  const recommendationText = recommendations
    .map(
      (rec) =>
        `*${rec.disease}*\n• Tests: ${rec.tests.slice(0, 2).join(", ")}\n• Frequency: ${rec.frequency}`
    )
    .join("\n\n");

  const message = `
📋 *REKOMENDASI SCREENING KESEHATAN*

Berdasarkan hasil assessment Anda:

${recommendationText}

✅ *Langkah Selanjutnya:*
• Jadwalkan pemeriksaan dengan fasilitas kesehatan
• Ikuti saran gaya hidup sehat
• Monitor kondisi kesehatan secara berkala

---
MedpredictJKN - Sistem Prediksi Risiko Penyakit
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Mengirim notifikasi ke health facility/faskes
 * @param phoneNumber Nomor WhatsApp petugas kesehatan
 * @param patientInfo Informasi pasien
 * @param riskInfo Informasi risiko
 */
export async function sendFaskesNotification(
  phoneNumber: string,
  patientInfo: {
    name: string;
    id: string;
  },
  riskInfo: {
    disease: string;
    riskScore: number;
    severity: "critical" | "high" | "medium";
  }
): Promise<WhatsAppResponse> {
  const severityLabel =
    riskInfo.severity === "critical"
      ? "⛔"
      : riskInfo.severity === "high"
        ? "🔴"
        : "🟡";

  const message = `
${severityLabel} *ALERT RISIKO PASIEN - FASKES*

Pasien: ${patientInfo.name}
ID: ${patientInfo.id}

Penyakit: ${riskInfo.disease}
Skor Risiko: ${riskInfo.riskScore}%
Tingkat: ${riskInfo.severity.toUpperCase()}

⚠️ *Action Required:*
Segera follow up pasien untuk screening dan konsultasi

---
MedpredictJKN - Sistem Prediksi Risiko Penyakit
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Mengirim pesan test/verifikasi
 * @param phoneNumber Nomor WhatsApp tujuan
 * @param code Kode verifikasi
 */
export async function sendVerificationCode(
  phoneNumber: string,
  code: string
): Promise<WhatsAppResponse> {
  const message = `Kode verifikasi MedpredictJKN Anda: *${code}*\n\nJangan bagikan kode ini kepada siapapun.`;

  return sendWhatsAppMessage(phoneNumber, message);
}
