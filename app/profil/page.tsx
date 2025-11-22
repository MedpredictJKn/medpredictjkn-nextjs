"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Camera, Mail, Phone } from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    profilePhoto?: string;
}

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error';
}

export default function ProfilPage() {
    const router = useRouter();

    // Initialize user from localStorage immediately to prevent flickering
    const [user, setUser] = useState<UserData | null>(() => {
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
    const [photoPreview, setPhotoPreview] = useState<string>("");
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        let isMounted = true;
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/auth/login");
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            if (isMounted) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(userData);
                if (userData.profilePhoto) {
                    setPhotoPreview(userData.profilePhoto);
                }
            }
        } catch (err) {
            console.error("Error parsing user data:", err);
        }

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setPhotoPreview(result);
                const updatedUser: UserData = { ...user, profilePhoto: result };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);

                // Show success toast
                const toastId = Date.now().toString();
                setToasts(prev => [...prev, { id: toastId, message: "Foto profil berhasil diperbarui!", type: 'success' }]);
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toastId));
                }, 3000);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

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
                {/* Header */}
                <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
                    <div className="h-[70px] px-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Profil Saya
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Kelola informasi pribadi dan profil Anda
                            </p>
                        </div>
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

                {/* Profile Content */}
                <div className="p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Profile Header Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                    {/* Photo Section */}
                                    <div className="relative">
                                        <ProfileAvatar
                                            src={photoPreview}
                                            alt={user?.name || "Profile"}
                                            name={user?.name || "U"}
                                            size="lg"
                                            className="border-2 border-blue-400/50 shadow-lg"
                                        />
                                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl cursor-pointer transition-all shadow-lg">
                                            <Camera className="w-5 h-5" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 text-center md:text-left">
                                        <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
                                        <p className="text-cyan-400 font-semibold mb-6">
                                            {user?.role === "doctor" ? "Dokter" : "Pasien"}
                                        </p>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-400">Email</p>
                                                    <p className="text-white font-medium break-all">{user?.email}</p>
                                                </div>
                                            </div>

                                            {user?.phone && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                        <Phone className="w-5 h-5 text-green-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-400">Nomor Telepon</p>
                                                        <p className="text-white font-medium">{user.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Status Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Status */}
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm mb-3">Status Akun</p>
                                    <p className="text-2xl font-bold text-green-400 mb-2">Aktif</p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs text-green-300 font-medium">Terverifikasi</span>
                                    </div>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm mb-3">Bergabung</p>
                                    <p className="text-xl font-bold text-white">{new Date().getFullYear()}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {user?.role === "doctor" ? "Dokter MedpredictJKn" : "Pasien MedpredictJKn"}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
                                <div className="relative z-10 space-y-3">
                                    <p className="text-gray-400 text-sm mb-4">Menu Cepat</p>
                                    {user?.role === "doctor" ? (
                                        <>
                                            <Link
                                                href="/doctor/monitoring"
                                                className="block text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                            >
                                                Monitoring Pasien
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                                            >
                                                Keluar Akun
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/cek-kesehatan"
                                                className="block text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                            >
                                                Cek Kesehatan
                                            </Link>
                                            <Link
                                                href="/chat"
                                                className="block text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                            >
                                                Chat AI
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                                            >
                                                Keluar Akun
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Cards - Only for Patients */}
                        {user?.role !== "doctor" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Health Data */}
                                <Link
                                    href="/cek-kesehatan"
                                    className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 hover:border-white/40 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-semibold text-white mb-2">Data Kesehatan</h3>
                                        <p className="text-gray-400 text-sm mb-4">Lihat dan kelola data kesehatan Anda</p>
                                        <span className="text-cyan-400 text-sm font-medium flex items-center gap-1">
                                            Buka →
                                        </span>
                                    </div>
                                </Link>

                                {/* Settings */}
                                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-semibold text-white mb-2">Pengaturan Privasi</h3>
                                        <p className="text-gray-400 text-sm mb-4">Kelola preferensi dan privasi akun Anda</p>
                                        <span className="text-gray-500 text-sm font-medium">Segera hadir</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Photo Upload Hint */}
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-blue-500/20 p-6">
                            <div className="relative z-10">
                                <p className="text-blue-300 text-sm">
                                    💡 <span className="font-medium">Tips:</span> Klik ikon kamera di atas foto profil Anda untuk mengubah atau menambahkan foto baru. Foto akan disimpan secara otomatis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
