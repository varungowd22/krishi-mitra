import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/auth.js";
import { getWeatherAlertEvents, getWeatherDeliveryStatus, getWeatherForecast } from "../services/weatherAlerts.js";

const router = express.Router();
router.use(protect, allowRoles("farmer"));

router.get("/preferences", async (req, res) => {
  if (!mongoose.isValidObjectId(req.user._id)) {
    return res.status(503).json({ message: "Weather alerts require a database-backed farmer account." });
  }
  try {
    const user = await User.findById(req.user._id).select("phone weatherAlertPreferences").lean();
    if (!user) return res.status(404).json({ message: "Farmer account not found." });
    return res.json({
      phone: user.phone,
      preferences: user.weatherAlertPreferences,
      delivery: getWeatherDeliveryStatus(),
    });
  } catch (error) {
    console.error("Could not load weather alert preferences:", error.message);
    return res.status(500).json({ message: "Could not load weather alert settings." });
  }
});

router.put("/preferences", async (req, res) => {
  const { enabled, sms, whatsapp, latitude, longitude, locationLabel } = req.body;
  if (typeof enabled !== "boolean" || typeof sms !== "boolean" || typeof whatsapp !== "boolean") {
    return res.status(400).json({ message: "Choose whether to enable alerts and select at least one delivery channel." });
  }
  if (enabled && !sms && !whatsapp) {
    return res.status(400).json({ message: "Select SMS, WhatsApp, or both before enabling weather alerts." });
  }
  const hasCoordinates = latitude !== undefined && longitude !== undefined;
  if (enabled && (!hasCoordinates ||
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    return res.status(400).json({ message: "Set your farm location to receive local weather alerts." });
  }
  if (hasCoordinates && (
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180
  )) {
    return res.status(400).json({ message: "Provide valid farm coordinates." });
  }
  if (locationLabel !== undefined && (typeof locationLabel !== "string" || locationLabel.length > 120)) {
    return res.status(400).json({ message: "Farm location label must be 120 characters or fewer." });
  }
  if (!mongoose.isValidObjectId(req.user._id)) {
    return res.status(503).json({ message: "Weather alerts require a database-backed farmer account." });
  }
  try {
    const farmer = await User.findById(req.user._id).select("phone");
    if (!farmer) return res.status(404).json({ message: "Farmer account not found." });
    if (enabled && (!farmer.phone || !/^(?:\+\d{8,15}|(?:91)?\d{10})$/.test(farmer.phone.replace(/[\s()-]/g, "")))) {
      return res.status(400).json({ message: "Add a valid phone number to your farmer profile before enabling alerts." });
    }
    const preferences = {
      "weatherAlertPreferences.enabled": enabled,
      "weatherAlertPreferences.sms": sms,
      "weatherAlertPreferences.whatsapp": whatsapp,
    };
    if (hasCoordinates) {
      preferences["weatherAlertPreferences.latitude"] = latitude;
      preferences["weatherAlertPreferences.longitude"] = longitude;
      preferences["weatherAlertPreferences.locationLabel"] = locationLabel?.trim() || "Saved farm location";
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: preferences },
      { new: true, runValidators: true }
    ).select("phone weatherAlertPreferences").lean();
    if (!user) return res.status(404).json({ message: "Farmer account not found." });
    return res.json({
      phone: user.phone,
      preferences: user.weatherAlertPreferences,
      delivery: getWeatherDeliveryStatus(),
    });
  } catch (error) {
    console.error("Could not save weather alert preferences:", error.message);
    return res.status(500).json({ message: "Could not save weather alert settings." });
  }
});

router.get("/forecast", async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  if (
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180
  ) {
    return res.status(400).json({ message: "Provide valid farm coordinates for a forecast." });
  }
  try {
    const forecast = await getWeatherForecast(latitude, longitude);
    return res.json({
      forecast: forecast.time.map((date, index) => ({
        date,
        minTemperature: forecast.temperature_2m_min[index],
        maxTemperature: forecast.temperature_2m_max[index],
        rainChance: forecast.precipitation_probability_max[index],
      })),
      alerts: getWeatherAlertEvents(forecast),
      thresholds: { rainChance: 70, frostMinTemperature: 2, heatMaxTemperature: 38 },
    });
  } catch (error) {
    console.error("Could not load farm weather forecast:", error.message);
    return res.status(502).json({ message: "Weather forecast is temporarily unavailable." });
  }
});

export default router;
