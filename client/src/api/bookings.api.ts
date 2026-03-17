import { supabase } from "../lib/supabase";
import type { Booking } from "../types";

const BOOKING_SELECT = `
  *,
  services!inner(name, duration_min),
  slots!inner(starts_at, ends_at)
`;

function mapBooking(raw: Record<string, unknown>): Booking {
  const services = raw.services as { name: string; duration_min: number };
  const slots = raw.slots as { starts_at: string; ends_at: string };
  return {
    ...(raw as unknown as Booking),
    service_name: services.name,
    service_duration_min: services.duration_min,
    slot_starts_at: slots.starts_at,
    slot_ends_at: slots.ends_at,
  };
}

// Uses RPC to prevent double-booking via DB transaction
export async function apiCreateBooking(
  slotId: string,
  serviceId: string,
  notes?: string
): Promise<Booking> {
  const { data, error } = await supabase.rpc("create_booking", {
    p_slot_id: slotId,
    p_service_id: serviceId,
    p_notes: notes ?? null,
  });
  if (error) throw error;
  return data as Booking;
}

export async function apiGetMyBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(mapBooking);
}

export async function apiGetBooking(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapBooking(data as Record<string, unknown>);
}

export async function apiCancelBooking(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "confirmed")
    .select(BOOKING_SELECT)
    .single();
  if (error) throw error;
  return mapBooking(data as Record<string, unknown>);
}

// Admin — uses RPC so it can read auth.users for email/name
export async function apiGetAllBookings(params?: {
  status?: string;
  date?: string;
}): Promise<Booking[]> {
  const { data, error } = await supabase.rpc("get_all_bookings", {
    p_status: params?.status ?? null,
    p_date:   params?.date   ?? null,
  });
  if (error) throw error;
  // RPC already returns flat columns — no nested join mapping needed
  return (data as Booking[]);
}

export async function apiUpdateBookingStatus(
  id: string,
  status: "confirmed" | "cancelled" | "completed"
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(BOOKING_SELECT)
    .single();
  if (error) throw error;
  return mapBooking(data as Record<string, unknown>);
}
