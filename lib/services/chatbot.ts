import { prisma } from "@/lib/db";

export async function saveChatHistory(
  userId: string,
  message: string,
  response: string,
  source: "fastapi" | "gemini"
) {
  return prisma.chatHistory.create({
    data: {
      userId,
      message,
      response,
      source,
    },
  });
}

export async function getChatHistory(userId: string, limit: number = 20) {
  return prisma.chatHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Mock function - replace dengan actual FastAPI call
export async function callFastAPIChatbot(message: string): Promise<string> {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const response = await fetch(`${fastApiUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("FastAPI error");
    const data = await response.json();
    return data.response || "Tidak ada respons";
  } catch {
    return "Maaf, chatbot sedang tidak tersedia.";
  }
}

// Call Gemini API using URL from .env
export async function callGeminiChatbot(message: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;

    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    if (!apiUrl) throw new Error("GEMINI_API_URL not configured");

    const urlWithKey = `${apiUrl}?key=${apiKey}`;

    const response = await fetch(urlWithKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Anda adalah asisten kesehatan yang berempati dan membantu. Jawab pertanyaan berikut dengan singkat dan jelas dalam Bahasa Indonesia: ${message}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error("No text content in Gemini response:", data);
      throw new Error("No response text from Gemini");
    }

    return textContent;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
}
