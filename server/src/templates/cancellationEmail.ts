export function cancellationEmailHtml(data: {
  userName: string;
  bookingId: string;
  serviceName: string;
  startsAt: Date;
  clientOrigin: string;
}): string {
  const date = data.startsAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = data.startsAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const ref = data.bookingId.slice(0, 8).toUpperCase();

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Cancelled</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #6b7280; padding: 32px 24px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">Booking Cancelled</h1>
    </div>
    <div style="padding: 32px 24px;">
      <p style="color: #374151; font-size: 16px;">Hi <strong>${data.userName}</strong>,</p>
      <p style="color: #374151; font-size: 16px;">Your booking has been cancelled:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Reference</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: bold;">#${ref}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Service</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px;">${data.serviceName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Date</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Time</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px;">${time}</td>
        </tr>
      </table>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.clientOrigin}" style="background: #2563eb; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: bold;">Book Again</a>
      </div>
    </div>
    <div style="background: #f9fafb; padding: 16px 24px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Appointment Booking System</p>
    </div>
  </div>
</body>
</html>`;
}
