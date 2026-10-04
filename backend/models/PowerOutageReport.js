import mongoose from "mongoose";

const PowerOutageReportSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    district: { type: String, required: true },
    taluk: { type: String, required: true },
    village: { type: String, required: true },
    outageTime: { type: Date, required: true },
    status: { type: String, required: true },
    description: { type: String, required: true },
    gpsCoordinates: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PowerOutageReport", PowerOutageReportSchema);
