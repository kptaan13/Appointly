import { RequestHandler } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../services/auth.service";
import { findUserById } from "../db/queries/users.queries";
import { env } from "../config/env";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Parameters<RequestHandler>[1], token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body as z.infer<typeof registerSchema>;
    const { accessToken, refreshToken, user } = await registerUser(name, email, password);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ success: true, data: { accessToken, user } });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const { accessToken, refreshToken, user } = await loginUser(email, password);
    setRefreshCookie(res, refreshToken);
    res.json({ success: true, data: { accessToken, user } });
  } catch (err) {
    next(err);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      res.status(401).json({ success: false, message: "No refresh token" });
      return;
    }
    const { accessToken } = await refreshAccessToken(token);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE] as string | undefined;
    if (token) await logoutUser(token);
    res.clearCookie(REFRESH_COOKIE);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await findUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    const { password_hash: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};
