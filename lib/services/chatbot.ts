import { prisma } from "@/lib/db";
import { retryWithBackoff } from "@/lib/utils";

// General Knowledge Base tentang Aplikasi
const _APPLICATION_KNOWLEDGE = `
TENTANG APLIKASI MedpredictJKn:

Nama Aplikasi: MedpredictJKn - Sistem Prediksi Dini Risiko Penyakit Berbasis AI/ML
Deskripsi: Platform kesehatan digital yang menggunakan kecerdasan buatan untuk memprediksi risiko penyakit kronis dan memberikan rekomendasi intervensi kesehatan yang dipersonalisasi untuk peserta JKN (Jaminan Kesehatan Nasional).

MENU UTAMA PATIENT (PENGGUNA):

1. Dashboard
   - Ringkasan status kesehatan
   - Data riwayat kesehatan terbaru
   - Akses cepat ke fitur-fitur utama

2. Cek Kesehatan & Analisis Risiko
   - Input data kesehatan: tinggi badan, berat badan, tekanan darah, gula darah, kolesterol
   - Perhitungan otomatis BMI dan status berat badan
   - Analisis risiko penyakit menggunakan AI:
     * Diabetes Melitus Tipe 2
     * Hipertensi
     * Penyakit Jantung Koroner
   - Rekomendasi skrining kesehatan spesifik (minimal 4 rekomendasi)
   - Saran gaya hidup terpersonalisasi

3. Chat AI Kesehatan
   - Konsultasi kesehatan dengan chatbot bertenaga AI
   - Tanya jawab tentang kesehatan, pencegahan penyakit, gaya hidup sehat
   - Dukungan 24/7 dalam Bahasa Indonesia
   - Integrasi dengan data kesehatan pengguna

4. Profil Saya
   - Kelola informasi pribadi
   - Upload foto profil
   - Lihat riwayat kesehatan
   - Pengaturan akun

FITUR-FITUR UTAMA:

1. Model Prediksi Dini Risiko Penyakit (Early Risk Prediction)
   - AI/Machine Learning dilatih menggunakan dataset JKN (riwayat diagnosa, obat, kunjungan, hasil lab)
   - Menghitung skor risiko individual (0-100 scale) untuk penyakit umum
   - Tingkat Risiko: Rendah (0-30), Sedang (31-60), Tinggi (61-100)
   - Manfaat: Mengidentifikasi individu sebelum menunjukkan gejala parah, memungkinkan intervensi gaya hidup atau pengobatan preventif

2. Sistem Alert & Notifikasi Otomatis
   - Mengirimkan peringatan kepada peserta JKN melalui aplikasi mobile/SMS
   - Notifikasi ke fasilitas kesehatan (Faskes) primer terkait
   - Triggered ketika skor risiko pasien melebihi ambang batas
   - Manfaat: Mendorong pasien segera melakukan skrining di Faskes terdekat (pencegahan)

3. Rekomendasi Skrining & Intervensi Spesifik
   - Setelah mengidentifikasi risiko, AI merekomendasikan:
     * Jenis pemeriksaan penunjang relevan (GDP, EKG, profil lipid, dll)
     * Estimasi biaya pemeriksaan
     * Lokasi fasilitas kesehatan terdekat
     * Saran modifikasi gaya hidup yang dipersonalisasi (nutrisi, olahraga, stres management)
   - Manfaat: Efisiensi pemeriksaan, hindari pemeriksaan tidak perlu, intervensi tepat sasaran

4. Dashboard Tenaga Kesehatan (Dokter)
   - Antarmuka untuk dokter/perawat di Faskes
   - Melihat daftar pasien dengan risiko tertinggi
   - Riwayat JKN singkat setiap pasien
   - Rekomendasi skrining AI terintegrasi
   - Fitur monitoring pasien dan pengiriman pesan
   - Manfaat: Membantu dokter memprioritaskan pasien yang membutuhkan perhatian segera

TEKNOLOGI:
- Framework: Next.js 16 dengan TypeScript
- AI/ML: Gemini API untuk natural language processing dan analisis kesehatan
- Database: PostgreSQL dengan Prisma ORM
- Authentication: JWT Token-based
- Real-time: WhatsApp Integration untuk notifikasi

KEUNTUNGAN MENGGUNAKAN MedpredictJKn:
✓ Deteksi dini risiko penyakit kronis sebelum gejala parah
✓ Rekomendasi kesehatan yang dipersonalisasi berdasarkan data individual
✓ Akses mudah ke informasi kesehatan dan konsultasi AI 24/7
✓ Integrasi dengan sistem JKN untuk data medis komprehensif
✓ Membantu dokter di daerah dengan SDM terbatas
✓ Mendorong perilaku hidup sehat melalui notifikasi dan rekomendasi
✓ Menghemat biaya kesehatan dengan pencegahan dan skrining tepat sasaran
`;

