import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/images/medpredictjkn.png"
              alt="MedpredictJKN Logo"
              width={40}
              height={40}
              priority
            />
            <h1 className="text-2xl font-bold flex items-center gap-1">
              <span style={{ color: "#123c70" }}>Medpredict</span>
              <span style={{ color: "#76c04a" }}>JKn</span>
            </h1>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/auth/login"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-800 mb-4">
          Prediksi Risiko Penyakit dengan Teknologi AI
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          MedpredictJKN - Sistem deteksi dini penyakit kronis berbasis data JKN
          dengan notifikasi WhatsApp real-time
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/auth/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
          >
            Mulai Sekarang
          </Link>
          <Link
            href="/auth/login"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-medium"
          >
            Masuk
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">🧮</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Prediksi Risiko
            </h3>
            <p className="text-gray-600">
              Hitung risiko penyakit (Diabetes, Hipertensi, Jantung, Stroke) berdasarkan data kesehatan
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">🔴</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Alert Otomatis
            </h3>
            <p className="text-gray-600">
              Terima alert real-time ketika risiko penyakit terdeteksi
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Rekomendasi Screening
            </h3>
            <p className="text-gray-600">
              Dapatkan saran pemeriksaan kesehatan yang dipersonalisasi
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 MedpredictJKN - Sistem Prediksi Risiko Penyakit. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}