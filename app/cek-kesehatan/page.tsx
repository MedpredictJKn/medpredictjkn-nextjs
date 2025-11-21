"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Activity, Pill, ArrowLeft, TrendingUp, Heart } from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
}

interface HealthData {
    height: number;
    weight: number;
    bloodPressure?: string;
    bloodSugar?: number;
    cholesterol?: number;
    notes?: string;
}

interface HealthResponse {
    bmi: number;
    status: string;
    height: number;
    weight: number;
}

export default function CekKesehatanPage() {
    const router = useRouter();
    const [_user, setUser] = useState<User | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [token, setToken] = useState("");
    const [result, setResult] = useState<HealthResponse | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const [formData, setFormData] = useState<HealthData>({
        height: 0,
        weight: 0,
        bloodPressure: "",
        bloodSugar: undefined,
        cholesterol: undefined,
        notes: "",
    });

    // Fetch existing health data
    const fetchHealthData = async (token: string) => {
        try {
            const response = await fetch("/api/health", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    // Auto-populate form with existing data
                    setFormData({
                        height: data.data.height || 0,
                        weight: data.data.weight || 0,
                        bloodPressure: data.data.bloodPressure || "",
                        bloodSugar: data.data.bloodSugar || undefined,
                        cholesterol: data.data.cholesterol || undefined,
                        notes: data.data.notes || "",
                    });

                    // Show result if available
                    if (data.data.bmi) {
                        setResult({
                            bmi: data.data.bmi,
                            status: data.data.status,
                            height: data.data.height,
                            weight: data.data.weight,
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching health data:", err);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "bloodSugar" || name === "cholesterol"
                    ? value
                        ? parseFloat(value)
                        : undefined
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.height || !formData.weight) {
            setError("Tinggi dan berat badan harus diisi");
            return;
        }

        if (!token) {
            setError("Token tidak ditemukan, silahkan login ulang");
            return;
        }

        try {
            const response = await fetch("/api/health", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Gagal menyimpan data kesehatan");
                return;
            }

            setSuccess("Data kesehatan berhasil disimpan!");

            // Update form dengan data terbaru dari response (jangan clear)
            setFormData({
                height: data.data.height,
                weight: data.data.weight,
                bloodPressure: data.data.bloodPressure || "",
                bloodSugar: data.data.bloodSugar || undefined,
                cholesterol: data.data.cholesterol || undefined,
                notes: data.data.notes || "",
            });

            // Show result
            setResult({
                bmi: data.data.bmi,
                status: data.data.status,
                height: data.data.height,
                weight: data.data.weight,
            });
        } catch (err) {
            setError(String(err) || "Terjadi kesalahan");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "normal":
                return "text-green-400";
            case "underweight":
                return "text-blue-400";
            case "overweight":
                return "text-yellow-400";
            case "obese":
                return "text-red-400";
            default:
                return "text-gray-400";
        }
    };

    const getStatusBgGradient = (status: string) => {
        switch (status) {
            case "normal":
                return "from-green-500/20 to-emerald-500/20 border-green-500/40";
            case "underweight":
                return "from-blue-500/20 to-cyan-500/20 border-blue-500/40";
            case "overweight":
                return "from-yellow-500/20 to-orange-500/20 border-yellow-500/40";
            case "obese":
                return "from-red-500/20 to-pink-500/20 border-red-500/40";
            default:
                return "from-gray-500/20 to-slate-500/20 border-gray-500/40";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "normal":
                return "Berat Badan Normal";
            case "underweight":
                return "Berat Badan Kurang";
            case "overweight":
                return "Berat Badan Berlebih";
            case "obese":
                return "Obesitas";
            default:
                return "Status Tidak Diketahui";
        }
    };

    // eslint-disable react-hooks/rules-of-hooks
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (!storedToken) {
            router.push("/auth/login");
            return;
        }

        let userData: User | null = null;
        if (storedUser) {
            try {
                userData = JSON.parse(storedUser);
            } catch {
                userData = null;
            }
        }

        // Set all state at once
        setUser(userData);
        setToken(storedToken);
        setIsCheckingAuth(false);
        
        // Fetch existing health data in a separate microtask to avoid cascading renders
        Promise.resolve().then(() => {
            fetchHealthData(storedToken);
        });
    }, [router]);

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="h-[70px] px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Cek Kesehatan
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Periksa data kesehatan dan analisis BMI Anda
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <div className="p-8 space-y-8 relative z-10">
                {/* Messages */}
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/40 backdrop-blur-lg animate-in">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-red-200 text-sm font-semibold">Error</p>
                            <p className="text-red-200/80 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/20 border border-green-500/40 backdrop-blur-lg animate-in">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-green-200 text-sm font-semibold">Berhasil</p>
                            <p className="text-green-200/80 text-sm">{success}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Form Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8 shadow-2xl">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                                        <Activity className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Data Kesehatan Anda</h3>
                                        <p className="text-sm text-gray-400 mt-0.5">Masukkan data kesehatan terbaru untuk analisis BMI</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Basic Measurements */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-6 bg-linear-to-b from-blue-400 to-cyan-400 rounded-full" />
                                            <h4 className="text-lg font-bold text-white">Pengukuran Dasar</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    Tinggi Badan (cm) <span className="text-red-400">*</span>
                                                </label>
                                                <Input
                                                    type="number"
                                                    name="height"
                                                    value={formData.height || ""}
                                                    onChange={handleChange}
                                                    required
                                                    min="0"
                                                    step="0.1"
                                                    placeholder="170"
                                                    className="bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl h-12 focus:border-blue-400 focus:ring-blue-400/20 transition-all group-hover:border-white/30"
                                                />
                                                <p className="text-xs text-gray-400">Contoh: 170 cm</p>
                                            </div>

                                            <div className="space-y-2 group">
                                                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                    Berat Badan (kg) <span className="text-red-400">*</span>
                                                </label>
                                                <Input
                                                    type="number"
                                                    name="weight"
                                                    value={formData.weight || ""}
                                                    onChange={handleChange}
                                                    required
                                                    min="0"
                                                    step="0.1"
                                                    placeholder="65"
                                                    className="bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl h-12 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all group-hover:border-white/30"
                                                />
                                                <p className="text-xs text-gray-400">Contoh: 65 kg</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vital Signs */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-6 bg-linear-to-b from-red-400 to-pink-400 rounded-full" />
                                            <h4 className="text-lg font-bold text-white">Tanda Vital</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-4 group">
                                                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                    Tekanan Darah (mmHg)
                                                </label>
                                                <Input
                                                    type="text"
                                                    name="bloodPressure"
                                                    value={formData.bloodPressure || ""}
                                                    onChange={handleChange}
                                                    placeholder="120/80"
                                                    className="bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl h-12 focus:border-red-400 focus:ring-red-400/20 transition-all group-hover:border-white/30"
                                                />
                                                <p className="text-xs text-gray-400">Format: Sistole/Diastole</p>
                                            </div>

                                            <div className="space-y-2 group">
                                                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                                    Gula Darah (mg/dL)
                                                </label>
                                                <Input
                                                    type="number"
                                                    name="bloodSugar"
                                                    value={formData.bloodSugar || ""}
                                                    onChange={handleChange}
                                                    placeholder="100"
                                                    min="0"
                                                    step="1"
                                                    className="bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl h-12 focus:border-yellow-400 focus:ring-yellow-400/20 transition-all group-hover:border-white/30"
                                                />
                                                <p className="text-xs text-gray-400">Puasa: 70-100 mg/dL</p>
                                            </div>

                                            <div className="space-y-2 group">
                                                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                    Kolesterol (mg/dL)
                                                </label>
                                                <Input
                                                    type="number"
                                                    name="cholesterol"
                                                    value={formData.cholesterol || ""}
                                                    onChange={handleChange}
                                                    placeholder="200"
                                                    min="0"
                                                    step="1"
                                                    className="bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all group-hover:border-white/30"
                                                />
                                                <p className="text-xs text-gray-400">Target: &lt;200 mg/dL</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Notes */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-6 bg-linear-to-b from-purple-400 to-pink-400 rounded-full" />
                                            <h4 className="text-lg font-bold text-white">Catatan & Keterangan</h4>
                                        </div>
                                        <Textarea
                                            name="notes"
                                            value={formData.notes || ""}
                                            onChange={handleChange}
                                            placeholder="Tulis catatan tentang kondisi kesehatan Anda, misalnya: keluhan, aktivitas fisik, pola makan, atau obat-obatan yang sedang dikonsumsi..."
                                            className="bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all resize-none"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 group"
                                        >
                                            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Simpan & Analisis
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Info & Guidelines */}
                    <div className="space-y-6">
                        {/* BMI Guide */}
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-green-500/20">
                                        <Heart className="w-5 h-5 text-green-400" />
                                    </div>
                                    <h4 className="font-bold text-white text-lg">Panduan BMI</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-3 h-3 bg-blue-400 rounded-full" />
                                            <p className="font-semibold text-blue-300 text-sm">Kurang: &lt;18.5</p>
                                        </div>
                                        <p className="text-gray-400 text-xs ml-6">Berat badan kurang dari normal</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:border-green-500/40 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-3 h-3 bg-green-400 rounded-full" />
                                            <p className="font-semibold text-green-300 text-sm">Normal: 18.5-24.9</p>
                                        </div>
                                        <p className="text-gray-400 text-xs ml-6">Berat badan ideal</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                                            <p className="font-semibold text-yellow-300 text-sm">Berlebih: 25-29.9</p>
                                        </div>
                                        <p className="text-gray-400 text-xs ml-6">Berat badan di atas normal</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-3 h-3 bg-red-400 rounded-full" />
                                            <p className="font-semibold text-red-300 text-sm">Obesitas: ≥30</p>
                                        </div>
                                        <p className="text-gray-400 text-xs ml-6">Berat badan sangat berlebih</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Health Tips */}
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-purple-400" />
                                    Tips Sehat
                                </h4>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex gap-3">
                                        <span className="text-purple-400 font-bold">•</span>
                                        <span className="text-gray-300">Minum air putih 8 gelas per hari</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-purple-400 font-bold">•</span>
                                        <span className="text-gray-300">Olahraga minimal 30 menit setiap hari</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-purple-400 font-bold">•</span>
                                        <span className="text-gray-300">Perbanyak konsumsi sayur dan buah</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-purple-400 font-bold">•</span>
                                        <span className="text-gray-300">Hindari makanan berminyak dan berlemak</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-purple-400 font-bold">•</span>
                                        <span className="text-gray-300">Istirahat yang cukup (7-8 jam per hari)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Result Section */}
                {result && (
                    <div className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-8 bg-linear-to-b from-cyan-400 to-blue-400 rounded-full" />
                            <h2 className="text-3xl font-bold text-white">Hasil Analisis Anda</h2>
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-500/10 backdrop-blur-lg border border-blue-500/30 p-6 shadow-lg hover:border-blue-500/50 transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                                <div className="relative z-10">
                                    <p className="text-blue-200/80 text-sm font-semibold uppercase tracking-wide mb-2">Tinggi Badan</p>
                                    <p className="text-4xl font-bold text-blue-100">{result.height}</p>
                                    <p className="text-sm text-blue-200/60 mt-3">cm</p>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-500/20 to-purple-500/10 backdrop-blur-lg border border-purple-500/30 p-6 shadow-lg hover:border-purple-500/50 transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                                <div className="relative z-10">
                                    <p className="text-purple-200/80 text-sm font-semibold uppercase tracking-wide mb-2">Berat Badan</p>
                                    <p className="text-4xl font-bold text-purple-100">{result.weight}</p>
                                    <p className="text-sm text-purple-200/60 mt-3">kg</p>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-500/20 to-cyan-500/10 backdrop-blur-lg border border-cyan-500/30 p-6 shadow-lg hover:border-cyan-500/50 transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
                                <div className="relative z-10">
                                    <p className="text-cyan-200/80 text-sm font-semibold uppercase tracking-wide mb-2">BMI Anda</p>
                                    <p className="text-5xl font-bold bg-linear-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">{result.bmi.toFixed(1)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${getStatusBgGradient(result.status)} backdrop-blur-lg border p-8 text-center shadow-2xl`}>
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" />
                            </div>

                            <div className="relative z-10">
                                <p className="text-gray-300 text-sm mb-4 font-semibold uppercase tracking-widest">Status Kesehatan Anda</p>
                                <p className={`text-6xl font-black ${getStatusColor(result.status)} mb-6 drop-shadow-lg`}>
                                    {getStatusText(result.status)}
                                </p>
                                <div className="max-w-2xl mx-auto space-y-4">
                                    <p className="text-gray-200 text-lg leading-relaxed">
                                        Berdasarkan perhitungan BMI Anda sebesar <span className="font-bold text-white">{result.bmi.toFixed(1)}</span>, status kesehatan Anda masuk dalam kategori <span className="font-bold text-white">{getStatusText(result.status)}</span>.
                                    </p>
                                    <p className="text-gray-300 text-sm">
                                        Untuk informasi lebih detail dan rekomendasi kesehatan yang tepat, silakan konsultasikan dengan profesional kesehatan atau dokter terpercaya.
                                    </p>
                                </div>

                                {/* Quick Action */}
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={() => {
                                            setFormData({
                                                height: 0,
                                                weight: 0,
                                                bloodPressure: "",
                                                bloodSugar: undefined,
                                                cholesterol: undefined,
                                                notes: "",
                                            });
                                            setResult(null);
                                        }}
                                        className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl backdrop-blur transition-all border border-white/30"
                                    >
                                        Cek Ulang
                                    </Button>
                                    <Button
                                        onClick={() => router.push("/dashboard")}
                                        className="px-8 py-3 bg-linear-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white font-semibold rounded-xl backdrop-blur transition-all border border-white/30"
                                    >
                                        Kembali ke Dashboard
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
