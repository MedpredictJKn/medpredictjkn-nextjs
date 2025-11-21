"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    MessageCircle,
    CheckCircle,
    AlertCircle,
    Send,
    Phone,
    Bell,
    ToggleRight,
    ToggleLeft,
} from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
}

interface NotificationSettings {
    dailyReminders: boolean;
    healthAlerts: boolean;
    appointmentReminders: boolean;
    medicationReminders: boolean;
    weeklyReport: boolean;
}

export default function NotifikasiWAPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [settings, setSettings] = useState<NotificationSettings>({
        dailyReminders: false,
        healthAlerts: true,
        appointmentReminders: true,
        medicationReminders: false,
        weeklyReport: false,
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/auth/login");
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setPhoneNumber(userData.phone || "");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    };

    const handleVerifyPhone = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsVerifying(true);

        if (!phoneNumber.trim()) {
            setError("Nomor telepon tidak boleh kosong");
            setIsVerifying(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/notify-wa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    phoneNumber,
                    action: "verify",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Gagal memverifikasi nomor");
                return;
            }

            setSuccess("Nomor WhatsApp berhasil diverifikasi!");
            setIsVerified(true);

            // Update user in localStorage
            const updatedUser: UserData = { ...user!, phone: phoneNumber };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (err) {
            setError(String(err) || "Terjadi kesalahan");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSettingToggle = (key: keyof NotificationSettings) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSaveSettings = async () => {
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/notify-wa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action: "settings",
                    settings,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Gagal menyimpan pengaturan");
                return;
            }

            setSuccess("Pengaturan notifikasi berhasil disimpan!");
        } catch (err) {
            setError(String(err) || "Terjadi kesalahan");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500"></div>
                    <p className="text-gray-300 font-medium">Memuat pengaturan...</p>
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
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="bg-linear-to-r from-green-500 to-emerald-500 p-2.5 rounded-xl">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Notifikasi WhatsApp</h1>
                                <p className="text-xs text-gray-400">Kelola pengaturan notifikasi kesehatan melalui WhatsApp</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Messages */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/20 border border-red-500/40 backdrop-blur">
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/20 border border-green-500/40 backdrop-blur">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                                <p className="text-green-300 text-sm">{success}</p>
                            </div>
                        )}

                        {/* Verification Section */}
                        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Verifikasi Nomor WhatsApp</h2>
                                        <p className="text-gray-400 text-sm">Masukkan nomor WhatsApp Anda untuk menerima notifikasi</p>
                                    </div>
                                </div>

                                <form onSubmit={handleVerifyPhone} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Nomor WhatsApp (Format: +62xxxxxxxxxx)
                                        </label>
                                        <Input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            placeholder="+62812345678"
                                            disabled={isVerified}
                                            className="h-11 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-green-400 focus:ring-green-400/20 disabled:opacity-50"
                                        />
                                    </div>

                                    {!isVerified ? (
                                        <button
                                            type="submit"
                                            disabled={isVerifying}
                                            className="w-full h-11 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            {isVerifying ? (
                                                <>
                                                    <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                                    Memverifikasi...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Verifikasi Nomor
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/20 border border-green-500/40">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span className="text-green-300 font-medium">Nomor terverifikasi!</span>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        {isVerified && (
                            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                                            <Bell className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Pengaturan Notifikasi</h2>
                                            <p className="text-gray-400 text-sm">Pilih jenis notifikasi yang ingin Anda terima</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {/* Daily Reminders */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                            <div>
                                                <p className="text-white font-medium">Pengingat Harian</p>
                                                <p className="text-gray-400 text-sm">Notifikasi kesehatan setiap hari</p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle("dailyReminders")}
                                                className="transition-all"
                                            >
                                                {settings.dailyReminders ? (
                                                    <ToggleRight className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Health Alerts */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                            <div>
                                                <p className="text-white font-medium">Alert Kesehatan</p>
                                                <p className="text-gray-400 text-sm">Notifikasi untuk kondisi kesehatan kritis</p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle("healthAlerts")}
                                                className="transition-all"
                                            >
                                                {settings.healthAlerts ? (
                                                    <ToggleRight className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Appointment Reminders */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                            <div>
                                                <p className="text-white font-medium">Pengingat Jadwal</p>
                                                <p className="text-gray-400 text-sm">Notifikasi sebelum jadwal kesehatan Anda</p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle("appointmentReminders")}
                                                className="transition-all"
                                            >
                                                {settings.appointmentReminders ? (
                                                    <ToggleRight className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Medication Reminders */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                            <div>
                                                <p className="text-white font-medium">Pengingat Obat</p>
                                                <p className="text-gray-400 text-sm">Notifikasi untuk waktu minum obat</p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle("medicationReminders")}
                                                className="transition-all"
                                            >
                                                {settings.medicationReminders ? (
                                                    <ToggleRight className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Weekly Report */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                            <div>
                                                <p className="text-white font-medium">Laporan Mingguan</p>
                                                <p className="text-gray-400 text-sm">Ringkasan kesehatan setiap minggu</p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle("weeklyReport")}
                                                className="transition-all"
                                            >
                                                {settings.weeklyReport ? (
                                                    <ToggleRight className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveSettings}
                                        className="w-full h-11 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Simpan Pengaturan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Info Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-lg border border-cyan-500/20 p-6">
                            <div className="relative z-10">
                                <p className="text-cyan-300 text-sm">
                                    💡 <span className="font-medium">Info:</span> Notifikasi akan dikirimkan langsung ke WhatsApp Anda. Pastikan nomor WhatsApp Anda aktif dan terdaftar di aplikasi WhatsApp untuk menerima notifikasi dengan baik.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
