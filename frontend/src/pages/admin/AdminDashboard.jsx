import { useState } from "react";
import { LayoutDashboard, Wallet, TrendingUp, FileWarning, Droplets, ScanLine } from "lucide-react";
import Header from "../../components/Header.jsx";
import AdminOverview from "./AdminOverview.jsx";
import AdminLoans from "./AdminLoans.jsx";
import AdminMandi from "./AdminMandi.jsx";
import AdminInsurance from "./AdminInsurance.jsx";
import AdminIrrigation from "./AdminIrrigation.jsx";
import AdminProducts from "./AdminProducts.jsx";
import AdminSOSMonitor from "./AdminSOSMonitor.jsx";

const TABS = [
  { key: "overview", icon: LayoutDashboard, label: "Overview", Component: AdminOverview },
  { key: "loans", icon: Wallet, label: "Loans & Debt", Component: AdminLoans },
  { key: "mandi", icon: TrendingUp, label: "Mandi Prices", Component: AdminMandi },
  { key: "insurance", icon: FileWarning, label: "Insurance Claims", Component: AdminInsurance },
  { key: "irrigation", icon: Droplets, label: "Irrigation", Component: AdminIrrigation },
  { key: "products", icon: ScanLine, label: "Product Registry", Component: AdminProducts },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const ActiveComponent = TABS.find((tb) => tb.key === active).Component;

  return (
    <div className="km-page">
      <Header />
      <nav className="km-nav-tabs">
        {TABS.map(({ key, icon: Icon, label }) => (
          <div key={key} className={`km-nav-tab ${active === key ? "active" : ""}`} onClick={() => setActive(key)}>
            <Icon size={15} /> {label}
          </div>
        ))}
      </nav>
      <AdminSOSMonitor />
      <main className="km-main">
        <ActiveComponent />
      </main>
    </div>
  );
}
