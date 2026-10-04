import mongoose from "mongoose";

const DairyMarketplaceSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cow: { type: mongoose.Schema.Types.ObjectId, ref: "Cow", required: true },
    expectedPrice: { type: Number, required: true },
    milkCapacityLiters: { type: Number, required: true },
    hasHealthCertificate: { type: Boolean, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("DairyMarketplace", DairyMarketplaceSchema);
