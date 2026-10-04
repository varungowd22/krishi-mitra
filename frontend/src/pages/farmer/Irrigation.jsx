import { useEffect, useState } from "react";
import { Droplets, Clock, RefreshCw } from "lucide-react";
import api from "../../utils/api.js";
import { useLang } from "../../context/LangContext.jsx";
import StampBadge from "../../components/StampBadge.jsx";

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function Irrigation() {
  const { t } = useLang();
  const [mySlots, setMySlots] = useState([]);
  const [canalSchedule, setCanalSchedule] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setLoadError("");
    setScheduleError("");
    let loadedMySlotsSuccessfully = false;
    try {
      const { data } = await api.get("/irrigation/my");
      if (!Array.isArray(data)) {
        throw new Error("The irrigation service returned an invalid schedule.");
      }
      loadedMySlotsSuccessfully = true;
      setMySlots(data);
      if (data.length === 0) {
        setMySlots([]);
        setCanalSchedule([]);
        return;
      }

      const canalNames = [...new Set(data.map((slot) => slot.canalName).filter(Boolean))];
      const schedules = await Promise.all(canalNames.map(async (canalName) => {
        const { data: schedule } = await api.get(`/irrigation/canal/${encodeURIComponent(canalName)}`);
        if (!Array.isArray(schedule)) {
          throw new Error(`The ${canalName} canal schedule is unavailable.`);
        }
        return schedule;
      }));
      setCanalSchedule(schedules.flat());
    } catch (err) {
      if (loadedMySlotsSuccessfully) {
        setScheduleError(err.response?.data?.message || err.message || "Unable to load the canal rotation schedule.");
      } else {
        setLoadError(err.response?.data?.message || err.message || "Unable to load saved irrigation data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upcoming = mySlots.filter((s) => s.status === "scheduled" || s.status === "in_progress");
  const past = mySlots.filter((s) => s.status === "completed" || s.status === "missed" || s.status === "swapped");

  return (
    <div>
      {loadError && (
        <div role="alert" className="km-card" style={{ marginBottom: 16, color: "var(--km-alert)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>{loadError} Start or reconnect the database, then retry.</span>
          <button type="button" className="km-btn km-btn--outline" onClick={load} disabled={isLoading} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={15} className={isLoading ? "km-spin" : ""} /> {isLoading ? "Loading..." : "Retry"}
          </button>
        </div>
      )}
      <div className="km-card" style={{ marginBottom: 16 }}>
        <div className="km-card-title">
          <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}>
            <Droplets size={18} color="var(--km-forest)" /> {t("myTurn")}
          </h3>
          <button type="button" className="km-btn km-btn--outline" onClick={load} disabled={isLoading} aria-label="Refresh irrigation schedule" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={15} className={isLoading ? "km-spin" : ""} /> Refresh
          </button>
        </div>
        {isLoading && mySlots.length === 0 ? (
          <p role="status" className="km-empty">Loading your irrigation turns...</p>
        ) : loadError && mySlots.length === 0 ? (
          <p className="km-empty">Your assigned water turn cannot be shown until the irrigation service reconnects.</p>
        ) : upcoming.length === 0 ? (
          <p className="km-empty">No upcoming water turns assigned yet. Contact your irrigation officer to add your farm to the canal rotation.</p>
        ) : (
          <div className="km-grid km-grid-2">
            {upcoming.map((s) => (
              <div key={s._id} style={{ border: "2px solid var(--km-saffron)", borderRadius: 5, padding: 14, background: "rgba(224,141,36,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{s.canalName}</strong>
                  <StampBadge status={s.status} />
                </div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem" }}>
                  <Clock size={14} /> {fmtDate(s.turnDate)}, {s.startTime} – {s.endTime} ({s.durationHours}h)
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--km-ink-soft)", marginTop: 4 }}>
                  Field {s.fieldSurveyNumber} · {s.landAcres} acres · Rotation #{s.rotationCycleNumber}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="km-card" style={{ marginBottom: 16 }}>
        <div className="km-card-title">
          <h3 style={{ fontSize: "1.05rem" }}>{t("canalSchedule")}</h3>
        </div>
        {scheduleError && <p role="alert" style={{ color: "var(--km-alert)" }}>{scheduleError}</p>}
        {canalSchedule.length === 0 ? (
          <p className="km-empty">{loadError || scheduleError ? "Canal schedule is unavailable until the irrigation service reconnects." : "No canal rotation entries are available for your assigned turn yet."}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="km-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Village</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Acres</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {canalSchedule.map((s) => (
                  <tr key={s._id}>
                    <td>{s.farmer?.name}</td>
                    <td>{s.farmer?.village}</td>
                    <td>{fmtDate(s.turnDate)}</td>
                    <td>{s.startTime} – {s.endTime}</td>
                    <td>{s.landAcres}</td>
                    <td><StampBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="km-card">
          <div className="km-card-title">
            <h3 style={{ fontSize: "1.05rem" }}>Past Turns</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {past.map((s) => (
              <div key={s._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--km-line)" }}>
                <span>{fmtDate(s.turnDate)} · {s.startTime}–{s.endTime}</span>
                <StampBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
