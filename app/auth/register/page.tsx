"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { AlertCircle, Mail, Lock, User, Phone } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
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
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registrasi gagal");
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
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md space-y-6 relative z-10">
                {/* Logo Section */}
                <div className="text-center space-y-3 mb-8">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/images/medpredictjkn.png"
                            alt="MedPredict JKN Logo"
                            width={80}
                            height={80}
                            priority
                            className="drop-shadow-lg"
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">
                            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MedPredict</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-2">Daftar Akun Baru</p>
                    </div>
                </div>

                {/* Register Form Card */}
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="space-y-2 mb-8">
                            <h2 className="text-2xl font-bold text-white">Daftar Akun</h2>
                            <p className="text-gray-400 text-sm">Isi data di bawah untuk membuat akun baru</p>
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
                                    <User className="w-4 h-4 text-green-400" />
                                    Nama Lengkap
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Reyhan Capri Moraga"
                                    className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                                />
                            </div>

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
                                    className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-cyan-400" />
                                    Nomor Telepon
                                </label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+62812345678"
                                    className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-orange-400" />
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                                />
                                <p className="text-xs text-gray-400">
                                    Minimal 8 karakter untuk keamanan
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <User className="w-4 h-4" />
                                        Daftar
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center text-sm mt-6 pt-6 border-t border-white/10">
                            <span className="text-gray-400">Sudah punya akun? </span>
                            <Link href="/auth/login" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors">
                                Masuk di sini
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <p className="text-center text-xs text-gray-500">
                    Data Anda dilindungi dengan enkripsi tingkat enterprise
                </p>
            </div>
        </div>
    );
}
