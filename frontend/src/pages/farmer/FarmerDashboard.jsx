import { useEffect, useRef, useState } from "react";
import { Wallet, TrendingUp, FileWarning, Droplets, ScanLine, LayoutDashboard, Plane, Droplet, Zap, Truck, AlertOctagon, X, ShoppingCart, Film } from "lucide-react";
import api from "../../utils/api.js";
import Header from "../../components/Header.jsx";
import VoiceAssistant from "../../components/VoiceAssistant.jsx";
import { useLang } from "../../context/LangContext.jsx";
import FarmerOverview from "./FarmerOverview.jsx";
import LoanTracker from "./LoanTracker.jsx";
import MandiPrices from "./MandiPrices.jsx";
import InsuranceClaims from "./InsuranceClaims.jsx";
import Irrigation from "./Irrigation.jsx";
import PesticideDetector from "./PesticideDetector.jsx";
import Drones from "./Drones.jsx";
import Dairy from "./Dairy.jsx";
import Power from "./Power.jsx";
import DiseaseDetection from "./DiseaseDetection.jsx";
import FertilizerRecommendation from "./FertilizerRecommendation.jsx";
import Marketplace from "./Marketplace.jsx";
import CropHealth from "./CropHealth.jsx";
import { Satellite } from "lucide-react";
import FutureFarming from "./FutureFarming.jsx";
import { createEmergencyAudioContext, playEmergencySiren } from "../../utils/emergencyAudio.js";

const TABS = [
  { key: "overview", icon: LayoutDashboard, labelKey: "overview", Component: FarmerOverview },
  { key: "crophealth", icon: Satellite, label: "Satellite NDVI", Component: CropHealth },
  { key: "disease", icon: ScanLine, label: "AI Disease Scan", Component: DiseaseDetection },
  { key: "pesticide", icon: ScanLine, labelKey: "pesticideDetector", Component: PesticideDetector },
  { key: "fertilizer", icon: Droplets, label: "Fertilizer AI", Component: FertilizerRecommendation },
  { key: "irrigation", icon: Droplets, labelKey: "irrigation", Component: Irrigation },
  { key: "power", icon: Zap, labelKey: "power", Component: Power },
  { key: "dairy", icon: Droplet, labelKey: "dairy", Component: Dairy },
  { key: "drones", icon: Truck, label: "Smart Equipment", Component: Drones },
  { key: "marketplace", icon: ShoppingCart, label: "Marketplace", Component: Marketplace },
  { key: "mandi", icon: TrendingUp, labelKey: "mandiPrices", Component: MandiPrices },
  { key: "loans", icon: Wallet, labelKey: "loanTracker", Component: LoanTracker },
  { key: "insurance", icon: FileWarning, labelKey: "insuranceClaims", Component: InsuranceClaims },
  { key: "futurefarming", icon: Film, label: "Future Farming", Component: FutureFarming },
];

