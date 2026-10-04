import mongoose from "mongoose";

const powerScheduleSchema = new mongoose.Schema(
  {
    district: { type: String, required: true },
    taluk: { type: String, required: true },
    hobli: { type: String },
    village: { type: String },
    pinCode: { type: String },
    morningSupplyStart: { type: String }, // e.g. "06:00"
    morningSupplyEnd: { type: String },   // e.g. "09:00"
    afternoonSupplyStart: { type: String },
    afternoonSupplyEnd: { type: String },
    nightSupplyStart: { type: String },
    nightSupplyEnd: { type: String },
    status: { type: String, enum: ["Active", "Maintenance", "Suspended"], default: "Active" },
    provider: { type: String, enum: ["BESCOM", "HESCOM", "MESCOM", "CESC", "GESCOM", "KPTCL"], default: "BESCOM" }
  },
  { timestamps: true }
);

export default mongoose.model("PowerSchedule", powerScheduleSchema);
