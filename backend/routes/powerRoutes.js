import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();
router.use(protect);

// ─── In-memory power schedule store (used when MongoDB is not connected) ────────
let memorySchedules = [
  {
    _id: "PS1",
    district: "Mandya",
    taluk: "Mandya",
    hobli: "Keregodu",
    village: "Keregodu",
    pinCode: "571401",
    provider: "BESCOM",
    morningStart: "06:00", morningEnd: "10:00",
    afternoonStart: "14:00", afternoonEnd: "16:00",
    nightStart: "21:00", nightEnd: "23:00",
  },
  {
    _id: "PS2",
    district: "Mandya",
    taluk: "Maddur",
    hobli: "Maddur",
    village: "Maddur",
    pinCode: "571428",
    provider: "BESCOM",
    morningStart: "07:00", morningEnd: "11:00",
    afternoonStart: "15:00", afternoonEnd: "17:00",
    nightStart: "20:00", nightEnd: "22:00",
  },
];

let memoryOutages = [
  {
    _id: "PO1",
    village: "Keregodu",
    taluk: "Mandya",
    district: "Mandya",
    pinCode: "571401",
    details: "Transformer fault near main market",
    status: "Reported",
    latitude: 12.5231,
    longitude: 76.8955,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

let memoryNotices = [
  {
    _id: "PN1",
    titleEn: "Scheduled Maintenance — Mandya District",
    titleKn: "ನಿಗದಿತ ನಿರ್ವಹಣೆ — ಮಂಡ್ಯ ಜಿಲ್ಲೆ",
    contentEn: "Power supply will be interrupted on 2026-10-06 from 10:00 AM to 2:00 PM for routine transformer maintenance.",
    contentKn: "2026-10-06 ರಂದು ಬೆಳಿಗ್ಗೆ 10:00 ರಿಂದ ಮಧ್ಯಾಹ್ನ 2:00 ರವರೆಗೆ ವಿದ್ಯುತ್ ಸರಬರಾಜು ಅಡಚಣೆ ಇರುತ್ತದೆ.",
    noticeType: "maintenance",
    scheduledDate: new Date("2026-10-06"),
    durationEn: "10:00 AM – 2:00 PM",
    durationKn: "ಬೆಳಿಗ್ಗೆ 10:00 – ಮಧ್ಯಾಹ್ನ 2:00",
  },
];

// GET /api/power/schedule?district=Mandya&taluk=Mandya
router.get("/schedule", async (req, res) => {
  const { district, taluk } = req.query;
  if (mongoose.connection.readyState !== 1) {
    let result = memorySchedules;
    if (district) result = result.filter(s => s.district.toLowerCase() === district.toLowerCase());
    if (taluk) result = result.filter(s => s.taluk.toLowerCase() === taluk.toLowerCase());
    return res.json(result);
  }
  try {
    const PowerSchedule = (await import("../models/PowerSchedule.js")).default;
    const query = {};
    if (district) query.district = new RegExp(String(district).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (taluk) query.taluk = new RegExp(String(taluk).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const schedules = await PowerSchedule.find(query).limit(10);
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/power/outage — Farmer reports an outage
router.post("/outage", allowRoles("farmer", "admin"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const newOutage = { _id: "PO" + Date.now(), ...req.body, status: "Reported", createdAt: new Date() };
    memoryOutages.push(newOutage);
    return res.status(201).json(newOutage);
  }
  try {
    const PowerOutage = (await import("../models/PowerOutage.js")).default;
    const outage = await PowerOutage.create({ ...req.body, farmer: req.user._id });
    res.status(201).json(outage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/power/outages — List all outage reports
router.get("/outages", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(memoryOutages);
  }
  try {
    const PowerOutage = (await import("../models/PowerOutage.js")).default;
    const query = req.user.role === "admin" ? {} : { farmer: req.user._id };
    const outages = await PowerOutage.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(outages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/power/notices — Public power notices
router.get("/notices", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(memoryNotices);
  }
  try {
    const PowerNotice = (await import("../models/PowerNotice.js")).default;
    const notices = await PowerNotice.find().sort({ scheduledDate: 1 }).limit(10);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/power/outage/:id/status — Admin updates outage status
router.patch("/outage/:id/status", allowRoles("admin"), async (req, res) => {
  const { status } = req.body;
  if (mongoose.connection.readyState !== 1) {
    const outage = memoryOutages.find(o => o._id === req.params.id);
    if (outage) outage.status = status;
    return res.json(outage || { message: "Not found" });
  }
  try {
    const PowerOutage = (await import("../models/PowerOutage.js")).default;
    const outage = await PowerOutage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(outage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
