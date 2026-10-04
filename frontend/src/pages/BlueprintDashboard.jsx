import React, { useState } from "react";
import { Activity, Database, FolderTree, Smartphone, LogOut, Code2, QrCode, MonitorPlay, FileJson, Play, Brain, ChevronRight, User, CheckCircle, Map, Droplet, Sprout, Wind, Building, CloudRain, Cpu, BarChart3, Cloud, ShieldAlert, Mic, Settings, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BlueprintDashboard() {
  const [activeTab, setActiveTab] = useState("projectFiles");
  const navigate = useNavigate();

  const handleExit = () => {
    navigate("/");
  };

  const tabs = [
    { id: "animation", icon: MonitorPlay, label: "3D System\nAnimation" },
    { id: "rest", icon: Code2, label: "REST\nEndpoints" },
    { id: "models", icon: Database, label: "Mongoose\nModels" },
    { id: "projectFiles", icon: Code2, label: "Project\nFiles" },
    { id: "mobileQR", icon: Smartphone, label: "Mobile Sync\nQR" }
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#111111", 
      color: "#e0e0e0", 
      fontFamily: "var(--font-mono)", 
      padding: "20px" 
    }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333", paddingBottom: "15px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
           <div style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "var(--km-saffron-deep)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src="/emblem.png" alt="Emblem" style={{ width: "30px", filter: "brightness(0) invert(1)" }} onError={(e) => e.target.style.display='none'} />
           </div>
           <div>
              <div style={{ fontSize: "0.75rem", color: "var(--km-saffron)", fontWeight: "bold", letterSpacing: "1px" }}>GOVERNMENT OF KARNATAKA - 3D AUDIT NODE</div>
              <h1 style={{ fontSize: "1.4rem", margin: "5px 0 0 0", color: "#fff" }}>Krishi Mitra — 3D Architecture & Gemini AI Blueprint</h1>
           </div>
        </div>
        <div style={{ display: "flex", gap: "15px" }}>
           <button style={{ 
             backgroundColor: "transparent", border: "1px solid var(--km-saffron)", color: "var(--km-saffron)", 
             padding: "8px 15px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px",
             cursor: "pointer", fontWeight: "bold"
           }}>
             <Activity size={16} /> Evaluator Mode
           </button>
           <button onClick={handleExit} style={{ 
             backgroundColor: "var(--km-alert)", border: "none", color: "#fff", 
             padding: "8px 15px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px",
             cursor: "pointer", fontWeight: "bold"
           }}>
             <LogOut size={16} /> Exit Blueprint
           </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", padding: "10px", marginBottom: "20px" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--km-success)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
           <Activity size={16} /> <strong>3D PERSPECTIVE INTERFACE</strong> 
        </div>
        <div style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "15px" }}>
           Interactive 3D blueprint model demonstrating live micro-transactions, Google Gemini prompts, and Mongoose operations.
        </div>
        
        <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
           <div style={{ display: "flex", gap: "5px", border: "1px solid #444", borderRadius: "4px", padding: "4px", backgroundColor: "#222", alignItems: "center", marginRight: "10px" }}>
              <span style={{ padding: "5px", color: "#888", cursor: "pointer" }}>↺</span>
              <span style={{ padding: "5px", color: "#888", cursor: "pointer" }}>⟲</span>
              <span style={{ padding: "5px", color: "#888", cursor: "pointer" }}>⤡</span>
              <span style={{ padding: "5px", color: "#888", cursor: "pointer" }}>🔍</span>
           </div>
           
           {tabs.map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               style={{
                 backgroundColor: activeTab === tab.id ? "rgba(45, 106, 79, 0.2)" : "transparent",
                 border: activeTab === tab.id ? "1px solid var(--km-success)" : "1px solid #444",
                 color: activeTab === tab.id ? "var(--km-success)" : "#888",
                 padding: "8px 15px",
                 borderRadius: "4px",
                 display: "flex",
                 alignItems: "center",
                 gap: "10px",
                 cursor: "pointer",
                 whiteSpace: "pre-wrap",
                 textAlign: "left",
                 fontSize: "0.8rem",
                 minWidth: "140px"
               }}
             >
               <tab.icon size={18} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", padding: "20px" }}>
        
        {/* TAB: PROJECT FILES */}
        {activeTab === "projectFiles" && (
          <div>
            <h2 style={{ fontSize: "1rem", color: "var(--km-saffron)", marginBottom: "20px", textTransform: "uppercase" }}>
              KRISHI MITRA COMPONENT REGISTRY TREE
            </h2>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              
              <div style={{ flex: 1, border: "1px solid #333", borderRadius: "6px", padding: "20px", minWidth: "300px" }}>
                <h3 style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                  <Activity size={16} /> Backend Directories
                </h3>
                <pre style={{ margin: 0, fontSize: "0.85rem", color: "#aaa", lineHeight: "1.8" }}>
├─ server.js (startup REST hub)<br/>
├─ models/<br/>
│  ├─ User.js, Loan.js, Cow.js, MilkRecord.js,<br/>
│  │  InsuranceClaim.js, PowerSchedule.js,<br/>
│  │  PowerOutageReport.js<br/>
├─ routes/<br/>
│  ├─ authRoutes.js, loanRoutes.js, amsRoutes.js,<br/>
│  │  powerRoutes.js<br/>
├─ seed/<br/>
│  ├─ seedData.js (Aadhaar & APMC seeder)<br/>
                </pre>
              </div>

              <div style={{ flex: 1, border: "1px solid #333", borderRadius: "6px", padding: "20px", minWidth: "300px" }}>
                <h3 style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                  <FolderTree size={16} color="#8892b0" /> Frontend Directories
                </h3>
                <pre style={{ margin: 0, fontSize: "0.85rem", color: "#aaa", lineHeight: "1.8" }}>
├─ src/<br/>
│  ├─ App.jsx & main.jsx (router root)<br/>
│  ├─ context/ (AuthContext, LangContext)<br/>
│  ├─ pages/<br/>
│  │  ├─ Login.jsx, Register.jsx,<br/>
│  │  │  BlueprintDashboard.jsx<br/>
│  │  ├─ farmer/ (LoanTracker, MandiPrices,<br/>
│  │  │  PesticideDetector, Power, Drones, Dairy)<br/>
│  │  ├─ admin/ (AdminFarmers, AdminInsurance,<br/>
│  │  │  AdminSubsidies, AdminPower)<br/>
│  │  ├─ vendor/ (VendorDashboard)<br/>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MONGOOSE MODELS */}
        {activeTab === "models" && (
          <div>
            <h2 style={{ fontSize: "1rem", color: "var(--km-saffron)", marginBottom: "20px", textTransform: "uppercase" }}>
              MONGODB DATA SCHEMAS (MONGOOSE MODEL LAYER)
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" }}>
              
              {/* Card 1 */}
              <div style={{ border: "1px solid #333", borderRadius: "6px", padding: "15px", backgroundColor: "#111" }}>
                <h3 style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px 0" }}>
                  <Database size={14} color="var(--km-alert)" /> User.js
                </h3>
                <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 10px 0" }}>Stores user credentials, role authentication, and geography.</p>
                <div style={{ fontSize: "0.8rem", color: "#ccc", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>name</span><span>String</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>phone</span><span>String (Unique)</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>role</span><span>Enum ['farmer', 'admin', 'vendor']</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>district / taluk / hobli</span><span>String</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>landAcres</span><span>Number</span></div>
                </div>
              </div>

              {/* Card 2 */}
              <div style={{ border: "1px solid #333", borderRadius: "6px", padding: "15px", backgroundColor: "#111" }}>
                <h3 style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px 0" }}>
                  <Database size={14} color="var(--km-alert)" /> Loan.js
                </h3>
                <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 10px 0" }}>Audits private and public loan records to detect debt trap conditions.</p>
                <div style={{ fontSize: "0.8rem", color: "#ccc", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>farmer</span><span>ObjectId ref 'User'</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>lenderName / lenderType</span><span>String & Enum</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>principalAmount</span><span>Number</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>interestRatePercent</span><span>Number</span></div>
                </div>
              </div>

              {/* Card 3 */}
              <div style={{ border: "1px solid #333", borderRadius: "6px", padding: "15px", backgroundColor: "#111" }}>
                <h3 style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px 0" }}>
                  <Database size={14} color="var(--km-alert)" /> PowerSchedule.js
                </h3>
                <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 10px 0" }}>Stores location-based scheduled electricity availability windows.</p>
                <div style={{ fontSize: "0.8rem", color: "#ccc", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>district / taluk / hobli / village / pinCode</span><span>String</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>provider</span><span>String (BESCOM, HESCOM, etc.)</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>morningStart / morningEnd</span><span>String (e.g. '06:00')</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>afternoonStart / afternoonEnd</span><span>String</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>nightStart / nightEnd</span><span>String</span></div>
                </div>
              </div>
              
              {/* Card 4 */}
              <div style={{ border: "1px solid #333", borderRadius: "6px", padding: "15px", backgroundColor: "#111" }}>
                <h3 style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px 0" }}>
                  <Database size={14} color="var(--km-alert)" /> PowerOutageReport.js
                </h3>
                <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 10px 0" }}>Customer-reported electricity grid outage logs.</p>
                <div style={{ fontSize: "0.8rem", color: "#ccc", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>farmer</span><span>ObjectId ref 'User'</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>village / taluk / district / pinCode</span><span>String</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>details / photo</span><span>String (Description & Base64)</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>latitude / longitude</span><span>Number (GPS Coordinates)</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--km-success)" }}>status</span><span>Enum ['Reported', 'Investigating', 'Resolved']</span></div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: MOBILE SYNC QR */}
        {activeTab === "mobileQR" && (
          <div>
            <h2 style={{ fontSize: "1rem", color: "var(--km-saffron)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", textTransform: "uppercase" }}>
              <Smartphone size={18} /> Mobile Live Synchronization Hub
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: "20px" }}>
              Synchronize this local developer environment with any real mobile device to test layouts, voice synthesis, and SOS telemetry instantly.
            </p>
            
            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
               {/* QR Box */}
               <div style={{ flex: 1, maxWidth: "350px", border: "1px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#111" }}>
                  <h3 style={{ fontSize: "1rem", color: "#fff", margin: "0 0 15px 0" }}>Scan to Open Krishi Mitra</h3>
                  <div style={{ width: "200px", height: "200px", backgroundColor: "#fff", padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>
                     {/* Dummy QR Code using an SVG or Image, here we use a placeholder SVG */}
                     <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                        <path d="M7 7h.01M18 7h.01M18 18h.01M7 18h.01M10 10v4M14 14V10M10 14h4"></path>
                     </svg>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "5px" }}>Computer Local IP Address</div>
                  <div style={{ padding: "8px 15px", border: "1px solid var(--km-saffron)", borderRadius: "4px", color: "var(--km-saffron)", fontWeight: "bold", width: "100%", textAlign: "center", marginBottom: "10px" }}>
                    polite-spiders-beam.loca.lt
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#666", textAlign: "center" }}>
                    Encoded URL: https://polite-spiders-beam.loca.lt/login
                  </div>
               </div>

               {/* Instructions */}
               <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "15px" }}>
                  <h3 style={{ fontSize: "1rem", color: "var(--km-saffron)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <FileJson size={18} /> Connection Guidelines
                  </h3>
                  
                  <div style={{ display: "flex", gap: "10px" }}>
                     <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--km-saffron)", color: "#000", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "0.8rem", flexShrink: 0 }}>1</div>
                     <div>
                       <strong style={{ color: "var(--km-success)", fontSize: "0.9rem" }}>Real Public Live Proxy:</strong>
                       <p style={{ fontSize: "0.85rem", color: "#aaa", margin: "5px 0 0 0", lineHeight: "1.5" }}>
                         You can access the project worldwide at: <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>https://polite-spiders-beam.loca.lt</a>. Scans from any network connection will resolve automatically!
                       </p>
                     </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                     <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--km-saffron)", color: "#000", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "0.8rem", flexShrink: 0 }}>2</div>
                     <div>
                       <strong style={{ color: "var(--km-success)", fontSize: "0.9rem" }}>Local IP Fallback (If Wi-Fi only):</strong>
                       <p style={{ fontSize: "0.85rem", color: "#aaa", margin: "5px 0 0 0", lineHeight: "1.5" }}>
                         If accessing locally, make sure your mobile device is connected to the same Wi-Fi router. The local IPv4 address is: <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>http://polite-spiders-beam.loca.lt:5174/</a>.
                       </p>
                     </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                     <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--km-saffron)", color: "#000", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "0.8rem", flexShrink: 0 }}>3</div>
                     <div>
                       <strong style={{ color: "var(--km-success)", fontSize: "0.9rem" }}>Scan and Access:</strong>
                       <p style={{ fontSize: "0.85rem", color: "#aaa", margin: "5px 0 0 0", lineHeight: "1.5" }}>
                         Scan this QR code with any native smartphone camera application. It will parse the link and open the site instantly in Safari, Chrome, or Firefox.
                       </p>
                     </div>
                  </div>

                  <div style={{ marginTop: "15px", padding: "15px", border: "1px solid #444", borderRadius: "6px", backgroundColor: "#222" }}>
                    <strong style={{ color: "#fff", fontSize: "0.85rem" }}>💡 Localtunnel Tip:</strong>
                    <span style={{ color: "#aaa", fontSize: "0.85rem", marginLeft: "5px" }}>
                      If accessing via localtunnel, the first page might ask you to submit your host's public IP address. Simply enter the public IP address listed on that screen to authorize connection.
                    </span>
                  </div>
               </div>
            </div>
          </div>
        )}
        
        {/* TAB: ANIMATION (20 SLIDES GRID) */}
        {activeTab === "animation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* 20 SLIDES GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
              
              {/* Slide Generator Helper */}
              {(() => {
                const slides = [
                  { num: "1", title: "INTRODUCTION", time: "00:00", desc: "Welcome to Krishi Mitra, an AI Powered Smart Agriculture Platform.", content: (
                    <div style={{ textAlign: "center", paddingTop: "20px" }}>
                       <h2 style={{ color: "var(--km-success)", margin: 0 }}>KRISHI MITRA</h2>
                       <p style={{ fontSize: "0.7rem", color: "#aaa" }}>AI POWERED SMART AGRICULTURE PLATFORM</p>
                    </div>
                  )},
                  { num: "2", title: "SYSTEM INITIALIZATION", time: "00:30", desc: "Initializing all AI modules and secure government services.", content: (
                    <div style={{ fontSize: "0.7rem", color: "#fff", display: "flex", flexDirection: "column", gap: "5px", paddingTop: "10px" }}>
                       <div style={{ color: "var(--km-success)" }}>✔ React Frontend Loaded</div>
                       <div style={{ color: "var(--km-success)" }}>✔ Express Server Connected</div>
                       <div style={{ color: "var(--km-success)" }}>✔ MongoDB Connected</div>
                       <div style={{ color: "var(--km-success)" }}>✔ Gemini AI Connected</div>
                       <div style={{ color: "var(--km-success)" }}>✔ Government APIs Connected</div>
                    </div>
                  )},
                  { num: "3", title: "FARMER REGISTRATION", time: "01:00", desc: "Farmer registers using Aadhaar, verifies OTP and accesses dashboard.", content: (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                       <div style={{ border: "1px solid #444", borderRadius: "8px", padding: "10px", width: "80%" }}>
                          <div style={{ fontSize: "0.6rem", color: "#aaa", marginBottom: "5px" }}>Aadhaar Number</div>
                          <div style={{ border: "1px solid #333", padding: "5px", marginBottom: "5px", fontSize: "0.7rem" }}>XXXX XXXX 4567</div>
                          <div style={{ backgroundColor: "var(--km-success)", color: "#000", padding: "5px", textAlign: "center", fontSize: "0.7rem", borderRadius: "4px" }}>Verify OTP</div>
                       </div>
                    </div>
                  )},
                  { num: "4", title: "DASHBOARD OVERVIEW", time: "01:30", desc: "All farming needs, government services, and AI tools in one dashboard.", content: (
                    <div style={{ display: "flex", gap: "5px", height: "100%", alignItems: "center", padding: "10px" }}>
                       <div style={{ flex: 1, border: "1px solid #333", height: "100%", padding: "5px" }}>
                         <div style={{ height: "4px", backgroundColor: "#333", marginBottom: "4px" }} />
                         <div style={{ height: "4px", backgroundColor: "#333", marginBottom: "4px" }} />
                         <div style={{ height: "4px", backgroundColor: "#333", marginBottom: "4px" }} />
                       </div>
                       <div style={{ flex: 3, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                         <div style={{ backgroundColor: "#222", padding: "5px", textAlign: "center" }}><span style={{ color: "var(--km-success)", fontSize: "0.8rem" }}>Good</span><br/><span style={{ fontSize: "0.5rem" }}>Soil</span></div>
                         <div style={{ backgroundColor: "#222", padding: "5px", textAlign: "center" }}><span style={{ color: "#fff", fontSize: "0.8rem" }}>28°C</span><br/><span style={{ fontSize: "0.5rem" }}>Weather</span></div>
                         <div style={{ backgroundColor: "#222", padding: "5px", textAlign: "center" }}><span style={{ color: "var(--km-saffron)", fontSize: "0.8rem" }}>₹19</span><br/><span style={{ fontSize: "0.5rem" }}>Price</span></div>
                         <div style={{ backgroundColor: "#222", padding: "5px", textAlign: "center" }}><span style={{ color: "var(--km-success)", fontSize: "0.8rem" }}>Active</span><br/><span style={{ fontSize: "0.5rem" }}>Insurance</span></div>
                       </div>
                    </div>
                  )},
                  { num: "5", title: "DISEASE DETECTION (AI)", time: "02:00", desc: "AI scans crop leaves, detects diseases, and recommends the best medicine.", content: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%", padding: "0 10px" }}>
                       <Smartphone size={24} color="var(--km-success)" />
                       <ChevronRight size={16} color="#666" />
                       <Brain size={24} color="var(--km-saffron)" />
                       <ChevronRight size={16} color="#666" />
                       <div style={{ fontSize: "0.6rem", textAlign: "center" }}>Leaf Blast<br/><span style={{ color: "var(--km-success)" }}>98.8%</span></div>
                    </div>
                  )},
                  { num: "6", title: "FERTILIZER RECOMMENDATION", time: "02:30", desc: "AI analyzes soil nutrients and recommends the right fertilizers.", content: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%", padding: "0 10px" }}>
                       <div style={{ fontSize: "0.6rem", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div>N <span style={{ color: "var(--km-alert)" }}>Low</span></div>
                          <div>P <span style={{ color: "var(--km-success)" }}>Normal</span></div>
                          <div>K <span style={{ color: "var(--km-saffron)" }}>Medium</span></div>
                       </div>
                       <ChevronRight size={16} color="#666" />
                       <div style={{ fontSize: "0.6rem", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div>Urea <span style={{ color: "#fff" }}>45kg</span></div>
                          <div>DAP <span style={{ color: "#fff" }}>25kg</span></div>
                       </div>
                    </div>
                  )},
                  { num: "7", title: "MARKET PRICE PREDICTION", time: "03:00", desc: "AI predicts market prices and helps farmers sell at the best time.", content: (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                       <BarChart3 size={32} color="var(--km-saffron)" />
                       <div style={{ fontSize: "0.7rem", marginTop: "5px" }}>Best Time to Sell: <span style={{ color: "var(--km-success)" }}>Tomorrow</span></div>
                    </div>
                  )},
                  { num: "8", title: "VENDOR MODULE", time: "03:30", desc: "Verified vendors upload genuine products. No chance for fake or harmful products.", content: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%", padding: "0 10px" }}>
                       <User size={20} color="#888" />
                       <ChevronRight size={14} color="#666" />
                       <CheckCircle size={24} color="var(--km-success)" />
                       <ChevronRight size={14} color="#666" />
                       <User size={20} color="var(--km-saffron)" />
                    </div>
                  )},
                  { num: "9", title: "LOAN MANAGEMENT", time: "04:00", desc: "AI checks eligibility and helps farmers get loans easily from banks.", content: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%", padding: "0 10px" }}>
                       <div style={{ fontSize: "0.6rem", display: "flex", flexDirection: "column" }}>
                         <span>Land: 3 Acres</span>
                         <span>Income: 2.4L</span>
                         <span>Eligible: 3.5L</span>
                       </div>
                       <Building size={24} color="#888" />
                       <div style={{ fontSize: "0.8rem", color: "var(--km-success)", fontWeight: "bold" }}>APPROVED</div>
                    </div>
                  )},
                  { num: "10", title: "SUBSIDY SYSTEM", time: "04:30", desc: "AI verifies the claim and subsidy amount is released directly to the farmer.", content: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%", padding: "0 10px" }}>
                       <div style={{ fontSize: "0.6rem", textAlign: "center" }}><FileJson size={16}/><br/>Apply</div>
                       <ChevronRight size={14} color="#666" />
                       <Brain size={18} color="var(--km-saffron)" />
                       <ChevronRight size={14} color="#666" />
                       <div style={{ fontSize: "0.7rem", color: "var(--km-success)" }}>₹45,000<br/>Released</div>
                    </div>
                  )},
                  { num: "11", title: "CROP INSURANCE", time: "05:00", desc: "AI based crop damage assessment makes insurance faster and easier.", content: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%", padding: "0 10px" }}>
                       <ShieldAlert size={20} color="var(--km-alert)" />
                       <ChevronRight size={14} color="#666" />
                       <Brain size={20} color="var(--km-saffron)" />
                       <ChevronRight size={14} color="#666" />
                       <CheckCircle size={20} color="var(--km-success)" />
                    </div>
                  )},
                  { num: "12", title: "WEATHER INTELLIGENCE", time: "05:30", desc: "Real-time weather intelligence protects crops and improves productivity.", content: (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "5px" }}>
                       <CloudRain size={24} color="#0072bc" />
                       <div style={{ fontSize: "0.6rem", color: "var(--km-alert)" }}>Heavy Rain Tomorrow</div>
                       <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "0.5rem", color: "#ccc" }}>
                         <li>Avoid Spraying</li>
                         <li>Delay Irrigation</li>
                       </ul>
                    </div>
                  )},
                  { num: "13", title: "AI VOICE ASSISTANT", time: "06:00", desc: "Farmers can talk to AI in Kannada, Hindi, English and other languages.", content: (
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 10px", gap: "10px" }}>
                       <div style={{ fontSize: "0.6rem", color: "#ccc", display: "flex", gap: "5px", alignItems: "center" }}><User size={12}/> "ನನ್ನ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಬೇಕು?"</div>
                       <div style={{ fontSize: "0.6rem", color: "var(--km-success)", display: "flex", gap: "5px", alignItems: "center" }}><Mic size={12}/> "ಯೂರಿಯಾ 45 ಕೆಜಿ ಹಾಕಿ."</div>
                    </div>
                  )},
                  { num: "14", title: "ADMIN DASHBOARD", time: "06:30", desc: "Administrators monitor all activities and services from one centralized dashboard.", content: (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", padding: "10px", height: "100%" }}>
                       <div style={{ border: "1px solid #333", padding: "2px", textAlign: "center", fontSize: "0.6rem" }}>Farmers<br/><span style={{ color: "var(--km-success)" }}>1,25,000</span></div>
                       <div style={{ border: "1px solid #333", padding: "2px", textAlign: "center", fontSize: "0.6rem" }}>Vendors<br/><span style={{ color: "var(--km-saffron)" }}>6,500</span></div>
                       <div style={{ border: "1px solid #333", padding: "2px", textAlign: "center", fontSize: "0.6rem" }}>Loans<br/><span style={{ color: "#0072bc" }}>₹28 Cr</span></div>
                       <div style={{ border: "1px solid #333", padding: "2px", textAlign: "center", fontSize: "0.6rem" }}>Subsidies<br/><span style={{ color: "var(--km-alert)" }}>₹42 Cr</span></div>
                    </div>
                  )},
                  { num: "15", title: "AI DECISION ENGINE", time: "07:00", desc: "Gemini AI processes data and gives the best suggestions and solutions.", content: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%", padding: "0 10px" }}>
                       <div style={{ fontSize: "0.5rem", textAlign: "center" }}><User size={14}/><br/>Request</div>
                       <ChevronRight size={14} color="#666" />
                       <div style={{ border: "1px solid var(--km-saffron)", padding: "5px", borderRadius: "50%", textAlign: "center" }}><Brain size={20} color="var(--km-saffron)"/></div>
                       <ChevronRight size={14} color="#666" />
                       <div style={{ fontSize: "0.5rem", textAlign: "center" }}><Database size={14}/><br/>DB / API</div>
                    </div>
                  )},
                  { num: "16", title: "SYSTEM ARCHITECTURE", time: "07:30", desc: "Our strong architecture ensures speed, security and reliability.", content: (
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 10px", gap: "5px" }}>
                       <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "#ccc" }}>
                          <span>React</span> <span>Express.js</span> <span>Node.js</span> <span>MongoDB</span>
                       </div>
                       <div style={{ borderTop: "1px dashed #666", width: "100%" }} />
                       <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.5rem", color: "#888" }}>
                          <span>Gemini AI</span> <span>Govt APIs</span> <span>Weather API</span> <span>SMS/Email</span>
                       </div>
                    </div>
                  )},
                  { num: "17", title: "TECHNOLOGIES USED", time: "08:00", desc: "We used modern technologies to build a smart and scalable platform.", content: (
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", height: "100%", gap: "10px", padding: "10px" }}>
                       <Cpu size={20} color="#61dafb" /> <Database size={20} color="#47a248" /> <Brain size={20} color="var(--km-saffron)" />
                       <Wind size={20} color="#38bdf8" /> <BarChart3 size={20} color="#ff6384" /> <Cloud size={20} color="#f2a600" />
                    </div>
                  )},
                  { num: "18", title: "CREATED BY", time: "08:30", desc: "'Passionate about using technology to empower farmers and build a better tomorrow.'", content: (
                    <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "10px", gap: "10px" }}>
                       <div style={{ width: "40px", height: "40px", backgroundColor: "#fff", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                          <User size={24} color="#000" />
                       </div>
                       <div>
                          <div style={{ fontSize: "0.7rem", color: "var(--km-success)", fontWeight: "bold" }}>VARUN GOWDA</div>
                          <div style={{ fontSize: "0.5rem", color: "#aaa" }}>Developer & Founder<br/>Krishi Mitra</div>
                       </div>
                    </div>
                  )},
                  { num: "19", title: "MY THOUGHT", time: "09:00", desc: "My vision is to empower every farmer with smart technology.", content: (
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "10px", textAlign: "center" }}>
                       <div style={{ fontSize: "0.7rem", fontStyle: "italic", color: "#ddd" }}>"Technology can change farming. AI can change the future of farmers."</div>
                       <Sprout size={24} color="var(--km-success)" style={{ margin: "5px auto 0" }} />
                    </div>
                  )},
                  { num: "20", title: "THANK YOU", time: "09:30", desc: "Together, Let's Build a Better Future for Our Farmers. Jai Hind, Jai Kisan!", content: (
                    <div style={{ textAlign: "center", paddingTop: "20px" }}>
                       <h2 style={{ color: "#fff", margin: "0 0 5px 0", fontSize: "1.2rem" }}>THANK YOU</h2>
                       <div style={{ fontSize: "0.6rem", color: "var(--km-success)" }}>FOR WATCHING</div>
                       <h3 style={{ color: "var(--km-success)", margin: "5px 0 0 0", fontSize: "0.9rem" }}>KRISHI MITRA</h3>
                    </div>
                  )}
                ];

                return slides.map(s => (
                  <div key={s.num} style={{ 
                    border: "1px solid #333", backgroundColor: "#0a0a0a", display: "flex", flexDirection: "column", 
                    height: "150px", overflow: "hidden"
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "1px solid #222", fontSize: "0.6rem" }}>
                       <span style={{ fontWeight: "bold", color: "#ddd" }}>{s.num}. {s.title}</span>
                       <span style={{ color: "#888" }}>{s.time}</span>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, position: "relative" }}>
                       {s.content}
                    </div>
                    {/* Controls Overlay */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 8px", backgroundColor: "#111", fontSize: "0.5rem", color: "#aaa" }}>
                       <Play size={10} color="#fff" /> {s.time} / 10:00
                    </div>
                    {/* Footer Text */}
                    <div style={{ padding: "4px 8px", backgroundColor: "#000", fontSize: "0.5rem", color: "#888", borderTop: "1px solid #222", height: "30px", overflow: "hidden" }}>
                       {s.desc}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* BOTTOM FOOTER BANNER */}
            <div style={{ 
              backgroundColor: "#fff", color: "#000", display: "flex", justifyContent: "space-between", 
              padding: "15px", borderRadius: "6px", alignItems: "center", fontFamily: "sans-serif"
            }}>
               <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRight: "1px solid #ccc", paddingRight: "15px" }}>
                  <div style={{ width: "40px", height: "40px", backgroundColor: "#eee", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                     <User size={24} color="#333" />
                  </div>
                  <div>
                     <div style={{ fontSize: "0.6rem", fontWeight: "bold", color: "#555" }}>WHO CREATED</div>
                     <div style={{ fontSize: "0.9rem", color: "var(--km-forest)", fontWeight: "bold" }}>VARUN GOWDA</div>
                     <div style={{ fontSize: "0.6rem", color: "#555" }}>Developer & Founder<br/>Krishi Mitra</div>
                  </div>
               </div>

               <div style={{ textAlign: "center", flex: 1, padding: "0 15px", borderRight: "1px solid #ccc" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#555", marginBottom: "5px" }}>TECHNOLOGIES USED</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                     <Cpu size={24} color="#61dafb" /> <Database size={24} color="#47a248" /> 
                     <Brain size={24} color="var(--km-saffron)" /> <BarChart3 size={24} color="#ff6384" /> 
                     <Wind size={24} color="#38bdf8" /> <FileJson size={24} color="#333" />
                  </div>
               </div>

               <div style={{ flex: 1, padding: "0 15px", borderRight: "1px solid #ccc" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#555", marginBottom: "5px" }}>ABOUT KRISHI MITRA</div>
                  <div style={{ fontSize: "0.65rem", color: "#333", lineHeight: "1.4" }}>
                    Krishi Mitra is an AI powered platform that provides farmers with crop health analysis, fertilizer recommendation, market prediction, loans, subsidies, insurance, weather alerts and more.
                  </div>
               </div>

               <div style={{ textAlign: "center", paddingLeft: "15px", width: "120px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#333", marginBottom: "5px" }}>THANK YOU<br/>For Watching</div>
                  <Sprout size={24} color="var(--km-forest)" style={{ margin: "0 auto" }} />
               </div>
            </div>

          </div>
        )}

        {/* TAB: NOT IMPLEMENTED */}
        {activeTab === "rest" && (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <Activity size={40} style={{ marginBottom: "10px" }} />
            <h3>Module Under Construction</h3>
            <p>This blueprint feature is not fully initialized yet.</p>
          </div>
        )}

      </div>
      
      <div style={{ textAlign: "center", marginTop: "40px", fontSize: "0.75rem", color: "#555" }}>
         © 2026 Krishi Mitra 3D Blueprint Console • Department of Smart Governance<br/>
         Google Gemini 3.5 ML model gateway active. Console Operator: Guest Architect
      </div>

    </div>
  );
}
