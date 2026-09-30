import { Router } from "express";
import { userRoutes } from "./modules/user/index.js";
import { authRoutes } from "./modules/auth/index.js";
import { attendanceRoutes } from "./modules/attendance/index.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/attendance", attendanceRoutes);

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API healthy", timestamp: new Date() });
});

export default router;