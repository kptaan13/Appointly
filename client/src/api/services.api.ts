import { supabase } from "../lib/supabase";
import type { Service } from "../types";

export async function apiGetServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data as Service[];
}

export async function apiGetService(id: string): Promise<Service> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Service;
}

export async function apiCreateService(service: {
  name: string;
  description?: string;
  duration_min: number;
  price: number;
}): Promise<Service> {
  const { data, error } = await supabase
    .from("services")
    .insert(service)
    .select()
    .single();
  if (error) throw error;
  return data as Service;
}

export async function apiUpdateService(id: string, updates: Partial<Service>): Promise<Service> {
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Service;
}
