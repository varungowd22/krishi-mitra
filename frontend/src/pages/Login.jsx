import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const Q = [
  ["Farming is a profession of hope. Every seed planted is a prayer for a better harvest.", "ಪ್ರತಿ ಬೀಜ ಬಿತ್ತಿದಾಗ ರೈತ ಭರವಸೆಯ ಕನಸು ಕಾಣುತ್ತಾನೆ — ಆ ಕನಸೇ ಅವನ ಶಕ್ತಿ."],
  ["The farmer feeds the nation; serving him is serving the country.", "ರೈತ ದೇಶಕ್ಕೆ ಅನ್ನ ನೀಡುತ್ತಾನೆ — ಅವನ ಸೇವೆಯೇ ದೇಶಸೇವೆ."],
  ["Farming is a profession of hope. Every seed planted is a prayer for a better harvest.", "ಪ್ರತಿ ಬೀಜ ಬಿತ್ತಿದಾಗ ರೈತ ಭರವಸೆಯ ಕನಸು ಕಾಣುತ್ತಾನೆ — ಆ ಕನಸೇ ಅವನ ಶಕ್ತಿ."],
  ["Healthy soil today is a rich harvest tomorrow.", "ಇಂದಿನ ಆರೋಗ್ಯಕರ ಮಣ್ಣು ನಾಳೆಯ ಸಮೃದ್ಧ ಫಸಲು."],
  ["Every drop of water saved is a seed more grown.", "ಉಳಿಸಿದ ಪ್ರತಿ ನೀರಿನ ಹನಿ ಇನ್ನೊಂದು ಬೀಜಕ್ಕೆ ಜೀವ."],
  ["Together, technology and tradition grow stronger crops.", "ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಸಂಪ್ರದಾಯ ಸೇರಿದರೆ ಬೆಳೆ ಬಲವಾಗುತ್ತದೆ."]
];

const P = [
  ["🌱", "Bayer", "https://www.bayer.in/"],
  ["🧪", "UPL", "https://www.upl-ltd.com/in"],
  ["🌾", "Karnataka", "https://karnatakabank.com/"],
  ["🏦", "SBI", "https://sbi.bank.in/web/personal-banking/home"],
  ["🛡️", "ICICI", "https://www.icici.bank.in/"],
  ["🏛️", "NABARD", "https://www.nabard.org/"],
  ["🤖", "Fasal", "https://fasal.co/"],
  ["🔬", "ICAR", "https://icar.org.in/"]
];

const EXTRA_PARTNERS = [
  ["🏦", "HDFC", "https://www.hdfc.bank.in/"],
  ["🌿", "Syngenta", "https://www.syngenta.co.in/"],
  ["🚜", "Mahindra", "https://www.mahindratractor.com/"],
  ["💧", "Jain Irrigation", "https://www.jains.com/"],
  ["📡", "IFFCO", "https://www.iffco.in/en/"]
];

const ROLE_ROUTES = {
  farmer: "/farmer",
  admin: "/admin",
  vendor: "/vendor",
};

