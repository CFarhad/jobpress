import { z } from "zod";

const money = z.number().int("Whole numbers only").min(0).max(10_000_000).nullable();

export const isEmptyHtml = (html) => !html || html.replace(/<[^>]*>/g, "").trim() === "";

export const jobSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(3, "Title is too short").max(120),
    departmentId: z.string().min(1, "Select a department"),
    summary: z.string().trim().min(10, "Write at least 10 characters").max(300, "Max 300 characters"),
    location: z.string().trim().min(2, "Enter a location").max(120),
    type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
    workplace: z.enum(["ONSITE", "HYBRID", "REMOTE"]),
    experience: z.enum(["ENTRY", "MID", "SENIOR", "LEAD"]),
    salaryMin: money,
    salaryMax: money,
    salaryCurrency: z.string().trim().toUpperCase().length(3, "Use a 3-letter code"),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
      .nullable(),
    featured: z.boolean(),
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
    description: z
      .string()
      .max(50000)
      .refine((v) => !isEmptyHtml(v), "Description is required"),
    responsibilities: z.string().max(50000),
    requirements: z.string().max(50000),
    benefits: z.string().max(50000),
    formId: z.string().max(40).nullable(),
  })
  .refine((v) => v.salaryMin === null || v.salaryMax === null || v.salaryMax >= v.salaryMin, {
    message: "Max must be greater than min",
    path: ["salaryMax"],
  });