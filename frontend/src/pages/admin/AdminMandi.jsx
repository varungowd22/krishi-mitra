import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import api from "../../utils/api.js";

export default function AdminMandi() {
  const [prices, setPrices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cropName: "", cropNameKannada: "", mandiName: "", district: "", minPrice: "", maxPrice: "", modalPrice: "", trend: "stable", changePercent: "" });

  const load = async () => {
    const { data } = await api.get("/ams/mandi");
    setPrices(data);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/ams/mandi", {
        ...form,
        minPrice: Number(form.minPrice),
        maxPrice: Number(form.maxPrice),
        modalPrice: Number(form.modalPrice),
        changePercent: Number(form.changePercent) || 0,
      });
      setShowForm(false);
      setForm({ cropName: "", cropNameKannada: "", mandiName: "", district: "", minPrice: "", maxPrice: "", modalPrice: "", trend: "stable", changePercent: "" });
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Mandi price was not saved.");
    }
  };

  return (
    <div className="km-card">
      <div className="km-card-title">
        <h3 style={{ fontSize: "1.05rem" }}>Mandi Price Management</h3>
        <button className="km-btn km-btn--accent" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Price Entry"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 16, background: "var(--km-paper-dim)", borderRadius: 5 }}>
          <div className="km-grid km-grid-3">
            <div className="km-field"><label className="km-label">Crop Name</label><input className="km-input" required value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Crop Name (Kannada)</label><input className="km-input" value={form.cropNameKannada} onChange={(e) => setForm({ ...form, cropNameKannada: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Mandi Name</label><input className="km-input" required value={form.mandiName} onChange={(e) => setForm({ ...form, mandiName: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">District</label><input className="km-input" required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Min Price (₹)</label><input className="km-input" type="number" required value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Max Price (₹)</label><input className="km-input" type="number" required value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} /></div>
            <div className="km-field"><label className="km-label">Modal Price (₹)</label><input className="km-input" type="number" required value={form.modalPrice} onChange={(e) => setForm({ ...form, modalPrice: e.target.value })} /></div>
            <div className="km-field">
              <label className="km-label">Trend</label>
              <select className="km-select" value={form.trend} onChange={(e) => setForm({ ...form, trend: e.target.value })}>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="stable">Stable</option>
              </select>
            </div>
            <div className="km-field"><label className="km-label">Change %</label><input className="km-input" type="number" step="0.1" value={form.changePercent} onChange={(e) => setForm({ ...form, changePercent: e.target.value })} /></div>
          </div>
          <button type="submit" className="km-btn km-btn--primary">Save</button>
        </form>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="km-table">
          <thead><tr><th>Crop</th><th>Mandi</th><th>District</th><th>Modal Price</th><th>Trend</th></tr></thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p._id}>
                <td>{p.cropName}</td><td>{p.mandiName}</td><td>{p.district}</td><td>₹{p.modalPrice}</td><td style={{ textTransform: "capitalize" }}>{p.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
