import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Bell, Plus, X, Trash2, LineChart, Target, Zap } from "lucide-react";
import { useLang } from "../../context/LangContext.jsx";
import { loadWorkspace, saveWorkspace } from "../../utils/workspace.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendIcon = ({ trend }) => {
  if (trend === "up") return <TrendingUp size={16} color="var(--km-success)" />;
  if (trend === "down") return <TrendingDown size={16} color="var(--km-alert)" />;
  return <Minus size={16} color="var(--km-ink-soft)" />;
};

export default function MandiPrices() {
  const { t } = useLang();
  
  // Mock Data for Live APMC Connection
  const [prices, setPrices] = useState([
    { _id: "1", cropName: "Tomato", cropNameKannada: "ಟೊಮೇಟೊ", mandiName: "Kolar APMC", minPrice: 1800, maxPrice: 2100, modalPrice: 1900, trend: "up", changePercent: 5.2 },
    { _id: "2", cropName: "Onion", cropNameKannada: "ಈರುಳ್ಳಿ", mandiName: "Yeshwanthpur APMC", minPrice: 2800, maxPrice: 3200, modalPrice: 3000, trend: "down", changePercent: -2.1 },
    { _id: "3", cropName: "Ragi", cropNameKannada: "ರಾಗಿ", mandiName: "Tumkur APMC", minPrice: 3400, maxPrice: 3600, modalPrice: 3500, trend: "stable", changePercent: 0 },
    { _id: "4", cropName: "Potato", cropNameKannada: "ಆಲೂಗಡ್ಡೆ", mandiName: "Hassan APMC", minPrice: 1500, maxPrice: 1750, modalPrice: 1600, trend: "up", changePercent: 1.5 },
  ]);

  const [alerts, setAlerts] = useState([]);
  const [alertError, setAlertError] = useState("");
  const [alertsLoaded, setAlertsLoaded] = useState(false);
  const [triggered, setTriggered] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cropName: "", targetPrice: "", preferredMandi: "" });

  useEffect(() => {
    let cancelled = false;
    loadWorkspace("mandi-alerts")
      .then((savedAlerts) => {
        if (!cancelled && Array.isArray(savedAlerts)) setAlerts(savedAlerts);
      })
      .catch((error) => {
        if (!cancelled) setAlertError(error.response?.data?.message || "Unable to load saved price alerts.");
      })
      .finally(() => {
        if (!cancelled) setAlertsLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const nextAlerts = [...alerts, {
      _id: crypto.randomUUID(),
      cropName: form.cropName.trim(),
      targetPrice: Number(form.targetPrice),
      preferredMandi: form.preferredMandi.trim(),
    }];
    setAlertError("");
    try {
      setAlerts(await saveWorkspace("mandi-alerts", nextAlerts));
      setShowForm(false);
      setForm({ cropName: "", targetPrice: "", preferredMandi: "" });
    } catch (error) {
      setAlertError(error.response?.data?.message || "Price alert was not saved. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const nextAlerts = alerts.filter((alert) => alert._id !== id);
    setAlertError("");
    try {
      setAlerts(await saveWorkspace("mandi-alerts", nextAlerts));
    } catch (error) {
      setAlertError(error.response?.data?.message || "Price alert was not deleted. Please try again.");
    }
  };

  // Chart Data for Tomato Prediction
  const chartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Today', 'Tomorrow (Pred)', 'Day 7 (Pred)'],
    datasets: [
      {
        label: 'Price per Quintal (₹)',
        data: [1700, 1750, 1800, 1850, 1900, 2200, 2150],
        fill: true,
        backgroundColor: 'rgba(224, 141, 36, 0.2)',
        borderColor: 'var(--km-saffron-deep)',
        tension: 0.4,
        pointBackgroundColor: 'var(--km-forest-deep)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: [3, 3, 3, 3, 5, 6, 3], // Highlight today and tomorrow
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.parsed.y} / Quintal`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 1500,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {alertError && <div role="alert" className="km-card" style={{ color: "var(--km-alert)" }}>{alertError}</div>}
      
      {/* AI Market Prediction Section (Storyboard Step 7) */}
      <div className="km-card" style={{ borderLeft: "4px solid var(--km-forest)" }}>
         <h3 style={{ fontSize: "1.2rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 15px 0" }}>
           <LineChart size={24} /> AI Market Price Prediction
         </h3>
         
         <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
               <div style={{ fontSize: "1rem", color: "var(--km-ink-soft)", marginBottom: "15px" }}>Tomato Price Trend (Kolar APMC)</div>
               
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                 <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", textTransform: "uppercase" }}>Today</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--km-ink)" }}>₹19/kg</div>
                 </div>
                 <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--km-saffron-deep)", textTransform: "uppercase", fontWeight: "bold" }}>Tomorrow's Prediction</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--km-saffron-deep)", display: "flex", alignItems: "center", gap: "5px" }}>
                       ₹22/kg <TrendingUp size={20} />
                    </div>
                 </div>
               </div>

               <div style={{ padding: "12px", backgroundColor: "rgba(45, 106, 79, 0.1)", borderRadius: "8px", border: "1px solid var(--km-success)", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <Zap size={20} color="var(--km-success)" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--km-forest-deep)", fontWeight: "bold" }}>AI Recommendation</div>
                    <div style={{ fontSize: "0.95rem", color: "var(--km-ink)", marginTop: "2px" }}>Best time to sell is <strong>Tomorrow</strong>. Expected price surge due to supply shortage in neighboring districts.</div>
                  </div>
               </div>
            </div>

            <div style={{ flex: 1.5, minWidth: "300px", height: "220px", position: "relative" }}>
               <Line data={chartData} options={chartOptions} />
            </div>
         </div>
      </div>

      {triggered.length > 0 && (
        <div className="km-card" style={{ borderColor: "var(--km-saffron)", background: "rgba(224,141,36,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Bell size={18} color="var(--km-saffron-deep)" />
            <strong style={{ color: "var(--km-saffron-deep)" }}>Price Alert Triggered — Sell Now!</strong>
          </div>
          {triggered.map((item, i) => (
            <p key={i} style={{ fontSize: "0.88rem", margin: "4px 0" }}>
              <strong>{item.alert.cropName}</strong> hit ₹{item.price.modalPrice}/quintal at {item.price.mandiName} (your target: ₹{item.alert.targetPrice})
            </p>
          ))}
        </div>
      )}

      {/* Live APMC Prices */}
      <div className="km-card">
        <div className="km-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0, color: "var(--km-forest-deep)" }}>Live APMC Mandi Prices</h3>
          <span style={{ fontSize: "0.75rem", backgroundColor: "var(--km-success-dim)", color: "var(--km-success)", padding: "4px 8px", borderRadius: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--km-success)" }}></span> Live Data Connected
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="km-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--km-paper-dim)", textAlign: "left" }}>
                <th style={{ padding: "12px", color: "var(--km-ink-soft)" }}>{t("cropName")}</th>
                <th style={{ padding: "12px", color: "var(--km-ink-soft)" }}>Mandi</th>
                <th style={{ padding: "12px", color: "var(--km-ink-soft)" }}>Min Price (₹)</th>
                <th style={{ padding: "12px", color: "var(--km-ink-soft)" }}>Max Price (₹)</th>
                <th style={{ padding: "12px", color: "var(--km-ink-soft)" }}>Modal Price (₹)</th>
                <th style={{ padding: "12px", color: "var(--km-ink-soft)" }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p._id} style={{ borderBottom: "1px solid var(--km-line)" }}>
                  <td style={{ padding: "12px" }}>
                    <strong style={{ color: "var(--km-ink)" }}>{p.cropName}</strong>
                    {p.cropNameKannada && <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>{p.cropNameKannada}</div>}
                  </td>
                  <td style={{ padding: "12px", color: "var(--km-ink-soft)" }}>{p.mandiName}</td>
                  <td style={{ padding: "12px" }}>{p.minPrice}</td>
                  <td style={{ padding: "12px" }}>{p.maxPrice}</td>
                  <td style={{ padding: "12px", fontSize: "1.1rem", fontWeight: "bold", color: "var(--km-forest-deep)" }}>{p.modalPrice}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", color: p.trend === "up" ? "var(--km-success)" : p.trend === "down" ? "var(--km-alert)" : "var(--km-ink-soft)" }}>
                      <TrendIcon trend={p.trend} />
                      {p.changePercent > 0 ? "+" : ""}{p.changePercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Alerts */}
      <div className="km-card">
        <div className="km-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0, color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Target size={18} /> {t("myAlerts")}
          </h3>
          <button className="km-btn km-btn--primary" onClick={() => setShowForm(!showForm)} style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? t("cancel") : t("setAlert")}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} style={{ marginBottom: 20, padding: 20, background: "var(--km-paper-dim)", borderRadius: "8px", border: "1px dashed var(--km-forest)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)", display: "block", marginBottom: "5px" }}>{t("cropName")}</label>
                <input className="km-input" style={{ width: "100%" }} required value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })} placeholder="e.g. Tomato" />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)", display: "block", marginBottom: "5px" }}>{t("targetPrice")} (₹/Quintal)</label>
                <input className="km-input" style={{ width: "100%" }} type="number" required value={form.targetPrice} onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} placeholder="e.g. 2200" />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)", display: "block", marginBottom: "5px" }}>Preferred Mandi (optional)</label>
                <input className="km-input" style={{ width: "100%" }} value={form.preferredMandi} onChange={(e) => setForm({ ...form, preferredMandi: e.target.value })} placeholder="e.g. Kolar APMC" />
              </div>
            </div>
            <button type="submit" className="km-btn km-btn--primary" style={{ width: "100%" }}>Save Target Price Alert</button>
          </form>
        )}

        {!alertsLoaded ? (
          <div role="status" style={{ padding: "20px", color: "var(--km-ink-soft)" }}>Loading saved price alerts...</div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--km-ink-soft)", backgroundColor: "#faf7f0", borderRadius: "8px", border: "1px dashed #ccc" }}>
            <Bell size={30} opacity={0.3} style={{ marginBottom: "10px" }} />
            <p style={{ margin: 0 }}>No active alerts. Set one to get notified immediately via SMS/App when prices rise.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
            {alerts.map((a) => (
              <div key={a._id} style={{ border: "1px solid var(--km-line)", backgroundColor: "#fff", borderRadius: "8px", padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div>
                  <strong style={{ fontSize: "1.1rem", color: "var(--km-ink)" }}>{a.cropName}</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", marginTop: "4px" }}>
                    Target: <strong style={{ color: "var(--km-forest-deep)" }}>₹{a.targetPrice}/Quintal</strong>
                  </div>
                </div>
                <button onClick={() => handleDelete(a._id)} style={{ background: "rgba(220, 38, 38, 0.1)", border: "none", color: "#DC2626", padding: "8px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Delete Alert">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
