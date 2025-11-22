export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Cookie telah dihapus",
      },
      { status: 200 }
    );

    // Clear HTTP-only cookie
    response.cookies.delete("token");

    return response;
  } catch (error) {
    console.error("Clear cookie error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus cookie",
      },
      { status: 500 }
    );
  }
}
