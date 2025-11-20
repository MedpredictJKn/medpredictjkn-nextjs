// WhatsApp Notification Service
// Untuk saat ini ini adalah template - update dengan API Fonnte atau Twilio nanti

export interface WhatsAppPayload {
  phoneNumber: string;
  message: string;
}

export async function sendWhatsAppNotification(
  payload: WhatsAppPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const apiKey = process.env.FONNTE_API_KEY;
    const deviceId = process.env.FONNTE_DEVICE_ID;

    if (!apiKey || !deviceId) {
      console.warn(
        "WhatsApp API not configured (FONNTE_API_KEY or FONNTE_DEVICE_ID missing)"
      );
      return {
        success: false,
        error: "WhatsApp API belum dikonfigurasi",
      };
    }

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: payload.phoneNumber,
        message: payload.message,
        device_id: deviceId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === true) {
      return {
        success: true,
        messageId: data.messageId,
      };
    }

    return {
      success: false,
      error: data.message || "Gagal mengirim pesan",
    };
  } catch (error) {
    console.error("WhatsApp notification error:", error);
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
