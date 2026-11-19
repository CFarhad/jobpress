export const CV_MAX_SIZE = 5 * 1024 * 1024;
export const CV_EXTENSIONS = ["pdf", "doc", "docx"];
export const CV_ACCEPT = ".pdf,.doc,.docx";
export const CV_MIME = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function fileExtension(name) {
  const match = /\.([a-z0-9]+)$/i.exec(name ?? "");
  return match ? match[1].toLowerCase() : "";
}

/** Returns an error message, or "" when the file looks fine. Works in browser and server. */
export function validateCvFile(file) {
  if (!file || typeof file === "string" || !file.size) return "Please upload your CV";
  if (file.size > CV_MAX_SIZE) return "File is larger than 5 MB";
  if (!CV_EXTENSIONS.includes(fileExtension(file.name))) return "Upload a PDF, DOC or DOCX file";
  return "";
}

/** Server-side magic-byte check so a renamed .exe can't pass as a PDF. */
export function matchesSignature(buffer, extension) {
  const starts = (bytes) => bytes.every((byte, i) => buffer[i] === byte);
  if (extension === "pdf") return starts([0x25, 0x50, 0x44, 0x46]);
  if (extension === "doc") return starts([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (extension === "docx") return starts([0x50, 0x4b, 0x03, 0x04]);
  return false;
}