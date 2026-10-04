import { useEffect, useState } from "react";
import api from "../../utils/api.js";
import StampBadge from "../../components/StampBadge.jsx";

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const STATUS_OPTIONS = ["submitted", "under_review", "field_inspection", "approved", "rejected", "paid"];

export default function AdminInsurance() {
  const [claims, setClaims] = useState([]);
  const [editing, setEditing] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "", note: "", approvedAmount: "", rejectionReason: "" });

  const load = async () => {
    const { data } = await api.get("/ams/insurance/all");
    setClaims(data);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (claim) => {
    setEditing(claim._id);
    setStatusForm({ status: claim.status, note: "", approvedAmount: claim.approvedAmount || "", rejectionReason: claim.rejectionReason || "" });
  };

  const handleUpdate = async (id) => {
    try {
      await api.patch(`/ams/insurance/${id}`, {
        ...statusForm,
        approvedAmount: statusForm.approvedAmount ? Number(statusForm.approvedAmount) : undefined,
      });
      setEditing(null);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Insurance claim update was not saved.");
    }
  };

  return (
    <div className="km-card">
      <div className="km-card-title"><h3 style={{ fontSize: "1.05rem" }}>Crop Insurance Claims — Review Queue</h3></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {claims.map((c) => (
          <div key={c._id} style={{ border: "1px solid var(--km-line)", borderRadius: 5, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <strong>{c.farmer?.name}</strong> — {c.cropName} ({c.policyNumber})
                <div style={{ fontSize: "0.78rem", color: "var(--km-ink-soft)" }}>
                  {c.farmer?.village}, {c.farmer?.taluk} · {c.damageType.replace(/_/g, " ")} · {c.damagePercent}% damage · Filed {fmtDate(c.createdAt)}
                </div>
              </div>
              <StampBadge status={c.status} />
            </div>
            {c.description && <p style={{ fontSize: "0.85rem", marginTop: 8 }}>{c.description}</p>}
            {c.photos?.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {c.photos.map((p, i) => <img key={i} src={p} alt="evidence" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 4 }} />)}
              </div>
            )}

            {editing === c._id ? (
              <div style={{ marginTop: 12, padding: 12, background: "var(--km-paper-dim)", borderRadius: 5 }}>
                <div className="km-grid km-grid-3">
                  <div className="km-field">
                    <label className="km-label">New Status</label>
                    <select className="km-select" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  {statusForm.status === "approved" && (
                    <div className="km-field"><label className="km-label">Approved Amount (₹)</label><input className="km-input" type="number" value={statusForm.approvedAmount} onChange={(e) => setStatusForm({ ...statusForm, approvedAmount: e.target.value })} /></div>
                  )}
                  {statusForm.status === "rejected" && (
                    <div className="km-field"><label className="km-label">Rejection Reason</label><input className="km-input" value={statusForm.rejectionReason} onChange={(e) => setStatusForm({ ...statusForm, rejectionReason: e.target.value })} /></div>
                  )}
                </div>
                <div className="km-field"><label className="km-label">Note</label><input className="km-input" value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="km-btn km-btn--primary" onClick={() => handleUpdate(c._id)}>Update Status</button>
                  <button className="km-btn km-btn--outline" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="km-btn km-btn--outline" style={{ marginTop: 10, fontSize: "0.8rem" }} onClick={() => openEdit(c)}>Update Status</button>
            )}
          </div>
        ))}
        {claims.length === 0 && <p className="km-empty">No claims submitted yet.</p>}
      </div>
    </div>
  );
}
