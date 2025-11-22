import { NextRequest, NextResponse } from "next/server";

// Routes yang hanya bisa diakses jika sudah login
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Simple JWT verification using Web Crypto API (Edge Runtime compatible)
async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("❌ JWT_SECRET not configured in middleware");
      return null;
    }

    // Split JWT into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("❌ Invalid JWT format");
      return null;
    }

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;

    // Decode payload
    const payloadJson = JSON.parse(
      Buffer.from(payloadEncoded, "base64").toString("utf-8")
    );

    // Check expiration
    if (payloadJson.exp && payloadJson.exp * 1000 < Date.now()) {
      console.error("❌ Token has expired");
      return null;
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerEncoded}.${payloadEncoded}`);
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = Buffer.from(signatureEncoded, "base64url");
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      data
    );

    if (!isValid) {
      console.error("❌ Invalid token signature");
      return null;
    }

    return { userId: payloadJson.userId, email: payloadJson.email };
  } catch (error) {
    console.error(
      "❌ Token verification failed in middleware:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

export async function middleware(request: NextRequest) {
  // Allow all requests to continue
  // Protected routes will be handled by client-side checks in page components
  // Auth route redirects will be handled on the client side
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match only page routes, exclude api, static files, and images
    "/((?!_next/static|_next/image|favicon.ico|api|public).*)",
  ],
};
