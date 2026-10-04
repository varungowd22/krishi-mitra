import express from "express";
import SOSAlert from "../models/SOSAlert.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.post("/trigger", allowRoles("farmer"), async (req, res) => {
  const emergencyType = typeof req.body.emergencyType === "string" ? req.body.emergencyType.trim() : "";
  if (!emergencyType) return res.status(400).json({ message: "Emergency type is required" });
  try {
    const alert = await SOSAlert.create({
      farmer: req.user._id,
      emergencyType,
      location: { address: req.user.address || [req.user.village, req.user.taluk, req.user.district].filter(Boolean).join(", ") },
    });
    return res.status(201).json({
      success: true,
      message: "SOS alert saved. No live emergency dispatch is configured; call 112 for immediate help.",
      caseId: `SOS-${alert._id}`,
      estimatedResponse: "15-30 minutes",
      emergencyType: alert.emergencyType,
      helpline: "112",
      alert,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save SOS alert" });
  }
});

router.get("/active", allowRoles("admin"), async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ status: "active" })
      .populate("farmer", "name phone")
      .sort({ createdAt: -1 })
      .lean();
    return res.json(alerts);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load active SOS alerts" });
  }
});

router.patch("/:id/resolve", allowRoles("admin"), async (req, res) => {
  try {
    const alert = await SOSAlert.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { $set: { status: "resolved", resolvedBy: req.user._id, resolvedAt: new Date() } },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: "Active SOS alert not found" });
    return res.json(alert);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid SOS alert ID" });
    return res.status(500).json({ message: "Failed to resolve SOS alert" });
  }
});

export default router;
