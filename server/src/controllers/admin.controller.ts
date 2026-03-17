import { RequestHandler } from "express";
import { z } from "zod";
import { listAllBookings, updateBookingStatus } from "../db/queries/bookings.queries";
import { listUsers } from "../db/queries/users.queries";

export const adminUpdateBookingSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed"]),
});

export const getAllBookings: RequestHandler = async (req, res, next) => {
  try {
    const { status, date } = req.query as { status?: string; date?: string };
    const bookings = await listAllBookings({ status, date });
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const patchBookingStatus: RequestHandler = async (req, res, next) => {
  try {
    const { status } = req.body as z.infer<typeof adminUpdateBookingSchema>;
    const booking = await updateBookingStatus(req.params.id, status);
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
