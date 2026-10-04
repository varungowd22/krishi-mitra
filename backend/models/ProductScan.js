import mongoose from "mongoose";

const productScanSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    barcode: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    result: {
      type: String,
      enum: ["genuine", "counterfeit", "not_found", "expired_registration"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProductScan", productScanSchema);
