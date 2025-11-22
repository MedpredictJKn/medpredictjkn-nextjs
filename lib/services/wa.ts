// WhatsApp Notification Service
// Menggunakan WhAPI.cloud API

export interface WhatsAppPayload {
  phoneNumber: string;
  message: string;
}

export async function sendWhatsAppNotification(
  payload: WhatsAppPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiToken = process.env.WHAT_API_TOKEN;
    const apiUrl = process.env.WHAT_API_URL;

    if (!apiToken || !apiUrl) {
      console.warn(
        "WhatsApp API not configured (WHAT_API_TOKEN or WHAT_API_URL missing)"
      );
      return {
        success: false,
        error: "WhatsApp API belum dikonfigurasi",
      };
    }

    // Format nomor: pastikan hanya angka tanpa @c.us untuk WhAPI
    let phoneNumber = payload.phoneNumber.trim();
    
    // Remove @c.us jika ada
    if (phoneNumber.includes("@")) {
      phoneNumber = phoneNumber.split("@")[0];
    }
    
    // Normalize nomor Indonesia
    // Jika dimulai dengan 0, ganti dengan 62
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "62" + phoneNumber.slice(1);
    }
    // Jika ada duplikat 6262, hapus duplikat
    else if (phoneNumber.startsWith("6262")) {
      phoneNumber = phoneNumber.slice(2);
    }
    
    // Validasi nomor Indonesia (harus dimulai dengan 62 dan minimal 10 digit setelah 62)
    if (!phoneNumber.startsWith("62") || phoneNumber.length < 12) {
      console.error(
        `[WhatsApp] Invalid phone number format: ${phoneNumber}. Must start with 62 and have 10-12 digits after it.`
      );
      return {
        success: false,
        error: "Format nomor WhatsApp tidak valid. Gunakan format 62xxxxxxxxxx",
      };
    }

    console.log(`[WhatsApp] Sending to ${phoneNumber}`);

    const response = await fetch(`${apiUrl}/messages/text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,  // Tanpa @c.us, WhAPI akan menambahkannya otomatis
        body: payload.message,
      }),
    });

    const data = await response.json();

    console.log(`[WhatsApp] Response status: ${response.status}`, data);

    if (response.ok && (data.sent || data.result)) {
      return {
        success: true,
        messageId: data.message?.id || data.result?.id || data.id,
      };
    }

    return {
      success: false,
      error: data.message || data.error || "Gagal mengirim pesan",
    };
  } catch (error) {
    console.error("[WhatsApp] Error:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

// Fungsi untuk mengirim notifikasi kesehatan
export async function sendHealthNotification(
  phoneNumber: string,
  userName: string,
  healthData: {
    bmi: number;
    status: string;
    height: number;
    weight: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const message = `Halo ${userName}, 👋

Hasil cek kesehatan Anda:
📊 BMI: ${healthData.bmi}
📏 Tinggi: ${healthData.height} cm
⚖️ Berat: ${healthData.weight} kg
📈 Status: ${healthData.status}

${
  healthData.status === "normal"
    ? "✅ Berat badan Anda sudah normal!"
    : healthData.status === "underweight"
      ? "⚠️ Berat badan Anda terlalu ringan. Konsultasi dengan dokter."
      : healthData.status === "overweight"
        ? "⚠️ Berat badan Anda sedikit berlebih. Pertimbangkan gaya hidup sehat."
        : "🚨 Berat badan Anda masuk kategori obesitas. Segera konsultasi dokter!"
}

Tetap jaga kesehatan! 💪`;

  return sendWhatsAppNotification({
    phoneNumber,
    message,
  });
}

// Interface untuk analisis kesehatan lengkap
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

interface AnalysisResult {
  bmi: number;
  status: string;
  height: number;
  weight: number;
  riskLevel: string;
  screeningRecommendations: Recommendation[];
  lifestyleRecommendations: LifestyleTip[];
}

// Fungsi untuk mengirim notifikasi analisis lengkap dari aiAnalyzer
export async function sendAnalysisNotification(
  phoneNumber: string,
  userName: string,
  analysis: AnalysisResult
): Promise<{ success: boolean; error?: string }> {
  // Bagian 1: Data BMI dan Status Kesehatan
  let message = `🏥 *HASIL ANALISIS KESEHATAN ANDA* 🏥

Halo ${userName}! Berikut hasil cek kesehatan Anda:

📊 *DATA KESEHATAN*
├─ BMI: ${analysis.bmi.toFixed(1)}
├─ Tinggi: ${analysis.height} cm
├─ Berat: ${analysis.weight} kg
└─ Status: ${analysis.status.toUpperCase()}

⚠️ *LEVEL RISIKO*: ${analysis.riskLevel}

`;

  // Bagian 2: Rekomendasi Skrining Kesehatan
  if (analysis.screeningRecommendations && analysis.screeningRecommendations.length > 0) {
    message += `\n💉 *REKOMENDASI SKRINING KESEHATAN*\n`;
    
    analysis.screeningRecommendations.forEach((rec, index) => {
      message += `\n${index + 1}. ${rec.type}
   Prioritas: ${rec.priority}
   📝 ${rec.description}
   
   🔍 Alasan: ${rec.reason}`;
      
      if (rec.estimatedCost) {
        message += `\n   💰 Estimasi Biaya: ${rec.estimatedCost}`;
      }
      if (rec.location) {
        message += `\n   📍 Lokasi: ${rec.location}`;
      }
    });
  }

  // Bagian 3: Rekomendasi Gaya Hidup Personalisasi
  if (analysis.lifestyleRecommendations && analysis.lifestyleRecommendations.length > 0) {
    message += `\n\n💪 *REKOMENDASI GAYA HIDUP PERSONALISASI*\n`;
    
    analysis.lifestyleRecommendations.forEach((category, index) => {
      message += `\n${index + 1}. *${category.category}*`;
      category.tips.forEach((tip) => {
        message += `\n   • ${tip}`;
      });
    });
  }

  // Bagian 4: Penutup
  message += `\n\n---

💡 *LANGKAH SELANJUTNYA*:
1. Konsultasikan hasil ini dengan dokter
2. Lakukan pemeriksaan yang direkomendasikan
3. Terapkan gaya hidup sehat sesuai rekomendasi
4. Monitor kesehatan Anda secara berkala

Tetap jaga kesehatan! 🏃‍♂️💚

---
Pesan ini dikirim dari sistem Medpredict JKN
Untuk informasi lebih lanjut, kunjungi aplikasi kesehatan Anda.`;

  return sendWhatsAppNotification({
    phoneNumber,
    message,
  });
}
