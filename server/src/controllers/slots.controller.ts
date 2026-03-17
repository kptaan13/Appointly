import { RequestHandler } from "express";
import { z } from "zod";
import {
  getAvailableSlots,
  createSlot,
  toggleSlotBlock,
  deleteSlot,
  listSlotsByService,
} from "../db/queries/slots.queries";
import { pool } from "../config/db";

export const slotCreateSchema = z.object({
  service_id: z.string().uuid(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  capacity: z.number().int().positive().default(1),
});

export const slotBlockSchema = z.object({
  blocked: z.boolean(),
});

export const getSlots: RequestHandler = async (req, res, next) => {
  try {
    const { serviceId, date } = req.query as { serviceId?: string; date?: string };

    if (!serviceId || !date) {
      res.status(400).json({ success: false, message: "serviceId and date are required" });
      return;
    }

    const slots = await getAvailableSlots(serviceId, date);
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
};

export const getAdminSlots: RequestHandler = async (req, res, next) => {
  try {
    const { serviceId } = req.query as { serviceId?: string };
    if (!serviceId) {
      res.status(400).json({ success: false, message: "serviceId is required" });
      return;
    }
    const slots = await listSlotsByService(serviceId);
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
};

export const postSlot: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof slotCreateSchema>;
    const slot = await createSlot({ ...data, created_by: req.user!.userId });
    res.status(201).json({ success: true, data: slot });
  } catch (err) {
    next(err);
  }
};

export const patchSlotBlock: RequestHandler = async (req, res, next) => {
  try {
    const { blocked } = req.body as z.infer<typeof slotBlockSchema>;
    const slot = await toggleSlotBlock(req.params.id, blocked);
    if (!slot) {
      res.status(404).json({ success: false, message: "Slot not found" });
      return;
    }
    res.json({ success: true, data: slot });
  } catch (err) {
    next(err);
  }
};

export const deleteSlotHandler: RequestHandler = async (req, res, next) => {
  try {
    // Check for confirmed bookings before deleting
    const { rows } = await pool.query(
      "SELECT id FROM bookings WHERE slot_id = $1 AND status = 'confirmed' LIMIT 1",
      [req.params.id]
    );
    if (rows.length > 0) {
      res.status(409).json({ success: false, message: "Cannot delete slot with confirmed bookings" });
      return;
    }
    await deleteSlot(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
