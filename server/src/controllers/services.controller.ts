import { RequestHandler } from "express";
import { z } from "zod";
import {
  listServices,
  findServiceById,
  createService,
  updateService,
  softDeleteService,
} from "../db/queries/services.queries";

export const serviceCreateSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  duration_min: z.number().int().positive(),
  price: z.number().nonnegative(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const getServices: RequestHandler = async (_req, res, next) => {
  try {
    const services = await listServices();
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

export const getService: RequestHandler = async (req, res, next) => {
  try {
    const service = await findServiceById(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const postService: RequestHandler = async (req, res, next) => {
  try {
    const service = await createService(req.body as z.infer<typeof serviceCreateSchema>);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const putService: RequestHandler = async (req, res, next) => {
  try {
    const service = await updateService(req.params.id, req.body as z.infer<typeof serviceUpdateSchema>);
    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const deleteService: RequestHandler = async (req, res, next) => {
  try {
    await softDeleteService(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
