"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { AlertCircle, Mail, Lock } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login gagal");
                return;
            }

            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            router.push("/dashboard");
        } catch (err) {
            setError(String(err) || "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>

            <div className="w-full max-w-7xl flex gap-8 relative z-10 h-screen md:h-auto md:max-h-screen md:items-center">
                {/* Left Side - Logo & Branding */}
                <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center space-y-8 pr-8">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <Image
                                src="/images/medpredictjkn.png"
                                alt="MedpredictJKn JKN Logo"
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
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <p className="text-center text-sm text-gray-400 max-w-sm">
                        Sistem keamanan kami melindungi data kesehatan Anda dengan enkripsi tingkat enterprise
                    </p>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-6">
                        {/* Mobile Logo */}
                        <div className="md:hidden text-center space-y-3 mb-8">
                            <div className="flex justify-center mb-4">
                                <Image
                                    src="/images/medpredictjkn.png"
                                    alt="MedpredictJKn JKN Logo"
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

                        {/* Login Form Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="space-y-2 mb-8">
                                    <h2 className="text-2xl font-bold text-white">Masuk ke Akun</h2>
                                    <p className="text-gray-400 text-sm">Masuk dengan email dan password Anda untuk melanjutkan</p>
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
                                            <Mail className="w-4 h-4 text-blue-400" />
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="nama@example.com"
                                            className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-blue-400 focus:ring-blue-400/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-cyan-400" />
                                            Password
                                        </label>
                                        <Input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                            className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-blue-400 focus:ring-blue-400/20"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                Masuk
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center text-sm mt-6 pt-6 border-t border-white/10">
                                    <span className="text-gray-400">Belum punya akun? </span>
                                    <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                                        Daftar di sini
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Footer Info */}
                        <p className="md:hidden text-center text-xs text-gray-500">
                            Sistem keamanan kami melindungi data kesehatan Anda dengan enkripsi tingkat enterprise
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
