import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JwtPayload } from "@/types";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

/**
 * Retry async function with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param isRetryable - Function to determine if error is retryable
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  isRetryable?: (error: unknown) => boolean
): Promise<T> {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;

      // Check if we should retry
      const shouldRetry =
        (isRetryable?.(error)) ?? 
        (String(error).includes("connection") ||
        String(error).includes("P2024") ||
        String(error).includes("timeout"));

      if (!shouldRetry || retries > maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = Math.pow(2, retries) * 1000;
      console.warn(`[retryWithBackoff] Retry ${retries}/${maxRetries} after ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error("Unexpected state in retryWithBackoff");
}

/**
 * Parse markdown bold syntax (**text**) from a string
 * Returns array of strings and bold markers for React rendering
 */
export function parseMarkdownBold(text: string): (string | { type: 'bold'; content: string })[] {
  const parts: (string | { type: 'bold'; content: string })[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add bold text
    parts.push({ type: 'bold', content: match[1] });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 0 ? [text] : parts;
}
