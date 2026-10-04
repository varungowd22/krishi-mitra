import mongoose from "mongoose";

const userWorkspaceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    module: { type: String, required: true, trim: true, maxlength: 60 },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

userWorkspaceSchema.index({ user: 1, module: 1 }, { unique: true });

export default mongoose.model("UserWorkspace", userWorkspaceSchema);
