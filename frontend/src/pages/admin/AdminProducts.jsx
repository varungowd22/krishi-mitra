import { useEffect, useState } from "react";
import { Plus, X, Ban } from "lucide-react";
import api from "../../utils/api.js";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [scans, setScans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ barcode: "", productName: "", productType: "pesticide", manufacturer: "", batchNumber: "", govtRegistrationNumber: "", registrationValidTill: "", activeIngredient: "" });

  const load = async () => {
    const [p, s] = await Promise.all([api.get("/products"), api.get("/products/scans/counterfeit-report")]);
    setProducts(p.data);
    setScans(s.data);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", form);
      setShowForm(false);
      setForm({ barcode: "", productName: "", productType: "pesticide", manufacturer: "", batchNumber: "", govtRegistrationNumber: "", registrationValidTill: "", activeIngredient: "" });
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Product was not saved.");
    }
  };

  const handleFlag = async (id) => {
    try {
      await api.put(`/products/${id}/flag`);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Product status was not saved.");
    }
  };

  return (
    <div>
      <div className="km-card" style={{ marginBottom: 16 }}>
        <div className="km-card-title">
          <h3 style={{ fontSize: "1.05rem" }}>Approved Product Registry</h3>
          <button className="km-btn km-btn--accent" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Register Product"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 16, background: "var(--km-paper-dim)", borderRadius: 5 }}>
            <div className="km-grid km-grid-2">
              <div className="km-field"><label className="km-label">Barcode</label><input className="km-input" required value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></div>
              <div className="km-field"><label className="km-label">Product Name</label><input className="km-input" required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></div>
              <div className="km-field">
                <label className="km-label">Product Type</label>
                <select className="km-select" value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
                  <option value="pesticide">Pesticide</option>
                  <option value="seed">Seed</option>
                  <option value="fertilizer">Fertilizer</option>
                </select>
              </div>
              <div className="km-field"><label className="km-label">Manufacturer</label><input className="km-input" required value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></div>
              <div className="km-field"><label className="km-label">Batch Number</label><input className="km-input" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} /></div>
              <div className="km-field"><label className="km-label">Govt Registration No.</label><input className="km-input" required value={form.govtRegistrationNumber} onChange={(e) => setForm({ ...form, govtRegistrationNumber: e.target.value })} /></div>
              <div className="km-field"><label className="km-label">Reg. Valid Till</label><input className="km-input" type="date" value={form.registrationValidTill} onChange={(e) => setForm({ ...form, registrationValidTill: e.target.value })} /></div>
              <div className="km-field"><label className="km-label">Active Ingredient</label><input className="km-input" value={form.activeIngredient} onChange={(e) => setForm({ ...form, activeIngredient: e.target.value })} /></div>
            </div>
            <button type="submit" className="km-btn km-btn--primary">Save</button>
          </form>
        )}

        <div style={{ overflowX: "auto" }}>
          <table className="km-table">
            <thead><tr><th>Barcode</th><th>Product</th><th>Manufacturer</th><th>Reg. No.</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{p.barcode}</td>
                  <td>{p.productName}</td><td>{p.manufacturer}</td><td>{p.govtRegistrationNumber}</td>
                  <td style={{ color: p.isApproved ? "var(--km-success)" : "var(--km-alert)", fontWeight: 600 }}>{p.isApproved ? "Approved" : "Flagged"}</td>
                  <td>{p.isApproved && <button onClick={() => handleFlag(p._id)} style={{ background: "none", border: "none", color: "var(--km-alert)" }} title="Flag as counterfeit"><Ban size={16} /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="km-card">
        <div className="km-card-title"><h3 style={{ fontSize: "1.05rem" }}>Counterfeit Scan Reports</h3></div>
        {scans.length === 0 ? <p className="km-empty">No counterfeit scans reported.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table className="km-table">
              <thead><tr><th>Reported By</th><th>Village</th><th>Barcode</th><th>Result</th><th>Date</th></tr></thead>
              <tbody>
                {scans.map((s) => (
                  <tr key={s._id}>
                    <td>{s.scannedBy?.name}</td><td>{s.scannedBy?.village}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{s.barcode}</td>
                    <td style={{ color: "var(--km-alert)", fontWeight: 600, textTransform: "capitalize" }}>{s.result.replace(/_/g, " ")}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
