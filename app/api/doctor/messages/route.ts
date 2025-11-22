import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/utils";
import { ApiResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SendMessagePayload {
  patientId: string;
  message: string;
  sendViaWA: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Verify token
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

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

    // Check if user is doctor
    const doctor = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, name: true },
    });

    if (!doctor || doctor.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Anda bukan dokter" } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const body: SendMessagePayload = await request.json();

    if (!body.patientId || !body.message) {
      return NextResponse.json(
        { success: false, message: "ID pasien dan pesan harus diisi" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: { id: body.patientId, role: "patient" },
      select: { phone: true, name: true, email: true },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Pasien tidak ditemukan" } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Save message to database
    const doctorMessage = await prisma.doctorMessage.create({
      data: {
        doctorId: decoded.userId,
        patientId: body.patientId,
        message: body.message,
        sentViaWA: false, // Will be set to true after sending
      },
    });

    // Send via WhatsApp automatically if patient has phone
    if (patient.phone) {
      try {
        const waResponse = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notify-wa`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: patient.phone,
              body: `[Pesan dari ${doctor.name}]\n\n${body.message}`,
            }),
          }
        );

        if (waResponse.ok) {
          // Update message as sent via WA
          await prisma.doctorMessage.update({
            where: { id: doctorMessage.id },
            data: { sentViaWA: true, sentAt: new Date() },
          });

          return NextResponse.json(
            {
              success: true,
              message: "Pesan berhasil dikirim ke WhatsApp pasien",
              data: doctorMessage,
            } as ApiResponse<typeof doctorMessage>,
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            {
              success: true,
              message: "Pesan tersimpan tapi gagal dikirim ke WhatsApp",
              data: doctorMessage,
            } as ApiResponse<typeof doctorMessage>,
            { status: 200 }
          );
        }
      } catch (waError) {
        console.error("WhatsApp send error:", waError);
        return NextResponse.json(
          {
            success: true,
            message: "Pesan tersimpan tapi gagal dikirim ke WhatsApp",
            data: doctorMessage,
          } as ApiResponse<typeof doctorMessage>,
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pesan berhasil disimpan",
        data: doctorMessage,
      } as ApiResponse<typeof doctorMessage>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengirim pesan",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// GET messages for a specific patient (for doctor to see history)
export async function GET(request: NextRequest) {
  try {
    // Verify token
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

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

    // Check if user is doctor
    const doctor = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!doctor || doctor.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Anda bukan dokter" } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Get patientId from query params
    const patientId = request.nextUrl.searchParams.get("patientId");
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: "Patient ID diperlukan" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get messages
    const messages = await prisma.doctorMessage.findMany({
      where: {
        doctorId: decoded.userId,
        patientId: patientId,
      },
      select: {
        id: true,
        message: true,
        sentViaWA: true,
        sentAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pesan berhasil diambil",
        data: messages,
      } as ApiResponse<typeof messages>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil pesan",
        error: String(error),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
