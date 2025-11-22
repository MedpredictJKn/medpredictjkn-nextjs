"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { AlertCircle, Send, Loader, ArrowLeft, Users } from "lucide-react";

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
    notes: string | null;
    createdAt: Date;
}

interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    age: number | null;
    gender: string | null;
    profilePhoto?: string;
    latestHealth: HealthData | null;
    healthHistory: HealthData[];
}

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error';
}

export default function DoctorMonitoringPage() {
    const router = useRouter();
    const [_user, setUser] = useState<User | null>(() => {
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
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [message, setMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

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
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();
            if (data.success) {
                setMessage("");
                const toastId = Date.now().toString();
                setToasts(prev => [...prev, { id: toastId, message: data.message, type: 'success' }]);
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toastId));
                }, 3000);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            const toastId = Date.now().toString();
            setToasts(prev => [...prev, { id: toastId, message: "Gagal mengirim pesan", type: 'error' }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 3000);
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
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
            <style>{`
                .patient-list-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .patient-list-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .patient-list-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(148, 163, 184, 0.4);
                    border-radius: 3px;
                }
                .patient-list-scroll::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(148, 163, 184, 0.6);
                }
            `}</style>

            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-float-1"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-float-2"></div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="h-[70px] px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-linear-to-r from-green-500 to-cyan-500 p-2 rounded-lg">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                                Monitoring Pasien
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">Pantau kesehatan pasien Anda</p>
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-8 relative z-10 overflow-hidden">
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/20 border border-red-500/40 mb-6 backdrop-blur">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-6 h-full">
                    {/* Patient List */}
                    <div className="col-span-1 overflow-hidden">
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
                            <div className="sticky top-0 z-20 p-4 border-b border-white/10 bg-white/5 backdrop-blur-lg shrink-0">
                                <h2 className="text-lg font-bold text-white">Daftar Pasien</h2>
                            </div>
                            <div
                                className="patient-list-scroll flex-1 overflow-y-auto min-h-0"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'rgba(148, 163, 184, 0.4) transparent'
                                }}
                            >
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
                                            className={`w-full p-4 border-b border-white/10 hover:bg-white/5 transition ${selectedPatient?.id === patient.id ? "bg-white/10" : ""
                                                }`}
                                        >
                                            <div className="text-left flex items-center gap-3">
                                                <ProfileAvatar
                                                    src={patient.profilePhoto}
                                                    alt={patient.name}
                                                    name={patient.name}
                                                    size="sm"
                                                    className="shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{patient.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{patient.email}</p>
                                                    {patient.latestHealth && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            BMI: {patient.latestHealth.bmi}
                                                        </p>
                                                    )}
                                                </div>
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
                                        <div className="flex items-center gap-4 flex-1">
                                            <ProfileAvatar
                                                src={selectedPatient.profilePhoto}
                                                alt={selectedPatient.name}
                                                name={selectedPatient.name}
                                                size="md"
                                            />
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{selectedPatient.name}</h3>
                                                <p className="text-sm text-gray-400">{selectedPatient.email}</p>
                                                {selectedPatient.phone && (
                                                    <p className="text-sm text-gray-400">{selectedPatient.phone}</p>
                                                )}
                                            </div>
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
                                        <div className="space-y-6">
                                            {/* BMI Summary Cards */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                    <p className="text-xs text-gray-400 mb-2">BMI</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        {selectedPatient.latestHealth.bmi.toFixed(1)}
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

                                            {/* Vital Signs */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-white">Tanda Vital</h4>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {/* Blood Pressure */}
                                                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                        <p className="text-xs text-gray-400 mb-2">Tekanan Darah</p>
                                                        <p className="text-lg font-bold text-white">
                                                            {selectedPatient.latestHealth.bloodPressure || "—"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">Format: Sistole/Diastole</p>
                                                        {selectedPatient.latestHealth.bloodPressure && (
                                                            <p className="text-xs text-gray-500 mt-2">Ideal: &lt;120/80 mmHg</p>
                                                        )}
                                                    </div>

                                                    {/* Blood Sugar */}
                                                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                        <p className="text-xs text-gray-400 mb-2">Gula Darah</p>
                                                        <p className="text-lg font-bold text-white">
                                                            {selectedPatient.latestHealth.bloodSugar ? `${selectedPatient.latestHealth.bloodSugar} mg/dL` : "—"}
                                                        </p>
                                                        {selectedPatient.latestHealth.bloodSugar && (
                                                            <div className="text-xs text-gray-500 mt-2">
                                                                <p>Puasa: 70-100 mg/dL</p>
                                                                {selectedPatient.latestHealth.bloodSugar > 100 && (
                                                                    <p className="text-yellow-400 mt-1">⚠️ Tinggi</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Cholesterol */}
                                                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                        <p className="text-xs text-gray-400 mb-2">Kolesterol</p>
                                                        <p className="text-lg font-bold text-white">
                                                            {selectedPatient.latestHealth.cholesterol ? `${selectedPatient.latestHealth.cholesterol} mg/dL` : "—"}
                                                        </p>
                                                        {selectedPatient.latestHealth.cholesterol && (
                                                            <div className="text-xs text-gray-500 mt-2">
                                                                <p>Target: &lt;200 mg/dL</p>
                                                                {selectedPatient.latestHealth.cholesterol >= 200 && (
                                                                    <p className="text-red-400 mt-1">⚠️ Tinggi</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {selectedPatient.latestHealth.notes && (
                                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                    <p className="text-xs text-gray-400 mb-2">Catatan & Keterangan</p>
                                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedPatient.latestHealth.notes}</p>
                                                </div>
                                            )}

                                            {/* Health History */}
                                            {selectedPatient.healthHistory && selectedPatient.healthHistory.length > 1 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-bold text-white">Riwayat Kesehatan</h4>
                                                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                                                        {selectedPatient.healthHistory.map((health) => (
                                                            <div key={health.id} className="bg-white/5 rounded-lg p-3 border border-white/10 text-sm">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="text-gray-300 font-medium">BMI: {health.bmi.toFixed(1)} • {getBMILabel(health.status)}</p>
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            {health.height}cm • {health.weight}kg
                                                                            {health.bloodPressure && ` • TD: ${health.bloodPressure}`}
                                                                            {health.bloodSugar && ` • Gula: ${health.bloodSugar}`}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500">
                                                                        {new Date(health.createdAt).toLocaleDateString("id-ID")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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
                                            <p className="text-xs text-gray-400">Pesan akan otomatis dikirim ke WhatsApp pasien</p>
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
        </div>
    );
}
