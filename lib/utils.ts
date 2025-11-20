import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JwtPayload } from "@/types";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function generateToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("❌ JWT_SECRET not configured in .env");
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("❌ JWT_SECRET not configured in .env.local");
      return null;
    }

    const decoded = jwt.verify(token, secret) as {
      userId: string;
      email: string;
      iat: number;
      exp: number;
    };

    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.error(
      "❌ Token verification failed:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

export function calculateBMI(height: number, weight: number): number {
  // height in cm, weight in kg
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

export function getBMIStatus(bmi: number): string {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;

  // Handle "Bearer <token>" format
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7); // Remove "Bearer " prefix
  }

  return null;
}
