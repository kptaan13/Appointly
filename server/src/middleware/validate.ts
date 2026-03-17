import { RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors;
      res.status(400).json({ success: false, message: "Validation error", errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
