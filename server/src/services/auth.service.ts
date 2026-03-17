import * as crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createUser, findUserByEmail } from "../db/queries/users.queries";
import {
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refresh_tokens.queries";
import { JwtPayload, User } from "../types";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

function parseDuration(dur: string): number {
  // converts "7d" / "15m" to milliseconds
  const unit = dur.slice(-1);
  const value = parseInt(dur.slice(0, -1), 10);
  const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (map[unit] ?? 86_400_000);
}

export async function registerUser(name: string, email: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) throw Object.assign(new Error("Email already in use"), { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser(name, email, passwordHash);
  return issueTokens(user);
}

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

  return issueTokens(user);
}

async function issueTokens(user: User) {
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const rawRefreshToken = signRefreshToken(payload);
  const tokenHash = hashToken(rawRefreshToken);

  const ttlMs = parseDuration(env.REFRESH_TOKEN_EXPIRES_IN);
  const expiresAt = new Date(Date.now() + ttlMs);
  await storeRefreshToken(user.id, tokenHash, expiresAt);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function refreshAccessToken(rawRefreshToken: string) {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(rawRefreshToken, env.REFRESH_TOKEN_SECRET) as JwtPayload;
  } catch {
    throw Object.assign(new Error("Invalid or expired refresh token"), { status: 401 });
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await findRefreshToken(tokenHash);

  if (!stored || stored.revoked || stored.expires_at < new Date()) {
    throw Object.assign(new Error("Refresh token revoked or expired"), { status: 401 });
  }

  const accessToken = signAccessToken(payload);
  return { accessToken };
}

export async function logoutUser(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  await revokeRefreshToken(tokenHash);
}