export default function FarmerDashboard() {
  const [active, setActive] = useState("overview");
  const { t } = useLang();
  const ActiveComponent = TABS.find((tb) => tb.key === active).Component;

  const [showSOS, setShowSOS] = useState(false);
  const [sosType, setSosType] = useState("Medical");
  const [sendingSOS, setSendingSOS] = useState(false);
  const [sosMessage, setSosMessage] = useState("");
  const [sosCaseId, setSosCaseId] = useState("");
  const [sosSoundError, setSosSoundError] = useState("");
  const sosAudioContext = useRef(null);
  const sirenTimer = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(sirenTimer.current);
    void sosAudioContext.current?.close();
  }, []);

  const handleSOS = async () => {
    if (sendingSOS) return;
    setSendingSOS(true);
    setSosMessage("");
    setSosCaseId("");
    setSosSoundError("");
    window.clearTimeout(sirenTimer.current);
    if (sosAudioContext.current && sosAudioContext.current.state !== "closed") {
      void sosAudioContext.current.close();
    }
    sosAudioContext.current = null;
    try {
      sosAudioContext.current = createEmergencyAudioContext();
      if (sosAudioContext.current) await sosAudioContext.current.resume();
    } catch (error) {
      setSosSoundError(error.message || "Emergency sound could not be enabled on this phone.");
      void sosAudioContext.current?.close();
      sosAudioContext.current = null;
    }

    try {
      const { data } = await api.post("/sos/trigger", { emergencyType: sosType });
      setSosCaseId(data.caseId);
      setSosMessage(data.message);
      sirenTimer.current = window.setTimeout(() => {
        try {
          playEmergencySiren(sosAudioContext.current);
          sirenTimer.current = window.setTimeout(() => {
            void sosAudioContext.current?.close();
            sosAudioContext.current = null;
          }, 2300);
        } catch (error) {
          setSosSoundError(error.message || "Emergency sound could not play on this phone.");
        }
      }, 3000);
      setShowSOS(false);
    } catch (err) {
      setSosMessage(`${err.response?.data?.message || "SOS alert was not saved."} Please call 112 directly.`);
      void sosAudioContext.current?.close();
      sosAudioContext.current = null;
    } finally {
      setSendingSOS(false);
    }
  };

  return (
    <div className="km-page" style={{ position: "relative" }}>
      <Header />
      <nav className="km-nav-tabs" aria-label="Farmer dashboard modules">
        {TABS.map(({ key, icon: Icon, labelKey, label }) => (
          <button
            type="button"
            key={key}
            className={`km-nav-tab ${active === key ? "active" : ""}`}
            onClick={() => setActive(key)}
            aria-current={active === key ? "page" : undefined}
          >
            <Icon size={15} /> {label || t(labelKey)}
          </button>
        ))}
      </nav>
      <main className="km-main">
        {sosMessage && (
          <div role="status" className="km-card" style={{ marginBottom: 16, borderLeft: "5px solid #d32f2f" }}>
            <strong style={{ color: "#b42318" }}>Emergency SOS</strong>
            <p style={{ margin: "8px 0" }}>{sosMessage}</p>
            {sosCaseId && <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>Case ID: {sosCaseId} · Emergency siren scheduled on this phone in 3 seconds.</p>}
            {sosSoundError && <p style={{ margin: "4px 0", color: "#b42318", fontSize: "0.85rem" }}>{sosSoundError}</p>}
            <a href="tel:112" style={{ color: "#b42318", fontWeight: 700 }}>Call 112 for immediate danger</a>
          </div>
        )}
        <ActiveComponent />
      </main>

      {/* Floating Voice Assistant */}
      <VoiceAssistant />

      {/* Floating SOS Button */}
      <button 
        type="button"
        aria-label="Open emergency SOS"
        onClick={() => setShowSOS(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#d32f2f",
          color: "white",
          border: "4px solid #fff",
          boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 999
        }}
      >
        <AlertOctagon size={30} />
      </button>

      {/* SOS Modal */}
      {showSOS && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div className="km-card" style={{ width: "100%", maxWidth: "400px", borderTop: "4px solid #d32f2f", position: "relative" }}>
             <button type="button" aria-label="Close emergency SOS" onClick={() => setShowSOS(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", cursor: "pointer" }}><X size={20}/></button>
             <h3 style={{ fontSize: "1.2rem", color: "#d32f2f", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "8px" }}>
               <AlertOctagon /> EMERGENCY SOS
             </h3>
             <p style={{ fontSize: "0.9rem", color: "var(--km-ink-soft)", marginBottom: "20px" }}>
               This sends an alert to the officer dashboard in Krishi Mitra. Emergency services are not automatically dispatched. Call 112 for immediate help.
             </p>
             
             <div style={{ marginBottom: "20px" }}>
               <label className="km-label">Type of Emergency</label>
               <select className="km-input" value={sosType} onChange={(e) => setSosType(e.target.value)}>
                 <option value="Medical">Medical Emergency</option>
                 <option value="Crop Fire">Crop Fire</option>
                 <option value="Equipment Accident">Equipment Accident</option>
                 <option value="Wild Animal">Wild Animal Attack</option>
                 <option value="Debt Harassment">Debt Harassment / Extortion</option>
                 <option value="Other">Other</option>
               </select>
             </div>

             <div style={{ display: "flex", gap: "10px" }}>
               <button type="button" onClick={handleSOS} disabled={sendingSOS} style={{ flex: 1, padding: "12px", background: "#d32f2f", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                 {sendingSOS ? "Sending..." : "SEND SOS NOW"}
               </button>
               <button type="button" onClick={() => setShowSOS(false)} style={{ flex: 1, padding: "12px", background: "#f1f1f1", color: "var(--km-ink)", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                 Cancel
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
