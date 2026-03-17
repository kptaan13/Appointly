export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "user" | "admin";
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_min: number;
  price: string; // pg returns NUMERIC as string
  is_active: boolean;
  created_at: Date;
}

export interface Slot {
  id: string;
  service_id: string;
  starts_at: Date;
  ends_at: Date;
  capacity: number;
  is_blocked: boolean;
  created_by: string;
  created_at: Date;
}

export interface Booking {
  id: string;
  user_id: string;
  slot_id: string;
  service_id: string;
  status: "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
}

// Augment Express Request with user payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}
