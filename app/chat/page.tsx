"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
    type: "user" | "bot";
    text: string;
    timestamp: Date;
}

export default function ChatPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/auth/login");
            return;
        }
        setIsCheckingAuth(false);
    }, [router]);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        // Ambil token langsung dari localStorage saat submit
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Token tidak ditemukan, silahkan login ulang");
            router.push("/auth/login");
            return;
        }

        // Store the message text before clearing inputValue
        const messageText = inputValue;

        // Add user message
        const userMessage: Message = {
            type: "user",
            text: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: messageText,
                    source: "gemini",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Gagal mengirim pesan");
                return;
            }

            // Add bot message
            const botMessage: Message = {
                type: "bot",
                text: data.data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            setError(String(err) || "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Memuat...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 h-screen flex flex-col">
                {/* Header */}
                <div className="mb-4">
                    <Link href="/dashboard" className="text-blue-600 hover:underline mb-4">
                        ← Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Chat dengan AI</h1>
                    <p className="text-gray-600">Tanyakan pertanyaan kesehatan Anda</p>
                </div>

                {/* Chat Box */}
                <div className="flex-1 bg-white rounded-lg shadow-md p-6 mb-4 overflow-y-auto flex flex-col">
                    {messages.length === 0 && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-5xl mb-4">💬</div>
                                <p className="text-gray-500 text-lg">
                                    Mulai percakapan dengan mengetik pertanyaan kesehatan Anda
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                                        }`}
                                >
                                    <p className="wrap-break-word">{message.text}</p>
                                    <p
                                        className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"
                                            }`}
                                    >
                                        {message.timestamp.toLocaleTimeString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
                            {error}
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ketik pesan Anda..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
                    >
                        {isLoading ? "..." : "Kirim"}
                    </button>
                </form>

                {/* Info */}
                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>💡 Chatbot menggunakan AI untuk menjawab pertanyaan kesehatan Anda</p>
                </div>
            </div>
        </div>
    );
}