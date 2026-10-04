import { useState } from "react";
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

  const playSiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "square";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.0);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.5);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 2.0);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    } catch (err) {
      console.warn("Audio play failed", err);
    }
  };

  const handleSOS = async () => {
    setSendingSOS(true);
    playSiren(); // Play siren sound immediately
    try {
      const { data } = await api.post("/sos/trigger", { emergencyType: sosType });
      alert(data.message);
      setShowSOS(false);
    } catch (err) {
      alert(`${err.response?.data?.message || "SOS alert was not saved."} Please call 112 directly.`);
    }
    setSendingSOS(false);
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
        <ActiveComponent />
      </main>

      {/* Floating Voice Assistant */}
      <VoiceAssistant />

      {/* Floating SOS Button */}
      <button 
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
             <button onClick={() => setShowSOS(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", cursor: "pointer" }}><X size={20}/></button>
             <h3 style={{ fontSize: "1.2rem", color: "#d32f2f", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "8px" }}>
               <AlertOctagon /> EMERGENCY SOS
             </h3>
             <p style={{ fontSize: "0.9rem", color: "var(--km-ink-soft)", marginBottom: "20px" }}>
               Triggering this will alert the nearest Agricultural Officer and Emergency Services with your exact profile location.
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
               <button onClick={handleSOS} disabled={sendingSOS} style={{ flex: 1, padding: "12px", background: "#d32f2f", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                 {sendingSOS ? "Sending..." : "SEND SOS NOW"}
               </button>
               <button onClick={() => setShowSOS(false)} style={{ flex: 1, padding: "12px", background: "#f1f1f1", color: "var(--km-ink)", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                 Cancel
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
