"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none animate-float-1"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-float-2"></div>
            <div className="fixed top-1/2 left-0 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 text-center space-y-8 max-w-2xl">
                {/* 404 Icon with Animation */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-3xl blur-2xl opacity-50"></div>

                    </div>
                </div>

                {/* Error Content */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-fade-in">
                            404
                        </h1>
                        <p className="text-2xl md:text-3xl font-bold text-white">
                            Halaman Tidak Ditemukan
                        </p>
                    </div>

                    <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                        Maaf, halaman yang Anda cari tidak tersedia atau mungkin telah dipindahkan. Mari kembali dan jelajahi lebih lanjut.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 group"
                    >
                        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Ke Beranda
                    </Link>
                </div>

                {/* Alternative Link */}
                <div className="pt-6 flex flex-col items-center justify-center gap-4 w-full">
                    <span className="text-gray-400 font-medium">Atau</span>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <Link
                        href="/auth/login"
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300"
                    >
                        Masuk ke Akun
                    </Link>
                </div>

                {/* Help Text */}
                <div className="pt-6">
                    <p className="text-xs text-gray-600">
                        Butuh bantuan? Hubungi tim dukungan teknis kami
                    </p>
                </div>
            </div>
        </div>
    );
}
