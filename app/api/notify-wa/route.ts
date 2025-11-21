/**
 * POST /api/notify-wa
 * Endpoint untuk mengirim notifikasi WhatsApp menggunakan WhAPI.cloud
 */

import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/services/wa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WhatsAppPayload {
  to: string;
  body: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WhatsAppPayload;

    // Validate input
    if (!body.to || !body.body) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, body" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^62\d{9,12}$/;
    if (!phoneRegex.test(body.to)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Use 62xxxxxxxxxx" },
        { status: 400 }
      );
    }

    // Send WhatsApp message
    const result = await sendWhatsAppNotification({
      phoneNumber: body.to,
      message: body.body,
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "Pesan berhasil dikirim",
          data: { messageId: result.messageId },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send message",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[WhatsApp API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notify-wa
 * Endpoint untuk test/verify API status
 */
export async function GET() {
  try {
    const apiUrl = process.env.WHAT_API_URL;
    const apiToken = process.env.WHAT_API_TOKEN;

    if (!apiUrl || !apiToken) {
      return NextResponse.json(
        {
          status: "error",
          message: "WhatsApp API credentials not configured",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "WhatsApp API is configured and ready",
        api_url: apiUrl,
        api_token_configured: !!apiToken,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
