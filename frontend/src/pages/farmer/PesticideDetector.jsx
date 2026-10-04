import { useEffect, useRef, useState } from "react";
import { ScanLine, ShieldCheck, ShieldAlert, ShieldQuestion, Camera, X } from "lucide-react";
import api from "../../utils/api.js";
import { useLang } from "../../context/LangContext.jsx";

const RESULT_META = {
  genuine: { icon: ShieldCheck, color: "var(--km-success)", label: "GENUINE PRODUCT" },
  counterfeit: { icon: ShieldAlert, color: "var(--km-alert)", label: "COUNTERFEIT / UNREGISTERED" },
  not_found: { icon: ShieldQuestion, color: "var(--km-saffron-deep)", label: "NOT FOUND IN REGISTRY" },
  expired_registration: { icon: ShieldAlert, color: "var(--km-alert)", label: "REGISTRATION EXPIRED" },
};

export default function PesticideDetector() {
  const { t } = useLang();
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const loadHistory = async () => {
    try {
      const { data } = await api.get("/products/scans/my");
      setHistory(data);
    } catch (error) {
      setScanError(error.response?.data?.message || "Unable to load saved scan history.");
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleScan = async (code) => {
    setScanError("");
    try {
      const { data } = await api.post("/products/scan", { barcode: code, location: "Mobile scan" });
      setResult(data);
      await loadHistory();
    } catch (error) {
      setScanError(error.response?.data?.message || "The scan was not saved. Please try again.");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    await handleScan(barcode.trim());
  };

  const startCameraScan = async () => {
    setScanError("");
    if (!window.isSecureContext) {
      setScanError("Camera scanning requires HTTPS in Chrome. Open the hosted HTTPS app or enter the barcode manually.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError("This browser does not provide camera access. Enter the barcode manually instead.");
      return;
    }
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode("km-qr-reader");
      html5QrCodeRef.current = qr;
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          setBarcode(decodedText);
          await stopCameraScan();
          handleScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setScanError("Camera access denied or unavailable. Enter barcode manually below.");
      setScanning(false);
    }
  };

  const stopCameraScan = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {}
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { if (html5QrCodeRef.current) html5QrCodeRef.current.stop().catch(() => {}); };
  }, []);

  const meta = result ? RESULT_META[result.result] : null;
  const Icon = meta?.icon;

  return (
    <div>
      <div className="km-card" style={{ marginBottom: 16 }}>
        <div className="km-card-title">
          <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}>
            <ScanLine size={18} color="var(--km-forest)" /> {t("pesticideDetector")}
          </h3>
        </div>

        {!scanning ? (
          <button className="km-btn km-btn--accent" onClick={startCameraScan} style={{ marginBottom: 14 }}>
            <Camera size={16} /> Open Camera to Scan
          </button>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div id="km-qr-reader" ref={scannerRef} style={{ maxWidth: 320, margin: "0 auto", borderRadius: 8, overflow: "hidden" }} />
            <button className="km-btn km-btn--outline" onClick={stopCameraScan} style={{ marginTop: 10 }}>
              <X size={16} /> Stop Camera
            </button>
          </div>
        )}

        {scanError && (
          <div style={{ background: "rgba(224,141,36,0.1)", color: "var(--km-saffron-deep)", padding: 10, borderRadius: 4, fontSize: "0.82rem", marginBottom: 12 }}>
            {scanError}
          </div>
        )}

        <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            className="km-input"
            placeholder={t("scanBarcode")}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <button type="submit" className="km-btn km-btn--primary">Check</button>
        </form>
        <p style={{ fontSize: "0.74rem", color: "var(--km-ink-soft)", marginTop: 8 }}>
          Try demo barcodes: <code>8901030875315</code> (genuine) or <code>8901030899999</code> (counterfeit)
        </p>

        {result && (
          <div style={{ marginTop: 18, padding: 16, borderRadius: 6, border: `2px solid ${meta.color}`, background: `${meta.color}11` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon size={28} color={meta.color} />
              <strong style={{ color: meta.color, fontSize: "1.05rem" }}>{meta.label}</strong>
            </div>
            {result.product && (
              <div style={{ marginTop: 12, fontSize: "0.88rem" }}>
                <div><strong>{result.product.productName}</strong></div>
                <div style={{ color: "var(--km-ink-soft)" }}>Manufacturer: {result.product.manufacturer}</div>
                <div style={{ color: "var(--km-ink-soft)" }}>Govt Reg. No: {result.product.govtRegistrationNumber}</div>
                {result.product.activeIngredient && (
                  <div style={{ color: "var(--km-ink-soft)" }}>Active Ingredient: {result.product.activeIngredient}</div>
                )}
              </div>
            )}
            {result.result === "not_found" && (
              <p style={{ marginTop: 10, fontSize: "0.85rem" }}>
                This barcode isn't in the government product registry. Avoid purchase and report the shop to the Agriculture Department.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="km-card">
        <div className="km-card-title">
          <h3 style={{ fontSize: "1.05rem" }}>Recent Scans</h3>
        </div>
        {history.length === 0 ? (
          <p className="km-empty">No scans yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((h) => {
              const m = RESULT_META[h.result];
              const HIcon = m.icon;
              return (
                <div key={h._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--km-line)" }}>
                  <HIcon size={16} color={m.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{h.product?.productName || h.barcode}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--km-ink-soft)" }}>{new Date(h.createdAt).toLocaleString("en-IN")}</div>
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: m.color }}>{m.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
