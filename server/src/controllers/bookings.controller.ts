import { RequestHandler } from "express";
import { z } from "zod";
import { createBooking, cancelUserBooking } from "../services/booking.service";
import {
  listUserBookings,
  findBookingById,
} from "../db/queries/bookings.queries";

export const bookingCreateSchema = z.object({
  slotId: z.string().uuid(),
  serviceId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const postBooking: RequestHandler = async (req, res, next) => {
  try {
    const { slotId, serviceId, notes } = req.body as z.infer<typeof bookingCreateSchema>;
    const booking = await createBooking({
      userId: req.user!.userId,
      slotId,
      serviceId,
      notes,
    });
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const getMyBookings: RequestHandler = async (req, res, next) => {
  try {
    const bookings = await listUserBookings(req.user!.userId);
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const getBooking: RequestHandler = async (req, res, next) => {
  try {
    const booking = await findBookingById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }
    // Only owner or admin
    if (booking.user_id !== req.user!.userId && req.user!.role !== "admin") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const cancelBookingHandler: RequestHandler = async (req, res, next) => {
  try {
    const booking = await cancelUserBooking(req.params.id, req.user!.userId);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
