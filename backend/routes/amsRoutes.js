import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();
router.use(protect);

// ─── In-memory AMS data store (used when MongoDB is not connected) ─────────────
let memoryMandiPrices = [
  { _id: "M1", cropName: "Tomato", cropNameKannada: "ಟೊಮೇಟೊ", mandiName: "Kolar APMC", minPrice: 1800, maxPrice: 2100, modalPrice: 1900, trend: "up", changePercent: 5.2, date: new Date() },
  { _id: "M2", cropName: "Onion", cropNameKannada: "ಈರುಳ್ಳಿ", mandiName: "Yeshwanthpur APMC", minPrice: 2800, maxPrice: 3200, modalPrice: 3000, trend: "down", changePercent: -2.1, date: new Date() },
  { _id: "M3", cropName: "Ragi", cropNameKannada: "ರಾಗಿ", mandiName: "Tumkur APMC", minPrice: 3400, maxPrice: 3600, modalPrice: 3500, trend: "stable", changePercent: 0, date: new Date() },
  { _id: "M4", cropName: "Potato", cropNameKannada: "ಆಲೂಗಡ್ಡೆ", mandiName: "Hassan APMC", minPrice: 1500, maxPrice: 1750, modalPrice: 1600, trend: "up", changePercent: 1.5, date: new Date() },
  { _id: "M5", cropName: "Sugarcane", cropNameKannada: "ಕಬ್ಬು", mandiName: "Mandya APMC", minPrice: 3200, maxPrice: 3400, modalPrice: 3300, trend: "stable", changePercent: 0.2, date: new Date() },
  { _id: "M6", cropName: "Maize", cropNameKannada: "ಜೋಳ", mandiName: "Dharwad APMC", minPrice: 1900, maxPrice: 2100, modalPrice: 2000, trend: "up", changePercent: 3.0, date: new Date() },
];

