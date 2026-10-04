import mongoose from "mongoose";

const SubsidySchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schemeName: { type: String, required: true },
    amountEligible: { type: Number, required: true },
    status: { type: String, required: true },
    releasedAmount: { type: Number },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applicationDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Subsidy", SubsidySchema);
