import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const insuranceClaimSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    policyNumber: { type: String, required: true, trim: true },
    cropName: { type: String, required: true, trim: true },
    surveyNumber: { type: String, trim: true }, // land survey/plot number
    landAcres: { type: Number, required: true },
    damageType: {
      type: String,
      enum: ["flood", "drought", "hailstorm", "pest_attack", "fire", "cyclone", "unseasonal_rain", "other"],
      required: true,
    },
    damagePercent: { type: Number, min: 0, max: 100, required: true },
    incidentDate: { type: Date, required: true },
    description: { type: String, trim: true },
    photos: [{ type: String }], // base64 evidence photos
    estimatedLossAmount: { type: Number },
    approvedAmount: { type: Number },
    status: {
      type: String,
      enum: ["submitted", "under_review", "field_inspection", "approved", "rejected", "paid"],
      default: "submitted",
    },
    rejectionReason: { type: String, trim: true },
    statusHistory: [statusHistorySchema],
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("InsuranceClaim", insuranceClaimSchema);
