import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site";

let transporter;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

export async function sendApplicationConfirmation({ to, name, jobTitle }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[email] SMTP not configured, skipped confirmation to ${to}`);
    return;
  }

  const firstName = name.trim().split(/\s+/)[0];

  await mailer.sendMail({
    from:
      process.env.EMAIL_FROM ||
      `${siteConfig.name} Careers <no-reply@example.com>`,
    to,
    subject: `We received your application for ${jobTitle}`,
    text: `Hi ${firstName},\n\nThank you for applying for "${jobTitle}" at ${siteConfig.name}. Our hiring team will review your application and contact you if your profile matches.\n\nBest regards,\n${siteConfig.name} Talent Team`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;line-height:1.6;color:#161d1b">
        <h2 style="color:#00665e">Application received</h2>
        <p>Hi ${escapeHtml(firstName)},</p>
        <p>Thank you for applying for <strong>${escapeHtml(jobTitle)}</strong> at ${escapeHtml(siteConfig.name)}.
        Our hiring team will review your application and contact you if your profile matches.</p>
        <p>Best regards,<br/>${escapeHtml(siteConfig.name)} Talent Team</p>
      </div>`,
  });
}