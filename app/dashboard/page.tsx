"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
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
            setUser(JSON.parse(storedUser));
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
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Memuat...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-gray-600">Halo, {user?.name}! 👋</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        Keluar
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Health Check Card */}
                    <Link href="/cek-kesehatan">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                            <div className="text-3xl mb-2">📊</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Cek Kesehatan
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Periksa BMI dan data kesehatan Anda
                            </p>
                        </div>
                    </Link>

                    {/* Chat Card */}
                    <Link href="/chat">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                            <div className="text-3xl mb-2">💬</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Chat dengan AI
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Tanyakan hal tentang kesehatan
                            </p>
                        </div>
                    </Link>

                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-3xl mb-2">👤</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Profil</h2>
                        <div className="text-gray-600 text-sm">
                            <p>Email: {user?.email}</p>
                            {user?.phone && <p>Telp: {user.phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Informasi Akun
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-500 text-sm">Nama</p>
                            <p className="text-lg font-semibold text-gray-800">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Email</p>
                            <p className="text-lg font-semibold text-gray-800 truncate">
                                {user?.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Status</p>
                            <p className="text-lg font-semibold text-green-600">Aktif</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Member Sejak</p>
                            <p className="text-lg font-semibold text-gray-800">Hari Ini</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
