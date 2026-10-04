import mongoose from "mongoose";

const powerNoticeSchema = new mongoose.Schema(
  {
    titleEn: { type: String, required: true },
    titleKn: { type: String, required: true },
    contentEn: { type: String },
    contentKn: { type: String },
    noticeType: {
      type: String,
      enum: ["maintenance", "loadShedding", "outageAlert"],
      required: true,
    },
    scheduledDate: { type: Date },
    durationEn: { type: String },
    durationKn: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PowerNotice", powerNoticeSchema);
