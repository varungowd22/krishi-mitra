import mongoose from "mongoose";

const sosAlertSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emergencyType: { type: String, required: true, trim: true, maxlength: 80 },
    location: {
      address: { type: String, trim: true },
    },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("SOSAlert", sosAlertSchema);
