import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, UserController.create);
router.get("/", authMiddleware, UserController.findAll);
router.get("/:id", authMiddleware, UserController.findById);
router.put("/:id", authMiddleware, UserController.update);
router.delete("/:id", authMiddleware, UserController.remove);

export default router;
