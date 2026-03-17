import nodemailer from "nodemailer";
import { env } from "./env";

async function createTransport() {
  if (env.NODE_ENV === "development" && !env.SMTP_HOST) {
    // Use Ethereal for development (auto-created test account)
    const testAccount = await nodemailer.createTestAccount();
    console.log("Ethereal email preview URL will be logged per email sent.");
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export const transporter = createTransport();
