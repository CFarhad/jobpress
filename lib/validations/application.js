import { z } from "zod";

export const CV_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
export const CV_EXTENSIONS = [".pdf", ".doc", ".docx"];
export const CV_ACCEPT = ".pdf,.doc,.docx";

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Only http(s) links, so "javascript:" URLs can never be stored and later clicked by HR
const optionalUrl = z
  .string()
  .trim()
  .max(300, "Link is too long")
  .refine(
    (v) => v === "" || isHttpUrl(v),
    "Enter a full link starting with http:// or https://"
  );

export const applicationFieldsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(254),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{7,20}$/, "Enter a valid phone number"),
  country: z.string().trim().min(2, "Enter your country").max(80),
  city: z.string().trim().min(2, "Enter your city").max(80),
  coverLetter: z
    .string()
    .trim()
    .max(5000, "Cover letter must be under 5,000 characters"),
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  consent: z
    .boolean()
    .refine((v) => v === true, "You must accept the privacy policy to apply"),
});

export function getExt(name = "") {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

// Works for browser File objects and server File objects
export function validateCvMeta(file) {
  if (!file || typeof file === "string" || !file.size) {
    return "Please upload your CV";
  }
  if (file.size > CV_MAX_SIZE) return "File is too large. Maximum size is 5 MB";
  if (!CV_EXTENSIONS.includes(getExt(file.name))) {
    return "Only PDF, DOC, or DOCX files are accepted";
  }
  return null;
}

// Reads the text fields from FormData (same function on client and server)
export function readApplicationFields(formData) {
  const text = (key) => String(formData.get(key) ?? "");
  return {
    fullName: text("fullName"),
    email: text("email"),
    phone: text("phone"),
    country: text("country"),
    city: text("city"),
    coverLetter: text("coverLetter"),
    linkedinUrl: text("linkedinUrl"),
    portfolioUrl: text("portfolioUrl"),
    consent: ["on", "true"].includes(text("consent")),
  };
}

export function fieldErrorsFrom(error) {
  const errors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}