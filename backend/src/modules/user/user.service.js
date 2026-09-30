import bcrypt from "bcryptjs";
import { User } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const createUser = async (data) => {
  const normalizedEmail = data.email?.trim().toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new ApiError(409, "Email already in use");

  const rawPassword = data.password || "student123";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const user = await User.create({
    ...data,
    email: normalizedEmail,
    password: hashedPassword,
    role: data.role || "student",
  });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const getAllUsers = async () => User.find().select("-password").sort({ createdAt: -1 });

export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};