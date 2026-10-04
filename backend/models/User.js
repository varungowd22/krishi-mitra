import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const weatherAlertPreferencesSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    sms: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    locationLabel: { type: String, trim: true, maxlength: 120 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 4 },
    role: {
      type: String,
      enum: ["farmer", "admin", "vendor"],
      default: "farmer",
    },
    village: { type: String, trim: true },
    taluk: { type: String, trim: true },
    district: { type: String, trim: true },
    age: { type: Number, min: 1, max: 120 },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    weatherAlertPreferences: { type: weatherAlertPreferencesSchema, default: () => ({}) },
    landAcres: { type: Number, default: 0 },
    farmerIdNumber: { type: String, trim: true }, // Govt farmer ID / Aadhaar-linked ref
    // Vendor specific
    shopName: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    // Admin specific
    designation: { type: String, trim: true }, // e.g. "Agriculture Officer"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
