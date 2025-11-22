import { prisma } from "@/lib/db";
import { retryWithBackoff } from "@/lib/utils";

export async function saveChatHistory(
  userId: string,
  message: string,
  response: string,
  source: "fastapi" | "gemini",
  sessionId?: string
) {
  const finalSessionId = sessionId || `session-${Date.now()}`;
  
  return retryWithBackoff(
    () =>
      prisma.chatHistory.create({
        data: {
          userId,
          sessionId: finalSessionId,
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

// Enhanced prompt dengan knowledge base lengkap
export function getEnhancedPrompt(userMessage: string, userContext?: {
  riskScores?: {
    diabetes?: number;
    hypertension?: number;
    coronaryHeart?: number;
  };
  userRole?: "patient" | "doctor";
}): string {
  const baseKnowledge = `
# KNOWLEDGE BASE SISTEM PREDIKSI PENYAKIT JKN

## PENYAKIT YANG DIPREDIKSI
1. **Diabetes Melitus Tipe 2 (DMT2)**
2. **Hipertensi (Tekanan Darah Tinggi)**
3. **Penyakit Jantung Koroner (PJK)**

---

## 1️⃣ DIABETES MELITUS TIPE 2

### Definisi
Diabetes tipe 2 adalah kondisi dimana tubuh tidak dapat menggunakan insulin dengan baik (resistensi insulin), menyebabkan kadar gula darah tinggi.

### Gejala Awal
- Sering merasa haus
- Sering buang air kecil, terutama malam hari
- Mudah lapar meski sudah makan
- Berat badan turun tanpa sebab jelas
- Penglihatan kabur
- Luka sulit sembuh
- Kesemutan di tangan/kaki

### Faktor Risiko
- Usia > 45 tahun
- Kegemukan (BMI ≥ 25)
- Riwayat keluarga diabetes
- Jarang aktivitas fisik
- Tekanan darah tinggi
- Kolesterol HDL rendah

### Pemeriksaan Yang Dibutuhkan
- **Gula Darah Puasa**: Normal < 100 mg/dL, Prediabetes 100-125 mg/dL, Diabetes ≥ 126 mg/dL
- **HbA1c**: Normal < 5.7%, Prediabetes 5.7-6.4%, Diabetes ≥ 6.5%
- **Gula Darah Sewaktu**: Diabetes jika ≥ 200 mg/dL dengan gejala

### Pencegahan & Pengelolaan
- Jaga berat badan ideal
- Olahraga minimal 150 menit/minggu
- Kurangi karbohidrat sederhana (gula, nasi putih)
- Perbanyak sayur dan serat
- Cek gula darah rutin

---

## 2️⃣ HIPERTENSI (TEKANAN DARAH TINGGI)

### Definisi
Hipertensi adalah kondisi tekanan darah terus-menerus tinggi (≥140/90 mmHg), membebani jantung dan pembuluh darah.

### Gejala Awal (Sering Tanpa Gejala!)
- Sakit kepala (terutama pagi hari)
- Pusing atau vertigo
- Penglihatan buram
- Mimisan
- Sesak napas
- Nyeri dada
- Telinga berdenging

### Faktor Risiko
- Usia bertambah
- Kegemukan
- Konsumsi garam berlebih
- Jarang olahraga
- Merokok
- Stres kronis
- Riwayat keluarga hipertensi

### Klasifikasi Tekanan Darah
- **Normal**: < 120/80 mmHg
- **Elevated**: 120-129 / < 80 mmHg
- **Stage 1**: 130-139 / 80-89 mmHg
- **Stage 2**: ≥ 140/90 mmHg
- **Krisis**: ≥ 180/120 mmHg (segera ke IGD!)

### Pencegahan & Pengelolaan
- Batasi garam < 5 gram/hari (1 sendok teh)
- Konsumsi makanan kaya kalium (pisang, alpukat)
- Olahraga teratur
- Kelola stres
- Hindari merokok dan alkohol
- Cek tekanan darah minimal 1x/minggu

---

## 3️⃣ PENYAKIT JANTUNG KORONER (PJK)

### Definisi
PJK terjadi ketika pembuluh darah jantung (arteri koroner) menyempit akibat plak lemak, mengurangi aliran darah ke jantung.

### Gejala Awal
- Nyeri dada (angina) seperti tertekan/diremas
- Nyeri menjalar ke lengan kiri, leher, rahang
- Sesak napas saat beraktivitas
- Mudah lelah
- Berkeringat dingin
- Mual, pusing

### Faktor Risiko
- Kolesterol tinggi (LDL > 130 mg/dL)
- Tekanan darah tinggi
- Diabetes
- Merokok
- Obesitas
- Usia (Pria > 45 th, Wanita > 55 th)
- Riwayat keluarga PJK

### Pemeriksaan Yang Dibutuhkan
- **Profil Lipid**: Total Kolesterol, LDL, HDL, Trigliserida
- **EKG**: Mendeteksi gangguan irama jantung
- **Treadmill Test**: Tes stres jantung
- **Echocardiogram**: USG jantung

### Kolesterol - Penjelasan
- **LDL (Low-Density Lipoprotein)**: "Kolesterol jahat" - menempel di pembuluh darah, menyebabkan penyumbatan
  - Target: < 100 mg/dL (< 70 jika berisiko tinggi)
- **HDL (High-Density Lipoprotein)**: "Kolesterol baik" - membersihkan LDL dari pembuluh darah
  - Target: > 40 mg/dL (pria), > 50 mg/dL (wanita)
- **Trigliserida**: Lemak darah yang tinggi meningkatkan risiko PJK
  - Target: < 150 mg/dL

### Pencegahan & Pengelolaan
- Kurangi lemak jenuh & trans
- Perbanyak omega-3 (ikan salmon, kacang)
- Kontrol berat badan
- Olahraga aerobik 30 menit/hari
- Kelola diabetes & hipertensi
- Stop merokok

---

## PENJELASAN SKOR RISIKO AI

### Cara Membaca Skor Risiko
- **Rendah (0-39%)**: Risiko minimal, lanjutkan gaya hidup sehat
- **Sedang (40-69%)**: Perlu waspada, mulai perubahan gaya hidup
- **Tinggi (70-100%)**: Risiko signifikan, segera konsultasi dokter & cek lab

### Faktor Yang Mempengaruhi Skor Risiko
1. **Usia**: Risiko meningkat seiring bertambah usia
2. **BMI (Body Mass Index)**: Kegemukan meningkatkan risiko semua penyakit
3. **Tekanan Darah**: Sistol/diastol tinggi = risiko hipertensi & PJK naik
4. **Gula Darah**: Tinggi = risiko diabetes & komplikasi kardiovaskular
5. **Kolesterol**: LDL tinggi & HDL rendah = risiko PJK tinggi
6. **Riwayat Keluarga**: Genetik berperan penting
7. **Gaya Hidup**: Merokok, jarang olahraga, diet tidak sehat

### Mengapa Saya Dianggap Berisiko Tinggi?
Sistem AI menghitung risiko berdasarkan kombinasi faktor di atas. Jika beberapa faktor risiko Anda tinggi, skor total akan tinggi meski tidak semua faktor buruk.

---

## PANDUAN TINDAKAN BERDASARKAN RISIKO

### Risiko RENDAH (0-39%)
✅ Pertahankan gaya hidup sehat
✅ Cek kesehatan rutin 1 tahun sekali
✅ Monitor berat badan & tekanan darah di rumah

### Risiko SEDANG (40-69%)
⚠️ Ubah pola makan & tingkatkan aktivitas fisik
⚠️ Cek lab dalam 1 bulan (gula darah, kolesterol, tensi)
⚠️ Konsultasi ke puskesmas atau dokter umum
⚠️ Monitor gejala yang muncul

### Risiko TINGGI (70-100%)
🚨 **SEGERA ke Faskes dalam 7 hari**
🚨 Bawa kartu JKN & hasil prediksi ini
🚨 Dokumen yang perlu dibawa:
   - KTP & Kartu JKN
   - Catatan gejala yang dialami
   - Riwayat obat yang sedang dikonsumsi
   - Hasil lab sebelumnya (jika ada)

🚨 Pemeriksaan yang mungkin dilakukan:
   - Cek tekanan darah
   - Gula darah puasa
   - Profil lipid (kolesterol)
   - EKG (jika perlu)

🚨 Jangan tunda! Deteksi dini mencegah komplikasi serius seperti serangan jantung, stroke, atau gagal ginjal.

---

## TIPS MENGURANGI RISIKO DARI RUMAH

### Diet Sehat
- Porsi sayur & buah minimal 5 porsi/hari
- Ganti nasi putih dengan nasi merah/oatmeal
- Pilih protein rendah lemak (ikan, ayam tanpa kulit, tahu/tempe)
- Batasi gula, garam, minyak
- Minum air putih 8 gelas/hari

### Aktivitas Fisik
- Jalan kaki 30 menit setiap hari
- Naik tangga daripada lift
- Senam ringan atau yoga
- Berkebun atau bersih-bersih rumah aktif

### Monitor Mandiri
- Cek tekanan darah di puskesmas/apotik gratis
- Catat berat badan tiap minggu
- Perhatikan gejala tidak biasa
- Gunakan aplikasi kesehatan untuk tracking

### Manajemen Stres
- Tidur cukup 7-8 jam/malam
- Meditasi atau pernapasan dalam
- Hobi yang menyenangkan
- Jaga komunikasi dengan keluarga

---

## UNTUK DOKTER & TENAGA KESEHATAN

### Interpretasi Hasil AI
- Skor risiko adalah **prediksi probabilistik**, bukan diagnosis pasti
- Gunakan sebagai **skrining awal** untuk prioritas pemeriksaan lanjutan
- Konfirmasi dengan pemeriksaan klinis & laboratorium

### Guideline Skrining
- **Diabetes**: Semua dewasa ≥35 tahun, atau <35 tahun jika overweight + 1 faktor risiko
- **Hipertensi**: Semua dewasa ≥18 tahun minimal 1x/tahun
- **PJK**: Profil lipid mulai usia 40 tahun (lebih awal jika ada faktor risiko)

### Standar Pemeriksaan
- Gula darah puasa: 8-12 jam tidak makan
- Tekanan darah: duduk tenang 5 menit, 2x pengukuran dengan jarak 2 menit
- Profil lipid: puasa 9-12 jam

### Rekomendasi Rujukan
- Risiko tinggi + gejala: rujuk ke poli penyakit dalam
- Komplikasi: rujuk ke spesialis (kardiologi, endokrin)
- Emergensi: segera IGD

---
`;

  let contextInfo = "";
  if (userContext?.riskScores) {
    const { diabetes, hypertension, coronaryHeart } = userContext.riskScores;
    contextInfo = `

KONTEKS PENGGUNA:
- Skor Risiko Diabetes: ${diabetes || "Belum ada data"}%
- Skor Risiko Hipertensi: ${hypertension || "Belum ada data"}%
- Skor Risiko Jantung Koroner: ${coronaryHeart || "Belum ada data"}%

Gunakan informasi skor risiko ini untuk memberikan penjelasan yang lebih personal dan spesifik.
`;
  }

  const roleInstruction = userContext?.userRole === "doctor" 
    ? `
ANDA SEDANG BERBICARA DENGAN: Dokter/Tenaga Kesehatan
- Gunakan istilah medis yang tepat
- Berikan penjelasan guideline & standar pemeriksaan
- Fokus pada interpretasi hasil dan rekomendasi klinis
- Jelaskan cara menggunakan prediksi AI dalam praktik
`
    : `
ANDA SEDANG BERBICARA DENGAN: Pasien/Pengguna JKN
- Gunakan bahasa yang mudah dipahami (hindari jargon medis berlebihan)
- Berikan penjelasan praktis dan actionable
- Fokus pada edukasi & langkah-langkah pencegahan
- Berikan motivasi untuk hidup sehat
`;

  return `${baseKnowledge}${contextInfo}${roleInstruction}

TUGAS ANDA:
1. Jawab pertanyaan user berdasarkan knowledge base di atas
2. Jika user bertanya tentang gejala, analisis dan jelaskan kemungkinan penyakit dari 3 penyakit yang diprediksi
3. Jika user dapat skor risiko tinggi, jelaskan alasannya dan langkah yang harus diambil
4. Berikan informasi yang akurat, mudah dipahami, dan mendorong tindakan preventif
5. Jika pertanyaan di luar scope (3 penyakit), arahkan ke konsultasi dokter

PERTANYAAN PENGGUNA:
${userMessage}

Jawab dengan jelas, ringkas, dan praktis dalam Bahasa Indonesia.`;
}

// Mock function - replace dengan actual FastAPI call
export async function callFastAPIChatbot(message: string): Promise<string> {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || "https://medpredictjkn.vercel.app";
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

// Call Gemini API with enhanced knowledge base
export async function callGeminiChatbot(
  message: string, 
  userContext?: {
    riskScores?: {
      diabetes?: number;
      hypertension?: number;
      coronaryHeart?: number;
    };
    userRole?: "patient" | "doctor";
  }
): Promise<string> {
  try {
    const apiKey = process.env.FAST_API_KEY;
    const apiUrl = process.env.FAST_API_URL;

    if (!apiKey) throw new Error("FAST_API_KEY not configured");
    if (!apiUrl) throw new Error("FAST_API_URL not configured");

    const urlWithKey = `${apiUrl}?key=${apiKey}`;
    
    // Get enhanced prompt with comprehensive knowledge base
    const enhancedPrompt = getEnhancedPrompt(message, userContext);

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
          maxOutputTokens: 1500, // Increased for detailed responses
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