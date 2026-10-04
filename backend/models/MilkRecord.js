import mongoose from "mongoose";

const MilkRecordSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cow: { type: mongoose.Schema.Types.ObjectId, ref: "Cow", required: true },
    date: { type: Date, required: true },
    morningQuantityLiters: { type: Number, required: true },
    eveningQuantityLiters: { type: Number, required: true },
    totalQuantityLiters: { type: Number, required: true },
    fatPercentage: { type: Number, required: true },
    snfPercentage: { type: Number, required: true },
    pricePerLiter: { type: Number, required: true },
    totalRevenue: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("MilkRecord", MilkRecordSchema);
