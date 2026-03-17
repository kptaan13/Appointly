import { PoolClient } from "pg";
import { pool } from "../../config/db";
import { Booking } from "../../types";

export interface BookingWithDetails extends Booking {
  service_name: string;
  service_duration_min: number;
  slot_starts_at: Date;
  slot_ends_at: Date;
  user_name?: string;
  user_email?: string;
}

export async function createBookingTx(
  client: PoolClient,
  data: {
    user_id: string;
    slot_id: string;
    service_id: string;
    notes?: string;
  }
): Promise<Booking> {
  const { rows } = await client.query<Booking>(
    `INSERT INTO bookings (user_id, slot_id, service_id, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.user_id, data.slot_id, data.service_id, data.notes ?? null]
  );
  return rows[0];
}

export async function getSlotBookingCountTx(
  client: PoolClient,
  slotId: string
): Promise<number> {
  const { rows } = await client.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM bookings
     WHERE slot_id = $1 AND status = 'confirmed'`,
    [slotId]
  );
  return parseInt(rows[0].count, 10);
}

export async function findBookingById(id: string): Promise<BookingWithDetails | null> {
  const { rows } = await pool.query<BookingWithDetails>(
    `SELECT b.*,
            s.name AS service_name,
            s.duration_min AS service_duration_min,
            sl.starts_at AS slot_starts_at,
            sl.ends_at AS slot_ends_at
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN slots sl ON sl.id = b.slot_id
     WHERE b.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listUserBookings(userId: string): Promise<BookingWithDetails[]> {
  const { rows } = await pool.query<BookingWithDetails>(
    `SELECT b.*,
            s.name AS service_name,
            s.duration_min AS service_duration_min,
            sl.starts_at AS slot_starts_at,
            sl.ends_at AS slot_ends_at
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN slots sl ON sl.id = b.slot_id
     WHERE b.user_id = $1
     ORDER BY sl.starts_at DESC`,
    [userId]
  );
  return rows;
}

export async function cancelBooking(id: string, userId: string): Promise<Booking | null> {
  const { rows } = await pool.query<Booking>(
    `UPDATE bookings
     SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'confirmed'
     RETURNING *`,
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function listAllBookings(filters: {
  status?: string;
  date?: string;
}): Promise<BookingWithDetails[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.status) {
    conditions.push(`b.status = $${idx++}`);
    values.push(filters.status);
  }
  if (filters.date) {
    conditions.push(`sl.starts_at::date = $${idx++}::date`);
    values.push(filters.date);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query<BookingWithDetails>(
    `SELECT b.*,
            s.name AS service_name,
            s.duration_min AS service_duration_min,
            sl.starts_at AS slot_starts_at,
            sl.ends_at AS slot_ends_at,
            u.name AS user_name,
            u.email AS user_email
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN slots sl ON sl.id = b.slot_id
     JOIN users u ON u.id = b.user_id
     ${where}
     ORDER BY sl.starts_at DESC`,
    values
  );
  return rows;
}

export async function updateBookingStatus(
  id: string,
  status: "confirmed" | "cancelled" | "completed"
): Promise<Booking | null> {
  const { rows } = await pool.query<Booking>(
    "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [status, id]
  );
  return rows[0] ?? null;
}
