import { useEffect, useRef, useState } from "react";
import { AlertOctagon, BellRing, CheckCircle, Volume2, VolumeX } from "lucide-react";
import api from "../../utils/api.js";
import { createEmergencyAudioContext, playEmergencySiren } from "../../utils/emergencyAudio.js";

export default function AdminSOSMonitor() {
  const [alerts, setAlerts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const [soundError, setSoundError] = useState("");
  const audioContext = useRef(null);
  const knownAlertIds = useRef(null);
  const inFlight = useRef(false);
  const sirenTimers = useRef(new Set());

  useEffect(() => {
    let isMounted = true;
    const refreshAlerts = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const { data } = await api.get("/sos/active");
        if (!Array.isArray(data)) throw new Error("The SOS service returned an invalid alert list.");
        if (!isMounted) return;

        const currentIds = new Set(data.map((alert) => alert._id));
        const newAlerts = knownAlertIds.current
          ? data.filter((alert) => !knownAlertIds.current.has(alert._id))
          : data;
        knownAlertIds.current = currentIds;
        setAlerts(data);
        setLoadError("");

        if (newAlerts.length > 0) {
          if (audioContext.current?.state === "running") {
            const timer = window.setTimeout(() => {
              sirenTimers.current.delete(timer);
              try {
                playEmergencySiren(audioContext.current);
              } catch (error) {
                if (isMounted) setSoundError(error.message);
              }
            }, 3000);
            sirenTimers.current.add(timer);
          } else {
            setSoundError("New SOS received. Enable sound on this device to hear emergency alerts.");
          }

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            newAlerts.forEach((alert) => {
              try {
                const notification = new Notification(`Emergency SOS: ${alert.emergencyType}`, {
                  body: `${alert.farmer?.name || "Farmer"} · ${alert.location?.address || "Location not provided"}`,
                  tag: alert._id,
                });
                notification.onclick = () => window.focus();
              } catch (error) {
                console.warn("Could not show SOS browser notification:", error.message);
              }
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.response?.data?.message || "Unable to check for new SOS alerts.");
        }
      } finally {
        inFlight.current = false;
      }
    };

    void refreshAlerts();
    const timer = window.setInterval(() => void refreshAlerts(), 5000);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
      sirenTimers.current.forEach((sirenTimer) => window.clearTimeout(sirenTimer));
      sirenTimers.current.clear();
      void audioContext.current?.close();
    };
  }, []);

  const enableEmergencyNotifications = async () => {
    setSoundError("");
    try {
      audioContext.current = createEmergencyAudioContext();
      if (audioContext.current) {
        await audioContext.current.resume();
        setIsSoundEnabled(audioContext.current.state === "running");
      } else {
        setSoundError("This browser does not support emergency sound. Keep the officer dashboard open to see new alerts.");
      }

      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        setNotificationPermission(await Notification.requestPermission());
      }
    } catch (error) {
      setSoundError(error.message || "Could not enable emergency alerts on this device.");
    }
  };

  const resolveAlert = async (id) => {
    try {
      await api.patch(`/sos/${id}/resolve`);
      setAlerts((previousAlerts) => previousAlerts.filter((alert) => alert._id !== id));
      knownAlertIds.current?.delete(id);
    } catch (error) {
      setLoadError(error.response?.data?.message || "SOS resolution was not saved. Please try again.");
    }
  };

  return (
    <section className="km-card" aria-labelledby="sos-monitor-title" style={{ margin: "16px auto 0", width: "min(100% - 32px, 1200px)", borderLeft: "5px solid #d32f2f" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 id="sos-monitor-title" style={{ fontSize: "1.1rem", color: "#b42318", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <AlertOctagon /> Officer Emergency SOS Monitor
        </h2>
        <button type="button" className="km-btn km-btn--outline" onClick={enableEmergencyNotifications} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          {isSoundEnabled ? <BellRing size={16} /> : <Volume2 size={16} />}
          {isSoundEnabled ? "Emergency sound enabled" : "Enable emergency sound"}
        </button>
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--km-ink-soft)", margin: "8px 0" }}>
        Checks for new SOS alerts every 5 seconds while this officer dashboard is open. Browser notifications: {notificationPermission}.
      </p>
      {loadError && <p role="alert" style={{ color: "#b42318", margin: "8px 0" }}>{loadError}</p>}
      {soundError && <p role="status" style={{ color: "#8a4b00", margin: "8px 0" }}>{soundError}</p>}
      {alerts.length === 0 ? (
        <p role="status" style={{ margin: "8px 0 0", color: "var(--km-ink-soft)" }}>
          {loadError ? "SOS monitoring will resume when the service reconnects." : "No active emergency SOS alerts."}
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {alerts.map((alert) => (
            <article key={alert._id} className="km-card" style={{ borderLeft: "4px solid #d32f2f", background: "#fff5f5" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ color: "#b42318" }}>{alert.emergencyType}</strong>
                  <div style={{ marginTop: 5 }}><strong>Farmer:</strong> {alert.farmer?.name || "Unknown"} {alert.farmer?.phone ? `(${alert.farmer.phone})` : ""}</div>
                  <div style={{ marginTop: 4 }}><strong>Profile location:</strong> {alert.location?.address || "Not provided"}</div>
                  {alert.location?.address && (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.location.address)}`} target="_blank" rel="noreferrer">
                      Open location in Google Maps
                    </a>
                  )}
                  <div style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>Received: {new Date(alert.createdAt).toLocaleString()}</div>
                </div>
                <button type="button" onClick={() => resolveAlert(alert._id)} className="km-btn km-btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--km-success)" }}>
                  <CheckCircle size={16} /> Mark resolved
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, color: "var(--km-ink-soft)", fontSize: "0.75rem" }}>
        <VolumeX size={14} /> Keep this page open, enable sound, and allow browser notifications for device alerts. This does not contact emergency services.
      </div>
    </section>
  );
}
