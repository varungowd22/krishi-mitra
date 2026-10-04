import mongoose from "mongoose";

const IrrigationSlotSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    canalName: { type: String, required: true },
    fieldSurveyNumber: { type: String, required: true },
    landAcres: { type: Number, required: true },
    turnDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationHours: { type: Number, required: true },
    status: { type: String, enum: ["scheduled", "completed", "missed"], default: "scheduled" },
    rotationCycleNumber: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("IrrigationSlot", IrrigationSlotSchema);
