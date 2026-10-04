import mongoose from "mongoose";

const WeatherNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventKey: { type: String, required: true },
    alertType: { type: String, enum: ["rain", "frost", "heat"], required: true },
    forecastDate: { type: String, required: true },
    message: { type: String, required: true },
    smsSentAt: { type: Date },
    whatsappSentAt: { type: Date },
  },
  { timestamps: true }
);

WeatherNotificationSchema.index({ user: 1, eventKey: 1 }, { unique: true });

export default mongoose.model("WeatherNotification", WeatherNotificationSchema);
