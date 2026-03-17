import { pool } from "../../config/db";
import { Slot } from "../../types";

export interface SlotWithBookingCount extends Slot {
  booking_count: number;
}

export async function getAvailableSlots(
  serviceId: string,
  date: string // YYYY-MM-DD
): Promise<SlotWithBookingCount[]> {
  const { rows } = await pool.query<SlotWithBookingCount>(
    `SELECT s.*,
            COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS booking_count
     FROM slots s
     LEFT JOIN bookings b ON b.slot_id = s.id
     WHERE s.service_id = $1
       AND s.starts_at::date = $2::date
       AND s.is_blocked = FALSE
     GROUP BY s.id
     HAVING COUNT(b.id) FILTER (WHERE b.status = 'confirmed') < s.capacity
     ORDER BY s.starts_at`,
    [serviceId, date]
  );
  return rows;
}

export async function findSlotById(id: string): Promise<Slot | null> {
  const { rows } = await pool.query<Slot>("SELECT * FROM slots WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function createSlot(data: {
  service_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  created_by: string;
}): Promise<Slot> {
  const { rows } = await pool.query<Slot>(
    `INSERT INTO slots (service_id, starts_at, ends_at, capacity, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.service_id, data.starts_at, data.ends_at, data.capacity, data.created_by]
  );
  return rows[0];
}

export async function toggleSlotBlock(
  id: string,
  blocked: boolean
): Promise<Slot | null> {
  const { rows } = await pool.query<Slot>(
    "UPDATE slots SET is_blocked = $1 WHERE id = $2 RETURNING *",
    [blocked, id]
  );
  return rows[0] ?? null;
}

export async function deleteSlot(id: string): Promise<void> {
  await pool.query("DELETE FROM slots WHERE id = $1", [id]);
}

export async function listSlotsByService(serviceId: string): Promise<SlotWithBookingCount[]> {
  const { rows } = await pool.query<SlotWithBookingCount>(
    `SELECT s.*,
            COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS booking_count
     FROM slots s
     LEFT JOIN bookings b ON b.slot_id = s.id
     WHERE s.service_id = $1
     GROUP BY s.id
     ORDER BY s.starts_at`,
    [serviceId]
  );
  return rows;
}
