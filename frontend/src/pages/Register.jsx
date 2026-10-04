import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const ROLE_ROUTES = { farmer: "/farmer", admin: "/admin", vendor: "/vendor" };

export default function Register() {
  const [role, setRole] = useState("farmer");
  const [form, setForm] = useState({
    name: "", phone: "", password: "", village: "", taluk: "", district: "",
    landAcres: "", shopName: "", licenseNumber: "", designation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, role, landAcres: Number(form.landAcres) || 0 };
      const user = await register(payload);
      navigate(ROLE_ROUTES[user.role]);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="km-page">
      <div className="km-tricolor-strip" />
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px" }}>
        <form onSubmit={handleSubmit} className="km-card" style={{ width: "100%", maxWidth: 440 }}>
          <h2 style={{ marginBottom: 16 }}>{t("register")}</h2>

          <div className="km-field">
            <label className="km-label">{t("role")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["farmer", "admin", "vendor"].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`km-btn ${role === r ? "km-btn--primary" : "km-btn--outline"}`}
                  style={{ flex: 1, fontSize: "0.8rem", padding: "8px 4px" }}
                >
                  {t(r)}
                </button>
              ))}
            </div>
          </div>

          <div className="km-field">
            <label className="km-label">{t("name")}</label>
            <input className="km-input" value={form.name} onChange={update("name")} required />
          </div>

          <div className="km-field">
            <label className="km-label">{t("phone")}</label>
            <input className="km-input" value={form.phone} onChange={update("phone")} required />
          </div>

          <div className="km-field">
            <label className="km-label">{t("password")}</label>
            <input className="km-input" type="password" value={form.password} onChange={update("password")} required />
          </div>

          {role === "farmer" && (
            <>
              <div className="km-grid km-grid-2">
                <div className="km-field">
                  <label className="km-label">{t("village")}</label>
                  <input className="km-input" value={form.village} onChange={update("village")} />
                </div>
                <div className="km-field">
                  <label className="km-label">{t("taluk")}</label>
                  <input className="km-input" value={form.taluk} onChange={update("taluk")} />
                </div>
              </div>
              <div className="km-field">
                <label className="km-label">{t("landAcres")}</label>
                <input className="km-input" type="number" step="0.1" value={form.landAcres} onChange={update("landAcres")} />
              </div>
            </>
          )}

          {role === "vendor" && (
            <>
              <div className="km-field">
                <label className="km-label">Shop Name</label>
                <input className="km-input" value={form.shopName} onChange={update("shopName")} required />
              </div>
              <div className="km-field">
                <label className="km-label">License Number</label>
                <input className="km-input" value={form.licenseNumber} onChange={update("licenseNumber")} />
              </div>
            </>
          )}

          {role === "admin" && (
            <div className="km-field">
              <label className="km-label">Designation</label>
              <input
                className="km-input"
                value={form.designation}
                onChange={update("designation")}
                placeholder="e.g. Agriculture Extension Officer"
              />
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(179,58,58,0.08)", color: "var(--km-alert)", padding: "8px 12px", borderRadius: 4, fontSize: "0.82rem", marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="km-btn km-btn--primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "..." : t("register")}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.82rem", marginTop: 14 }}>
            Already have an account? <a href="/login">{t("login")}</a>
          </p>
        </form>
      </div>
    </div>
  );
}
