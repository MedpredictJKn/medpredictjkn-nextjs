"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { AlertCircle, Send, MessageCircle, User, Bot, ArrowLeft, Loader, Menu, X, Clock, Plus } from "lucide-react";

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

interface ChatHistoryItem {
    id: string;
    message: string;
    response: string;
    source: string;
    createdAt: string;
    sessionId?: string;
}

interface ChatSession {
    sessionId: string;
    firstMessage: string;
    createdAt: string;
    messageCount: number;
    chats: ChatHistoryItem[];
}

const parseMarkdownBold = (text: string) => {
    const parts: (string | React.ReactNode)[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;

    text.replace(regex, (match, group, offset) => {
        if (offset > lastIndex) {
            parts.push(text.slice(lastIndex, offset));
        }
        parts.push(<strong key={offset}>{group}</strong>);
        lastIndex = offset + match.length;
        return match;
    });

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
};

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(() => {
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("token") || "";
        }
        return "";
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string>("");

    // Ref untuk auto-scroll ke pesan terbaru
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (!storedToken) {
            router.push("/auth/login");
            return;
        }

        setToken(storedToken);
        // Initialize new session
        setCurrentSessionId(`session-${Date.now()}`);

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } catch {
                setUser(null);
            }
        }

        // Load chat history
        loadChatHistory(storedToken);

        // Listen for localStorage changes to sync profile photo updates
        const handleStorageChange = () => {
            const updatedUser = localStorage.getItem("user");
            if (updatedUser) {
                try {
                    setUser(JSON.parse(updatedUser));
                } catch {
                    setUser(null);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [router]);

    // Effect untuk load chat dari URL parameter
    useEffect(() => {
        if (chatSessions.length > 0) {
            const sessionId = searchParams.get("id");
            if (sessionId) {
                const session = chatSessions.find(s => s.sessionId === sessionId);
                if (session) {
                    // Load all chats from session
                    const messages: Message[] = [];
                    // Reverse array agar urutan dari lama ke terbaru
                    const sortedChats = [...session.chats].reverse();
                    sortedChats.forEach((chat) => {
                        messages.push({
                            type: "user",
                            text: chat.message,
                            timestamp: new Date(chat.createdAt),
                        });
                        messages.push({
                            type: "bot",
                            text: chat.response,
                            timestamp: new Date(chat.createdAt),
                        });
                    });
                    setMessages(messages);
                    setSelectedChatId(session.sessionId);
                }
            }
        }
    }, [chatSessions, searchParams]);

    const loadChatHistory = async (authToken: string) => {
        try {
            setIsLoadingHistory(true);
            const response = await fetch("/api/chatbot", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && Array.isArray(data.data)) {
                    // Kelompokkan chat berdasarkan sessionId
                    const sessions = new Map<string, ChatSession>();

                    data.data.forEach((chat: ChatHistoryItem) => {
                        const sessionId = chat.sessionId || "default-session";

                        if (!sessions.has(sessionId)) {
                            sessions.set(sessionId, {
                                sessionId,
                                firstMessage: chat.message.substring(0, 40),
                                createdAt: chat.createdAt,
                                messageCount: 0,
                                chats: [],
                            });
                        }

                        const session = sessions.get(sessionId)!;
                        session.messageCount += 1;
                        session.chats.push(chat);
                    });

                    // Urutkan berdasarkan tanggal terbaru ke lama untuk sidebar
                    const sortedSessions = Array.from(sessions.values()).sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );

                    setChatSessions(sortedSessions);
                }
            }
        } catch (err) {
            console.error("Error loading chat history:", err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const loadSessionChats = (session: ChatSession) => {
        // Load all chats from session
        const messages: Message[] = [];
        // Reverse array agar urutan dari lama ke terbaru
        const sortedChats = [...session.chats].reverse();
        sortedChats.forEach((chat) => {
            messages.push({
                type: "user",
                text: chat.message,
                timestamp: new Date(chat.createdAt),
            });
            messages.push({
                type: "bot",
                text: chat.response,
                timestamp: new Date(chat.createdAt),
            });
        });
        setMessages(messages);
        setSelectedChatId(session.sessionId);
        // Update URL dengan sessionId
        router.push(`/chat?id=${encodeURIComponent(session.sessionId)}`);
    };

    const startNewChat = () => {
        setMessages([]);
        setSelectedChatId(null);
        // Create new session ID
        setCurrentSessionId(`session-${Date.now()}`);
        setSidebarOpen(false);
        // Clear URL
        router.push("/chat");
    };

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        const currentToken = token || localStorage.getItem("token");

        if (!currentToken) {
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
                    "Authorization": `Bearer ${currentToken}`,
                },
                body: JSON.stringify({
                    message: messageText,
                    source: "gemini",
                    sessionId: currentSessionId,
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

            // Refresh chat history
            loadChatHistory(currentToken);
            setSelectedChatId(null);
        } catch (err) {
            setError(String(err) || "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-float-1"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-float-2"></div>

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed left-0 top-0 h-full w-64 bg-slate-950/95 backdrop-blur border-r border-white/10 z-50 transition-transform duration-300 flex flex-col scrollbar-hide`}>
                <div className="sticky top-0 h-[70px] px-4 border-b border-white/10 bg-slate-950/95 backdrop-blur flex flex-col">
                    <div className="flex items-center justify-between flex-1">
                        <h2 className="text-lg font-bold text-white">Chat History</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="px-4 py-3 border-b border-white/10">
                    <button
                        onClick={startNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Percakapan Baru
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                    {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader className="w-5 h-5 animate-spin text-purple-400" />
                        </div>
                    ) : chatSessions.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Belum ada riwayat chat</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {chatSessions.map((session) => (
                                <button
                                    key={session.sessionId}
                                    onClick={() => loadSessionChats(session)}
                                    className={`w-full text-left p-3 rounded-lg transition-all ${selectedChatId === session.sessionId
                                        ? "bg-purple-600/30 border border-purple-500/50 text-white"
                                        : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                                        }`}
                                >
                                    <p className="text-sm font-medium truncate">{session.firstMessage}...</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-gray-500">
                                            {new Date(session.createdAt).toLocaleDateString("id-ID", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">
                                            {session.messageCount} pesan
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
                    <div className="h-[70px] px-8 flex items-center justify-between">
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col p-8 relative z-10 overflow-hidden">
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
                                    {["Obat-obatan", "Gaya Hidup", "Nutrisi", "Kesehatan Mental"].map((topic) => (
                                        <button
                                            key={topic}
                                            onClick={() => setInputValue(`Tolong jelaskan tentang ${topic}`)}
                                            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.length > 0 && (
                        <div className="flex-1 flex flex-col mb-8 overflow-y-auto pr-4">
                            <div className="space-y-4 flex flex-col">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                                        style={message.type === "bot" ? { maxWidth: "1135px" } : {}}
                                    >
                                        <div className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                                            {message.type === "user" ? (
                                                <ProfileAvatar
                                                    src={user?.profilePhoto}
                                                    alt={user?.name || "User"}
                                                    name={user?.name || "U"}
                                                    size="sm"
                                                    className="shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-linear-to-br from-purple-600 to-pink-600 text-white">
                                                    <Bot className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div>
                                                <div className={`rounded-2xl p-4 backdrop-blur-lg border ${message.type === "user"
                                                    ? "bg-linear-to-br from-blue-600 to-cyan-600 text-white border-blue-500/20"
                                                    : "bg-white/10 text-white border-white/20"
                                                    }`}>
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                        {parseMarkdownBold(message.text)}
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
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/20 border border-red-500/40 mb-6 backdrop-blur">
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="flex gap-3 sticky bottom-0 bg-linear-to-t from-slate-800 via-slate-800 to-transparent pt-4 max-w-3xl w-full mx-auto">
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
        </div>
    );
}