import mongoose from "mongoose";

const MandiPriceSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    cropNameKannada: { type: String },
    mandiName: { type: String, required: true },
    district: { type: String, required: true },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    modalPrice: { type: Number, required: true },
    trend: { type: String, enum: ["up", "down", "stable"], default: "stable" },
    changePercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("MandiPrice", MandiPriceSchema);
