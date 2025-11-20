export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function validateRegister(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: RegisterPayload;
} {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null) {
    return { valid: false, errors: ["Data harus berupa object"] };
  }

  const obj = data as Record<string, unknown>;

  // Validate name
  if (!obj.name || typeof obj.name !== "string" || obj.name.trim().length < 2) {
    errors.push("Nama minimal 2 karakter");
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!obj.email || typeof obj.email !== "string" || !emailRegex.test(obj.email)) {
    errors.push("Email tidak valid");
  }

  // Validate password
  if (!obj.password || typeof obj.password !== "string" || obj.password.length < 6) {
    errors.push("Password minimal 6 karakter");
  }

  // Validate phone (optional)
  if (obj.phone && typeof obj.phone !== "string") {
    errors.push("Nomor telepon harus berupa string");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      name: (obj.name as string).trim(),
      email: (obj.email as string).trim().toLowerCase(),
      password: obj.password as string,
      phone: obj.phone ? (obj.phone as string).trim() : undefined,
    },
  };
}

export function validateLogin(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: LoginPayload;
} {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null) {
    return { valid: false, errors: ["Data harus berupa object"] };
  }

  const obj = data as Record<string, unknown>;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!obj.email || typeof obj.email !== "string" || !emailRegex.test(obj.email)) {
    errors.push("Email tidak valid");
  }

  // Validate password
  if (!obj.password || typeof obj.password !== "string" || obj.password.length < 6) {
    errors.push("Password minimal 6 karakter");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      email: (obj.email as string).trim().toLowerCase(),
      password: obj.password as string,
    },
  };
}
