import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/farmers", allowRoles("admin"), async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" })
      .select("name village landAcres")
      .sort({ name: 1 })
      .lean();
    return res.json(farmers);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load farmers" });
  }
});

router.put("/profile", async (req, res) => {
  const allowedFields = ["name", "phone", "age", "village", "taluk", "district", "address", "pincode", "photoUrl"];
  const updates = {};
  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No profile fields were provided" });
  }
  if (updates.name !== undefined && (typeof updates.name !== "string" || !updates.name.trim())) {
    return res.status(400).json({ message: "Name must not be empty" });
  }
  if (updates.phone !== undefined && (typeof updates.phone !== "string" || !/^[0-9]{7,15}$/.test(updates.phone))) {
    return res.status(400).json({ message: "Enter a valid phone number" });
  }
  if (updates.age !== undefined && (!Number.isInteger(Number(updates.age)) || Number(updates.age) < 1 || Number(updates.age) > 120)) {
    return res.status(400).json({ message: "Enter a valid age" });
  }
  if (updates.pincode !== undefined && (typeof updates.pincode !== "string" || !/^[0-9]{5,10}$/.test(updates.pincode))) {
    return res.status(400).json({ message: "Enter a valid postal code" });
  }
  if (!mongoose.isValidObjectId(req.user._id)) {
    return res.status(503).json({ message: "This change could not be saved. Please try again later." });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user.toSafeObject());
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.phone) {
      return res.status(409).json({ message: "That phone number is already in use" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Failed to save profile changes" });
  }
});

export default router;
