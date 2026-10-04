import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true, trim: true },
    productName: { type: String, required: true, trim: true },
    productType: { type: String, enum: ["pesticide", "seed", "fertilizer"], required: true },
    manufacturer: { type: String, required: true, trim: true },
    batchNumber: { type: String, trim: true },
    govtRegistrationNumber: { type: String, required: true, trim: true }, // CIB&RC reg no.
    registrationValidTill: { type: Date },
    isApproved: { type: Boolean, default: true },
    activeIngredient: { type: String, trim: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // vendor or admin who registered it
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
