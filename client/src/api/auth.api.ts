import { supabase } from "../lib/supabase";

export async function apiRegister(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: "user" } },
  });
  if (error) throw error;
  return data;
}

export async function apiLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function apiLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function apiGetSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
