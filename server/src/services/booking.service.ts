import { pool } from "../config/db";
import {
  createBookingTx,
  getSlotBookingCountTx,
  cancelBooking,
  findBookingById,
} from "../db/queries/bookings.queries";
import { findUserById } from "../db/queries/users.queries";
import { sendBookingConfirmation, sendBookingCancellation } from "./email.service";

export async function createBooking(data: {
  userId: string;
  slotId: string;
  serviceId: string;
  notes?: string;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the slot row to prevent race conditions
    const { rows: slotRows } = await client.query(
      "SELECT * FROM slots WHERE id = $1 AND is_blocked = FALSE FOR UPDATE",
      [data.slotId]
    );

    if (slotRows.length === 0) {
      throw Object.assign(new Error("Slot not found or is blocked"), { status: 400 });
    }

    const slot = slotRows[0];
    const bookingCount = await getSlotBookingCountTx(client, data.slotId);

    if (bookingCount >= slot.capacity) {
      throw Object.assign(new Error("Slot is fully booked"), { status: 409 });
    }

    const booking = await createBookingTx(client, {
      user_id: data.userId,
      slot_id: data.slotId,
      service_id: data.serviceId,
      notes: data.notes,
    });

    await client.query("COMMIT");

    // Send confirmation email (non-blocking)
    const [bookingDetails, user] = await Promise.all([
      findBookingById(booking.id),
      findUserById(data.userId),
    ]);

    if (bookingDetails && user) {
      sendBookingConfirmation({
        to: user.email,
        userName: user.name,
        bookingId: booking.id,
        serviceName: bookingDetails.service_name,
        durationMin: bookingDetails.service_duration_min,
        startsAt: new Date(bookingDetails.slot_starts_at),
      }).catch((err) => console.error("Email send failed:", err));
    }

    return booking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function cancelUserBooking(bookingId: string, userId: string) {
  const booking = await cancelBooking(bookingId, userId);
  if (!booking) {
    throw Object.assign(new Error("Booking not found or cannot be cancelled"), { status: 404 });
  }

  // Send cancellation email (non-blocking)
  const [bookingDetails, user] = await Promise.all([
    findBookingById(bookingId),
    findUserById(userId),
  ]);

  if (bookingDetails && user) {
    sendBookingCancellation({
      to: user.email,
      userName: user.name,
      bookingId: bookingId,
      serviceName: bookingDetails.service_name,
      startsAt: new Date(bookingDetails.slot_starts_at),
    }).catch((err) => console.error("Email send failed:", err));
  }

  return booking;
}
