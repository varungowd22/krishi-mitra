import mongoose from "mongoose";

const SoilTestSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nitrogenLevel: { type: String, required: true },
    phosphorusLevel: { type: String, required: true },
    potassiumLevel: { type: String, required: true },
    phValue: { type: Number, required: true },
    recommendedFertilizers: [
      {
        name: { type: String, required: true },
        quantityKg: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SoilTest", SoilTestSchema);
