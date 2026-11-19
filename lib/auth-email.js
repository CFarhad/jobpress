import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site";

let transporter;

function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function sendPasswordResetEmail({ to, name, url }) {
  const transport = getTransport();
  if (!transport) {
    console.log(`\n[password reset] SMTP not configured. Reset link for ${to}:\n${url}\n`);
    return;
  }

  await transport.sendMail({
    from: process.env.EMAIL_FROM || `${siteConfig.name} <no-reply@localhost>`,
    to,
    subject: `Reset your ${siteConfig.name} password`,
    text: `Hi ${name},\n\nUse this link to set a new password (valid for 1 hour):\n${url}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>Hi ${escapeHtml(name)},</p>
<p>Use the button below to set a new password. The link is valid for 1 hour.</p>
<p><a href="${url}" style="background:#00665e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Reset password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}