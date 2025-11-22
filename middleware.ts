import { NextRequest, NextResponse } from "next/server";

// Routes yang hanya bisa diakses jika sudah login
const protectedRoutes = [
  "/dashboard",
  "/cek-kesehatan",
  "/chat",
  "/profil",
  "/doctor/monitoring",
];

// Routes yang hanya bisa diakses jika belum login
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  // Check if accessing protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if accessing auth routes
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If no token and trying to access protected route, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If token exists and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match protected and auth routes
    "/(dashboard|cek-kesehatan|chat|profil|doctor|auth)/:path*",
  ],
};
