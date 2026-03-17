export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_min: number;
  price: string;
  is_active: boolean;
  created_at: string;
}

export interface Slot {
  id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  is_blocked: boolean;
  booking_count?: number;
}

export interface Booking {
  id: string;
  user_id: string;
  slot_id: string;
  service_id: string;
  status: "confirmed" | "cancelled" | "completed";
  notes: string | null;
  service_name: string;
  service_duration_min: number;
  slot_starts_at: string;
  slot_ends_at: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
