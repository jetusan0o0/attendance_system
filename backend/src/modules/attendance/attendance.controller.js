import * as attendanceService from "./attendance.service.js";

export const handleScan = async (req, res, next) => {
  try {
    const result = await attendanceService.recordScan(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getTodayAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getTodayLogs();
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getAllLogs();
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

export const deleteAttendance = async (req, res, next) => {
  try {
    const record = await attendanceService.deleteLog(req.params.id);
    res.status(200).json({ success: true, message: "Attendance log removed", data: record });
  } catch (err) {
    next(err);
  }
};
