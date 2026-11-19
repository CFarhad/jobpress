import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
  remember: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => v === true || v === "true"),
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z
  .object({
    token: z.string().min(32).max(128),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password").max(72),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: emailSchema,
  role: z.enum(["ADMIN", "HR"]),
  password: passwordSchema,
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Name is too short").max(80),
  role: z.enum(["ADMIN", "HR"]),
  isActive: z.boolean(),
});

export const setPasswordSchema = z.object({
  id: z.string().min(1),
  password: passwordSchema,
});