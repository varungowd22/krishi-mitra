import express from "express";
import Product from "../models/Product.js";
import ProductScan from "../models/ProductScan.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", allowRoles("admin", "vendor"), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load product registry" });
  }
});

router.post("/", allowRoles("admin", "vendor"), async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, addedBy: req.user._id });
    return res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Barcode is already registered" });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: "Failed to register product" });
  }
});

router.put("/:id/flag", allowRoles("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid product ID" });
    return res.status(500).json({ message: "Failed to update product status" });
  }
});

router.get("/scans/my", allowRoles("farmer"), async (req, res) => {
  try {
    const scans = await ProductScan.find({ farmer: req.user._id })
      .populate("product", "productName manufacturer")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json(scans.map((scan) => ({
      ...scan,
      scannedAt: scan.createdAt,
    })));
  } catch (err) {
    return res.status(500).json({ message: "Failed to load scan history" });
  }
});

router.get("/scans/counterfeit-report", allowRoles("admin"), async (req, res) => {
  try {
    const scans = await ProductScan.find({ result: { $in: ["counterfeit", "expired_registration"] } })
      .populate("farmer", "name village")
      .populate("product", "productName")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    return res.json(scans.map((scan) => ({
      ...scan,
      scannedBy: scan.farmer,
      scannedAt: scan.createdAt,
    })));
  } catch (err) {
    return res.status(500).json({ message: "Failed to load counterfeit scan report" });
  }
});

router.post("/scan", allowRoles("farmer"), async (req, res) => {
  const barcode = typeof req.body.barcode === "string" ? req.body.barcode.trim() : "";
  if (!barcode) return res.status(400).json({ message: "Barcode is required" });
  try {
    const product = await Product.findOne({ barcode });
    let result = "not_found";
    if (product) {
      if (!product.isApproved) result = "counterfeit";
      else if (product.registrationValidTill && product.registrationValidTill < new Date()) result = "expired_registration";
      else result = "genuine";
    }
    const scan = await ProductScan.create({
      farmer: req.user._id,
      product: product?._id,
      barcode,
      location: req.body.location,
      result,
    });
    return res.json({
      ...scan.toObject(),
      product: product ? {
        productName: product.productName,
        manufacturer: product.manufacturer,
        govtRegistrationNumber: product.govtRegistrationNumber,
        activeIngredient: product.activeIngredient,
      } : null,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save product scan" });
  }
});

export default router;
