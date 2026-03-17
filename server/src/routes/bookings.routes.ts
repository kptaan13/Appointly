import { Router } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import {
  postBooking,
  getMyBookings,
  getBooking,
  cancelBookingHandler,
  bookingCreateSchema,
} from "../controllers/bookings.controller";

const router = Router();

router.use(authenticate);

router.post("/", validate(bookingCreateSchema), postBooking);
router.get("/my", getMyBookings);
router.get("/:id", getBooking);
router.patch("/:id/cancel", cancelBookingHandler);

export default router;
