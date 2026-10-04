import express from "express";
import mongoose from "mongoose";
import IrrigationSlot from "../models/IrrigationSlot.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/my", allowRoles("farmer"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Irrigation schedules are temporarily unavailable because the database is disconnected.",
      code: "DATABASE_UNAVAILABLE",
    });
  }
  try {
    const slots = await IrrigationSlot.find({ farmer: req.user._id }).sort({ turnDate: -1 }).lean();
    return res.json(slots);
  } catch (err) {
    console.error("Failed to load irrigation turns.", err);
    return res.status(500).json({ message: "Failed to load irrigation turns" });
  }
});

router.get("/canal/:canalName", allowRoles("farmer", "admin"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "The canal rotation schedule is temporarily unavailable because the database is disconnected.",
      code: "DATABASE_UNAVAILABLE",
    });
  }
  try {
    const slots = await IrrigationSlot.find({ canalName: req.params.canalName })
      .populate("farmer", "name village")
      .sort({ turnDate: 1, startTime: 1 })
      .lean();
    return res.json(slots);
  } catch (err) {
    console.error(`Failed to load the ${req.params.canalName} canal schedule.`, err);
    return res.status(500).json({ message: "Failed to load canal schedule" });
  }
});

router.get("/", allowRoles("admin"), async (req, res) => {
  try {
    const slots = await IrrigationSlot.find()
      .populate("farmer", "name village landAcres")
      .sort({ turnDate: -1 })
      .lean();
    return res.json(slots);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load irrigation schedule" });
  }
});

router.post("/", allowRoles("admin"), async (req, res) => {
  try {
    const slot = await IrrigationSlot.create(req.body);
    return res.status(201).json(slot);
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: "Failed to save irrigation slot" });
  }
});

export default router;
