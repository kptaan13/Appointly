import { pool } from "../../config/db";
import { RefreshToken } from "../../types";

export async function storeRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

export async function findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
  const { rows } = await pool.query<RefreshToken>(
    "SELECT * FROM refresh_tokens WHERE token_hash = $1",
    [tokenHash]
  );
  return rows[0] ?? null;
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await pool.query(
    "UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1",
    [tokenHash]
  );
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await pool.query(
    "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1",
    [userId]
  );
}