let memoryInsuranceClaims = [
  { _id: "IC1", farmer: { name: "Varun Gowda", phone: "9353243474", village: "Keregodu" }, policyNumber: "PMFBY-MND-2026-001", surveyNumber: "123/A", damagePercent: 65, status: "under_review", cropName: "Sugarcane", season: "Kharif 2026", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
];

let memorySubsidies = [
  { _id: "SB1", name: "PM-KISAN Direct Benefit Transfer", description: "₹6,000/year in 3 installments for all farmer families", amount: 6000, category: "Direct Income Support", eligibility: "All farmer families with cultivable land", lastDate: "Ongoing", status: "active" },
  { _id: "SB2", name: "PMFBY Crop Insurance", description: "Low premium crop insurance for Kharif and Rabi seasons", amount: null, category: "Crop Insurance", eligibility: "All farmers with crop loan or voluntary enrollment", lastDate: "2026-07-31", status: "active" },
  { _id: "SB3", name: "Kisan Credit Card (KCC)", description: "Short-term crop loans at 4% effective interest (3% subvention)", amount: 300000, category: "Credit Support", eligibility: "Farmers with agricultural land and no default", lastDate: "Ongoing", status: "active" },
  { _id: "SB4", name: "Soil Health Card Scheme", description: "Free soil testing and crop recommendations every 2 years", amount: null, category: "Agricultural Services", eligibility: "All farmers in Karnataka", lastDate: "Ongoing", status: "active" },
  { _id: "SB5", name: "NABARD DEDS (Dairy)", description: "25% subsidy (33% for SC/ST) on dairy unit setup cost", amount: null, category: "Animal Husbandry", eligibility: "Dairy farmers, SHGs, Cooperatives", lastDate: "Ongoing", status: "active" },
];

// ─── MANDI PRICE ROUTES ─────────────────────────────────────────────────────────

// GET /api/ams/mandi — Get live APMC mandi prices
router.get("/mandi", async (req, res) => {
  const { crop, mandi } = req.query;
  if (mongoose.connection.readyState !== 1) {
    let result = memoryMandiPrices;
    if (crop) result = result.filter(m => m.cropName.toLowerCase().includes(crop.toLowerCase()));
    if (mandi) result = result.filter(m => m.mandiName.toLowerCase().includes(mandi.toLowerCase()));
    return res.json(result);
  }
  try {
    const MandiPrice = (await import("../models/MandiPrice.js")).default;
    const query = {};
    if (crop) query.cropName = new RegExp(crop, "i");
    if (mandi) query.mandiName = new RegExp(mandi, "i");
    const prices = await MandiPrice.find(query).sort({ date: -1 }).limit(20);
    res.json(prices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ams/mandi — Admin adds/updates mandi price
router.post("/mandi", allowRoles("admin"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const newPrice = { _id: "M" + Date.now(), ...req.body, date: new Date(), trend: "stable", changePercent: 0 };
    memoryMandiPrices.push(newPrice);
    return res.status(201).json(newPrice);
  }
  try {
    const MandiPrice = (await import("../models/MandiPrice.js")).default;
    const price = await MandiPrice.create({ ...req.body, date: new Date() });
    res.status(201).json(price);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── INSURANCE CLAIM ROUTES ─────────────────────────────────────────────────────

// GET /api/ams/insurance — Farmer: get own insurance claims
router.get("/insurance", allowRoles("farmer"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(memoryInsuranceClaims.filter(ic => ic.farmer.phone === "9353243474"));
  }
  try {
    const InsuranceClaim = (await import("../models/InsuranceClaim.js")).default;
    const claims = await InsuranceClaim.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ams/insurance — Farmer: file insurance claim
router.post("/insurance", allowRoles("farmer"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const newClaim = { _id: "IC" + Date.now(), ...req.body, farmer: { name: "Varun Gowda", phone: "9353243474" }, status: "under_review", createdAt: new Date() };
    memoryInsuranceClaims.push(newClaim);
    return res.status(201).json(newClaim);
  }
  try {
    const InsuranceClaim = (await import("../models/InsuranceClaim.js")).default;
    const claim = await InsuranceClaim.create({ ...req.body, farmer: req.user._id });
    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ams/insurance/all — Admin: view all insurance claims
router.get("/insurance/all", allowRoles("admin"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(memoryInsuranceClaims);
  }
  try {
    const InsuranceClaim = (await import("../models/InsuranceClaim.js")).default;
    const claims = await InsuranceClaim.find().populate("farmer", "name phone village taluk").sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/ams/insurance/:id — Admin: approve/reject claim
router.patch("/insurance/:id", allowRoles("admin"), async (req, res) => {
  try {
    const InsuranceClaim = (await import("../models/InsuranceClaim.js")).default;
    const claim = await InsuranceClaim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Insurance claim not found" });
    const { status, note, approvedAmount, rejectionReason } = req.body;
    if (status && status !== claim.status) {
      claim.status = status;
      claim.statusHistory.push({ status, note, updatedBy: req.user._id });
    }
    if (approvedAmount !== undefined) claim.approvedAmount = Number(approvedAmount);
    if (rejectionReason !== undefined) claim.rejectionReason = rejectionReason;
    await claim.save();
    res.json(claim);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid insurance claim ID" });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
});

// ─── SUBSIDY ROUTES ─────────────────────────────────────────────────────────────

// GET /api/ams/subsidies — List all available government subsidies
router.get("/subsidies", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(memorySubsidies);
  }
  try {
    const Subsidy = (await import("../models/Subsidy.js")).default;
    const subsidies = await Subsidy.find({ status: "active" });
    res.json(subsidies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ams/subsidies — Admin: add new subsidy scheme
router.post("/subsidies", allowRoles("admin"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const newSub = { _id: "SB" + Date.now(), ...req.body, status: "active" };
    memorySubsidies.push(newSub);
    return res.status(201).json(newSub);
  }
  try {
    const Subsidy = (await import("../models/Subsidy.js")).default;
    const subsidy = await Subsidy.create(req.body);
    res.status(201).json(subsidy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
