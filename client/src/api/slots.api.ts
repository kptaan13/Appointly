import { supabase } from "../lib/supabase";
import type { Slot } from "../types";

export async function apiGetSlots(serviceId: string, date: string): Promise<Slot[]> {
  // Get slots for a service on a given date that are not blocked
  // and have available capacity (booking_count < capacity)
  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from("slots")
    .select(`
      *,
      bookings!left(id, status)
    `)
    .eq("service_id", serviceId)
    .eq("is_blocked", false)
    .gte("starts_at", startOfDay)
    .lte("starts_at", endOfDay)
    .order("starts_at");

  if (error) throw error;

  // Filter slots where confirmed booking count < capacity
  return (data as (Slot & { bookings: { id: string; status: string }[] })[])
    .map((slot) => ({
      ...slot,
      booking_count: slot.bookings.filter((b) => b.status === "confirmed").length,
    }))
    .filter((slot) => slot.booking_count < slot.capacity) as Slot[];
}

export async function apiGetAdminSlots(serviceId: string): Promise<Slot[]> {
  const { data, error } = await supabase
    .from("slots")
    .select(`*, bookings!left(id, status)`)
    .eq("service_id", serviceId)
    .order("starts_at");
  if (error) throw error;
  return data as Slot[];
}

export async function apiCreateSlot(slot: {
  service_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
}): Promise<Slot> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("slots")
    .insert({ ...slot, created_by: user!.id })
    .select()
    .single();
  if (error) throw error;
  return data as Slot;
}

export async function apiToggleSlotBlock(id: string, blocked: boolean): Promise<Slot> {
  const { data, error } = await supabase
    .from("slots")
    .update({ is_blocked: blocked })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Slot;
}

export async function apiDeleteSlot(id: string): Promise<void> {
  const { error } = await supabase.from("slots").delete().eq("id", id);
  if (error) throw error;
}
