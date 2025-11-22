"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Activity, Pill, ArrowLeft, TrendingUp, Heart, Award, Stethoscope, Loader } from "lucide-react";

export const dynamic = "force-dynamic";

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

interface RiskPrediction {
    diabetes: { score: number; level: string; risk: number };
    hypertension: { score: number; level: string; risk: number };
    heartDisease: { score: number; level: string; risk: number };
}

interface Alert {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    action?: string;
}

interface Recommendation {
    type: string;
    description: string;
    priority: string;
    reason: string;
    estimatedCost?: string;
    location?: string;
}

interface LifestyleTip {
    category: string;
    tips: string[];
}

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error';
}

export default function CekKesehatanPage() {
    const router = useRouter();
    const [_user] = useState<User | null>(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    return JSON.parse(storedUser);
                } catch (err) {
                    console.error("Error parsing user data:", err);
                    return null;
                }
            }
        }
        return null;
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [token] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("token") || "";
        }
        return "";
    });
    const [isCheckingAuth, setIsCheckingAuth] = useState(token ? false : true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Form data - persisten di database
    const [formData, setFormData] = useState<HealthData>({
        height: 0,
        weight: 0,
        bloodPressure: "",
        bloodSugar: undefined,
        cholesterol: undefined,
        notes: "",
    });

    // Result & Analysis - TEMPORARY ONLY (tidak disimpan, hilang saat refresh)
    const [result, setResult] = useState<HealthResponse | null>(null);
    const [_riskPrediction, setRiskPrediction] = useState<RiskPrediction | null>(null);
    const [_alerts, setAlerts] = useState<Alert[]>([]);
    const [screeningRecommendations, setScreeningRecommendations] = useState<Recommendation[]>([]);
    const [lifestyleRecommendations, setLifestyleRecommendations] = useState<LifestyleTip[]>([]);
    const [_riskLevel, setRiskLevel] = useState<string>("");
    const [_interventionRequired, setInterventionRequired] = useState(false);

    // Fetch existing health data
    const fetchHealthData = async (token: string) => {
        try {
            const response = await fetch("/api/health", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.warn(`[fetchHealthData] HTTP ${response.status}`);
                return;
            }

            const data = await response.json();
            console.log("[fetchHealthData] Response:", data);

            if (data.data) {
                setFormData({
                    height: data.data.height || 0,
                    weight: data.data.weight || 0,
                    bloodPressure: data.data.bloodPressure || "",
                    bloodSugar: data.data.bloodSugar || undefined,
                    cholesterol: data.data.cholesterol || undefined,
                    notes: data.data.notes || "",
                });

                // Note: Do NOT set result here. Results should only display after user clicks "Simpan & Analisis"
                // Results are temporary and should disappear on page refresh
            }
        } catch (err) {
            console.error("Error fetching health data:", err);
        }
    };

    const fetchAIRecommendations = async (bmi: number, healthData: HealthData) => {
        if (!token) return;

        try {
            setIsAnalyzing(true);
            const response = await fetch("/api/health/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    healthData,
                    bmi,
                }),
            });

            if (!response.ok) {
                console.error("Analysis API error:", response.status);
                const toastId = Date.now().toString();
                setToasts(prev => [...prev, { id: toastId, message: "Gagal menganalisis data kesehatan", type: 'error' }]);
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toastId));
                }, 3000);
                return;
            }

            const data = await response.json();
            console.log("[AI Analysis] Response:", data);

            if (data.success && data.data) {
                setRiskPrediction(data.data.riskPrediction);
                setAlerts(data.data.alerts);
                setScreeningRecommendations(data.data.screeningRecommendations);
                setLifestyleRecommendations(data.data.lifestyleRecommendations);
                setRiskLevel(data.data.riskLevel);
                setInterventionRequired(data.data.interventionRequired);

                // Show success toast ONLY WHEN ANALYSIS COMPLETES
                const toastId = Date.now().toString();
                setToasts(prev => [...prev, { id: toastId, message: "Data kesehatan berhasil disimpan dan dianalisis!", type: 'success' }]);
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toastId));
                }, 3000);
            }
        } catch (err) {
            console.error("Error fetching AI analysis:", err);
            const toastId = Date.now().toString();
            setToasts(prev => [...prev, { id: toastId, message: "Gagal menganalisis data kesehatan", type: 'error' }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 3000);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.height || !formData.weight) {
            const toastId = Date.now().toString();
            setToasts(prev => [...prev, { id: toastId, message: "Tinggi dan berat badan harus diisi", type: 'error' }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 3000);
            return;
        }

        if (!token) {
            const toastId = Date.now().toString();
            setToasts(prev => [...prev, { id: toastId, message: "Token tidak ditemukan, silahkan login ulang", type: 'error' }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 3000);
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
                const toastId = Date.now().toString();
                setToasts(prev => [...prev, { id: toastId, message: data.message || "Gagal menyimpan data kesehatan", type: 'error' }]);
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toastId));
                }, 3000);
                return;
            }

            // Update form dengan response dari server
            setFormData({
                height: data.data.height,
                weight: data.data.weight,
                bloodPressure: data.data.bloodPressure || "",
                bloodSugar: data.data.bloodSugar || undefined,
                cholesterol: data.data.cholesterol || undefined,
                notes: data.data.notes || "",
            });

            // Set result untuk tampilan temporary
            setResult({
                bmi: data.data.bmi,
                status: data.data.status,
                height: data.data.height,
                weight: data.data.weight,
            });

            // Fetch AI recommendations setelah health data disimpan
            // Success notification akan ditampilkan setelah analisis selesai
            await fetchAIRecommendations(data.data.bmi, {
                height: data.data.height,
                weight: data.data.weight,
                bloodPressure: data.data.bloodPressure,
                bloodSugar: data.data.bloodSugar,
                cholesterol: data.data.cholesterol,
                notes: data.data.notes,
            });
        } catch (err) {
            const toastId = Date.now().toString();
            setToasts(prev => [...prev, { id: toastId, message: String(err) || "Terjadi kesalahan", type: 'error' }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 3000);
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

    const _getStatusColor = (status: string) => {
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

    const _getStatusBgGradient = (status: string) => {
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

    const _getStatusText = (status: string) => {
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

    const _getAlertBgColor = (_severity: string) => {
        // Moved to chatbot AI
        return "";
    };

    const _getAlertIconColor = (_severity: string) => {
        // Moved to chatbot AI
        return "";
    };

    const _getRiskScoreColor = (_score: number) => {
        // Moved to chatbot AI
        return "";
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Urgent":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "High":
                return "bg-orange-500/20 text-orange-300 border-orange-500/30";
            case "Medium":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            default:
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
        }
    };

    useEffect(() => {
        // Token is already loaded in initial state, so check it here
        if (!token) {
            router.push("/auth/login");
            return;
        }

        setIsCheckingAuth(false);

        Promise.resolve().then(() => {
            fetchHealthData(token);
        });
    }, [token, router]);

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-float-1" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-float-2" />

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="h-[70px] px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Cek Kesehatan & Analisis Risiko
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Periksa data kesehatan dan dapatkan analisis AI mendalam
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Toast Notifications */}
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 mt-4 pointer-events-none">
                <div className="flex flex-col gap-2">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`flex items-center gap-3 px-6 py-3 rounded-lg backdrop-blur-lg border pointer-events-auto transition-all ${toast.type === 'success'
                                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                                : 'bg-red-500/20 border-red-500/40 text-red-300'
                                }`}
                        >
                            {toast.type === 'success' ? (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </div>
                    ))}
                </div>
            </div>

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
                                    <div className="p-6 rounded-lg bg-blue-500/20 border border-blue-500/30">
                                        <Activity className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Data Kesehatan Anda</h3>
                                        <p className="text-sm text-gray-400 mt-0.5">Masukkan data kesehatan terbaru untuk analisis BMI & risiko penyakit</p>
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
                                            <div className="space-y-2 group">
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
                                            placeholder="Tulis catatan tentang kondisi kesehatan Anda..."
                                            className="bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all resize-none"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                        <Button
                                            type="submit"
                                            disabled={isAnalyzing}
                                            className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            {isAnalyzing ? "Menganalisis..." : "Simpan & Analisis"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - BMI Guide & Health Tips */}
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

                {/* ===== RESULTS SECTION - TEMPORARY, ONLY AFTER SUBMIT ===== */}
                {result && (
                    <div className="space-y-8 animate-in fade-in-50 duration-500">
                        {/* Header */}

                        {/* Loading state while analyzing */}
                        {isAnalyzing && (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center space-y-4">
                                    <Loader className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                                    <p className="text-gray-300">Menganalisis data kesehatan Anda dengan AI...</p>
                                </div>
                            </div>
                        )}

                        {/* Analysis Results */}
                        {!isAnalyzing && _riskPrediction && (
                            <>
                                {/* BMI & Status Summary Tetap Ditampilkan */}

                                {/* ===== SCREENING RECOMMENDATIONS SECTION ===== */}
                                {screeningRecommendations.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 bg-linear-to-b from-blue-400 to-cyan-400 rounded-full" />
                                            <h3 className="text-3xl font-bold text-white">Rekomendasi Skrining Kesehatan</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {screeningRecommendations.map((rec, index) => (
                                                <div
                                                    key={index}
                                                    className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 shadow-lg hover:border-white/40 transition-all"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <Stethoscope className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                                                                <h4 className="text-lg font-bold text-white">{rec.type}</h4>
                                                            </div>
                                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}>
                                                                {rec.priority}
                                                            </span>
                                                        </div>

                                                        <p className="text-gray-300 mb-4">{rec.description}</p>

                                                        <div className="space-y-3 border-t border-white/10 pt-4">
                                                            <div>
                                                                <p className="text-xs text-gray-400 mb-1">Alasan</p>
                                                                <p className="text-sm text-gray-200">{rec.reason}</p>
                                                            </div>
                                                            {rec.estimatedCost && (
                                                                <div>
                                                                    <p className="text-xs text-gray-400 mb-1">Estimasi Biaya</p>
                                                                    <p className="text-sm text-gray-200">{rec.estimatedCost}</p>
                                                                </div>
                                                            )}
                                                            {rec.location && (
                                                                <div>
                                                                    <p className="text-xs text-gray-400 mb-1">Lokasi</p>
                                                                    <p className="text-sm text-gray-200">{rec.location}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ===== LIFESTYLE RECOMMENDATIONS SECTION ===== */}
                                {lifestyleRecommendations.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 bg-linear-to-b from-green-400 to-emerald-400 rounded-full" />
                                            <h3 className="text-3xl font-bold text-white">Rekomendasi Gaya Hidup Personalisasi</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {lifestyleRecommendations.map((category, index) => (
                                                <div
                                                    key={index}
                                                    className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 shadow-lg hover:border-white/40 transition-all"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <Award className="w-5 h-5 text-green-400" />
                                                            <h4 className="text-lg font-bold text-white">{category.category}</h4>
                                                        </div>

                                                        <ul className="space-y-3">
                                                            {category.tips.map((tip, tipIndex) => (
                                                                <li key={tipIndex} className="flex gap-3">
                                                                    <span className="text-green-400 font-bold shrink-0">•</span>
                                                                    <span className="text-gray-300 text-sm">{tip}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                                    <Button
                                        onClick={() => {
                                            setResult(null);
                                            setRiskPrediction(null);
                                            setAlerts([]);
                                            setScreeningRecommendations([]);
                                            setLifestyleRecommendations([]);
                                            setRiskLevel("");
                                            setInterventionRequired(false);
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
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}