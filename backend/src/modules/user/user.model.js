import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },
    course: { type: String, default: "B.S. Computer Science" },
    yearLevel: { type: String, default: "1st Year" },
    rfidUid: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);