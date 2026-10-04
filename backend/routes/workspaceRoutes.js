import express from "express";
import mongoose from "mongoose";
import { Buffer } from "node:buffer";
import UserWorkspace from "../models/UserWorkspace.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

const isValidModule = (module) => /^[a-z][a-z0-9-]{0,59}$/.test(module);

router.get("/:module", async (req, res) => {
  if (!isValidModule(req.params.module)) {
    return res.status(400).json({ message: "Invalid workspace module name" });
  }
  if (!mongoose.isValidObjectId(req.user._id)) {
    return res.status(503).json({ message: "Saved data is temporarily unavailable. Please try again later." });
  }
  try {
    const workspace = await UserWorkspace.findOne({
      user: req.user._id,
      module: req.params.module,
    }).lean();
    return res.json(workspace?.data ?? null);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load saved data" });
  }
});

router.put("/:module", async (req, res) => {
  if (!isValidModule(req.params.module)) {
    return res.status(400).json({ message: "Invalid workspace module name" });
  }
  if (!mongoose.isValidObjectId(req.user._id)) {
    return res.status(503).json({ message: "This change could not be saved. Please try again later." });
  }
  if (!Object.hasOwn(req.body, "data") || req.body.data === undefined) {
    return res.status(400).json({ message: "A data value is required" });
  }
  if (Buffer.byteLength(JSON.stringify(req.body.data), "utf8") > 1_000_000) {
    return res.status(413).json({ message: "Saved module data cannot exceed 1 MB" });
  }
  try {
    const workspace = await UserWorkspace.findOneAndUpdate(
      { user: req.user._id, module: req.params.module },
      { $set: { data: req.body.data } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json(workspace.data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to save data" });
  }
});

export default router;
