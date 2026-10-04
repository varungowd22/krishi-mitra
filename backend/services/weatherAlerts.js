import mongoose from "mongoose";
import { Buffer } from "node:buffer";
import User from "../models/User.js";
import WeatherNotification from "../models/WeatherNotification.js";

const RAIN_CHANCE_THRESHOLD = 70;
const FROST_TEMPERATURE_THRESHOLD = 2;
const HEAT_TEMPERATURE_THRESHOLD = 38;
const FORECAST_DAYS = 3;

export function getWeatherAlertEvents(forecast) {
  return forecast.time.flatMap((date, index) => {
    const precipitationChance = forecast.precipitation_probability_max[index];
    const minTemperature = forecast.temperature_2m_min[index];
    const maxTemperature = forecast.temperature_2m_max[index];
    const events = [];

    if (Number.isFinite(precipitationChance) && precipitationChance >= RAIN_CHANCE_THRESHOLD) {
      events.push({
        type: "rain",
        date,
        key: `rain:${date}`,
        severity: precipitationChance >= 90 ? "high" : "moderate",
        message: `Rain warning for ${date}: ${precipitationChance}% chance of rain. Protect harvested produce and avoid spraying before rainfall.`,
      });
    }
    if (Number.isFinite(minTemperature) && minTemperature <= FROST_TEMPERATURE_THRESHOLD) {
      events.push({
        type: "frost",
        date,
        key: `frost:${date}`,
        severity: minTemperature <= 0 ? "high" : "moderate",
        message: `Frost warning for ${date}: forecast low ${minTemperature}°C. Protect sensitive crops and young plants overnight.`,
      });
    }
    if (Number.isFinite(maxTemperature) && maxTemperature >= HEAT_TEMPERATURE_THRESHOLD) {
      events.push({
        type: "heat",
        date,
        key: `heat:${date}`,
        severity: maxTemperature >= 42 ? "high" : "moderate",
        message: `Heat warning for ${date}: forecast high ${maxTemperature}°C. Check irrigation and protect people and livestock from heat stress.`,
      });
    }
    return events;
  });
}

export async function getWeatherForecast(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "temperature_2m_min,temperature_2m_max,precipitation_probability_max",
    forecast_days: String(FORECAST_DAYS),
    timezone: "auto",
  });

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`Weather forecast provider returned HTTP ${response.status}`);
  }
  const data = await response.json();
  const daily = data.daily;
  if (
    !Array.isArray(daily?.time) || !Array.isArray(daily?.temperature_2m_min) ||
    !Array.isArray(daily?.temperature_2m_max) || !Array.isArray(daily?.precipitation_probability_max) ||
    !daily.time.length ||
    daily.temperature_2m_min.length !== daily.time.length ||
    daily.temperature_2m_max.length !== daily.time.length ||
    daily.precipitation_probability_max.length !== daily.time.length
  ) {
    throw new Error("Weather forecast provider returned incomplete daily data");
  }
  return {
    time: daily.time,
    temperature_2m_min: daily.temperature_2m_min,
    temperature_2m_max: daily.temperature_2m_max,
    precipitation_probability_max: daily.precipitation_probability_max,
  };
}

export function getWeatherDeliveryStatus() {
  const sms = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_FROM);
  const whatsapp = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);
  return { sms, whatsapp };
}

function toInternationalPhone(phone) {
  const normalized = String(phone || "").trim().replace(/[^\d+]/g, "");
  if (normalized.startsWith("+")) return normalized;
  if (/^\d{10}$/.test(normalized)) return `+91${normalized}`;
  if (/^91\d{10}$/.test(normalized)) return `+${normalized}`;
  throw new Error("Farmer phone number must use a valid international format");
}

async function sendTwilioMessage(channel, phone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = channel === "sms" ? process.env.TWILIO_SMS_FROM : process.env.TWILIO_WHATSAPP_FROM;
  if (!accountSid || !authToken || !from) throw new Error(`${channel} delivery is not configured`);

  const form = new URLSearchParams({
    To: channel === "whatsapp" ? `whatsapp:${toInternationalPhone(phone)}` : toInternationalPhone(phone),
    From: from,
    Body: message,
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Twilio ${channel} delivery failed with HTTP ${response.status}`);
  }
}

async function deliverWeatherEvent(user, event) {
  const eventKey = `${event.type}:${event.date}`;
  let notification = await WeatherNotification.findOne({ user: user._id, eventKey });
  if (!notification) {
    try {
      notification = await WeatherNotification.create({
        user: user._id,
        eventKey,
        alertType: event.type,
        forecastDate: event.date,
        message: event.message,
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      notification = await WeatherNotification.findOne({ user: user._id, eventKey });
    }
  }
  if (!notification) return;

  const { weatherAlertPreferences: preferences } = user;
  const deliveries = [
    { channel: "sms", enabled: preferences.sms, configured: getWeatherDeliveryStatus().sms, sentField: "smsSentAt" },
    { channel: "whatsapp", enabled: preferences.whatsapp, configured: getWeatherDeliveryStatus().whatsapp, sentField: "whatsappSentAt" },
  ];
  for (const delivery of deliveries) {
    if (!delivery.enabled || !delivery.configured || notification[delivery.sentField]) continue;
    try {
      await sendTwilioMessage(delivery.channel, user.phone, event.message);
      notification[delivery.sentField] = new Date();
      await notification.save();
    } catch (error) {
      console.error(`Weather ${delivery.channel} alert failed for user ${user._id} (${eventKey}):`, error.message);
    }
  }
}

let weatherCheckInProgress = false;

export async function checkAndSendWeatherAlerts() {
  if (weatherCheckInProgress || mongoose.connection.readyState !== 1) return;
  weatherCheckInProgress = true;
  try {
    await runWeatherAlertCheck();
  } catch (error) {
    console.error("Weather alert check failed:", error.message);
  } finally {
    weatherCheckInProgress = false;
  }
}

async function runWeatherAlertCheck() {
  if (mongoose.connection.readyState !== 1) return;
  const farmers = await User.find({
    role: "farmer",
    "weatherAlertPreferences.enabled": true,
    "weatherAlertPreferences.latitude": { $exists: true },
    "weatherAlertPreferences.longitude": { $exists: true },
  }).select("phone weatherAlertPreferences").lean();

  const configuredChannels = getWeatherDeliveryStatus();
  const needsSms = farmers.some((farmer) => farmer.weatherAlertPreferences.sms);
  const needsWhatsapp = farmers.some((farmer) => farmer.weatherAlertPreferences.whatsapp);
  if ((needsSms && !configuredChannels.sms) || (needsWhatsapp && !configuredChannels.whatsapp)) {
    console.warn("Some opted-in weather alert channels are not configured; messages will not be sent on those channels.");
  }

  for (const farmer of farmers) {
    try {
      const { latitude, longitude } = farmer.weatherAlertPreferences;
      const forecast = await getWeatherForecast(latitude, longitude);
      const events = getWeatherAlertEvents(forecast);
      for (const event of events) await deliverWeatherEvent(farmer, event);
    } catch (error) {
      console.error(`Could not check weather alerts for farmer ${farmer._id}:`, error.message);
    }
  }
}
