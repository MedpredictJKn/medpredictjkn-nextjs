import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/utils";
import { saveChatHistory, callGeminiChatbot, callFastAPIChatbot } from "@/lib/services/chatbot";
import { ChatPayload, ApiResponse } from "@/types";

// Pindahkan ke sini, setelah import
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatResponse {
  id: string;
  message: string;
  response: string;
  source: string;
  createdAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header (case-insensitive)
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: ChatPayload = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { success: false, message: "Pesan tidak boleh kosong" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Determine source (default to Gemini)
    const source = body.source || "gemini";

    let response = "";
    if (source === "fastapi") {
      response = await callFastAPIChatbot(body.message);
    } else {
      response = await callGeminiChatbot(body.message);
    }

    // Validate user exists before saving
    const { prisma } = await import("@/lib/db");
    const userExists = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan. Silakan login kembali.",
        },
        { status: 404 }
      );
    }

    // Save to database
    const chatData = await saveChatHistory(
      decoded.userId,
      body.message,
      response,
      source as "fastapi" | "gemini",
      body.sessionId
    ) as ChatResponse | null;

    if (!chatData) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal menyimpan chat history",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pesan berhasil diproses",
        data: {
          id: chatData.id,
          message: chatData.message,
          response: chatData.response,
          source: chatData.source,
          createdAt: chatData.createdAt,
        },
      } as ApiResponse<ChatResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Chatbot error:", error);
    
    const errorString = String(error);
    
    // Handle foreign key constraint error (user not found in database)
    if (errorString.includes("P2003") || errorString.includes("Foreign key constraint")) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak valid. Silakan login kembali.",
          error: "Foreign key constraint",
        } as ApiResponse<null>,
        { status: 401 }
      );
    }
    
    // Handle connection pool exhaustion
    if (errorString.includes("P2024") || errorString.includes("connection pool")) {
      return NextResponse.json(
        {
          success: false,
          message: "Server sedang busy. Silakan coba lagi dalam beberapa saat.",
          error: "Connection pool exhausted",
        } as ApiResponse<null>,
        { status: 503 }
      );
    }
    
    // Handle connection reset
    if (errorString.includes("ConnectionReset") || errorString.includes("connection")) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection error. Please try again.",
          error: "Connection issue",
        } as ApiResponse<null>,
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses pesan",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Import the getChatHistory function
    const { getChatHistory } = await import("@/lib/services/chatbot");
    const chatHistory = await getChatHistory(decoded.userId, 50);

    return NextResponse.json(
      {
        success: true,
        message: "Riwayat chat diambil",
        data: chatHistory as ChatResponse[],
      } as ApiResponse<ChatResponse[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Get chatId from query params if provided, otherwise delete all
    const url = new URL(request.url);
    const chatId = url.searchParams.get("id");

    const { prisma } = await import("@/lib/db");

    if (chatId) {
      // Delete specific chat
      await prisma.chatHistory.delete({
        where: { id: chatId },
      });
    } else {
      // Delete all chats for user
      await prisma.chatHistory.deleteMany({
        where: { userId: decoded.userId },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: chatId ? "Chat dihapus" : "Semua chat dihapus",
        data: null,
      } as ApiResponse<null>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus chat",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}