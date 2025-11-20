import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/utils";
import { saveChatHistory, callGeminiChatbot, callFastAPIChatbot } from "@/lib/services/chatbot";
import { ChatPayload, ApiResponse } from "@/types";

// Pindahkan ke sini, setelah import
export const runtime = "nodejs";

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
    
    if (!decoded) {
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

    // Save to database
    const chatData = await saveChatHistory(
      decoded.userId,
      body.message,
      response,
      source as "fastapi" | "gemini"
    );

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

    // This is a placeholder - implement getChatHistory in chatbot service
    return NextResponse.json(
      {
        success: true,
        message: "Riwayat chat diambil",
        data: [] as ChatResponse[],
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