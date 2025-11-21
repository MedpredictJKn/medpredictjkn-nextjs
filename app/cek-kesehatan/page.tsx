"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Activity, Heart, Droplets, Pill } from "lucide-react";

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
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (!storedToken) {
            router.push("/auth/login");
            return;
        }

        setToken(storedToken);

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } catch {
                setUser(null);
            }
        }

        setIsCheckingAuth(false);
    }, [router]);

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
        setIsLoading(true);

        if (!formData.height || !formData.weight) {
            setError("Tinggi dan berat badan harus diisi");
            setIsLoading(false);
            return;
        }

        if (!token) {
            setError("Token tidak ditemukan, silahkan login ulang");
            setIsLoading(false);
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
            setResult({
                bmi: data.data.bmi,
                status: data.data.status,
                height: data.data.height,
                weight: data.data.weight,
            });

            setFormData({
                height: 0,
                weight: 0,
                bloodPressure: "",
                bloodSugar: undefined,
                cholesterol: undefined,
                notes: "",
            });
        } catch (err) {
            setError(String(err) || "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
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

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500"></div>
                    <p className="text-gray-400 font-medium">Memverifikasi akses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex">
            {/* Sidebar */}
            <Sidebar onLogout={handleLogout} userName={user?.name} userEmail={user?.email} />

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Header */}
                <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/10 border-b border-white/10">
                    <div className="px-8 py-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Cek Kesehatan
                            </h1>
                            <p className="text-sm text-gray-400 mt-2">
                                Periksa data kesehatan dan analisis BMI Anda
                            </p>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 space-y-6">
                    {/* User Profile Section */}
                    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Heart className="w-6 h-6 text-red-500" />
                                Pengguna Aktif
                            </h2>

                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </div>

                                <div>
                                    <p className="text-2xl font-bold text-white">{user?.name || "User"}</p>
                                    <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                                    {user?.phone && (
                                        <p className="text-gray-400 text-sm">{user.phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 backdrop-blur-lg">
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-500/20 border border-green-500/40 backdrop-blur-lg">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                            <p className="text-green-200 text-sm">{success}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8">
                                <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-white mb-8">Data Kesehatan Anda</h3>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Basic Measurements */}
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                                <Activity className="w-6 h-6 text-blue-400" />
                                                Pengukuran Dasar
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-200">
                                                        Tinggi Badan (cm) *
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
                                                        className="bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl h-11 focus:border-blue-400"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-200">
                                                        Berat Badan (kg) *
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
                                                        className="bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl h-11 focus:border-blue-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vital Signs */}
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                                <Droplets className="w-6 h-6 text-red-400" />
                                                Tanda Vital
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-200">
                                                        Tekanan Darah
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        name="bloodPressure"
                                                        value={formData.bloodPressure || ""}
                                                        onChange={handleChange}
                                                        placeholder="120/80"
                                                        className="bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl h-11 focus:border-blue-400"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-200">
                                                        Gula Darah (mg/dL)
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        name="bloodSugar"
                                                        value={formData.bloodSugar || ""}
                                                        onChange={handleChange}
                                                        placeholder="100"
                                                        min="0"
                                                        className="bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl h-11 focus:border-blue-400"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-200">
                                                        Kolesterol (mg/dL)
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        name="cholesterol"
                                                        value={formData.cholesterol || ""}
                                                        onChange={handleChange}
                                                        placeholder="200"
                                                        min="0"
                                                        className="bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl h-11 focus:border-blue-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Notes */}
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                                <Pill className="w-6 h-6 text-purple-400" />
                                                Catatan Tambahan
                                            </h4>
                                            <Textarea
                                                name="notes"
                                                value={formData.notes || ""}
                                                onChange={handleChange}
                                                placeholder="Tulis catatan tentang kesehatan Anda..."
                                                className="bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl focus:border-blue-400"
                                                rows={4}
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                                            >
                                                {isLoading ? "Memproses..." : "Simpan & Analisis"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Info Sidebar */}
                        <div className="space-y-6">
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />

                                <div className="relative z-10">
                                    <h4 className="font-bold text-white text-lg mb-4">Panduan BMI</h4>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 shrink-0"></div>
                                            <div>
                                                <p className="font-semibold text-white">Kurang: &lt;18.5</p>
                                                <p className="text-gray-400 text-xs">Berat badan kurang</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0"></div>
                                            <div>
                                                <p className="font-semibold text-white">Normal: 18.5-24.9</p>
                                                <p className="text-gray-400 text-xs">Berat badan normal</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 shrink-0"></div>
                                            <div>
                                                <p className="font-semibold text-white">Berlebih: 25-29.9</p>
                                                <p className="text-gray-400 text-xs">Berat badan berlebih</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0"></div>
                                            <div>
                                                <p className="font-semibold text-white">Obese: ≥30</p>
                                                <p className="text-gray-400 text-xs">Obesitas</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className="space-y-6">
                            {/* Result Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                                    <div className="relative z-10">
                                        <p className="text-gray-400 text-sm mb-2">Tinggi Badan</p>
                                        <p className="text-4xl font-bold text-white">{result.height}</p>
                                        <p className="text-xs text-gray-500 mt-2">cm</p>
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
                                    <div className="relative z-10">
                                        <p className="text-gray-400 text-sm mb-2">Berat Badan</p>
                                        <p className="text-4xl font-bold text-white">{result.weight}</p>
                                        <p className="text-xs text-gray-500 mt-2">kg</p>
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg border border-cyan-500/40 p-6">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl" />
                                    <div className="relative z-10">
                                        <p className="text-gray-300 text-sm mb-2">BMI Anda</p>
                                        <p className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                            {result.bmi.toFixed(1)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">Body Mass Index</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${getStatusBgGradient(result.status)} backdrop-blur-lg border p-8 text-center`}>
                                <div className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <p className="text-gray-300 text-sm mb-4 font-semibold uppercase tracking-wider">
                                        Status Kesehatan Anda
                                    </p>
                                    <p className={`text-5xl font-bold ${getStatusColor(result.status)} mb-6`}>
                                        {getStatusText(result.status)}
                                    </p>
                                    <p className="text-gray-300 text-sm max-w-lg mx-auto">
                                        Berdasarkan hasil perhitungan BMI, status kesehatan Anda menunjukkan kategori tersebut. Untuk informasi lebih detail, konsultasikan dengan profesional kesehatan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
