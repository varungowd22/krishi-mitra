import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import api from "../../utils/api.js";
import StampBadge from "../../components/StampBadge.jsx";

const fmtINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/loans/all").then((res) => setLoans(res.data));
  }, []);

  const filtered = filter === "risk" ? loans.filter((l) => l.riskFlag) : filter === "overdue" ? loans.filter((l) => l.status === "overdue") : loans;

  return (
    <div className="km-card">
      <div className="km-card-title">
        <h3 style={{ fontSize: "1.05rem" }}>Farmer Loan & Debt Monitoring</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "overdue", "risk"].map((f) => (
            <button key={f} className={`km-btn ${filter === f ? "km-btn--primary" : "km-btn--outline"}`} style={{ fontSize: "0.78rem", padding: "6px 12px" }} onClick={() => setFilter(f)}>
              {f === "risk" ? "High Risk" : f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="km-table">
          <thead>
            <tr>
              <th>Farmer</th>
              <th>Village</th>
              <th>Lender</th>
              <th>Principal</th>
              <th>Outstanding</th>
              <th>Interest</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l._id}>
                <td>{l.farmer?.name}</td>
                <td>{l.farmer?.village}</td>
                <td>{l.lenderName}</td>
                <td>{fmtINR(l.principalAmount)}</td>
                <td>{fmtINR(l.principalAmount - l.amountRepaid)}</td>
                <td>
                  {l.interestRatePercent}%
                  {l.riskFlag && <AlertTriangle size={13} color="var(--km-alert)" style={{ marginLeft: 4, verticalAlign: "middle" }} />}
                </td>
                <td><StampBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="km-empty">No records match this filter.</p>}
      </div>
    </div>
  );
}
