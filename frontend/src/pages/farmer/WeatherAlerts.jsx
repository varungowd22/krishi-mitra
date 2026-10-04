import { useCallback, useEffect, useState } from "react";
import { BellRing, CheckCircle2, CloudRain, LocateFixed, Snowflake, Sun, TriangleAlert } from "lucide-react";
import api from "../../utils/api.js";
import "./WeatherAlerts.css";

const DEFAULT_PREFERENCES = { enabled: false, sms: true, whatsapp: true };

const ALERT_META = {
  rain: { icon: CloudRain, label: "Heavy rain", color: "#2563eb" },
  frost: { icon: Snowflake, label: "Frost", color: "#0891b2" },
  heat: { icon: Sun, label: "High heat", color: "#c2410c" },
};

const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const temperature = (value) => Number.isFinite(value) ? `${Math.round(value)}°` : "—";

export default function WeatherAlerts({ farmerPhone }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [coordinates, setCoordinates] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [phone, setPhone] = useState(farmerPhone || "");
  const [delivery, setDelivery] = useState({ sms: false, whatsapp: false });
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadForecast = useCallback(async (latitude, longitude) => {
    const { data } = await api.get("/weather-alerts/forecast", { params: { latitude, longitude } });
    setForecast(data.forecast);
    setAlerts(data.alerts);
    setThresholds(data.thresholds);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get("/weather-alerts/preferences")
      .then(async ({ data }) => {
        if (cancelled) return;
        const savedPreferences = data.preferences || DEFAULT_PREFERENCES;
        setPreferences({
          enabled: Boolean(savedPreferences.enabled),
          sms: savedPreferences.sms !== false,
          whatsapp: Boolean(savedPreferences.whatsapp),
        });
        setPhone(data.phone || farmerPhone || "");
        setDelivery(data.delivery || { sms: false, whatsapp: false });
        if (Number.isFinite(savedPreferences.latitude) && Number.isFinite(savedPreferences.longitude)) {
          const location = { latitude: savedPreferences.latitude, longitude: savedPreferences.longitude };
          setCoordinates(location);
          setLocationLabel(savedPreferences.locationLabel || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
          try {
            await loadForecast(location.latitude, location.longitude);
          } catch {
            if (!cancelled) setErrorMessage("Local forecast is temporarily unavailable.");
          }
        }
      })
      .catch(() => {
        if (!cancelled) setErrorMessage("Weather settings could not be loaded. Check your connection and try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [farmerPhone, loadForecast]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setErrorMessage("This browser does not support GPS location.");
      return;
    }
    setErrorMessage("");
    setStatusMessage("");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const location = { latitude: coords.latitude, longitude: coords.longitude };
        setCoordinates(location);
        setLocationLabel(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
        try {
          await loadForecast(location.latitude, location.longitude);
        } catch {
          setErrorMessage("Could not load a forecast for this location. Check your internet connection and try again.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setErrorMessage(error.code === error.PERMISSION_DENIED
          ? "Allow location access in your browser to set your farm location."
          : "Could not determine your location. Please try again.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (preferences.enabled && !preferences.sms && !preferences.whatsapp) {
      setErrorMessage("Select SMS, WhatsApp, or both before enabling alerts.");
      return;
    }
    if (preferences.enabled && !coordinates) {
      setErrorMessage("Set your farm location before enabling local weather alerts.");
      return;
    }
    setErrorMessage("");
    setStatusMessage("");
    setIsSaving(true);
    try {
      const { data } = await api.put("/weather-alerts/preferences", {
        ...preferences,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        locationLabel,
      });
      setPreferences(data.preferences);
      setDelivery(data.delivery);
      setStatusMessage(preferences.enabled
        ? "Weather alert preferences saved."
        : "Weather alerts are turned off.");
    } catch (error) {
      setErrorMessage(error.response?.data?.code === "DATABASE_UNAVAILABLE"
        ? "Your account is offline right now, so alert settings were not saved. Please try again when it reconnects."
        : error.response?.data?.message || "Could not save weather alert preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const missingSelectedDelivery = (preferences.sms && !delivery.sms) || (preferences.whatsapp && !delivery.whatsapp);

  return (
    <section className="km-weather-alerts km-card" aria-labelledby="weather-alerts-title">
      <div className="km-weather-alerts__header">
        <div className="km-weather-alerts__heading">
          <span className="km-weather-alerts__icon"><BellRing size={20} /></span>
          <div>
            <span className="km-weather-alerts__eyebrow">BEFORE WEATHER DAMAGES YOUR CROPS</span>
            <h2 id="weather-alerts-title">Farm weather alerts</h2>
          </div>
        </div>
        <span className={`km-weather-alerts__badge ${preferences.enabled ? "is-active" : ""}`}>
          {preferences.enabled ? "Alerts on" : "Opt-in alerts"}
        </span>
      </div>

      <p className="km-weather-alerts__intro">
        Get local forecast warnings for heavy rain, frost, and high heat by SMS, WhatsApp, or both.
      </p>

      <form onSubmit={handleSave}>
        <div className="km-weather-alerts__location">
          <div>
            <span className="km-weather-alerts__label">Farm alert location</span>
            <strong>{locationLabel || "Set your location to preview local weather"}</strong>
            <small>Coordinates are used only to select the local forecast.</small>
          </div>
          <button className="km-btn km-btn--outline" type="button" disabled={isLocating} onClick={handleLocate}>
            <LocateFixed size={16} /> {isLocating ? "Locating..." : "Use GPS"}
          </button>
        </div>

        <div className="km-weather-alerts__channels">
          <label className="km-weather-alerts__toggle">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(event) => setPreferences((current) => ({ ...current, enabled: event.target.checked }))}
            />
            <span><strong>Enable weather alerts</strong><small>Daily forecast checks for the next 3 days.</small></span>
          </label>
          <label className="km-weather-alerts__toggle">
            <input
              type="checkbox"
              checked={preferences.sms}
              onChange={(event) => setPreferences((current) => ({ ...current, sms: event.target.checked }))}
            />
            <span><strong>SMS</strong><small>{phone ? `To ${phone}` : "Add a phone number to your profile"}</small></span>
            <span className={`km-weather-alerts__channel-status ${delivery.sms ? "is-ready" : ""}`}>{delivery.sms ? "Configured" : "Setup needed"}</span>
          </label>
          <label className="km-weather-alerts__toggle">
            <input
              type="checkbox"
              checked={preferences.whatsapp}
              onChange={(event) => setPreferences((current) => ({ ...current, whatsapp: event.target.checked }))}
            />
            <span><strong>WhatsApp</strong><small>{phone ? `To ${phone}` : "Add a phone number to your profile"}</small></span>
            <span className={`km-weather-alerts__channel-status ${delivery.whatsapp ? "is-ready" : ""}`}>{delivery.whatsapp ? "Configured" : "Setup needed"}</span>
          </label>
        </div>

        {missingSelectedDelivery && (
          <p className="km-weather-alerts__setup-note">
            {`Messaging delivery requires the project owner to configure the ${preferences.sms && !delivery.sms && preferences.whatsapp && !delivery.whatsapp ? "SMS and WhatsApp" : preferences.sms && !delivery.sms ? "SMS" : "WhatsApp"} provider. Preferences can be saved now; no messages will be claimed as sent until delivery is configured.`}
          </p>
        )}

        {errorMessage && <p className="km-weather-alerts__message is-error" role="alert">{errorMessage}</p>}
        {statusMessage && <p className="km-weather-alerts__message" role="status"><CheckCircle2 size={16} /> {statusMessage}</p>}

        <button className="km-btn km-btn--primary km-weather-alerts__save" type="submit" disabled={isLoading || isSaving}>
          {isSaving ? "Saving preferences..." : preferences.enabled ? "Save alert preferences" : "Save alert settings"}
        </button>
      </form>

      {thresholds && (
        <div className="km-weather-alerts__thresholds">
          <span><CloudRain size={15} /> Rain chance ≥ {thresholds.rainChance}%</span>
          <span><Snowflake size={15} /> Frost low ≤ {thresholds.frostMinTemperature}°C</span>
          <span><Sun size={15} /> Heat high ≥ {thresholds.heatMaxTemperature}°C</span>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="km-weather-alerts__forecast" aria-label="Three-day farm forecast">
          {forecast.map((day) => (
            <div className="km-weather-alerts__day" key={day.date}>
              <strong>{formatDate(day.date)}</strong>
              <span>{temperature(day.minTemperature)} / {temperature(day.maxTemperature)}C</span>
              <small>{Number.isFinite(day.rainChance) ? `${day.rainChance}% rain chance` : "Rain chance unavailable"}</small>
            </div>
          ))}
        </div>
      )}

      {alerts.length > 0 ? (
        <div className="km-weather-alerts__warnings" aria-label="Forecast warnings">
          {alerts.map((alert) => {
            const metadata = ALERT_META[alert.type];
            const Icon = metadata.icon;
            return (
              <div className="km-weather-alerts__warning" key={alert.key} style={{ "--alert-color": metadata.color }}>
                <Icon size={19} />
                <div><strong>{metadata.label} · {formatDate(alert.date)}</strong><p>{alert.message}</p></div>
              </div>
            );
          })}
        </div>
      ) : forecast.length > 0 ? (
        <p className="km-weather-alerts__clear"><CheckCircle2 size={16} /> No rain, frost, or heat warning thresholds reached in the next 3 days.</p>
      ) : (
        <p className="km-weather-alerts__hint"><TriangleAlert size={15} /> Set a farm location to preview upcoming warnings.</p>
      )}
      <p className="km-weather-alerts__disclaimer">Forecasts are estimates, not official emergency warnings. Check local advisories before taking action.</p>
    </section>
  );
}
