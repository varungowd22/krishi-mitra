import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Loan from "../models/Loan.js";
import MandiPrice from "../models/MandiPrice.js";
import InsuranceClaim from "../models/InsuranceClaim.js";
import IrrigationSlot from "../models/IrrigationSlot.js";
import Product from "../models/Product.js";
import SoilTest from "../models/SoilTest.js";
import DiseaseScan from "../models/DiseaseScan.js";
import Subsidy from "../models/Subsidy.js";
import WeatherAlert from "../models/WeatherAlert.js";
import Cow from "../models/Cow.js";
import MilkRecord from "../models/MilkRecord.js";
import DairyMarketplace from "../models/DairyMarketplace.js";
import PowerSchedule from "../models/PowerSchedule.js";
import PowerOutageReport from "../models/PowerOutageReport.js";

dotenv.config();

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Clearing old data...");

  await Promise.all([
    User.deleteMany({}),
    Loan.deleteMany({}),
    MandiPrice.deleteMany({}),
    InsuranceClaim.deleteMany({}),
    IrrigationSlot.deleteMany({}),
    Product.deleteMany({}),
    SoilTest.deleteMany({}),
    DiseaseScan.deleteMany({}),
    Subsidy.deleteMany({}),
    WeatherAlert.deleteMany({}),
    Cow.deleteMany({}),
    MilkRecord.deleteMany({}),
    DairyMarketplace.deleteMany({}),
    PowerSchedule.deleteMany({}),
    PowerOutageReport.deleteMany({}),
  ]);

  // ---------- USERS ----------
  const admin = await User.create({
    name: "Prakash Rao",
    phone: "9900000001",
    email: "officer@krishimitra.gov.in",
    password: "admin123",
    role: "admin",
    designation: "Agriculture Extension Officer",
    district: "Bengaluru Rural",
    taluk: "Devanahalli",
  });

  const vendor = await User.create({
    name: "Lakshmi Agro Traders",
    phone: "9900000002",
    password: "vendor123",
    role: "vendor",
    shopName: "Lakshmi Agro Traders",
    licenseNumber: "KA-AGR-2024-1187",
    village: "Devanahalli Town",
    taluk: "Devanahalli",
    district: "Bengaluru Rural",
  });

  const farmer1 = await User.create({
    name: "Varun Gowda",
    phone: "9900000003",
    password: "farmer123",
    role: "farmer",
    village: "Kundana",
    taluk: "Devanahalli",
    district: "Bengaluru Rural",
    landAcres: 4.5,
    farmerIdNumber: "FID-KA-882103",
  });

  const farmer2 = await User.create({
    name: "Manjunatha K",
    phone: "9900000004",
    password: "farmer123",
    role: "farmer",
    village: "Kundana",
    taluk: "Devanahalli",
    district: "Bengaluru Rural",
    landAcres: 2.8,
    farmerIdNumber: "FID-KA-882104",
  });

  const farmer3 = await User.create({
    name: "Ramakka Hosalli",
    phone: "9900000005",
    password: "farmer123",
    role: "farmer",
    village: "Vishwanathapura",
    taluk: "Doddaballapura",
    district: "Bengaluru Rural",
    landAcres: 1.5,
    farmerIdNumber: "FID-KA-882105",
  });

  console.log("Users seeded.");

  // ---------- LOANS ----------
  await Loan.create([
    {
      farmer: farmer1._id,
      lenderName: "Suresh Shetty",
      lenderType: "moneylender",
      lenderContact: "9876543210",
      principalAmount: 50000,
      interestRatePercent: 36,
      purpose: "Seeds and fertilizer for ragi sowing",
      takenOn: daysFromNow(-120),
      dueDate: daysFromNow(-10),
      amountRepaid: 15000,
    },
    {
      farmer: farmer1._id,
      lenderName: "Devanahalli Cooperative Bank",
      lenderType: "cooperative_society",
      principalAmount: 80000,
      interestRatePercent: 9,
      purpose: "Drip irrigation equipment",
      takenOn: daysFromNow(-200),
      dueDate: daysFromNow(165),
      amountRepaid: 30000,
    },
    {
      farmer: farmer2._id,
      lenderName: "Ravi Kumar (local lender)",
      lenderType: "moneylender",
      lenderContact: "9876500000",
      principalAmount: 25000,
      interestRatePercent: 42,
      purpose: "Medical emergency",
      takenOn: daysFromNow(-60),
      dueDate: daysFromNow(5),
      amountRepaid: 0,
    },
    {
      farmer: farmer3._id,
      lenderName: "Karnataka Grameen Bank",
      lenderType: "bank",
      principalAmount: 100000,
      interestRatePercent: 7,
      purpose: "Tractor purchase",
      takenOn: daysFromNow(-300),
      dueDate: daysFromNow(60),
      amountRepaid: 60000,
    },
  ]);
  console.log("Loans seeded.");

  // ---------- MANDI PRICES ----------
  await MandiPrice.create([
    { cropName: "Ragi", cropNameKannada: "ರಾಗಿ", mandiName: "Devanahalli APMC", district: "Bengaluru Rural", minPrice: 3200, maxPrice: 3600, modalPrice: 3450, trend: "up", changePercent: 4.2 },
    { cropName: "Tomato", cropNameKannada: "ಟೊಮ್ಯಾಟೊ", mandiName: "Kolar APMC", district: "Kolar", minPrice: 800, maxPrice: 1400, modalPrice: 1100, trend: "down", changePercent: -8.5 },
    { cropName: "Maize", cropNameKannada: "ಮೆಕ್ಕೆಜೋಳ", mandiName: "Chikkaballapura APMC", district: "Chikkaballapura", minPrice: 1900, maxPrice: 2200, modalPrice: 2050, trend: "stable", changePercent: 0.5 },
    { cropName: "Ragi", cropNameKannada: "ರಾಗಿ", mandiName: "Doddaballapura APMC", district: "Bengaluru Rural", minPrice: 3100, maxPrice: 3500, modalPrice: 3300, trend: "up", changePercent: 2.1 },
    { cropName: "Potato", cropNameKannada: "ಆಲೂಗಡ್ಡೆ", mandiName: "Hassan APMC", district: "Hassan", minPrice: 1200, maxPrice: 1600, modalPrice: 1400, trend: "up", changePercent: 6.0 },
    { cropName: "Onion", cropNameKannada: "ಈರುಳ್ಳಿ", mandiName: "Kolar APMC", district: "Kolar", minPrice: 1800, maxPrice: 2400, modalPrice: 2100, trend: "down", changePercent: -3.2 },
    { cropName: "Groundnut", cropNameKannada: "ಶೇಂಗಾ", mandiName: "Chikkaballapura APMC", district: "Chikkaballapura", minPrice: 5200, maxPrice: 5800, modalPrice: 5500, trend: "stable", changePercent: 0.8 },
  ]);
  console.log("Mandi prices seeded.");

  // ---------- INSURANCE CLAIMS ----------
  await InsuranceClaim.create([
    {
      farmer: farmer1._id,
      policyNumber: "PMFBY-KA-2026-44210",
      cropName: "Ragi",
      surveyNumber: "44/2A",
      landAcres: 2.5,
      damageType: "unseasonal_rain",
      damagePercent: 65,
      incidentDate: daysFromNow(-25),
      description: "Heavy unseasonal rain during harvest flattened standing crop across the plot.",
      estimatedLossAmount: 45000,
      status: "field_inspection",
      assignedOfficer: admin._id,
      statusHistory: [
        { status: "submitted", note: "Claim filed by farmer", updatedAt: daysFromNow(-25) },
        { status: "under_review", note: "Documents verified by taluk office", updatedAt: daysFromNow(-20) },
        { status: "field_inspection", note: "Field officer assigned for site visit", updatedBy: admin._id, updatedAt: daysFromNow(-12) },
      ],
    },
    {
      farmer: farmer2._id,
      policyNumber: "PMFBY-KA-2026-44211",
      cropName: "Maize",
      surveyNumber: "12/1B",
      landAcres: 2.0,
      damageType: "pest_attack",
      damagePercent: 40,
      incidentDate: daysFromNow(-45),
      description: "Fall armyworm infestation reduced expected yield significantly.",
      estimatedLossAmount: 22000,
      approvedAmount: 18000,
      status: "approved",
      assignedOfficer: admin._id,
      statusHistory: [
        { status: "submitted", note: "Claim filed by farmer", updatedAt: daysFromNow(-45) },
        { status: "under_review", note: "Under review", updatedAt: daysFromNow(-40) },
        { status: "field_inspection", note: "Inspection completed", updatedAt: daysFromNow(-30) },
        { status: "approved", note: "Approved after inspection report", updatedBy: admin._id, updatedAt: daysFromNow(-15) },
      ],
    },
    {
      farmer: farmer3._id,
      policyNumber: "PMFBY-KA-2026-44212",
      cropName: "Groundnut",
      surveyNumber: "8/3",
      landAcres: 1.5,
      damageType: "drought",
      damagePercent: 20,
      incidentDate: daysFromNow(-70),
      description: "Insufficient rainfall during sowing window, partial crop loss.",
      estimatedLossAmount: 8000,
      status: "rejected",
      rejectionReason: "Damage percentage below the 33% threshold required for payout under policy terms.",
      assignedOfficer: admin._id,
      statusHistory: [
        { status: "submitted", note: "Claim filed by farmer", updatedAt: daysFromNow(-70) },
        { status: "under_review", note: "Under review", updatedAt: daysFromNow(-60) },
        { status: "rejected", note: "Damage threshold not met", updatedBy: admin._id, updatedAt: daysFromNow(-50) },
      ],
    },
  ]);
  console.log("Insurance claims seeded.");

  // ---------- IRRIGATION SCHEDULE ----------
  const canal = "Vrishabhavathi Canal - Block 4";
  await IrrigationSlot.create([
    { farmer: farmer1._id, canalName: canal, fieldSurveyNumber: "44/2A", landAcres: 2.5, turnDate: daysFromNow(1), startTime: "06:00", endTime: "09:00", durationHours: 3, status: "scheduled", rotationCycleNumber: 7 },
    { farmer: farmer2._id, canalName: canal, fieldSurveyNumber: "12/1B", landAcres: 2.0, turnDate: daysFromNow(1), startTime: "09:00", endTime: "11:30", durationHours: 2.5, status: "scheduled", rotationCycleNumber: 7 },
    { farmer: farmer3._id, canalName: canal, fieldSurveyNumber: "8/3", landAcres: 1.5, turnDate: daysFromNow(1), startTime: "11:30", endTime: "13:30", durationHours: 2, status: "scheduled", rotationCycleNumber: 7 },
    { farmer: farmer1._id, canalName: canal, fieldSurveyNumber: "44/2A", landAcres: 2.5, turnDate: daysFromNow(-6), startTime: "06:00", endTime: "09:00", durationHours: 3, status: "completed", rotationCycleNumber: 6 },
    { farmer: farmer2._id, canalName: canal, fieldSurveyNumber: "12/1B", landAcres: 2.0, turnDate: daysFromNow(-6), startTime: "09:00", endTime: "11:30", durationHours: 2.5, status: "missed", rotationCycleNumber: 6 },
  ]);
  console.log("Irrigation schedule seeded.");

  // ---------- PRODUCTS ----------
  const products = await Product.create([
    { barcode: "8901030875315", productName: "Tata Rallis Tafgor 30 EC", productType: "pesticide", manufacturer: "Tata Rallis India Ltd", batchNumber: "TR-2026-A11", govtRegistrationNumber: "CIBRC/REG/4521", registrationValidTill: daysFromNow(400), isApproved: true, activeIngredient: "Dimethoate 30% EC", addedBy: admin._id },
    { barcode: "8901030875322", productName: "Coromandel Gromor Hybrid Maize Seeds", productType: "seed", manufacturer: "Coromandel International", batchNumber: "CM-SEED-118", govtRegistrationNumber: "SEED/KA/2026/331", registrationValidTill: daysFromNow(300), isApproved: true, addedBy: vendor._id },
    { barcode: "8901030875346", productName: "Arka Rakshak Tomato Seeds", productType: "seed", manufacturer: "IIHR Bangalore", batchNumber: "IIHR-SEED-2026", govtRegistrationNumber: "SEED/KA/2026/994", registrationValidTill: daysFromNow(500), isApproved: true, activeIngredient: "Triple Disease Resistant Hybrid Seeds", addedBy: vendor._id },
    { barcode: "8901030875339", productName: "UPL Saaf Fungicide", productType: "pesticide", manufacturer: "UPL Limited", batchNumber: "UPL-9981", govtRegistrationNumber: "CIBRC/REG/7790", registrationValidTill: daysFromNow(200), isApproved: true, activeIngredient: "Carbendazim 12% + Mancozeb 63% WP", addedBy: vendor._id },
    { barcode: "8901030899999", productName: "MaxYield Super Growth Pesticide", productType: "pesticide", manufacturer: "Unregistered Local Pack", batchNumber: "UNK-001", govtRegistrationNumber: "NOT REGISTERED", isApproved: false, activeIngredient: "Unknown", addedBy: admin._id },
  ]);
  console.log("Products seeded.");

  // ---------- SOIL TESTS ----------
  await SoilTest.create([
    { farmer: farmer1._id, nitrogenLevel: "Low", phosphorusLevel: "Normal", potassiumLevel: "Medium", phValue: 6.2, recommendedFertilizers: [{ name: "Urea", quantityKg: 45 }, { name: "DAP", quantityKg: 25 }, { name: "MOP", quantityKg: 20 }] },
    { farmer: farmer2._id, nitrogenLevel: "Normal", phosphorusLevel: "Low", potassiumLevel: "High", phValue: 6.8, recommendedFertilizers: [{ name: "DAP", quantityKg: 40 }] },
  ]);
  console.log("Soil tests seeded.");

  // ---------- DISEASE SCANS ----------
  await DiseaseScan.create([
    { farmer: farmer1._id, cropName: "Tomato", diseaseDetected: "Leaf Blight", confidencePercent: 92.5, recommendedMedicine: "Mancozeb 75% WP", dosage: "2g / Litre of Water", scanDate: daysFromNow(-2) },
    { farmer: farmer3._id, cropName: "Ragi", diseaseDetected: "Blast", confidencePercent: 98.8, recommendedMedicine: "Carbendazim", dosage: "25ml / 15L Water", scanDate: daysFromNow(-5) },
  ]);
  console.log("Disease scans seeded.");

  // ---------- SUBSIDIES ----------
  await Subsidy.create([
    { farmer: farmer1._id, schemeName: "PM-KISAN", amountEligible: 2000, status: "released", releasedAmount: 2000, assignedOfficer: admin._id, applicationDate: daysFromNow(-30) },
    { farmer: farmer2._id, schemeName: "Krishi Yantra Dhare (Tractor Subsidy)", amountEligible: 45000, status: "officer_approved", assignedOfficer: admin._id, applicationDate: daysFromNow(-15) },
    { farmer: farmer3._id, schemeName: "Drip Irrigation Subsidy", amountEligible: 35000, status: "ai_verified", applicationDate: daysFromNow(-5) },
  ]);
  console.log("Subsidies seeded.");

  // ---------- WEATHER ALERTS ----------
  await WeatherAlert.create([
    { district: "Bengaluru Rural", taluk: "Devanahalli", alertType: "Heavy Rain", severity: "High", description: "Heavy rain expected in the next 24 hours.", recommendations: ["Avoid Spraying", "Delay Irrigation", "Harvest if possible"], validUntil: daysFromNow(2) },
    { district: "Chikkaballapura", taluk: "Gauribidanur", alertType: "High Temperature", severity: "Moderate", description: "Temperatures rising above 38°C.", recommendations: ["Ensure adequate irrigation", "Provide shade for sensitive crops"], validUntil: daysFromNow(4) },
  ]);
  console.log("Weather alerts seeded.");

  // ---------- DAIRY MANAGEMENT ----------
  const cow1 = await Cow.create({
    farmer: farmer1._id,
    tagId: "KA-04-1234",
    breed: "HF",
    ageYears: 4,
    weightKg: 450,
    pregnancyStatus: "Not Pregnant",
    healthStatus: "Healthy",
    lastVaccinationDate: daysFromNow(-45)
  });

  const cow2 = await Cow.create({
    farmer: farmer1._id,
    tagId: "KA-04-5678",
    breed: "Jersey",
    ageYears: 3,
    weightKg: 400,
    pregnancyStatus: "Pregnant",
    healthStatus: "Healthy",
    lastVaccinationDate: daysFromNow(-120)
  });

  await MilkRecord.create([
    {
      farmer: farmer1._id,
      cow: cow1._id,
      date: daysFromNow(-1),
      morningQuantityLiters: 8.5,
      eveningQuantityLiters: 7.2,
      totalQuantityLiters: 15.7,
      fatPercentage: 3.8,
      snfPercentage: 8.5,
      pricePerLiter: 32,
      totalRevenue: 502.4
    },
    {
      farmer: farmer1._id,
      cow: cow2._id,
      date: daysFromNow(-1),
      morningQuantityLiters: 6.0,
      eveningQuantityLiters: 5.5,
      totalQuantityLiters: 11.5,
      fatPercentage: 4.2,
      snfPercentage: 8.7,
      pricePerLiter: 34,
      totalRevenue: 391.0
    }
  ]);

  await DairyMarketplace.create({
    seller: farmer2._id,
    cow: cow1._id, // mock data link
    expectedPrice: 45000,
    milkCapacityLiters: 14,
    hasHealthCertificate: true,
    location: "Kundana, Devanahalli"
  });

  console.log("Dairy management seeded.");

  // ---------- SMART POWER MANAGEMENT ----------
  await PowerSchedule.create([
    {
      district: "Bengaluru Rural",
      taluk: "Devanahalli",
      hobli: "Kundana",
      village: "All Villages",
      pinCode: "562110",
      morningSupplyStart: "06:00",
      morningSupplyEnd: "10:00",
      afternoonSupplyStart: "14:00",
      afternoonSupplyEnd: "16:00",
      nightSupplyStart: "22:00",
      nightSupplyEnd: "02:00",
      provider: "BESCOM",
      status: "Active"
    },
    {
      district: "Chikkaballapura",
      taluk: "Gauribidanur",
      hobli: "Kasaba",
      village: "All Villages",
      pinCode: "561208",
      morningSupplyStart: "05:00",
      morningSupplyEnd: "09:00",
      afternoonSupplyStart: "13:00",
      afternoonSupplyEnd: "15:00",
      nightSupplyStart: "23:00",
      nightSupplyEnd: "03:00",
      provider: "BESCOM",
      status: "Active"
    }
  ]);

  await PowerOutageReport.create({
    farmer: farmer1._id,
    district: "Bengaluru Rural",
    taluk: "Devanahalli",
    village: "Kundana",
    outageTime: daysFromNow(-0.5),
    status: "Investigating",
    description: "Transformer spark, no power since afternoon.",
    gpsCoordinates: "13.245, 77.712"
  });
  
  console.log("Power management seeded.");

  console.log("\n=== SEED COMPLETE ===");
  console.log("\nDemo Login Credentials:");
  console.log("Admin   -> phone: 9900000001  password: admin123");
  console.log("Vendor  -> phone: 9900000002  password: vendor123");
  console.log("Farmer  -> phone: 9900000003  password: farmer123  (Varun Gowda)");
  console.log("Farmer  -> phone: 9900000004  password: farmer123  (Manjunatha K)");
  console.log("Farmer  -> phone: 9900000005  password: farmer123  (Ramakka Hosalli)");
  console.log("\nTry scanning barcode 8901030899999 in the Fake Pesticide Detector -> should show COUNTERFEIT");
  console.log("Try scanning barcode 8901030875315 -> should show GENUINE\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
