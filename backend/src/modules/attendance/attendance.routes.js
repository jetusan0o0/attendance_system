import { Router } from "express";
import * as attendanceController from "./attendance.controller.js";

const router = Router();

// Hardware scan endpoint (Called by ESP32, Raspberry Pi, RFID reader, or Web kiosk)
router.post("/scan", attendanceController.handleScan);

// Log retrieval endpoints
router.get("/today", attendanceController.getTodayAttendance);
router.get("/logs", attendanceController.getAllAttendance);
router.delete("/:id", attendanceController.deleteAttendance);

export default router;
