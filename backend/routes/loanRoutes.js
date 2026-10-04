import express from "express";
import Loan from "../models/Loan.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

import mongoose from "mongoose";

// Farmer: get own loans
router.get("/my", allowRoles("farmer"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([
      { _id: "L1", amount: 50000, purpose: "Crop Loan", status: "active", issueDate: new Date(), dueDate: new Date(Date.now() + 31536000000), interestRate: 4, amountRepaid: 10000, riskFlag: false }
    ]);
  }
  const loans = await Loan.find({ farmer: req.user._id }).sort({ dueDate: 1 });
  // refresh status on read
  for (const loan of loans) {
    await loan.save();
  }
  res.json(loans);
});

// Farmer: create loan
router.post("/", allowRoles("farmer"), async (req, res) => {
  try {
    const loan = await Loan.create({ ...req.body, farmer: req.user._id });
    res.status(201).json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Farmer: add repayment
router.post("/:id/repay", allowRoles("farmer"), async (req, res) => {
  const loan = await Loan.findOne({ _id: req.params.id, farmer: req.user._id });
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  const { amount, note } = req.body;
  loan.repayments.push({ amount, note });
  loan.amountRepaid += Number(amount);
  await loan.save();
  res.json(loan);
});

// Admin: view all loans (debt trap monitoring)
router.get("/all", allowRoles("admin"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([
      { _id: "L1", amount: 50000, purpose: "Crop Loan", status: "active", issueDate: new Date(), dueDate: new Date(Date.now() + 31536000000), interestRate: 4, amountRepaid: 10000, riskFlag: false, farmer: { name: "Varun Gowda", phone: "9353243474", village: "Keregodu" } }
    ]);
  }
  const loans = await Loan.find().populate("farmer", "name phone village taluk");
  res.json(loans);
});

// Admin: get high-risk farmers (debt trap alerts)
router.get("/risk-report", allowRoles("admin"), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([]);
  }
  const loans = await Loan.find({ riskFlag: true }).populate(
    "farmer",
    "name phone village taluk"
  );
  res.json(loans);
});

router.delete("/:id", allowRoles("farmer"), async (req, res) => {
  await Loan.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
  res.json({ message: "Loan record deleted" });
});

// Mock Bank API Responses for Phase 3
const BANKS = [
  { name: "State Bank of India", logo: "SBI", baseRate: 7.0, subvention: 3.0 },
  { name: "Canara Bank", logo: "Canara", baseRate: 7.2, subvention: 3.0 },
  { name: "Punjab National Bank", logo: "PNB", baseRate: 7.5, subvention: 3.0 },
  { name: "Karnataka Bank", logo: "KBL", baseRate: 8.5, subvention: 2.0 }
];

// POST /api/loans/check-eligibility
// Connects "directly" to simulated bank APIs to assess generic crop/land loans
router.post("/check-eligibility", allowRoles("farmer"), (req, res) => {
  const { landArea, cropType, existingLoans } = req.body;
  
  let scaleOfFinance = 30000; 
  if (cropType && cropType.toLowerCase().includes("sugarcane")) scaleOfFinance = 60000;
  if (cropType && cropType.toLowerCase().includes("cotton")) scaleOfFinance = 40000;

  const baseEligible = landArea * scaleOfFinance;
  const netEligible = Math.max(0, baseEligible - (existingLoans || 0));

  const subsidyPerAcre = 15000;
  const totalSubsidy = landArea * subsidyPerAcre;

  const loanTermMonths = 12;

  const offers = BANKS.map(bank => {
    const isRecommended = bank.name === "State Bank of India" || bank.name === "Canara Bank";
    const effectiveRate = bank.baseRate - bank.subvention;
    const r = effectiveRate / 12 / 100;
    const n = loanTermMonths;
    const emi = netEligible > 0 ? (netEligible * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
    const yearlyTotal = emi * 12;

    return {
      bankName: bank.name,
      eligibleAmount: netEligible,
      interestRate: bank.baseRate,
      effectiveRate, // After govt subvention
      monthlyEMI: emi,
      yearlyTotal: yearlyTotal,
      isRecommended
    };
  });

  res.json({
    scaleOfFinanceApplied: scaleOfFinance,
    totalEligibleAmount: netEligible,
    subsidyPerAcre,
    totalSubsidy,
    approvalNote: "Subject to Agricultural Officer Verification and Approval",
    offers: offers.sort((a, b) => a.effectiveRate - b.effectiveRate), 
    schemes: ["Kisan Credit Card (KCC)", "Interest Subvention Scheme (3%)"]
  });
});

// POST /api/loans/dairy-estimate
// Specifically for dairy farming financing
router.post("/dairy-estimate", allowRoles("farmer"), (req, res) => {
  const { cows, breed, dailyProduction } = req.body;
  
  const costPerAnimal = 70000; // Average cost for good HF/Jersey
  const totalProjectCost = cows * costPerAnimal;
  
  const eligibleLoan = totalProjectCost * 0.85; // 85% bank finance
  const farmerMargin = totalProjectCost * 0.15; // 15% margin money

  const monthlyRevenue = (dailyProduction || (cows * 12)) * 32 * 30; // 32 rs/L
  const monthlyFeedCost = cows * 200 * 30; // 200 rs/day/cow
  const monthlyProfit = monthlyRevenue - monthlyFeedCost;

  res.json({
    projectCost: totalProjectCost,
    eligibleLoan,
    farmerMargin,
    monthlyRevenue,
    monthlyFeedCost,
    monthlyProfit,
    recommendedInsurance: "Pashu Dhan Bima Yojana",
    subsidies: ["NABARD DEDS (25% General, 33% SC/ST)"]
  });
});

export default router;
