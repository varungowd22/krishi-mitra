import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// @route POST /api/auth/register
router.post("/register", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Registration is temporarily unavailable because the database is disconnected.",
      code: "DATABASE_UNAVAILABLE",
    });
  }

  const { name, phone, password, village, taluk, district } = req.body;
  if (req.body.role && req.body.role !== "farmer") {
    return res.status(403).json({ message: "Only farmer accounts can self-register. Contact an administrator for staff access." });
  }

  try {
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "Phone number already registered" });
    }
    const user = await User.create({ name, phone, password, village, taluk, district, role: "farmer" });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Sign-in is temporarily unavailable because the database is disconnected.",
      code: "DATABASE_UNAVAILABLE",
    });
  }

  try {
    const { phone, password, role } = req.body;

    const user = await User.findOne({ phone, role });
    if (!user) return res.status(404).json({ message: "Account not found for this role" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });
    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
