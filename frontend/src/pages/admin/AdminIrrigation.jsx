import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import api from "../../utils/api.js";
import StampBadge from "../../components/StampBadge.jsx";

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function AdminIrrigation() {
  const [slots, setSlots] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ farmer: "", canalName: "", fieldSurveyNumber: "", landAcres: "", turnDate: "", startTime: "", endTime: "", durationHours: "", rotationCycleNumber: "1" });

  const load = async () => {
    const [slotsRes, farmersRes] = await Promise.all([
      api.get("/irrigation"),
      api.get("/users/farmers"),
    ]);
    setSlots(slotsRes.data);
    setFarmers(farmersRes.data);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/irrigation", { ...form, landAcres: Number(form.landAcres), durationHours: Number(form.durationHours), rotationCycleNumber: Number(form.rotationCycleNumber) });
      setShowForm(false);
      setForm({ farmer: "", canalName: "", fieldSurveyNumber: "", landAcres: "", turnDate: "", startTime: "", endTime: "", durationHours: "", rotationCycleNumber: "1" });
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Irrigation slot was not saved.");
    }
  };

  return (
    <div className="km-card">
      <div className="km-card-title">
        <h3 style={{ fontSize: "1.05rem" }}>Irrigation Rotation Schedule</h3>
        <button className="km-btn km-btn--accent" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Slot"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 16, background: "var(--km-paper-dim)", borderRadius: 5 }}>
          <div className="km-grid km-grid-3">
            <div className="km-field">
              <label className="km-label">Farmer</label>
              <select
                className="km-select"
                required
                value={form.farmer}
                onChange={(e) => {
                  const selected = farmers.find((f) => f._id === e.target.value);
                  setForm({
                    ...form,
                    farmer: e.target.value,
                    landAcres: selected ? selected.landAcres : form.landAcres,
                  });
                }}
              >
                <option value="">Select farmer...</option>
                {farmers.map((f) => (
                  <option key={f._id} value={f._id}>{f.name} — {f.village} ({f.landAcres} ac)</option>
                ))}
              </select>
            </div>
            <div className="km-field"><label className="km-label">Canal Name</label><input className="km-input" required value={form.canalName} onChange={(e) => setForm({ ...form, canalName: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Field Survey No.</label><input className="km-input" value={form.fieldSurveyNumber} onChange={(e) => setForm({ ...form, fieldSurveyNumber: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Land Acres</label><input className="km-input" type="number" step="0.1" required value={form.landAcres} onChange={(e) => setForm({ ...form, landAcres: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Turn Date</label><input className="km-input" type="date" required value={form.turnDate} onChange={(e) => setForm({ ...form, turnDate: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Rotation Cycle #</label><input className="km-input" type="number" value={form.rotationCycleNumber} onChange={(e) => setForm({ ...form, rotationCycleNumber: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Start Time</label><input className="km-input" type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">End Time</label><input className="km-input" type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Duration (hours)</label><input className="km-input" type="number" step="0.5" required value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} /></div>
          </div>
          <button type="submit" className="km-btn km-btn--primary">Save</button>
        </form>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="km-table">
          <thead><tr><th>Farmer</th><th>Canal</th><th>Date</th><th>Time</th><th>Acres</th><th>Status</th></tr></thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s._id}>
                <td>{s.farmer?.name}</td><td>{s.canalName}</td><td>{fmtDate(s.turnDate)}</td><td>{s.startTime}–{s.endTime}</td><td>{s.landAcres}</td>
                <td><StampBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {slots.length === 0 && <p className="km-empty">No irrigation slots scheduled yet.</p>}
      </div>
    </div>
  );
}
