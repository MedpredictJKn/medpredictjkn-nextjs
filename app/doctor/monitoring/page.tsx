"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { AlertCircle, Send, Loader } from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    profilePhoto?: string;
}

interface HealthData {
    id: string;
    height: number;
    weight: number;
    bmi: number;
    status: string;
    bloodPressure: string | null;
    bloodSugar: number | null;
    cholesterol: number | null;
    createdAt: Date;
}

interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    age: number | null;
    gender: string | null;
    latestHealth: HealthData | null;
}

export default function DoctorMonitoringPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [message, setMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [sendViaWA, setSendViaWA] = useState(false);

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
            if (userData.role !== "doctor") {
                router.push("/dashboard");
                return;
            }
            if (isMounted) {
                setUser(userData);
            }
        } catch (err) {
            console.error("Error parsing user data:", err);
            router.push("/auth/login");
            return;
        }

        // Fetch patients data
        const fetchPatients = async () => {
            try {
                const response = await fetch("/api/doctor/patients", {
                    headers: {
                        "Authorization": `Bearer ${storedToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch patients");
                }

                const data = await response.json();
                if (isMounted && data.success) {
                    setPatients(data.data || []);
                }
            } catch (err) {
                console.error("Error fetching patients:", err);
                if (isMounted) {
                    setError("Gagal memuat data pasien");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPatients();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    const handleSendMessage = async () => {
        if (!selectedPatient || !message.trim()) return;

        setSendingMessage(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/doctor/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    patientId: selectedPatient.id,
                    message: message.trim(),
                    sendViaWA: sendViaWA,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();
            if (data.success) {
                setMessage("");
                alert(data.message);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Gagal mengirim pesan");
        } finally {
            setSendingMessage(false);
        }
    };

    const getBMIColor = (status: string) => {
        switch (status) {
            case "underweight":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "normal":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "overweight":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            case "obese":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    const getBMILabel = (status: string) => {
        switch (status) {
            case "underweight":
                return "Kurang Berat";
            case "normal":
                return "Normal";
            case "overweight":
                return "Berat Berlebih";
            case "obese":
                return "Obesitas";
            default:
                return "Tidak Diketahui";
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>

            {/* Sidebar */}
            <Sidebar 
                key={user?.role}
                onLogout={handleLogout} 
                userName={user?.name} 
                userEmail={user?.email} 
                userRole={user?.role} 
            />

            {/* Main Content */}
            <main className="flex-1 ml-64 relative z-10">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
                    <div className="h-[70px] px-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Monitoring Pasien
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Kelola dan pantau kesehatan pasien Anda
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Pasien</p>
                                <p className="text-lg font-bold text-blue-400 mt-0.5">{patients.length}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/20 border border-red-500/40 mb-6 backdrop-blur">
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-6">
                        {/* Patient List */}
                        <div className="col-span-1">
                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-white/10">
                                    <h2 className="text-lg font-bold text-white">Daftar Pasien</h2>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    {loading ? (
                                        <div className="p-6 flex justify-center">
                                            <Loader className="w-6 h-6 animate-spin text-blue-400" />
                                        </div>
                                    ) : patients.length === 0 ? (
                                        <div className="p-6 text-center text-gray-400">
                                            <p>Belum ada pasien</p>
                                        </div>
                                    ) : (
                                        patients.map((patient) => (
                                            <button
                                                key={patient.id}
                                                onClick={() => setSelectedPatient(patient)}
                                                className={`w-full p-3 border-b border-white/10 hover:bg-white/5 transition ${selectedPatient?.id === patient.id ? "bg-white/10" : ""
                                                    }`}
                                            >
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-white">{patient.name}</p>
                                                    <p className="text-xs text-gray-400">{patient.email}</p>
                                                    {patient.latestHealth && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            BMI: {patient.latestHealth.bmi}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Patient Detail & Message */}
                        <div className="col-span-2 space-y-6">
                            {selectedPatient ? (
                                <>
                                    {/* Patient Info & Health Data */}
                                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{selectedPatient.name}</h3>
                                                <p className="text-sm text-gray-400">{selectedPatient.email}</p>
                                                {selectedPatient.phone && (
                                                    <p className="text-sm text-gray-400">{selectedPatient.phone}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                {selectedPatient.gender && (
                                                    <p className="text-sm text-gray-400">
                                                        {selectedPatient.gender === "male" ? "Laki-laki" : "Perempuan"}
                                                    </p>
                                                )}
                                                {selectedPatient.age && (
                                                    <p className="text-sm text-gray-400">{selectedPatient.age} tahun</p>
                                                )}
                                            </div>
                                        </div>

                                        {selectedPatient.latestHealth ? (
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                    <p className="text-xs text-gray-400 mb-2">BMI</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        {selectedPatient.latestHealth.bmi}
                                                    </p>
                                                    <div
                                                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getBMIColor(
                                                            selectedPatient.latestHealth.status
                                                        )}`}
                                                    >
                                                        {getBMILabel(selectedPatient.latestHealth.status)}
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                    <p className="text-xs text-gray-400 mb-2">Tinggi/Berat</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {selectedPatient.latestHealth.height} cm / {selectedPatient.latestHealth.weight} kg
                                                    </p>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                    <p className="text-xs text-gray-400 mb-2">Data Terakhir</p>
                                                    <p className="text-sm font-medium text-white">
                                                        {new Date(selectedPatient.latestHealth.createdAt).toLocaleDateString(
                                                            "id-ID"
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-400">
                                                <p>Pasien belum memiliki data kesehatan</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Send Message */}
                                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Kirim Pesan</h3>
                                        <div className="space-y-4">
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Tulis pesan untuk pasien..."
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/20 transition resize-none"
                                                rows={4}
                                                disabled={sendingMessage}
                                            />
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={sendViaWA}
                                                        onChange={(e) => setSendViaWA(e.target.checked)}
                                                        className="w-4 h-4 bg-white/10 border border-white/20 rounded cursor-pointer"
                                                        disabled={sendingMessage}
                                                    />
                                                    <span className="text-sm text-gray-300">
                                                        Kirim via WhatsApp
                                                    </span>
                                                </label>
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={sendingMessage || !message.trim()}
                                                    className="ml-auto flex items-center gap-2 px-6 py-2 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                                                >
                                                    {sendingMessage ? (
                                                        <>
                                                            <Loader className="w-4 h-4 animate-spin" />
                                                            Mengirim...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4" />
                                                            Kirim
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
                                    <p className="text-gray-400">Pilih pasien dari daftar untuk melihat detail dan mengirim pesan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
