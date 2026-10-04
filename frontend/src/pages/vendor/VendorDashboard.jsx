import React, { useState } from "react";
import { 
  Store, ScanLine, ShoppingCart, TrendingUp, IndianRupee, Package, 
  Truck, Star, ShieldCheck, CreditCard, Clock, Activity, Calendar, MapPin
} from "lucide-react";
import Header from "../../components/Header.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const TABS = [
  { id: "sales", label: "Sales Dashboard", icon: TrendingUp },
  { id: "orders", label: "Order Management", icon: ShoppingCart },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "deliveries", label: "Delivery Tracking", icon: Truck },
  { id: "payments", label: "Payments & Earnings", icon: IndianRupee },
  { id: "reviews", label: "Reviews & Ratings", icon: Star },
];

export default function VendorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("sales");

  // --- Mock Data ---
  const salesData = { total: "₹4,52,000", today: "₹12,400", monthly: "₹1,25,000", pending: 4 };
  
  const orders = [
    { id: "ORD-2991", farmer: "Ramesh K.", date: "Today, 09:30 AM", status: "New", amount: "₹4,500", items: "2x Urea 50kg" },
    { id: "ORD-2990", farmer: "Suresh P.", date: "Yesterday, 14:15 PM", status: "Processing", amount: "₹12,000", items: "1x Drip Irrigation Kit" },
    { id: "ORD-2989", farmer: "Gowda M.", date: "Oct 24, 11:00 AM", status: "Shipped", amount: "₹3,200", items: "4x Hybrid Tomato Seeds" },
    { id: "ORD-2988", farmer: "Lingaraju", date: "Oct 22, 16:45 PM", status: "Delivered", amount: "₹18,500", items: "1x Mini Tractor Attachment" }
  ];

  const inventory = [
    { id: "INV-3", name: "Arka Rakshak Tomato Seeds", vendor: "IIHR Bangalore", category: "Seeds", price: "₹450", stock: 150, status: "In Stock", image: "/arka_rakshak_seeds.png" },
    { id: "INV-1", name: "Coromandel Urea (50kg)", vendor: "Coromandel", category: "Fertilizer", price: "₹266", stock: 45, status: "In Stock", image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100&h=100&fit=crop" },
    { id: "INV-2", name: "Bayer Nativo Fungicide", vendor: "Bayer CropScience", category: "Pesticide", price: "₹800", stock: 8, status: "Low Stock", image: "/nativo-fungicide.svg" },
    { id: "INV-4", name: "Honda Water Pump (5HP)", vendor: "Honda Agro", category: "Machinery", price: "₹18,500", stock: 12, status: "In Stock", image: "/honda-water-pump.jpg" },
  ];

  // --- Render Functions ---

  const renderSalesDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
        <div className="km-card" style={{ borderBottom: "4px solid var(--km-forest)" }}>
           <div style={{ color: "var(--km-ink-soft)", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase" }}>Total Sales (YTD)</div>
           <div style={{ fontSize: "1.8rem", fontWeight: "black", color: "var(--km-forest-deep)", marginTop: "5px" }}>{salesData.total}</div>
        </div>
        <div className="km-card" style={{ borderBottom: "4px solid var(--km-saffron)" }}>
           <div style={{ color: "var(--km-ink-soft)", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase" }}>Today's Sales</div>
           <div style={{ fontSize: "1.8rem", fontWeight: "black", color: "var(--km-saffron-deep)", marginTop: "5px" }}>{salesData.today}</div>
        </div>
        <div className="km-card" style={{ borderBottom: "4px solid var(--km-success)" }}>
           <div style={{ color: "var(--km-ink-soft)", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase" }}>Monthly Sales</div>
           <div style={{ fontSize: "1.8rem", fontWeight: "black", color: "var(--km-success)", marginTop: "5px" }}>{salesData.monthly}</div>
        </div>
        <div className="km-card" style={{ borderBottom: "4px solid var(--km-alert)" }}>
           <div style={{ color: "var(--km-ink-soft)", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase" }}>Pending Orders</div>
           <div style={{ fontSize: "1.8rem", fontWeight: "black", color: "var(--km-alert)", marginTop: "5px" }}>{salesData.pending}</div>
        </div>
      </div>
      
      <div className="km-card">
         <h3 style={{ margin: "0 0 15px 0", color: "var(--km-forest-deep)", fontSize: "1.1rem" }}>Best Selling Products</h3>
         <table className="km-table" style={{ width: "100%", borderCollapse: "collapse" }}>
           <thead>
             <tr style={{ backgroundColor: "var(--km-paper-dim)", textAlign: "left" }}>
               <th style={{ padding: "10px" }}>Product Name</th>
               <th style={{ padding: "10px" }}>Category</th>
               <th style={{ padding: "10px" }}>Units Sold</th>
               <th style={{ padding: "10px" }}>Revenue</th>
             </tr>
           </thead>
           <tbody>
             <tr style={{ borderBottom: "1px solid var(--km-line)" }}>
               <td style={{ padding: "10px" }}>Coromandel Urea (50kg)</td>
               <td style={{ padding: "10px" }}>Fertilizer</td>
               <td style={{ padding: "10px" }}>450</td>
               <td style={{ padding: "10px", fontWeight: "bold" }}>₹2,25,000</td>
             </tr>
             <tr style={{ borderBottom: "1px solid var(--km-line)" }}>
               <td style={{ padding: "10px" }}>Bayer Nativo Fungicide</td>
               <td style={{ padding: "10px" }}>Pesticide</td>
               <td style={{ padding: "10px" }}>120</td>
               <td style={{ padding: "10px", fontWeight: "bold" }}>₹96,000</td>
             </tr>
           </tbody>
         </table>
      </div>
    </div>
  );

  const renderOrderManagement = () => (
    <div className="km-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px", borderBottom: "1px solid var(--km-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <h3 style={{ margin: 0, color: "var(--km-forest-deep)", fontSize: "1.1rem" }}>Order Management</h3>
         <div style={{ display: "flex", gap: "10px" }}>
            <button className="km-btn km-btn--outline" style={{ fontSize: "0.8rem", padding: "5px 10px" }}>Filter: All</button>
            <button className="km-btn km-btn--primary" style={{ fontSize: "0.8rem", padding: "5px 10px" }}>Download Invoice Export</button>
         </div>
      </div>
      <table className="km-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "var(--km-paper-dim)", textAlign: "left" }}>
            <th style={{ padding: "12px" }}>Order ID</th>
            <th style={{ padding: "12px" }}>Date & Time</th>
            <th style={{ padding: "12px" }}>Farmer / Customer</th>
            <th style={{ padding: "12px" }}>Items</th>
            <th style={{ padding: "12px" }}>Amount</th>
            <th style={{ padding: "12px" }}>Status</th>
            <th style={{ padding: "12px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: "1px solid var(--km-line)" }}>
              <td style={{ padding: "12px", fontWeight: "bold", color: "var(--km-forest)" }}>{o.id}</td>
              <td style={{ padding: "12px", fontSize: "0.85rem" }}>{o.date}</td>
              <td style={{ padding: "12px", fontWeight: "bold" }}>{o.farmer}</td>
              <td style={{ padding: "12px", fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>{o.items}</td>
              <td style={{ padding: "12px", fontWeight: "bold" }}>{o.amount}</td>
              <td style={{ padding: "12px" }}>
                <span style={{
                  padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold",
                  backgroundColor: o.status === "New" ? "#E0F2FE" : o.status === "Processing" ? "#FEF3C7" : o.status === "Shipped" ? "#F3E8FF" : "#DCFCE7",
                  color: o.status === "New" ? "#0284C7" : o.status === "Processing" ? "#D97706" : o.status === "Shipped" ? "#9333EA" : "#16A34A"
                }}>
                  {o.status}
                </span>
              </td>
              <td style={{ padding: "12px" }}>
                <button className="km-btn km-btn--outline" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderInventory = () => (
    <div className="km-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px", borderBottom: "1px solid var(--km-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <h3 style={{ margin: 0, color: "var(--km-forest-deep)", fontSize: "1.1rem" }}>Inventory & Stock Management</h3>
         <button className="km-btn km-btn--primary" style={{ fontSize: "0.8rem", padding: "5px 10px", display: "flex", alignItems: "center", gap: "5px" }}>
            <ScanLine size={16}/> Add New Product
         </button>
      </div>
      <table className="km-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "var(--km-paper-dim)", textAlign: "left" }}>
            <th style={{ padding: "12px" }}>Product</th>
            <th style={{ padding: "12px" }}>Producer / Vendor</th>
            <th style={{ padding: "12px" }}>Category</th>
            <th style={{ padding: "12px" }}>Unit Price</th>
            <th style={{ padding: "12px" }}>Stock</th>
            <th style={{ padding: "12px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((inv) => (
            <tr key={inv.id} style={{ borderBottom: "1px solid var(--km-line)" }}>
              <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <img src={inv.image} alt={inv.name} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--km-line)" }} />
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{inv.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>{inv.id}</div>
                </div>
              </td>
              <td style={{ padding: "12px", fontSize: "0.88rem", fontWeight: "600", color: "var(--km-forest)" }}>{inv.vendor}</td>
              <td style={{ padding: "12px", fontSize: "0.85rem" }}>{inv.category}</td>
              <td style={{ padding: "12px", fontWeight: "bold", fontSize: "1rem", color: "var(--km-forest-deep)" }}>{inv.price}</td>
              <td style={{ padding: "12px", fontWeight: "bold", fontSize: "1.1rem" }}>{inv.stock}</td>
              <td style={{ padding: "12px" }}>
                <span style={{
                  padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold",
                  backgroundColor: inv.status === "In Stock" ? "#DCFCE7" : inv.status === "Low Stock" ? "#FEF3C7" : "#FEE2E2",
                  color: inv.status === "In Stock" ? "#16A34A" : inv.status === "Low Stock" ? "#D97706" : "#DC2626"
                }}>
                  {inv.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPayments = () => (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
       <div className="km-card" style={{ flex: 1, minWidth: "300px" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "var(--km-forest-deep)", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
             <CreditCard size={20} /> Vendor Earnings & Settlement
          </h3>
          <div style={{ backgroundColor: "rgba(11, 61, 46, 0.05)", padding: "20px", borderRadius: "8px", border: "1px solid var(--km-forest)" }}>
             <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", fontWeight: "bold", textTransform: "uppercase" }}>Available for Settlement</div>
             <div style={{ fontSize: "2.2rem", fontWeight: "black", color: "var(--km-forest-deep)", margin: "5px 0 15px 0" }}>₹42,500</div>
             <button className="km-btn km-btn--primary" style={{ width: "100%" }}>Withdraw to Bank Account</button>
          </div>

          <div style={{ marginTop: "20px" }}>
             <h4 style={{ fontSize: "0.9rem", color: "var(--km-ink)" }}>Recent Transactions</h4>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed var(--km-line)" }}>
                <div>
                   <div style={{ fontWeight: "bold", fontSize: "0.85rem" }}>Order ORD-2988 (UPI)</div>
                   <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>Oct 22 • Commission: 2%</div>
                </div>
                <div style={{ fontWeight: "bold", color: "var(--km-success)" }}>+₹18,130</div>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed var(--km-line)" }}>
                <div>
                   <div style={{ fontWeight: "bold", fontSize: "0.85rem" }}>Settlement Withdrawal</div>
                   <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>Oct 20 • Bank Transfer</div>
                </div>
                <div style={{ fontWeight: "bold", color: "var(--km-alert)" }}>-₹50,000</div>
             </div>
          </div>
       </div>

       <div className="km-card" style={{ flex: 1, minWidth: "300px" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "var(--km-forest-deep)", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
             <Activity size={20} /> Admin & Commission Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "#F0FDF4", borderRadius: "8px" }}>
                <ShieldCheck size={24} color="#16A34A" />
                <div>
                   <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#166534" }}>Vendor Verified</div>
                   <div style={{ fontSize: "0.75rem", color: "#15803D" }}>Account approved by Dept of Agriculture</div>
                </div>
             </div>
             
             <div style={{ padding: "15px", border: "1px solid var(--km-line)", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--km-ink)", marginBottom: "10px" }}>Current Commission Rates</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "5px" }}>
                   <span>Seeds & Fertilizers</span>
                   <strong>2.0%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "5px" }}>
                   <span>Machinery</span>
                   <strong>1.5%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "5px" }}>
                   <span>Organic Products</span>
                   <strong>0.5% (Subsidized)</strong>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="km-page" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Header />
      
      {/* Top Banner */}
      <div style={{ backgroundColor: "var(--km-forest-deep)", padding: "20px 40px", color: "white" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ width: "60px", height: "60px", backgroundColor: "var(--km-saffron)", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center" }}>
               <Store size={32} color="white" />
            </div>
            <div>
               <h1 style={{ margin: "0 0 5px 0", fontSize: "1.5rem" }}>{user?.company || "Vendor Operations Center"}</h1>
               <div style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={14} /> Gov Verified • License: {user?.licenseNumber || "KKA-AGR-0992"} • <MapPin size={14} /> {user?.village || "Bengaluru Rural"}
               </div>
            </div>
         </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 40px" }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid var(--km-line)", paddingBottom: "10px", marginBottom: "20px", overflowX: "auto" }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 15px",
                  backgroundColor: isActive ? "var(--km-forest)" : "transparent",
                  color: isActive ? "white" : "var(--km-ink-soft)",
                  border: "none", borderRadius: "8px",
                  fontWeight: "bold", fontSize: "0.9rem",
                  cursor: "pointer", whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                <Icon size={18} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Dynamic Content */}
        <div>
          {activeTab === "sales" && renderSalesDashboard()}
          {activeTab === "orders" && renderOrderManagement()}
          {activeTab === "inventory" && renderInventory()}
          {activeTab === "payments" && renderPayments()}
          
          {/* Deliveries & Reviews Fallback */}
          {(activeTab === "deliveries" || activeTab === "reviews") && (
            <div className="km-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "var(--km-ink-soft)" }}>
               {activeTab === "deliveries" ? <Truck size={48} opacity={0.2} style={{ marginBottom: "15px" }} /> : <Star size={48} opacity={0.2} style={{ marginBottom: "15px" }} />}
               <h3 style={{ margin: "0 0 10px 0", color: "var(--km-ink)" }}>{activeTab === "deliveries" ? "Delivery Tracking Integration" : "Customer Reviews"}</h3>
               <p style={{ textAlign: "center", maxWidth: "400px" }}>
                  {activeTab === "deliveries" 
                    ? "Link your logistics partner (e.g., Delhivery, India Post) to auto-track orders in real-time."
                    : "Products will receive ratings here once Farmers start leaving feedback on delivered orders."}
               </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
