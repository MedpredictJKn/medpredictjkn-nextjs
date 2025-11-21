"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AlertCircle, Send, MessageCircle, User, Bot, ArrowLeft, Loader } from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
}

interface Message {
    type: "user" | "bot";
    text: string;
    timestamp: Date;
}

export default function ChatPage() {
    const router = useRouter();
    const [_user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [_token, setToken] = useState("");

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (!storedToken) {
            router.push("/auth/login");
            return;
        }

        setToken(storedToken);

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } catch {
                setUser(null);
            }
        }
    }, [router]);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Token tidak ditemukan, silahkan login ulang");
            router.push("/auth/login");
            return;
        }

        const messageText = inputValue;

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

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="h-[70px] px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-linear-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Chat dengan AI
                                </h1>
                                <p className="text-xs text-gray-400 mt-0.5">Tanyakan pertanyaan kesehatan Anda</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col p-8 relative z-10">
                {/* Empty State */}
                {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center mb-8">
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-linear-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-2xl border border-purple-500/20 backdrop-blur">
                                    <MessageCircle className="w-12 h-12 text-purple-400" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Mulai Percakapan
                                </h2>
                                <p className="text-gray-400 max-w-md">
                                    Tanyakan apa pun tentang kesehatan Anda. AI kami siap membantu menjawab pertanyaan dengan informasi yang akurat.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all cursor-pointer">
                                    Obat-obatan
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all cursor-pointer">
                                    Gaya Hidup
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all cursor-pointer">
                                    Nutrisi
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all cursor-pointer">
                                    Kesehatan Mental
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                    <div className="flex-1 space-y-4 mb-8 overflow-y-auto pr-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex gap-3 max-w-2xl ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold ${message.type === "user"
                                        ? "bg-linear-to-br from-blue-600 to-cyan-600"
                                        : "bg-linear-to-br from-purple-600 to-pink-600"
                                        }`}>
                                        {message.type === "user" ? (
                                            <User className="w-4 h-4" />
                                        ) : (
                                            <Bot className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div>
                                        <div className={`rounded-2xl p-4 backdrop-blur-lg border ${message.type === "user"
                                            ? "bg-linear-to-br from-blue-600 to-cyan-600 text-white border-blue-500/20"
                                            : "bg-white/10 text-white border-white/20"
                                            }`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.text}
                                            </p>
                                            <p className={`text-xs mt-2 ${message.type === "user" ? "text-blue-100" : "text-gray-400"}`}>
                                                {message.timestamp.toLocaleTimeString("id-ID", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-linear-to-br from-purple-600 to-pink-600 text-white">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-lg">
                                        <div className="flex items-center gap-2">
                                            <Loader className="w-4 h-4 animate-spin text-purple-400" />
                                            <span className="text-sm text-gray-300">AI sedang berpikir...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/20 border border-red-500/40 mb-6 backdrop-blur">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="flex gap-3 sticky bottom-0 bg-linear-to-t from-slate-800 via-slate-800 to-transparent pt-4">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ketik pesan Anda..."
                        disabled={isLoading}
                        className="h-11 flex-1 bg-white/10 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="h-11 px-6 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>

                {/* Footer Info */}
                <div className="text-center text-sm text-gray-500 mt-4">
                    <p>Informasi dari AI mungkin tidak 100% akurat. Konsultasikan dengan dokter untuk diagnosis medis.</p>
                </div>
            </div>
        </div>
    );
}
