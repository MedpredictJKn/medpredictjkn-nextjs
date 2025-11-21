"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { Camera, ArrowLeft, User, Mail, Phone } from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
}

export default function ProfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [photoPreview, setPhotoPreview] = useState<string>("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/auth/login");
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            if (userData.profilePhoto) {
                setPhotoPreview(userData.profilePhoto);
            }
        } finally {
            setIsLoading(false);
        }
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
            };
            reader.readAsDataURL(file);
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
                    <p className="text-gray-300 font-medium">Memuat profil...</p>
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
                        <div>
                            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Profil Saya
                            </h1>
                            <p className="text-sm text-gray-400 mt-2">Kelola informasi pribadi dan profil Anda</p>
                        </div>
                    </div>
                </header>

                {/* Profile Content */}
                <div className="p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Profile Header Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-8">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                    {/* Photo Section */}
                                    <div className="relative">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt={user?.name}
                                                className="w-32 h-32 rounded-2xl object-cover border-2 border-blue-400/50 shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center border-2 border-blue-400/50 shadow-lg">
                                                <User className="w-16 h-16 text-white" />
                                            </div>
                                        )}
                                        <label className="absolute bottom-0 right-0 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white p-3 rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-cyan-500/50">
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
                                        <p className="text-cyan-400 font-semibold mb-6">Pengguna Aktif</p>

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
                                    <p className="text-xs text-gray-400 mt-2">Anggota MedPredict</p>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <p className="text-gray-400 text-sm mb-3">Menu Cepat</p>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                                    >
                                        Keluar Akun
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Health Data */}
                            <Link
                                href="/cek-kesehatan"
                                className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-6 hover:border-white/40 transition-all duration-300"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:opacity-75 transition-opacity" />
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
