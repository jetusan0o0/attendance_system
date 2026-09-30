import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../user/index.js";
import { ApiError } from "../../utils/ApiError.js";

export const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already registered");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { user: { id: user._id, name, email, role }, token };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
};