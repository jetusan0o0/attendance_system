import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    studentId: { type: String, required: false },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    rfidUid: { type: String, default: null },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    timeIn: { type: String, default: null }, // e.g. "08:30:15 AM"
    timeOut: { type: String, default: null }, // e.g. "05:15:20 PM"
    timeInDate: { type: Date, default: null },
    timeOutDate: { type: Date, default: null },
    durationFormatted: { type: String, default: null }, // e.g. "8h 45m"
    durationMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Present", "Late", "Absent", "Excused", "Completed"],
      default: "Present",
    },
    method: {
      type: String,
      enum: ["RFID", "QR", "Biometric", "Manual"],
      default: "RFID",
    },
    terminalId: { type: String, default: "GATE_TERMINAL_01" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
