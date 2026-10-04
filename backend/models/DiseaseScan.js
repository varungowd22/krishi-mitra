import mongoose from "mongoose";

const DiseaseScanSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cropName: { type: String, required: true },
    diseaseDetected: { type: String, required: true },
    confidencePercent: { type: Number, required: true },
    recommendedMedicine: { type: String },
    dosage: { type: String },
    severity: { type: String, enum: ["low", "moderate", "high", "uncertain"] },
    visualFindings: [{ type: String }],
    recommendedActions: [{ type: String }],
    scanDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("DiseaseScan", DiseaseScanSchema);
