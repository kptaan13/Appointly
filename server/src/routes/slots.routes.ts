import { Router } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  getSlots,
  getAdminSlots,
  postSlot,
  patchSlotBlock,
  deleteSlotHandler,
  slotCreateSchema,
  slotBlockSchema,
} from "../controllers/slots.controller";

const router = Router();

router.get("/admin", authenticate, requireAdmin, getAdminSlots);
router.get("/", getSlots);
router.post("/", authenticate, requireAdmin, validate(slotCreateSchema), postSlot);
router.patch("/:id/block", authenticate, requireAdmin, validate(slotBlockSchema), patchSlotBlock);
router.delete("/:id", authenticate, requireAdmin, deleteSlotHandler);

export default router;
