import { Router } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  getAllBookings,
  getAllUsers,
  patchBookingStatus,
  adminUpdateBookingSchema,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/bookings", getAllBookings);
router.get("/users", getAllUsers);
router.patch("/bookings/:id/status", validate(adminUpdateBookingSchema), patchBookingStatus);

export default router;
