import { useEffect, useState } from "react";
import { Plus, X, Camera, CheckCircle2, Clock } from "lucide-react";
import api from "../../utils/api.js";
import { useLang } from "../../context/LangContext.jsx";
import StampBadge from "../../components/StampBadge.jsx";

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const DAMAGE_TYPES = ["flood", "drought", "hailstorm", "pest_attack", "fire", "cyclone", "unseasonal_rain", "other"];

export default function InsuranceClaims() {
  const { t } = useLang();
  const [claims, setClaims] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [tracking, setTracking] = useState(null);
  const [form, setForm] = useState({
    policyNumber: "", cropName: "", surveyNumber: "", landAcres: "",
    damageType: "flood", damagePercent: "", incidentDate: "", description: "",
    estimatedLossAmount: "", photos: [],
  });

  const load = async () => {
    const { data } = await api.get("/ams/insurance");
    setClaims(data);
  };

  useEffect(() => { load(); }, []);

  const handlePhoto = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) => ({ ...f, photos: [...f.photos, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/ams/insurance", {
        ...form,
        landAcres: Number(form.landAcres),
        damagePercent: Number(form.damagePercent),
        estimatedLossAmount: Number(form.estimatedLossAmount) || undefined,
      });
      setShowForm(false);
      setForm({ policyNumber: "", cropName: "", surveyNumber: "", landAcres: "", damageType: "flood", damagePercent: "", incidentDate: "", description: "", estimatedLossAmount: "", photos: [] });
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Insurance claim was not saved.");
    }
  };

  const STEPS = ["submitted", "under_review", "field_inspection", "approved", "paid"];

  return (
    <div>
      <div className="km-card">
        <div className="km-card-title">
          <h3 style={{ fontSize: "1.05rem" }}>{t("insuranceClaims")}</h3>
          <button className="km-btn km-btn--accent" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? t("cancel") : t("fileClaim")}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 16, background: "var(--km-paper-dim)", borderRadius: 5 }}>
            <div className="km-grid km-grid-2">
              <div className="km-field">
                <label className="km-label">{t("policyNumber")}</label>
                <input className="km-input" required value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} placeholder="PMFBY-KA-..." />
              </div>
              <div className="km-field">
                <label className="km-label">{t("cropName")}</label>
                <input className="km-input" required value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })} />
              </div>
              <div className="km-field">
                <label className="km-label">Survey Number</label>
                <input className="km-input" value={form.surveyNumber} onChange={(e) => setForm({ ...form, surveyNumber: e.target.value })} />
              </div>
              <div className="km-field">
                <label className="km-label">{t("landAcres")}</label>
                <input className="km-input" type="number" step="0.1" required value={form.landAcres} onChange={(e) => setForm({ ...form, landAcres: e.target.value })} />
              </div>
              <div className="km-field">
                <label className="km-label">{t("damageType")}</label>
                <select className="km-select" value={form.damageType} onChange={(e) => setForm({ ...form, damageType: e.target.value })}>
                  {DAMAGE_TYPES.map((d) => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="km-field">
                <label className="km-label">{t("damagePercent")}</label>
                <input className="km-input" type="number" min="0" max="100" required value={form.damagePercent} onChange={(e) => setForm({ ...form, damagePercent: e.target.value })} />
              </div>
              <div className="km-field">
                <label className="km-label">Incident Date</label>
                <input className="km-input" type="date" required value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} />
              </div>
              <div className="km-field">
                <label className="km-label">Estimated Loss (₹)</label>
                <input className="km-input" type="number" value={form.estimatedLossAmount} onChange={(e) => setForm({ ...form, estimatedLossAmount: e.target.value })} />
              </div>
            </div>
            <div className="km-field">
              <label className="km-label">Description</label>
              <textarea className="km-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="km-field">
              <label className="km-label">{t("uploadPhoto")}</label>
              <label className="km-btn km-btn--outline" style={{ cursor: "pointer", display: "inline-flex" }}>
                <Camera size={16} /> Choose Photos
                <input type="file" accept="image/*" multiple onChange={handlePhoto} style={{ display: "none" }} />
              </label>
              {form.photos.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {form.photos.map((p, i) => (
                    <img key={i} src={p} alt="evidence" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid var(--km-line)" }} />
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="km-btn km-btn--primary">{t("submit")}</button>
          </form>
        )}

        {claims.length === 0 ? (
          <p className="km-empty">No claims filed yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {claims.map((c) => (
              <div key={c._id} style={{ border: "1px solid var(--km-line)", borderRadius: 5, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <strong>{c.cropName}</strong> — {c.policyNumber}
                    <div style={{ fontSize: "0.78rem", color: "var(--km-ink-soft)", textTransform: "capitalize" }}>
                      {c.damageType.replace(/_/g, " ")} · {c.damagePercent}% damage · {fmtDate(c.incidentDate)}
                    </div>
                  </div>
                  <StampBadge status={c.status} />
                </div>
                <button className="km-btn km-btn--outline" style={{ marginTop: 10, fontSize: "0.8rem" }} onClick={() => setTracking(tracking === c._id ? null : c._id)}>
                  {t("trackClaim")}
                </button>
                {tracking === c._id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--km-line)" }}>
                    {STEPS.map((step, i) => {
                      const hist = c.statusHistory.find((h) => h.status === step);
                      const reached = c.statusHistory.some((h) => h.status === step) || (step === "approved" && c.status === "paid");
                      const isRejectedPath = c.status === "rejected" && i > c.statusHistory.findIndex((h) => h.status === "rejected");
                      return (
                        <div key={step} style={{ display: "flex", gap: 10, marginBottom: 10, opacity: reached ? 1 : 0.4 }}>
                          {reached ? <CheckCircle2 size={18} color="var(--km-success)" /> : <Clock size={18} color="var(--km-ink-soft)" />}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "capitalize" }}>{step.replace(/_/g, " ")}</div>
                            {hist && <div style={{ fontSize: "0.78rem", color: "var(--km-ink-soft)" }}>{hist.note} · {fmtDate(hist.updatedAt)}</div>}
                          </div>
                        </div>
                      );
                    })}
                    {c.status === "rejected" && (
                      <div style={{ background: "rgba(179,58,58,0.08)", color: "var(--km-alert)", padding: 10, borderRadius: 4, fontSize: "0.82rem" }}>
                        Rejected: {c.rejectionReason}
                      </div>
                    )}
                    {c.approvedAmount && (
                      <div style={{ background: "rgba(45,106,79,0.08)", color: "var(--km-success)", padding: 10, borderRadius: 4, fontSize: "0.85rem", fontWeight: 600 }}>
                        Approved Amount: ₹{c.approvedAmount.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
