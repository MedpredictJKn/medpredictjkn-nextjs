"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [token, setToken] = useState("");
    const [result, setResult] = useState<HealthResponse | null>(null);

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
        if (!storedToken) {
            router.push("/auth/login");
            return;
        }
        setToken(storedToken);
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

            // Reset form
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "normal":
                return "text-green-600";
            case "underweight":
                return "text-blue-600";
            case "overweight":
                return "text-yellow-600";
            case "obese":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "normal":
                return "Berat badan normal";
            case "underweight":
                return "Berat badan kurang";
            case "overweight":
                return "Berat badan berlebih";
            case "obese":
                return "Obesitas";
            default:
                return "Status tidak diketahui";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="text-blue-600 hover:underline mb-4">
                        ← Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Cek Kesehatan</h1>
                    <p className="text-gray-600">Masukkan data kesehatan Anda untuk perhitungan BMI</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Height */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tinggi Badan (cm) *
                            </label>
                            <input
                                type="number"
                                name="height"
                                value={formData.height || ""}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="170"
                            />
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Berat Badan (kg) *
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight || ""}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="65"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Blood Pressure */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tekanan Darah (misal: 120/80)
                            </label>
                            <input
                                type="text"
                                name="bloodPressure"
                                value={formData.bloodPressure || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="120/80"
                            />
                        </div>

                        {/* Blood Sugar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gula Darah (mg/dL)
                            </label>
                            <input
                                type="number"
                                name="bloodSugar"
                                value={formData.bloodSugar || ""}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="100"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kolesterol (mg/dL)
                        </label>
                        <input
                            type="number"
                            name="cholesterol"
                            value={formData.cholesterol || ""}
                            onChange={handleChange}
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="200"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catatan
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes || ""}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Catatan tambahan tentang kesehatan Anda"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !token}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                        {!token ? "Memuat..." : isLoading ? "Memproses..." : "Hitung BMI & Simpan"}
                    </button>
                </form>

                {/* Result */}
                {result && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hasil Kesehatan Anda</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Tinggi Badan</p>
                                <p className="text-2xl font-bold text-gray-800">{result.height} cm</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Berat Badan</p>
                                <p className="text-2xl font-bold text-gray-800">{result.weight} kg</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">BMI Anda</p>
                                <p className="text-2xl font-bold text-blue-600">{result.bmi}</p>
                            </div>
                        </div>

                        <div className={`text-center p-4 rounded-lg bg-blue-50`}>
                            <p className="text-gray-600 mb-2">Status Kesehatan</p>
                            <p className={`text-3xl font-bold ${getStatusColor(result.status)}`}>
                                {getStatusText(result.status)}
                            </p>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                            <p className="font-semibold mb-2">💡 Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>BMI kurang dari 18.5: Berat badan kurang</li>
                                <li>BMI 18.5 - 24.9: Berat badan normal</li>
                                <li>BMI 25 - 29.9: Berat badan berlebih</li>
                                <li>BMI 30 keatas: Obesitas</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
