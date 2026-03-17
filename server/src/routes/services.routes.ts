import { Router } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  getServices,
  getService,
  postService,
  putService,
  deleteService,
  serviceCreateSchema,
  serviceUpdateSchema,
} from "../controllers/services.controller";

const router = Router();

router.get("/", getServices);
router.get("/:id", getService);
router.post("/", authenticate, requireAdmin, validate(serviceCreateSchema), postService);
router.put("/:id", authenticate, requireAdmin, validate(serviceUpdateSchema), putService);
router.delete("/:id", authenticate, requireAdmin, deleteService);

export default router;
