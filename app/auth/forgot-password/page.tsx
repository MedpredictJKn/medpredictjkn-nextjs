"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Loader, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setStep("code");
            } else {
                setError(data.message || "Terjadi kesalahan");
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            setError("Terjadi kesalahan saat memproses permintaan");
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/verify-reset-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to reset password page with email
                window.location.href = `/auth/reset-password?email=${encodeURIComponent(email)}&code=${code}`;
            } else {
                setError(data.message || "Kode tidak valid");
            }
        } catch (err) {
            console.error("Verify code error:", err);
            setError("Terjadi kesalahan saat memverifikasi kode");
        } finally {
            setLoading(false);
        }
    };

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
                        Reset password Anda dengan aman melalui kode verifikasi 6 digit
                    </p>
                </div>

                {/* Right Side - Form */}
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

                        {/* Forgot Password Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                {step === "email" ? (
                                    <>
                                        <div className="space-y-2 mb-8">
                                            <h2 className="text-2xl font-bold text-white">Lupa Password?</h2>
                                            <p className="text-gray-400 text-sm">Masukkan email Anda untuk menerima kode verifikasi 6 digit</p>
                                        </div>

                                        {error && (
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/40 mb-6 backdrop-blur">
                                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                                <p className="text-red-300 text-sm">{error}</p>
                                            </div>
                                        )}

                                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-purple-400" />
                                                    Email
                                                </label>
                                                <Input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="nama@example.com"
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
                                                        Mengirim...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail className="w-4 h-4" />
                                                        Kirim Kode
                                                    </>
                                                )}
                                            </button>
                                        </form>

                                        <div className="text-center text-sm mt-6 pt-6 border-t border-white/10 space-y-4">
                                            <div>
                                                <span className="text-gray-400">Ingat password? </span>
                                                <Link
                                                    href="/auth/login"
                                                    className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
                                                >
                                                    Masuk di sini
                                                </Link>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Belum punya akun? </span>
                                                <Link
                                                    href="/auth/register"
                                                    className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
                                                >
                                                    Daftar di sini
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2 mb-8">
                                            <h2 className="text-2xl font-bold text-white">Masukkan Kode Verifikasi</h2>
                                            <p className="text-gray-400 text-sm">Kami telah mengirim kode 6 digit ke email Anda</p>
                                        </div>

                                        {error && (
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/40 mb-6 backdrop-blur">
                                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                                <p className="text-red-300 text-sm">{error}</p>
                                            </div>
                                        )}

                                        <form onSubmit={handleCodeSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Kode (6 digit)</label>
                                                <Input
                                                    type="text"
                                                    value={code}
                                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    placeholder="000000"
                                                    maxLength={6}
                                                    className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-400 focus:ring-purple-400/20 text-center text-2xl letter-spacing-widest"
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading || code.length !== 6}
                                                className="w-full h-11 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                        Verifikasi...
                                                    </>
                                                ) : (
                                                    <>
                                                        Lanjutkan
                                                    </>
                                                )}
                                            </button>
                                        </form>

                                        <div className="text-center text-sm mt-6 pt-6 border-t border-white/10">
                                            <button
                                                onClick={() => {
                                                    setStep("email");
                                                    setCode("");
                                                    setError("");
                                                }}
                                                className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
                                            >
                                                Gunakan email lain
                                            </button>
                                        </div>
                                    </>
                                )}
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
