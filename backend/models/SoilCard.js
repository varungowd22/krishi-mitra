import mongoose from "mongoose";

const soilTestSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testDate: { type: Date, default: Date.now },
    nitrogenLevel: { type: String, enum: ["Low", "Normal", "High"], required: true },
    phosphorusLevel: { type: String, enum: ["Low", "Normal", "High"], required: true },
    potassiumLevel: { type: String, enum: ["Low", "Normal", "High"], required: true },
    phValue: { type: Number, required: true },
    recommendedFertilizers: [
      {
        name: { type: String },
        quantityKg: { type: Number }
      }
    ],
    advisoryAction: { type: String },
    status: { type: String, enum: ["pending", "analyzed"], default: "analyzed" }
  },
  { timestamps: true }
);

export default mongoose.model("SoilTest", soilTestSchema);