export default function Login() {
  const [role, setRole] = useState("farmer"); // farmer, admin, vendor
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [taluk, setTaluk] = useState("");
  const [district, setDistrict] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const [qi, setQi] = useState(2);
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAppQr, setShowAppQr] = useState(false);

  const { user, login, register } = useAuth();
  const { lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const isKn = lang === "kn";

  useEffect(() => {
    if (user) {
      navigate(ROLE_ROUTES[user.role] || "/farmer");
    }
  }, [user, navigate]);

  // Quote Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setQi((prev) => (prev + 1) % Q.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Generate spokes for Emblem
  const spokes = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    spokes.push(
      <line
        key={i}
        x1={(20 + 4 * Math.cos(a)).toFixed(1)}
        y1={(20 + 4 * Math.sin(a)).toFixed(1)}
        x2={(20 + 15 * Math.cos(a)).toFixed(1)}
        y2={(20 + 15 * Math.sin(a)).toFixed(1)}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!/^\d{10}$/.test(phone)) {
      setError(isKn ? "ದಯವಿಟ್ಟು 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ." : "Enter a 10-digit phone number.");
      return;
    }
    if (!password) {
      setError(isKn ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ." : "Enter your password.");
      return;
    }

    setLoading(true);
    try {
      let nextUser;
      if (isRegister) {
        nextUser = await register({ role, phone, password, name, village, taluk, district });
      } else {
        nextUser = await login(phone, password, role);
      }
      setSuccessMsg(`Signed in as ${role} (${phone}). Redirecting...`);
      navigate(ROLE_ROUTES[nextUser.role] || "/farmer");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (!err.response
            ? isKn
              ? "ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
              : "Unable to connect to the server. Please make sure the API is running and try again."
            : isRegister
            ? "Registration failed. Please check inputs."
            : "Login failed. Check phone number & password.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccount = (accRole, accPhone, accPass) => {
    setRole(accRole);
    setPhone(accPhone);
    setPassword(accPass);
    setError("");
    setSuccessMsg("");
  };

  const toggleRegistrationMode = () => {
    const nextRegister = !isRegister;
    if (nextRegister) setRole("farmer");
    setIsRegister(nextRegister);
  };

  return (
    <div className="km-root">
      <style>{`
        :root{
          --bg:#07281b; --bg2:#0b3a28; --card:#0a2f21; --line:#1d4a36;
          --gold:#e0a030; --orange:#d9831f; --cream:#f1ecdf; --cream2:#ece4d0;
          --ink:#0d3524; --muted:#9db8aa; --text:#f3efe3;
          --serif:'Noto Serif','Noto Serif Kannada',Georgia,serif;
          --sans:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
        }
        .km-root {
          min-height: 100vh;
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%) fixed, var(--bg);
          color: var(--text);
          font-family: var(--sans);
          line-height: 1.5;
        }
        .km-header {
          background: var(--bg);
          border-bottom: 3px solid var(--gold);
          padding: 18px 20px;
        }
        .km-bar {
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .km-emblem {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--orange);
          border: 4px solid #fff;
          display: grid;
          place-items: center;
          flex: none;
        }
        .km-bar .t { flex: 1; min-width: 0; }
        .km-gov {
          font-size: 12px;
          letter-spacing: .08em;
          color: var(--gold);
          font-weight: 600;
          margin: 0;
        }
        .km-h1 {
          font-family: var(--serif);
          font-size: 26px;
          line-height: 1.2;
          margin: 2px 0;
          color: #ffffff;
        }
        .km-sub { font-size: 14px; color: var(--muted); margin: 0; }
        .km-lang {
          background: #12402e;
          color: var(--text);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 12px 20px;
          font: 600 15px var(--serif);
          cursor: pointer;
          transition: background 0.2s;
        }
        .km-lang:hover { background: #1a543e; }
        .km-main {
          max-width: 760px;
          margin: 0 auto;
          padding: 22px 16px 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .km-hero { display: block; text-align: center; }
        .km-hero h2 { font-family: var(--serif); font-size: 32px; line-height: 1.15; margin: 0 0 12px; color: #ffffff; }
        .km-hero p { color: var(--muted); max-width: 60ch; margin: 0 auto; }
        @media(min-width:900px){
          .km-hero h2 { font-size: 38px; }
        }
        .km-card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 22px;
        }
        .km-quote { text-align: center; padding: 28px 22px 20px; }
        .km-quote small { color: var(--gold); font-weight: 600; font-size: 14px; letter-spacing: .06em; }
        .km-quote hr { width: 56px; border: 0; height: 2px; background: var(--orange); margin: 10px auto 18px; }
        .km-q-mark { font-family: var(--serif); font-size: 30px; color: var(--gold); line-height: .6; }
        .km-q-en { font-family: var(--serif); font-style: italic; color: #c9d6cc; font-size: 19px; margin: 12px 0 10px; min-height: 86px; }
        .km-q-kn { font-family: var(--serif); color: var(--gold); font-size: 17px; min-height: 56px; }
        .km-dots { display: flex; justify-content: center; gap: 8px; margin-top: 14px; }
        .km-dots button {
          width: 10px; height: 10px; border-radius: 99px; border: 0; background: #4b6b5c; padding: 0; cursor: pointer; transition: width .25s, background .25s;
        }
        .km-dots button.on { width: 28px; background: var(--orange); }
        .km-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .km-stat { background: var(--card); border: 1px solid var(--line); border-radius: 14px; text-align: center; padding: 18px 8px; }
        .km-stat b { display: block; font-family: var(--serif); color: var(--gold); font-size: 25px; }
        .km-stat span { display: block; color: var(--muted); font-size: 14px; }
        .km-app-qr { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 18px; }
        .km-app-qr-code { background: #fff; padding: 12px; border-radius: 12px; }
        .km-partners h2 { margin: 0 0 14px; text-align: center; color: var(--gold); font: 600 15px var(--sans); letter-spacing: .08em; }
        .km-chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .km-chip { display: inline-flex; align-items: center; background: #12402e; border: 1px solid var(--line); border-radius: 10px; padding: 8px 14px; font-size: 16px; color: var(--text); }
        a.km-chip { text-decoration: none; transition: background .18s, border-color .18s, transform .18s; }
        a.km-chip:hover { background: #1b563d; border-color: var(--gold); transform: translateY(-1px); }
        a.km-chip:focus-visible, .km-chip.more:focus-visible { outline: 3px solid var(--gold); outline-offset: 3px; }
        .km-chip.more { background: #3b3a1c; border-color: #6b5a22; color: var(--gold); cursor: pointer; font-family: inherit; }
        .km-login { background: var(--cream); color: var(--ink); padding: 0; overflow: hidden; border-color: #2a5a43; }
        .km-login .hd { background: var(--bg2); color: var(--text); text-align: center; padding: 22px 16px; border-bottom: 4px solid var(--orange); }
        .km-login .hd small { color: var(--gold); font-weight: 600; letter-spacing: .08em; font-size: 14px; }
        .km-login .hd h2 { font-family: var(--serif); font-size: 25px; margin: 6px 0 2px; color: #ffffff; }
        .km-login .hd p { margin: 0; color: var(--gold); font-family: var(--serif); }
        .km-login form { padding: 22px; }
        .km-lbl { display: block; font-weight: 600; font-size: 14px; letter-spacing: .06em; color: #4a4a3a; margin: 16px 0 8px; }
        .km-roles { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        .km-role { background: #fff; border: 2px solid #dcd2b6; border-radius: 12px; padding: 12px 4px; font: 600 15px var(--sans); color: var(--ink); cursor: pointer; transition: all 0.2s; }
        .km-role[aria-pressed="true"] { background: var(--ink); color: #fff; border-color: var(--ink); }
        .km-input { width: 100%; font: 17px var(--sans); padding: 15px 16px; border: 2px solid #dcd2b6; border-radius: 12px; background: #fff; color: var(--ink); margin-bottom: 4px; }
        .km-go { width: 100%; margin-top: 20px; padding: 17px; border: 0; border-radius: 12px; background: var(--ink); color: #fff; font: 600 18px var(--sans); cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.25); transition: opacity 0.2s; }
        .km-go:disabled { opacity: 0.7; cursor: not-allowed; }
        .km-demo { display: flex; align-items: center; gap: 12px; margin: 22px 0 12px; color: #5a5a48; font-weight: 600; font-size: 14px; }
        .km-demo:before, .km-demo:after { content: ""; flex: 1; height: 1px; background: #cfc6ab; }
        .km-acc { display: flex; justify-content: space-between; width: 100%; background: var(--cream2); border: 1px solid #dcd2b6; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; font: 600 15px var(--sans); color: var(--ink); cursor: pointer; text-align: left; transition: background 0.2s; }
        .km-acc:hover { background: #e2d8be; }
        .km-acc span:last-child { font-weight: 500; color: #444; }
        .km-msg { margin-top: 14px; padding: 12px 14px; border-radius: 10px; font-size: 14px; }
        .km-msg.ok { background: #dcefd9; color: #14502a; border: 1px solid #b8e2b2; }
        .km-msg.err { background: #f6dcd6; color: #7a2416; border: 1px solid #ecc2ba; }
        .km-footer { text-align: center; color: var(--muted); font-size: 14px; padding: 24px 16px 28px; }
        .km-hero { display: none; }
        @media(min-width:900px){
          .km-hero { display: block; }
          .km-hero h2 { font-family: var(--serif); font-size: 42px; line-height: 1.15; margin: 0 0 12px; }
          .km-hero p { color: var(--muted); max-width: 52ch; margin: 0; }
        }
        .km-mode-toggle {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
          font-size: 14px;
        }
        .km-mode-toggle button {
          background: transparent;
          border: none;
          color: #4a4a3a;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>

      {/* HEADER */}
      <header className="km-header">
        <div className="km-bar">
          <div className="km-emblem" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#1a1208" strokeWidth="1.6">
              <circle cx="20" cy="20" r="16" />
              <circle cx="20" cy="20" r="3" fill="#1a1208" />
              <g>{spokes}</g>
            </svg>
          </div>
          <div className="t">
            <p className="km-gov">
              {isKn ? "ಕರ್ನಾಟಕ ಸರ್ಕಾರ · ಕೃಷಿ ಇಲಾಖೆ" : "GOVERNMENT OF KARNATAKA · DEPARTMENT OF AGRICULTURE"}
            </p>
            <h1 className="km-h1" style={{ color: "#ffffff" }}>Krishi Mitra — ಕೃಷಿ ಮಿತ್ರ</h1>
            <p className="km-sub">
              {isKn ? "ಸ್ಮಾರ್ಟ್ ರೈತ ಸೇವಾ ಪೋರ್ಟಲ್" : "Smart Farmer Services Portal"}
            </p>
          </div>
          <button className="km-lang" type="button" onClick={toggleLang}>
            {isKn ? "English" : "ಕನ್ನಡ"}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="km-main">
        {/* HERO SECTION */}
        <div className="km-hero">
          <h2>
            {isKn
              ? "ಭಾರತದ ಪ್ರಮುಖ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ವ್ಯವಸ್ಥೆ"
              : "India's Premier Smart Agriculture Ecosystem"}
          </h2>
          <p>
            {isKn
              ? "ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ, ಬೀಜ ಬಾರ್ಕೋಡ್ ಸ್ಕ್ಯಾನ್, ಪಿಎಂ-ಕಿಸಾನ್ ಪರಿಶೀಲನೆ, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಮಂಡಿ ಬೆಲೆಗಳು — ಒಂದೇ ಕಾಗದರಹಿತ ವೇದಿಕೆಯಲ್ಲಿ."
              : "Irrigation schedules, seed barcode scans, PM-Kisan verification, crop damage insurance claims and live mandi prices in one paperless platform."}
          </p>
        </div>

        {/* QUOTE CARD */}
        <section className="km-card km-quote" aria-live="polite">
          <small>
            {isKn ? "✦ ಇಂದಿನ ಚಿಂತನೆ ✦" : "✦ THOUGHT OF THE MOMENT ✦"}
          </small>
          <hr />
          <div className="km-q-mark">"</div>
          <p className="km-q-en">{Q[qi][0]}</p>
          <p className="km-q-kn">{Q[qi][1]}</p>
          <div className="km-dots">
            {Q.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Quote ${idx + 1}`}
                className={idx === qi ? "on" : ""}
                onClick={() => setQi(idx)}
              />
            ))}
          </div>
        </section>

        {/* STATS */}
        <div className="km-stats">
          <div className="km-stat">
            <b>1.2Cr+</b>
            <span>{isKn ? "ರೈತರು" : "Farmers"}</span>
          </div>
          <div className="km-stat">
            <b>₹4500Cr</b>
            <span>{isKn ? "ಸಾಲಗಳು" : "Loans"}</span>
          </div>
          <div className="km-stat">
            <b>13</b>
            <span>{isKn ? "ಪಾಲುದಾರರು" : "Partners"}</span>
          </div>
        </div>

        {/* PARTNERS */}
        <section className="km-card km-partners">
          <h2>
            {isKn ? "🤝 ಅಧಿಕೃತ ಪಾಲುದಾರ ಕಂಪನಿಗಳು" : "🤝 OFFICIAL PARTNER COMPANIES"}
          </h2>
          <div className="km-chips">
            {P.map(([icon, name, url]) => (
              <a
                key={name}
                className="km-chip"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${name}'s official website (opens in a new tab)`}
              >
                {icon} {name}
              </a>
            ))}
            {showMore &&
              EXTRA_PARTNERS.map(([icon, name, url]) => (
                <a
                  key={name}
                  className="km-chip"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${name}'s official website (opens in a new tab)`}
                >
                  {icon} {name}
                </a>
              ))}
            {!showMore ? (
              <button
                type="button"
                className="km-chip more"
                onClick={() => setShowMore(true)}
                aria-expanded={showMore}
              >
                +5 more
              </button>
            ) : (
              <button
                type="button"
                className="km-chip more"
                onClick={() => setShowMore(false)}
                aria-expanded={showMore}
              >
                Show less
              </button>
            )}
          </div>
        </section>

        <section className="km-card" style={{ textAlign: "center" }} aria-labelledby="app-qr-title">
          <h2 id="app-qr-title" style={{ margin: "0 0 8px", color: "var(--gold)", fontSize: "1rem" }}>
            {isKn ? "📱 ಮೊಬೈಲ್‌ನಲ್ಲಿ ಕೃಷಿ ಮಿತ್ರ ತೆರೆಯಿರಿ" : "📱 Open Krishi Mitra on your phone"}
          </h2>
          <p style={{ color: "var(--muted)", margin: "0 auto 14px", maxWidth: "54ch", fontSize: "0.9rem" }}>
            {isKn ? "ಈ ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಲು QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ." : "Scan this QR code with your phone camera to open this same app."}
          </p>
          <div className="km-app-qr">
            <div className="km-app-qr-code">
              <QRCodeSVG value={window.location.origin} size={176} level="M" includeMargin />
            </div>
            <div style={{ maxWidth: "250px", textAlign: "left", color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.55 }}>
              <strong style={{ display: "block", color: "var(--text)", marginBottom: "5px" }}>One secure web app across your devices</strong>
              Use HTTPS on the published site for camera scanning and install support. Sign in separately on each device to keep account data protected.
            </div>
          </div>
        </section>

        {/* LOGIN CARD */}
        <section className="km-card km-login" aria-labelledby="lt">
          <div className="hd">
            <small>GOVERNMENT OF KARNATAKA</small>
            <h2 id="lt" style={{ color: "#ffffff" }}>
              {isRegister
                ? isKn
                  ? "ಹೊಸ ಖಾತೆ ರಚಿಸಿ"
                  : "Create an account"
                : isKn
                ? "ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ"
                : "Sign in to your account"}
            </h2>
            <p>
              {isKn
                ? "Sign in to your account"
                : "ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ"}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <span className="km-lbl" style={{ marginTop: 0 }}>
              LOGIN AS
            </span>
            <div className="km-roles">
              <button
                type="button"
                className="km-role"
                aria-pressed={role === "farmer"}
                disabled={isRegister && role !== "farmer"}
                onClick={() => setRole("farmer")}
              >
                🌾 Farmer
              </button>
              <button
                type="button"
                className="km-role"
                aria-pressed={role === "admin"}
                disabled={isRegister}
                onClick={() => setRole("admin")}
              >
                🏛️ Officer
              </button>
              <button
                type="button"
                className="km-role"
                aria-pressed={role === "vendor"}
                disabled={isRegister}
                onClick={() => setRole("vendor")}
              >
                🏪 Vendor
              </button>
            </div>
            {isRegister && (
              <p style={{ margin: "8px 0 0", color: "#5a5a48", fontSize: "0.8rem" }}>
                Officer and vendor accounts are provisioned by an administrator.
              </p>
            )}

            {isRegister && (
              <>
                <label className="km-lbl" htmlFor="nm">
                  FULL NAME
                </label>
                <input
                  id="nm"
                  className="km-input"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label className="km-lbl" htmlFor="vl">
                      VILLAGE
                    </label>
                    <input
                      id="vl"
                      className="km-input"
                      placeholder="Village"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="km-lbl" htmlFor="tl">
                      TALUK
                    </label>
                    <input
                      id="tl"
                      className="km-input"
                      placeholder="Taluk"
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <label className="km-lbl" htmlFor="ph">
              PHONE NUMBER
            </label>
            <input
              id="ph"
              className="km-input"
              inputMode="numeric"
              maxLength={10}
              placeholder="9900000003"
              autoComplete="username"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label className="km-lbl" htmlFor="pw">
              PASSWORD
            </label>
            <input
              id="pw"
              className="km-input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="km-go" type="submit" disabled={loading}>
              {loading
                ? isKn
                  ? "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ..."
                  : "Logging in..."
                : isRegister
                ? "📝 Register"
                : "🔐 Login"}
            </button>

            {error && <div className="km-msg err" role="status">{error}</div>}
            {successMsg && <div className="km-msg ok" role="status">{successMsg}</div>}

            <div className="km-mode-toggle">
              <button type="button" onClick={toggleRegistrationMode}>
                {isRegister
                  ? isKn
                    ? "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ"
                    : "Already have an account? Sign In"
                  : isKn
                  ? "ಹೊಸ ಖಾತೆ ತೆರೆಯಬೇಕೇ? ರಜಿಸ್ಟರ್ ಮಾಡಿ"
                  : "Need a new account? Register"}
              </button>
            </div>

            {!isRegister && (
              <>
                <div className="km-demo">Demo Accounts</div>
                <button
                  type="button"
                  className="km-acc"
                  onClick={() => handleDemoAccount("farmer", "9900000003", "farmer123")}
                >
                  <span>Farmer — Varun Gowda</span>
                  <span>9900000003</span>
                </button>
                <button
                  type="button"
                  className="km-acc"
                  onClick={() => handleDemoAccount("admin", "9900000001", "admin123")}
                >
                  <span>Officer — Prakash Rao</span>
                  <span>9900000001</span>
                </button>
                <button
                  type="button"
                  className="km-acc"
                  onClick={() => handleDemoAccount("vendor", "9900000002", "vendor123")}
                >
                  <span>Vendor — Lakshmi Agro</span>
                  <span>9900000002</span>
                </button>
              </>
            )}
          </form>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="km-footer">
        © 2025 Government of Karnataka · ಕರ್ನಾಟಕ ಸರ್ಕಾರ
      </footer>
    </div>
  );
}
