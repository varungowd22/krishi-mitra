import mongoose from "mongoose";

const WeatherAlertSchema = new mongoose.Schema(
  {
    district: { type: String, required: true },
    taluk: { type: String, required: true },
    alertType: { type: String, required: true },
    severity: { type: String, required: true },
    description: { type: String, required: true },
    recommendations: [{ type: String }],
    validUntil: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("WeatherAlert", WeatherAlertSchema);
