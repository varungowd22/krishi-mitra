import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import amsRoutes from "./routes/amsRoutes.js";
import powerRoutes from "./routes/powerRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import irrigationRoutes from "./routes/irrigationRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import weatherAlertRoutes from "./routes/weatherAlertRoutes.js";
import { checkAndSendWeatherAlerts } from "./services/weatherAlerts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // higher limit for base64 photo evidence
app.use(morgan("dev"));

app.use((req, res, next) => {
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  const readOnlyPostRoutes = [
    "/api/auth/login",
    "/api/loans/check-eligibility",
    "/api/loans/dairy-estimate",
  ];
  if (!isWrite || readOnlyPostRoutes.includes(req.path)) return next();
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    message: "Unable to complete this action right now. Please try again later.",
    code: "DATABASE_UNAVAILABLE",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/irrigation", irrigationRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/ams", amsRoutes);
app.use("/api/power", powerRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/weather-alerts", weatherAlertRoutes);

app.get("/api/health", (req, res) => res.json({
  status: "Krishi Mitra API running",
  database: mongoose.connection.readyState === 1 ? "connected" : "unavailable",
}));
app.get("/", (req, res) => res.send("Krishi Mitra API is running"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    void checkAndSendWeatherAlerts();
  })
  .catch((err) => console.error("MongoDB connection error. Starting without DB:", err.message));

const weatherAlertInterval = setInterval(() => {
  void checkAndSendWeatherAlerts();
}, 30 * 60 * 1000);
weatherAlertInterval.unref();

mongoose.connection.on("connected", () => {
  void checkAndSendWeatherAlerts();
});

app.listen(PORT, () => console.log(`Krishi Mitra server running on port ${PORT}`));