export async function saveChatHistory(
  userId: string,
  message: string,
  response: string,
  source: "fastapi" | "gemini"
) {
  return retryWithBackoff(
    () =>
      prisma.chatHistory.create({
        data: {
          userId,
          message,
          response,
          source,
        },
      }),
    3
  );
}

export async function getChatHistory(userId: string, limit: number = 20) {
  return prisma.chatHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Deteksi apakah user melaporkan gejala kesehatan atau bertanya tentang penyakit
function isHealthRelated(userMessage: string): boolean {
  const lowerMessage = userMessage.toLowerCase();
  const healthKeywords = [
    "sakit", "nyeri", "demam", "batuk", "pilek", "pusing", "lemas", "lelah",
    "sesak", "napas", "dada", "perut", "mual", "muntah", "diare", "sembelit",
    "sakit kepala", "sakit gigi", "sering buang air", "ruam", "gatal", "bengkak",
    "berkeringat", "tidur", "nafsu makan", "berat badan", "haus",
    "bab", "buang air", "gejala", "keluhan", "penyakit", "mengalami", "terasa",
    "diabetes", "hipertensi", "jantung", "kolesterol", "tekanan darah", "gula darah",
    "obesitas", "bmi", "berat badan", "risiko", "diagnosa", "penyakit kronis"
  ];
  
  return healthKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Function untuk prediksi penyakit berdasarkan gejala
export function getEnhancedPrompt(userMessage: string): string {
  // Deteksi apakah pertanyaan berhubungan dengan kesehatan/penyakit
  const isHealth = isHealthRelated(userMessage);
  
  if (isHealth) {
    return `Anda adalah dokter/tenaga kesehatan yang ahli dalam prediksi risiko penyakit kronis berdasarkan gejala dan riwayat kesehatan.

PENYAKIT UMUM YANG DIPREDIKSI (Berdasarkan Model Prediksi Dini Risiko Penyakit MedpredictJKn):
1. Diabetes Melitus Tipe 2 (DMT2)
2. Hipertensi (Tekanan Darah Tinggi)
3. Penyakit Jantung Koroner (PJK)

MODEL PREDIKSI:
AI/Machine Learning dilatih menggunakan dataset JKN (riwayat diagnosa, obat, kunjungan, hasil lab) untuk menghitung skor risiko individual (0-100 scale) untuk penyakit-penyakit umum tersebut.

TUGAS ANDA:
1. Analisis gejala atau kondisi kesehatan yang dilaporkan user
2. Prediksi penyakit mana (dari ketiga penyakit umum di atas) yang paling relevan berdasarkan gejala
3. Jelaskan hubungan antara gejala dengan penyakit yang diprediksi
4. Berikan penjelasan singkat tentang penyakit tersebut
5. Berikan saran umum tentang pencegahan atau pengelolaan kesehatan

INSTRUKSI PENTING:
- Hanya prediksi dari 3 penyakit utama: Diabetes Melitus Tipe 2, Hipertensi, atau Penyakit Jantung Koroner
- Jangan berikan diagnosis resmi atau resep obat
- Balas dalam Bahasa Indonesia yang jelas dan mudah dipahami
- Fokus pada analisis gejala dan prediksi penyakit, bukan mengarahkan ke menu atau fitur lain
- Jika gejala tidak jelas, minta informasi tambahan untuk analisis yang lebih akurat

Gejala/Kondisi Pengguna: ${userMessage}

Berikan prediksi penyakit berdasarkan gejala di atas.`;
  } else {
    return `Anda adalah asisten kesehatan yang ahli dalam prediksi penyakit kronis.

Pertanyaan pengguna tidak spesifik tentang gejala atau kondisi kesehatan. Balas dengan singkat dan jelas dalam Bahasa Indonesia, dan tanyakan lebih detail tentang kondisi kesehatan mereka.

Pertanyaan: ${userMessage}

Berikan respons yang ramah dan dorong user untuk berbagi gejala atau kondisi kesehatan mereka agar Anda bisa memberikan prediksi yang lebih akurat tentang risiko penyakit (Diabetes Melitus Tipe 2, Hipertensi, atau Penyakit Jantung Koroner).`;
  }
}

// Mock function - replace dengan actual FastAPI call
export async function callFastAPIChatbot(message: string): Promise<string> {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const response = await fetch(`${fastApiUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("FastAPI error");
    const data = await response.json();
    return data.response || "Tidak ada respons";
  } catch {
    return "Maaf, chatbot sedang tidak tersedia.";
  }
}

// Call Gemini API using URL from .env
export async function callGeminiChatbot(message: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;

    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    if (!apiUrl) throw new Error("GEMINI_API_URL not configured");

    const urlWithKey = `${apiUrl}?key=${apiKey}`;
    
    // Get enhanced prompt with application knowledge
    const enhancedPrompt = getEnhancedPrompt(message);

    const response = await fetch(urlWithKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error("No text content in Gemini response:", data);
      throw new Error("No response text from Gemini");
    }

    return textContent;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
}
