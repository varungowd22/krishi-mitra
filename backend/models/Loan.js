import mongoose from "mongoose";

const repaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    paidOn: { type: Date, default: Date.now },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lenderName: { type: String, required: true, trim: true },
    lenderType: {
      type: String,
      enum: ["moneylender", "bank", "cooperative_society", "self_help_group", "other"],
      default: "moneylender",
    },
    lenderContact: { type: String, trim: true },
    principalAmount: { type: Number, required: true },
    interestRatePercent: { type: Number, required: true, default: 0 }, // annual %
    purpose: { type: String, trim: true }, // seeds, fertilizer, equipment etc
    takenOn: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    amountRepaid: { type: Number, default: 0 },
    repayments: [repaymentSchema],
    status: {
      type: String,
      enum: ["active", "overdue", "closed"],
      default: "active",
    },
    documentPhoto: { type: String }, // base64 or path of agreement photo
    riskFlag: { type: Boolean, default: false }, // true if interest > 30% (debt trap indicator)
  },
  { timestamps: true }
);

loanSchema.pre("save", function (next) {
  if (this.interestRatePercent > 30) this.riskFlag = true;
  const outstanding = this.principalAmount - this.amountRepaid;
  if (outstanding <= 0) {
    this.status = "closed";
  } else if (new Date() > this.dueDate) {
    this.status = "overdue";
  } else {
    this.status = "active";
  }
  next();
});

export default mongoose.model("Loan", loanSchema);
