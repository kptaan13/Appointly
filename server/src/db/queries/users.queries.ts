import { pool } from "../../config/db";
import { User } from "../../types";

export async function createUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<User> {
  const { rows } = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, email, passwordHash]
  );
  return rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return rows[0] ?? null;
}

export async function listUsers(): Promise<Omit<User, "password_hash">[]> {
  const { rows } = await pool.query<Omit<User, "password_hash">>(
    "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC"
  );
  return rows;
}
