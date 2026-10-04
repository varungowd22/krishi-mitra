import { Sprout, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="km-tricolor-strip" />
      <header className="km-header">
        <div className="km-header-brand">
          <div className="km-emblem" style={{ backgroundColor: "var(--km-saffron)", border: "2px solid var(--km-paper)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ color: "var(--km-forest-deep)", fontSize: "24px", fontWeight: "bold" }}>❂</span>
          </div>
          <div className="km-brand-text">
            <h1 style={{ color: "#ffffff" }}>{t("appName")}</h1>
            <div className="km-kannada" style={{ color: "#ffffff", opacity: 0.95 }}>ಕೃಷಿ ಮಿತ್ರ • {t("tagline")}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user && (
            <span style={{ fontSize: "0.82rem", color: "#faf7f0", opacity: 0.85 }}>
              {user.name} · {t(user.role)}
            </span>
          )}
          <button className="km-lang-toggle" onClick={toggleLang}>
            {lang === "en" ? "ಕನ್ನಡ" : "English"}
          </button>
          {user && (
            <button
              className="km-lang-toggle"
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <LogOut size={14} /> {t("logout")}
            </button>
          )}
        </div>
      </header>
    </>
  );
}
