import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const CV_DIR = path.join(process.cwd(), "storage", "cvs");

export const CV_MIME = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Detect the real file type from its first bytes (never trust the filename or MIME header)
export function detectCvExtension(buffer) {
  if (buffer.length < 8) return null;

  if (buffer.subarray(0, 5).toString("latin1") === "%PDF-") return ".pdf";

  const ole = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (buffer.subarray(0, 8).equals(ole)) return ".doc";

  if (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return ".docx";
  }

  return null;
}

export function safeOriginalName(name = "cv") {
  return name.replace(/[^\w.\- ()]/g, "_").slice(0, 120) || "cv";
}

export async function saveCv(buffer, ext) {
  await fs.mkdir(CV_DIR, { recursive: true });
  const storedName = `${randomUUID()}${ext}`;
  await fs.writeFile(path.join(CV_DIR, storedName), buffer, { flag: "wx" });
  return storedName;
}

// path.basename blocks "../" path traversal
export function resolveCvPath(storedName) {
  return path.join(CV_DIR, path.basename(storedName));
}

export async function deleteCv(storedName) {
  try {
    await fs.unlink(resolveCvPath(storedName));
  } catch {
    // already gone
  }
}