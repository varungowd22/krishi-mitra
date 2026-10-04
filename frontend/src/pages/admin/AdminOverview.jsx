import { useEffect, useState } from "react";
import { Users, AlertTriangle, FileWarning, Droplets, ScanLine, AlertOctagon, CheckCircle, Store, ShieldCheck, ShoppingCart } from "lucide-react";
import api from "../../utils/api.js";

export default function AdminOverview() {
  const [stats, setStats] = useState({ loans: 0, riskLoans: 0, claims: 0, pendingClaims: 0, slots: 0, counterfeitScans: 0 });
  const [sosAlerts, setSosAlerts] = useState([]);

  useEffect(() => {
    (async () => {
      const [loans, claims, slots, scans, sos] = await Promise.all([
        api.get("/loans/all"),
        api.get("/ams/insurance/all"),
        api.get("/irrigation"),
        api.get("/products/scans/counterfeit-report"),
        api.get("/sos/active")
      ]);
      setStats({
        loans: loans.data.length,
        riskLoans: loans.data.filter((l) => l.riskFlag).length,
        claims: claims.data.length,
        pendingClaims: claims.data.filter((c) => !["approved", "rejected", "paid"].includes(c.status)).length,
        slots: slots.data.length,
        counterfeitScans: scans.data.length,
      });
      setSosAlerts(sos.data);
    })();
  }, []);

  const resolveSOS = async (id) => {
    try {
      await api.patch(`/sos/${id}/resolve`);
      setSosAlerts(sosAlerts.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "SOS resolution was not saved.");
    }
  };

  const cards = [
    { icon: Users, label: "Total Loan Records", value: stats.loans, color: "var(--km-forest)" },
    { icon: AlertTriangle, label: "High-Risk Debt Cases", value: stats.riskLoans, color: "var(--km-alert)" },
    { icon: FileWarning, label: "Insurance Claims Filed", value: stats.claims, color: "var(--km-forest)" },
    { icon: FileWarning, label: "Claims Pending Review", value: stats.pendingClaims, color: "var(--km-saffron-deep)" },
    { icon: Droplets, label: "Irrigation Slots Scheduled", value: stats.slots, color: "var(--km-forest)" },
    { icon: ScanLine, label: "Counterfeit Scans Reported", value: stats.counterfeitScans, color: "var(--km-alert)" },
  ];

  return (
    <div>
      <div className="km-grid km-grid-3">
        {cards.map((c, i) => (
          <div key={i} className="km-card km-stat">
            <c.icon size={22} color={c.color} style={{ marginBottom: 6 }} />
            <div className="km-stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="km-stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {sosAlerts.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ fontSize: "1.2rem", color: "#d32f2f", display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid #d32f2f", paddingBottom: "10px", marginBottom: "15px" }}>
            <AlertOctagon /> ACTIVE SOS ALERTS ({sosAlerts.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {sosAlerts.map(alert => (
              <div key={alert._id} className="km-card" style={{ borderLeft: "5px solid #d32f2f", backgroundColor: "#fff5f5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#d32f2f", marginBottom: "5px" }}>
                      {alert.emergencyType}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--km-ink)", marginBottom: "4px" }}>
                      <strong>Farmer:</strong> {alert.farmer?.name} ({alert.farmer?.phone})
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>
                      <strong>Location:</strong> {alert.location?.address}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "8px" }}>
                      Triggered: {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button onClick={() => resolveSOS(alert._id)} style={{ padding: "8px 12px", background: "var(--km-success)", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                    <CheckCircle size={16}/> Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Vendor & Product Management Section added for Phase 3 */}
      <div style={{ marginTop: "30px", borderTop: "2px solid var(--km-line)", paddingTop: "20px" }}>
        <h2 style={{ fontSize: "1.2rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
          <Store size={22} /> B2B Marketplace Administration
        </h2>
        
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
           
           <div className="km-card" style={{ flex: 1, minWidth: "300px" }}>
              <h3 style={{ margin: "0 0 15px 0", fontSize: "1.05rem", color: "var(--km-ink)", display: "flex", alignItems: "center", gap: "8px" }}>
                 <ShieldCheck size={18} color="var(--km-saffron-deep)" /> Pending Vendor Verifications
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                 {/* Mock Pending Vendor */}
                 <div style={{ padding: "12px", border: "1px solid var(--km-line)", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                       <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>Kisan Agro Store</div>
                       <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>GST: 29ABCDE1234F1Z5 • Kolar</div>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                       <button className="km-btn km-btn--primary" style={{ padding: "6px", fontSize: "0.75rem" }}>Verify</button>
                       <button className="km-btn km-btn--outline" style={{ padding: "6px", fontSize: "0.75rem", color: "var(--km-alert)", borderColor: "var(--km-alert)" }}>Reject</button>
                    </div>
                 </div>
                 {/* Mock Pending Vendor */}
                 <div style={{ padding: "12px", border: "1px solid var(--km-line)", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                       <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>GreenTech Fertilizers</div>
                       <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>License: KKA-AGR-0442 • Hubli</div>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                       <button className="km-btn km-btn--primary" style={{ padding: "6px", fontSize: "0.75rem" }}>Verify</button>
                       <button className="km-btn km-btn--outline" style={{ padding: "6px", fontSize: "0.75rem", color: "var(--km-alert)", borderColor: "var(--km-alert)" }}>Reject</button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="km-card" style={{ flex: 1, minWidth: "300px" }}>
              <h3 style={{ margin: "0 0 15px 0", fontSize: "1.05rem", color: "var(--km-ink)", display: "flex", alignItems: "center", gap: "8px" }}>
                 <ShoppingCart size={18} color="var(--km-success)" /> Product Approvals
              </h3>
              <table className="km-table" style={{ width: "100%", fontSize: "0.85rem" }}>
                 <thead>
                    <tr style={{ backgroundColor: "var(--km-paper-dim)", textAlign: "left" }}>
                       <th style={{ padding: "8px" }}>Vendor</th>
                       <th style={{ padding: "8px" }}>Product</th>
                       <th style={{ padding: "8px" }}>Action</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr style={{ borderBottom: "1px solid var(--km-line)" }}>
                       <td style={{ padding: "8px" }}>Sri Rama Seeds</td>
                       <td style={{ padding: "8px", fontWeight: "bold" }}>Hybrid Corn Seeds (2kg)</td>
                       <td style={{ padding: "8px" }}>
                          <button className="km-btn km-btn--outline" style={{ padding: "4px 8px", fontSize: "0.7rem", color: "var(--km-success)", borderColor: "var(--km-success)" }}>Approve</button>
                       </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--km-line)" }}>
                       <td style={{ padding: "8px" }}>Bayer Direct</td>
                       <td style={{ padding: "8px", fontWeight: "bold" }}>Confidor Pesticide (1L)</td>
                       <td style={{ padding: "8px" }}>
                          <button className="km-btn km-btn--outline" style={{ padding: "4px 8px", fontSize: "0.7rem", color: "var(--km-success)", borderColor: "var(--km-success)" }}>Approve</button>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>

        </div>
      </div>
    </div>
  );
}
