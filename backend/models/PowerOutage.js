import mongoose from "mongoose";

const powerOutageSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    village: { type: String, trim: true },
    taluk: { type: String, trim: true },
    district: { type: String, trim: true },
    pinCode: { type: String, trim: true },
    details: { type: String },
    photo: { type: String }, // Base64 image
    latitude: { type: Number },
    longitude: { type: Number },
    status: {
      type: String,
      enum: ["Reported", "Under Investigation", "Resolved"],
      default: "Reported",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PowerOutage", powerOutageSchema);
