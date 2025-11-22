"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Loader, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const tokenValid = !!code;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }

        if (password !== passwordConfirmation) {
            setError("Password tidak cocok");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    password,
                    passwordConfirmation,
                }),
            });

            const data = await response.json();

            if (data.success) {
                router.push("/auth/login?resetSuccess=true");
            } else {
                setError(data.message || "Terjadi kesalahan");
            }
        } catch (err) {
            console.error("Reset password error:", err);
            setError("Terjadi kesalahan saat reset password");
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

                <div className="w-full max-w-7xl flex gap-8 relative z-10 h-screen md:h-auto md:max-h-screen md:items-center">
                    <div className="hidden md:w-1/2 md:flex"></div>
                    <div className="w-full md:w-1/2 flex items-center justify-center">
                        <div className="w-full max-w-md space-y-6">
                            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
                                <div className="relative z-10 text-center space-y-6">
                                    <h1 className="text-2xl font-bold text-white">Link Tidak Valid</h1>
                                    <p className="text-gray-300">
                                        Kode reset password tidak ditemukan. Silakan minta kode baru.
                                    </p>
                                    <div className="space-y-2">
                                        <Link
                                            href="/auth/forgot-password"
                                            className="block w-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
                                        >
                                            Minta Kode Baru
                                        </Link>
                                        <Link
                                            href="/auth/login"
                                            className="block w-full bg-white/10 text-white font-medium py-2 rounded-lg transition-all duration-200 border border-white/20"
                                        >
                                            Kembali ke Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

            <div className="w-full max-w-7xl flex gap-8 relative z-10 h-screen md:h-auto md:max-h-screen md:items-center">
                {/* Left Side - Logo & Branding */}
                <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center space-y-8 pr-8">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <Image
                                src="/images/medpredictjkn.png"
                                alt="MedpredictJKn Logo"
                                width={120}
                                height={120}
                                priority
                                className="drop-shadow-lg"
                            />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold">
                                <span style={{ color: "#123c70", textShadow: "0 2px 8px rgba(18, 60, 112, 0.5)" }}>Medpredict</span>
                                <span style={{ color: "#76c04a", textShadow: "0 2px 8px rgba(118, 192, 74, 0.5)" }}>JKn</span>
                            </h1>
                            <p className="text-lg text-gray-300 mt-4">Sistem Prediksi Risiko Kesehatan Berbasis AI</p>
                        </div>
                    </div>
                    <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
                    <p className="text-center text-sm text-gray-400 max-w-sm">
                        Sistem keamanan kami melindungi data kesehatan Anda dengan enkripsi tingkat enterprise
                    </p>
                </div>

                {/* Right Side - Reset Password Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-6">
                        {/* Mobile Logo */}
                        <div className="md:hidden text-center space-y-3 mb-8">
                            <div className="flex justify-center mb-4">
                                <Image
                                    src="/images/medpredictjkn.png"
                                    alt="MedpredictJKn Logo"
                                    width={80}
                                    height={80}
                                    priority
                                    className="drop-shadow-lg"
                                />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">
                                    <span style={{ color: "#123c70" }}>Medpredict</span>
                                    <span style={{ color: "#76c04a" }}>JKn</span>
                                </h1>
                                <p className="text-sm text-gray-400 mt-2">Sistem Prediksi Risiko Kesehatan Berbasis AI</p>
                            </div>
                        </div>

                        {/* Reset Password Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                                    <p className="text-gray-400 text-sm">Masukkan password baru Anda</p>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/40 mb-6 backdrop-blur">
                                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                        <p className="text-red-300 text-sm">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-purple-400" />
                                            Password Baru
                                        </label>
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-purple-400" />
                                            Konfirmasi Password
                                        </label>
                                        <Input
                                            type="password"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            placeholder="Ulangi password"
                                            className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>

                                <div className="text-center text-sm mt-6 pt-6 border-t border-white/10">
                                    <span className="text-gray-400">Ingat password? </span>
                                    <Link href="/auth/login" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                                        Masuk di sini
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Footer Info */}
                        <p className="md:hidden text-center text-xs text-gray-500">
                            Data Anda dilindungi dengan enkripsi tingkat enterprise
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
