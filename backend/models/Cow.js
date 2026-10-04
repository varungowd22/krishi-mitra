import mongoose from "mongoose";

const CowSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tagId: { type: String, required: true },
    breed: { type: String, required: true },
    ageYears: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    pregnancyStatus: { type: String, required: true },
    healthStatus: { type: String, required: true },
    lastVaccinationDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Cow", CowSchema);
