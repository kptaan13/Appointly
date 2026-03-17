import { pool } from "../../config/db";
import { Service } from "../../types";

export async function listServices(): Promise<Service[]> {
  const { rows } = await pool.query<Service>(
    "SELECT * FROM services WHERE is_active = TRUE ORDER BY name"
  );
  return rows;
}

export async function findServiceById(id: string): Promise<Service | null> {
  const { rows } = await pool.query<Service>(
    "SELECT * FROM services WHERE id = $1",
    [id]
  );
  return rows[0] ?? null;
}

export async function createService(data: {
  name: string;
  description?: string;
  duration_min: number;
  price: number;
}): Promise<Service> {
  const { rows } = await pool.query<Service>(
    `INSERT INTO services (name, description, duration_min, price)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.description ?? null, data.duration_min, data.price]
  );
  return rows[0];
}

export async function updateService(
  id: string,
  data: Partial<{ name: string; description: string; duration_min: number; price: number; is_active: boolean }>
): Promise<Service | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.duration_min !== undefined) { fields.push(`duration_min = $${idx++}`); values.push(data.duration_min); }
  if (data.price !== undefined) { fields.push(`price = $${idx++}`); values.push(data.price); }
  if (data.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(data.is_active); }

  if (fields.length === 0) return findServiceById(id);

  values.push(id);
  const { rows } = await pool.query<Service>(
    `UPDATE services SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

export async function softDeleteService(id: string): Promise<void> {
  await pool.query("UPDATE services SET is_active = FALSE WHERE id = $1", [id]);
}
