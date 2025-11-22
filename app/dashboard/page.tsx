"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { useCounterAnimation, useProgressAnimation } from "@/lib/hooks/useCounterAnimation";
import {
    Activity,
    MessageCircle,
    AlertCircle,
    Heart,
    Zap,
    Users,
    ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    profilePhoto?: string;
}

interface HealthMetric {
    name: string;
    value: string;
    unit: string;
    status: "normal" | "warning" | "critical";
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(() => {
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

    // State Data
    const [patientCount, setPatientCount] = useState(0);
    const [activeMonitoring, setActiveMonitoring] = useState(0);
    const [totalPemeriksaan, setTotalPemeriksaan] = useState(0);
    const [totalChat, setTotalChat] = useState(0);
    const [alertAktif, setAlertAktif] = useState(0);
    const [totalMessagesSent, setTotalMessagesSent] = useState(0);
    const [latestHealth, setLatestHealth] = useState<{
        bloodPressure: string | null;
        bmi: number;
        bloodSugar: number | null;
        cholesterol: number | null;
        createdAt: Date;
    } | null>(null);
    const [wellnessScore, setWellnessScore] = useState(0);

    // --- LOGIC UNTUK MEMECAH TEKANAN DARAH ---
    // Jika data ada, split "120/80" menjadi [120, 80]. Jika tidak, default 0.
    const [targetSystole, targetDiastole] = latestHealth?.bloodPressure
        ? latestHealth.bloodPressure.split('/').map(Number)
        : [0, 0];

    // --- ANIMATION HOOKS ---

    // 1. Tekanan Darah (Dianimasikan terpisah)
    const animatedSystole = useCounterAnimation(targetSystole || 0, 1500);
    const animatedDiastole = useCounterAnimation(targetDiastole || 0, 1500);

    // 2. Global / Patient Stats
    const animatedTotalPemeriksaan = useCounterAnimation(totalPemeriksaan, 1500);
    const animatedTotalChat = useCounterAnimation(totalChat, 1500);
    const animatedAlertAktif = useCounterAnimation(alertAktif, 1500);

    // 3. Doctor Stats
    const animatedPatientCount = useCounterAnimation(patientCount, 1500);
    const animatedActiveMonitoring = useCounterAnimation(activeMonitoring, 1500);
    const animatedMessagesSent = useCounterAnimation(totalMessagesSent, 1500);

    // 4. Health Metrics Lainnya (Patient)
    const animatedWellnessScore = useCounterAnimation(wellnessScore, 2000);
    const animatedBMI = useProgressAnimation(latestHealth?.bmi ?? 0, 1500);
    const animatedBloodSugar = useCounterAnimation(latestHealth?.bloodSugar ?? 0, 1500);
    const animatedCholesterol = useCounterAnimation(latestHealth?.cholesterol ?? 0, 1500);

    useEffect(() => {
        let isMounted = true;
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (!storedUser || !storedToken) {
            router.push("/auth/login");
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            if (isMounted) {
                setUser(userData);

                // Fetch dashboard stats for all users
                const fetchDashboardStats = async () => {
                    try {
                        const response = await fetch("/api/dashboard/stats", {
                            headers: {
                                "Authorization": `Bearer ${storedToken}`,
                            },
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (isMounted && data.data) {
                                setTotalPemeriksaan(data.data.totalPemeriksaan);
                                setTotalChat(data.data.totalChat);
                                setAlertAktif(data.data.alertAktif);
                                setLatestHealth(data.data.latestHealth);
                                setWellnessScore(data.data.wellnessScore);
                            }
                        }
                    } catch (err) {
                        console.error("Error fetching dashboard stats:", err);
                    }
                };

                fetchDashboardStats();

                // Fetch doctor's patients if user is a doctor
                if (userData.role === "doctor") {
                    const fetchDoctorStats = async () => {
                        try {
                            const response = await fetch("/api/doctor/patients", {
                                headers: {
                                    "Authorization": `Bearer ${storedToken}`,
                                    "Cache-Control": "no-cache"
                                },
                            });

                            if (response.ok) {
                                const data = await response.json();
                                if (isMounted && data.data) {
                                    setPatientCount(data.data.length);
                                    const withHealthData = data.data.filter((p: { latestHealth: Record<string, unknown> | null }) => p.latestHealth).length;
                                    setActiveMonitoring(withHealthData);
                                }
                            }
                        } catch (err) {
                            console.error("Error fetching doctor stats:", err);
                        }
                    };

                    // Fetch total messages sent
                    const fetchMessageStats = async () => {
                        try {
                            const response = await fetch("/api/doctor/messages/count", {
                                headers: {
                                    "Authorization": `Bearer ${storedToken}`,
                                    "Cache-Control": "no-cache"
                                },
                            });

                            if (response.ok) {
                                const data = await response.json();
                                if (isMounted && data.data) {
                                    setTotalMessagesSent(data.data.totalMessagesSent);
                                }
                            }
                        } catch (err) {
                            console.error("Error fetching message stats:", err);
                        }
                    };

                    fetchDoctorStats();
                    fetchMessageStats();
                }
            }
        } catch (err) {
            console.error("Error parsing user data:", err);
        }

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleLogout = async () => {
        try {
            // Call logout API to clear server-side cookie
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear client-side data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/auth/login");
        }
    };

    const isDoctor = user?.role === "doctor";

    // Patient quick stats
    const patientQuickStats = [
        {
            label: "Total Pemeriksaan",
            value: animatedTotalPemeriksaan,
            icon: Activity,
            color: "bg-blue-500",
        },
        {
            label: "Chat AI",
            value: animatedTotalChat,
            icon: MessageCircle,
            color: "bg-purple-500",
        },
        {
            label: "Alert Aktif",
            value: animatedAlertAktif,
            icon: AlertCircle,
            color: "bg-orange-500",
        },
    ];

    // Doctor quick stats
    const doctorQuickStats = [
        {
            label: "Total Pasien",
            value: animatedPatientCount,
            icon: Users,
            color: "bg-green-500",
        },
        {
            label: "Monitoring Aktif",
            value: animatedActiveMonitoring,
            icon: AlertCircle,
            color: "bg-orange-500",
        },
        {
            label: "Pesan Terkirim",
            value: animatedMessagesSent,
            icon: MessageCircle,
            color: "bg-blue-500",
        },
    ];

    const quickStats = isDoctor ? doctorQuickStats : patientQuickStats;

    // Health Metrics dengan animasi LENGKAP
    const healthMetrics: HealthMetric[] = latestHealth ? [
        {
            name: "Tekanan Darah",
            // Disini kita gabungkan kembali Systole dan Diastole yang sudah dianimasikan
            value: latestHealth.bloodPressure
                ? `${Math.round(animatedSystole)}/${Math.round(animatedDiastole)}`
                : "0/A",
            unit: "mmHg",
            status: latestHealth.bloodPressure
                ? (() => {
                    const [systolic] = latestHealth.bloodPressure.split("/").map(Number);
                    return systolic > 140 || systolic < 90 ? "critical" : systolic > 130 || systolic < 100 ? "warning" : "normal";
                })()
                : "normal"
        },
        {
            name: "BMI",
            value: animatedBMI.toFixed(1),
            unit: "kg/m²",
            status: latestHealth.bmi < 18.5 || latestHealth.bmi > 24.9 ? "warning" : "normal"
        },
        {
            name: "Gula Darah",
            value: Math.round(animatedBloodSugar).toString(),
            unit: "mg/dL",
            status: latestHealth.bloodSugar
                ? latestHealth.bloodSugar > 200 || latestHealth.bloodSugar < 70 ? "critical" : latestHealth.bloodSugar > 140 || latestHealth.bloodSugar < 100 ? "warning" : "normal"
                : "normal"
        },
        {
            name: "Kolesterol",
            value: Math.round(animatedCholesterol).toString(),
            unit: "mg/dL",
            status: latestHealth.cholesterol
                ? latestHealth.cholesterol > 240 ? "critical" : latestHealth.cholesterol > 200 ? "warning" : "normal"
                : "normal"
        },
    ] : [
        { name: "Tekanan Darah", value: "0/0", unit: "mmHg", status: "normal" },
        { name: "BMI", value: "0.0", unit: "kg/m²", status: "normal" },
        { name: "Gula Darah", value: "0", unit: "mg/dL", status: "normal" },
        { name: "Kolesterol", value: "0", unit: "mg/dL", status: "normal" },
    ];

    const patientServices = [
        {
            title: "Cek Kesehatan",
            description: "Periksa BMI, tekanan darah, dan data kesehatan Anda",
            icon: Heart,
            href: "/cek-kesehatan",
        },
        {
            title: "Chat dengan AI",
            description: "Tanyakan pertanyaan kesehatan kepada AI kami",
            icon: MessageCircle,
            href: "/chat",
        },
        {
            title: "Profil Saya",
            description: "Kelola data pribadi dan riwayat kesehatan",
            icon: Users,
            href: "/profil",
        },
    ];

    const doctorServices = [
        {
            title: "Monitoring Pasien",
            description: "Pantau kesehatan dan BMI semua pasien Anda",
            icon: Users,
            href: "/doctor/monitoring",
        },
        {
            title: "Kirim Pesan",
            description: "Berkomunikasi dengan pasien melalui WhatsApp",
            icon: MessageCircle,
            href: "/doctor/monitoring",
        },
        {
            title: "Profil Saya",
            description: "Kelola data profesional dan informasi dokter",
            icon: Users,
            href: "/profil",
        },
    ];

    const services = isDoctor ? doctorServices : patientServices;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex" suppressHydrationWarning>
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-float-1"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-float-2"></div>

            {/* Sidebar */}
            <Sidebar
                key={user?.role}
                onLogout={handleLogout}
                userName={user?.name}
                userEmail={user?.email}
                userRole={user?.role}
                profilePhoto={user?.profilePhoto}
            />

            {/* Main Content */}
            <main className="flex-1 ml-64 relative z-10">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
                    <div className="h-[70px] px-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Selamat datang, <span className="text-white font-medium">{user?.name}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                                <p className="text-xs font-semibold text-green-400 mt-0.5">● Online</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 space-y-8">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickStats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group relative overflow-hidden rounded-xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-5 hover:border-white/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-start mb-4">
                                            <div className={`${stat.color} p-3 rounded-lg shadow-lg`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Patient-only: Health Status & Wellness */}
                    {!isDoctor && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Health Metrics */}
                            <div className="lg:col-span-2">
                                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-10 min-h-80">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-8">
                                            <Heart className="w-6 h-6 text-red-400" />
                                            <h2 className="text-2xl font-bold text-white">Status Kesehatan</h2>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            {healthMetrics.map((metric, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                                                >
                                                    <p className="text-gray-400 text-xs font-semibold uppercase">{metric.name}</p>
                                                    <div className="flex items-baseline gap-2 mt-4 mb-4">
                                                        <p className="text-3xl font-bold text-white">{metric.value}</p>
                                                        <p className="text-xs text-gray-500">{metric.unit}</p>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${metric.status === "normal"
                                                                ? "bg-green-500"
                                                                : metric.status === "warning"
                                                                    ? "bg-yellow-500"
                                                                    : "bg-red-500"
                                                                }`}
                                                            style={{
                                                                width: metric.status === "normal" ? "100%" : metric.status === "warning" ? "75%" : "50%",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Wellness & Cek Kesehatan */}
                            <div className="flex flex-col gap-6">
                                {/* Wellness Score */}
                                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 flex-1">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />

                                    <div className="relative z-10 h-full flex flex-col">
                                        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-3">Wellness Score</p>
                                        <div className="text-4xl font-bold text-white mb-4">{Math.round(animatedWellnessScore)}/100</div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                                            <div
                                                className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all duration-100 ease-out"
                                                style={{ width: `${animatedWellnessScore}%` }}
                                            />
                                        </div>
                                        <p className={`text-xs font-semibold mt-auto ${wellnessScore >= 80 ? "text-green-300" : wellnessScore >= 60 ? "text-yellow-300" : "text-red-300"
                                            }`}>
                                            {wellnessScore >= 80 ? "Sangat Baik!" : wellnessScore >= 60 ? "Baik" : "Perlu Perhatian"}
                                        </p>
                                    </div>
                                </div>

                                {/* Cek Kesehatan Link */}
                                <Link
                                    href="/cek-kesehatan"
                                    className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 hover:border-white/40 hover:shadow-lg transition-all duration-300 block flex-1"
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl" />

                                    <div className="relative z-10 h-full flex flex-col">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Heart className="w-5 h-5 text-red-400" />
                                            <h3 className="font-semibold text-white">Cek Kesehatan</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-5 flex-1">Periksa BMI, tekanan darah, dan data kesehatan Anda</p>

                                        <div className="flex items-center text-red-400 text-sm font-semibold gap-2 group-hover:gap-3 transition-all duration-300 mt-auto">
                                            Mulai Pemeriksaan
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Services Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-2xl font-bold text-white">Layanan Utama</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {services.map((service, idx) => {
                                const Icon = service.icon;
                                return (
                                    <Link
                                        key={idx}
                                        href={service.href}
                                        className="group relative overflow-hidden rounded-xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 hover:border-white/40 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>

                                            <h3 className="font-semibold text-white mb-2">{service.title}</h3>
                                            <p className="text-gray-400 text-sm mb-5">{service.description}</p>

                                            <div className="flex items-center text-blue-400 text-sm font-semibold gap-2 group-hover:gap-3 transition-all duration-300">
                                                Akses Sekarang
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}