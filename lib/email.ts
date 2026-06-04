import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
};

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("[Email] SMTP not configured. Would send to:", to, "Subject:", subject);
    return false;
  }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM ?? "noreply@xmusic.com", to, subject, html });
    return true;
  } catch (err: any) {
    console.error("[Email] Send error:", err?.message);
    return false;
  }
}

export async function sendSecurityAlert(subject: string, body: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  await sendEmail(adminEmail, `[X Music Security] ${subject}`, `<div style="font-family:sans-serif;padding:20px;"><h2 style="color:#A38F6B;">Security Alert</h2>${body}</div>`);
}
