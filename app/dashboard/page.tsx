"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import {
    Activity,
    MessageCircle,
    TrendingUp,
    AlertCircle,
    Heart,
    Zap,
    Users,
    ArrowRight,
    CheckCircle,
    Calendar,
    Stethoscope,
} from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
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
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/auth/login");
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="text-gray-600 font-medium">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    const healthMetrics: HealthMetric[] = [
        { name: "Tekanan Darah", value: "120/80", unit: "mmHg", status: "normal" },
        { name: "BMI", value: "22.5", unit: "kg/m²", status: "normal" },
        { name: "Detak Jantung", value: "72", unit: "bpm", status: "normal" },
        { name: "Kolesterol", value: "180", unit: "mg/dL", status: "warning" },
    ];

    const quickStats = [
        {
            label: "Total Pemeriksaan",
            value: "5",
            icon: Activity,
            color: "bg-blue-500",
            lightColor: "bg-blue-100",
            textColor: "text-blue-600",
        },
        {
            label: "Chat AI",
            value: "12",
            icon: MessageCircle,
            color: "bg-purple-500",
            lightColor: "bg-purple-100",
            textColor: "text-purple-600",
        },
        {
            label: "Alert Aktif",
            value: "2",
            icon: AlertCircle,
            color: "bg-orange-500",
            lightColor: "bg-orange-100",
            textColor: "text-orange-600",
        },
        {
            label: "Notifikasi",
            value: "8",
            icon: TrendingUp,
            color: "bg-green-500",
            lightColor: "bg-green-100",
            textColor: "text-green-600",
        },
    ];

    const services = [
        {
            title: "Cek Kesehatan",
            description: "Periksa BMI, tekanan darah, dan data kesehatan Anda",
            icon: Heart,
            color: "from-red-500 to-pink-500",
            bgLight: "bg-red-50",
            href: "/cek-kesehatan",
            accent: "text-red-600",
        },
        {
            title: "Chat dengan AI",
            description: "Tanyakan pertanyaan kesehatan kepada AI kami",
            icon: MessageCircle,
            color: "from-purple-500 to-pink-500",
            bgLight: "bg-purple-50",
            href: "/chat",
            accent: "text-purple-600",
        },
        {
            title: "Profil Saya",
            description: "Kelola data pribadi dan riwayat kesehatan",
            icon: Users,
            color: "from-blue-500 to-indigo-500",
            bgLight: "bg-blue-50",
            href: "/profil",
            accent: "text-blue-600",
        },
    ];

    const recentActivity = [
        {
            title: "Pemeriksaan Kesehatan",
            time: "2 hari lalu",
            status: "Selesai",
            icon: CheckCircle,
        },
        {
            title: "Chat dengan AI",
            time: "1 minggu lalu",
            status: "Aktif",
            icon: MessageCircle,
        },
        {
            title: "Update Profil",
            time: "2 minggu lalu",
            status: "Selesai",
            icon: CheckCircle,
        },
        {
            title: "Konsultasi Online",
            time: "3 minggu lalu",
            status: "Selesai",
            icon: Stethoscope,
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex">
            {/* Sidebar */}
            <Sidebar onLogout={handleLogout} userName={user?.name} userEmail={user?.email} />

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Top Bar - Navbar */}
                <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/10 border-b border-white/10">
                    <div className="px-8 py-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-sm text-gray-400 mt-2">
                                Selamat datang kembali, <span className="text-white font-semibold">{user?.name}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Status</p>
                                <p className="text-lg font-semibold text-green-400">Online</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 space-y-8">
                    {/* Quick Stats Grid - 4 Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {quickStats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
                                >
                                    {/* Animated background */}
                                    <div className="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`${stat.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="text-xs font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/40">
                                                Aktif
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-4xl font-bold text-white mt-2 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                                            {stat.value}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Health Metrics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Health Status Card */}
                        <div className="lg:col-span-2">
                            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                                <Heart className="w-7 h-7 text-red-500" />
                                                Status Kesehatan
                                            </h2>
                                            <p className="text-gray-400 text-sm mt-2">Data kesehatan Anda hari ini</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {healthMetrics.map((metric, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10"
                                            >
                                                <p className="text-gray-400 text-sm">{metric.name}</p>
                                                <div className="flex items-baseline gap-2 mt-3">
                                                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                                                    <p className="text-xs text-gray-500">{metric.unit}</p>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${metric.status === "normal"
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Sidebar */}
                        <div className="space-y-6">
                            {/* Next Appointment */}
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Calendar className="w-5 h-5 text-purple-400" />
                                        <h3 className="font-semibold text-white">Jadwal</h3>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4">Tidak ada jadwal di minggu ini</p>
                                    <button className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-medium py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
                                        Buat Jadwal
                                    </button>
                                </div>
                            </div>

                            {/* Wellness Score */}
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />

                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm mb-2">Wellness Score</p>
                                    <div className="text-4xl font-bold text-white mb-3">78/100</div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                                        <div className="w-3/4 h-full bg-linear-to-r from-green-500 to-emerald-500" />
                                    </div>
                                    <p className="text-xs text-gray-400">Sangat Baik!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            Layanan Utama
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {services.map((service, idx) => {
                                const Icon = service.icon;
                                return (
                                    <Link
                                        key={idx}
                                        href={service.href}
                                        className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 hover:border-white/40 transition-all duration-300 hover:shadow-2xl"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-300" />

                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>

                                            <h3 className="font-semibold text-white text-lg mb-2">{service.title}</h3>
                                            <p className="text-gray-400 text-sm mb-6">{service.description}</p>

                                            <div className="flex items-center text-blue-400 text-sm font-medium gap-2 group-hover:gap-3 transition-all duration-300">
                                                Akses Sekarang
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-cyan-400" />
                            Aktivitas Terbaru
                        </h2>

                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                            <div className="space-y-3">
                                {recentActivity.map((activity, idx) => {
                                    const ActivityIcon = activity.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500/50 to-purple-500/50 flex items-center justify-center shrink-0">
                                                    <ActivityIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">{activity.title}</p>
                                                    <p className="text-gray-500 text-xs">{activity.time}</p>
                                                </div>
                                            </div>
                                            <span
                                                className={`text-xs font-bold px-3 py-1.5 rounded-full border ${activity.status === "Selesai"
                                                        ? "bg-green-500/20 text-green-300 border-green-500/40"
                                                        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                                    }`}
                                            >
                                                {activity.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
