"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Heart,
  Zap,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  ArrowUp,
} from "lucide-react";

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const features = [
    {
      title: "Prediksi Risiko Penyakit",
      description: "Analisis data kesehatan Anda dengan AI untuk deteksi dini Diabetes, Hipertensi, Penyakit Jantung, dan Stroke",
      icon: Activity,
      accent: "text-blue-400",
    },
    {
      title: "Alert Real-time",
      description: "Terima notifikasi WhatsApp otomatis ketika risiko penyakit terdeteksi",
      icon: AlertCircle,
      accent: "text-red-400",
    },
    {
      title: "Chat dengan AI",
      description: "Tanyakan pertanyaan kesehatan kepada AI kami yang tersedia 24/7",
      icon: MessageCircle,
      accent: "text-purple-400",
    },
    {
      title: "Monitoring Kesehatan",
      description: "Pantau metrik kesehatan Anda seperti tekanan darah, BMI, dan detak jantung",
      icon: Heart,
      accent: "text-pink-400",
    },
    {
      title: "Data Aman",
      description: "Semua data kesehatan Anda dilindungi dengan enkripsi tingkat enterprise",
      icon: Shield,
      accent: "text-green-400",
    },
    {
      title: "Rekomendasi Screening",
      description: "Dapatkan saran pemeriksaan kesehatan yang dipersonalisasi berdasarkan profil risiko Anda",
      icon: TrendingUp,
      accent: "text-cyan-400",
    },
  ];

  const stats = [
    { label: "Pengguna Aktif", value: "10K+", icon: Activity },
    { label: "Pemeriksaan Selesai", value: "50K+", icon: CheckCircle },
    { label: "Alert Terkirim", value: "100K+", icon: AlertCircle },
    { label: "Uptime", value: "99.9%", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Background Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <Image
              src="/images/medpredictjkn.png"
              alt="MedpredictJKN Logo"
              width={40}
              height={40}
              priority
            />
            <h1 className="text-2xl font-bold">
              <span style={{ color: "#123c70", textShadow: "0 2px 8px rgba(18, 60, 112, 0.5)" }}>Medpredict</span>
              <span style={{ color: "#76c04a", textShadow: "0 2px 8px rgba(118, 192, 74, 0.5)" }}>JKn</span>
            </h1>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
            >
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 text-center relative z-10">
        <div className="space-y-6 mb-12">
          <h2 className="text-6xl font-bold text-white">
            Prediksi Risiko Penyakit dengan{" "}
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Teknologi AI
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            <span style={{ color: "#123c70", textShadow: "0 2px 8px rgba(18, 60, 112, 0.5)" }}>Medpredict</span>
            <span style={{ color: "#76c04a", textShadow: "0 2px 8px rgba(118, 192, 74, 0.5)" }}>JKn</span> - Sistem deteksi dini penyakit kronis berbasis data JKN dengan notifikasi WhatsApp real-time
          </p>
        </div>

        <div className="flex gap-4 justify-center mb-16">
          <Link
            href="/auth/register"
            className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-2xl transition-all duration-200 flex items-center gap-2"
          >
            Mulai Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold border border-white/20 transition-all"
          >
            Masuk
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-5 h-5 text-cyan-400" />
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            Fitur Unggulan
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Teknologi AI terdepan untuk kesehatan Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-6 h-6 ${feature.accent}`} />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-12 text-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Siap Menjaga Kesehatan Anda?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pengguna yang telah merasakan manfaat prediksi risiko kesehatan berbasis AI
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/auth/register"
                className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg"
              >
                Daftar Gratis Sekarang
              </Link>
              <Link
                href="/auth/login"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold border border-white/20 transition-all"
              >
                Sudah Punya Akun?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-xl bg-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-12 text-center">
          <p className="text-gray-400">
            &copy; 2025 <span style={{ color: "#123c70", textShadow: "0 2px 8px rgba(18, 60, 112, 0.5)" }}>Medpredict</span><span style={{ color: "#76c04a", textShadow: "0 2px 8px rgba(118, 192, 74, 0.5)" }}>JKn</span> - Sistem Prediksi Risiko Penyakit. Semua hak dilindungi.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Sistem keamanan kami melindungi data kesehatan Anda dengan enkripsi tingkat enterprise
          </p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}