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

    // Validate phone number format - should start with 62 and have 9-13 digits after it
    const phoneRegex = /^62\d{9,13}$/;
    let phoneNumber = body.to.toString().trim();
    
    console.log(`[WhatsApp API] Received phone: ${phoneNumber}`);
    
    // Remove common prefixes/symbols
    phoneNumber = phoneNumber.replace(/^\+/, ""); // Remove leading +
    phoneNumber = phoneNumber.replace(/^0/, ""); // Remove leading 0
    phoneNumber = phoneNumber.replace(/[^\d]/g, ""); // Remove all non-digits
    
    // Ensure it starts with 62 (Indonesia country code)
    if (!phoneNumber.startsWith("62")) {
      phoneNumber = "62" + phoneNumber;
    }
    
    console.log(`[WhatsApp API] Normalized phone: ${phoneNumber}, matches regex: ${phoneRegex.test(phoneNumber)}`);
    
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: `Invalid phone number format. Use 62xxxxxxxxxx (got: ${phoneNumber}, length after 62: ${phoneNumber.length - 2})` },
        { status: 400 }
      );
    }

    // Send WhatsApp message
    const result = await sendWhatsAppNotification({
      phoneNumber: phoneNumber,
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
