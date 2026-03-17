import nodemailer from "nodemailer";
import { transporter } from "../config/mailer";
import { env } from "../config/env";
import { confirmationEmailHtml } from "../templates/confirmationEmail";
import { cancellationEmailHtml } from "../templates/cancellationEmail";

export async function sendBookingConfirmation(data: {
  to: string;
  userName: string;
  bookingId: string;
  serviceName: string;
  durationMin: number;
  startsAt: Date;
}) {
  const transport = await transporter;
  const info = await transport.sendMail({
    from: env.SMTP_FROM,
    to: data.to,
    subject: `Your booking is confirmed — ${data.serviceName}`,
    html: confirmationEmailHtml({
      userName: data.userName,
      bookingId: data.bookingId,
      serviceName: data.serviceName,
      durationMin: data.durationMin,
      startsAt: data.startsAt,
      clientOrigin: env.CLIENT_ORIGIN,
    }),
  });

  if (env.NODE_ENV === "development") {
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  }
}

export async function sendBookingCancellation(data: {
  to: string;
  userName: string;
  bookingId: string;
  serviceName: string;
  startsAt: Date;
}) {
  const transport = await transporter;
  const info = await transport.sendMail({
    from: env.SMTP_FROM,
    to: data.to,
    subject: `Booking cancelled — ${data.serviceName}`,
    html: cancellationEmailHtml({
      userName: data.userName,
      bookingId: data.bookingId,
      serviceName: data.serviceName,
      startsAt: data.startsAt,
      clientOrigin: env.CLIENT_ORIGIN,
    }),
  });

  if (env.NODE_ENV === "development") {
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  }
}
