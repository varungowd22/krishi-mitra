import React, { useState } from "react";
import { Satellite, Map, Activity, AlertTriangle, CheckCircle, Leaf, Search } from "lucide-react";

const SECTORS = [
  { id: "A-1", ndvi: 0.82, msg: "Crop health is optimal. No action required." },
  { id: "A-2", ndvi: 0.79, msg: "Crop health is optimal. No action required." },
  { id: "A-3", ndvi: 0.52, msg: "Early signs of nitrogen deficiency. Monitor closely." },
  { id: "B-1", ndvi: 0.85, msg: "Crop health is optimal. No action required." },
  { id: "B-2", ndvi: 0.81, msg: "Crop health is optimal. No action required." },
  { id: "B-3", ndvi: 0.38, msg: "Pest/Nitrogen deficit flagged. Apply fertilizer." },
  { id: "C-1", ndvi: 0.77, msg: "Crop health is optimal. No action required." },
  { id: "C-2", ndvi: 0.55, msg: "Mild moisture stress detected. Increase irrigation." },
  { id: "C-3", ndvi: 0.80, msg: "Crop health is optimal. No action required." },
  { id: "D-1", ndvi: 0.83, msg: "Crop health is optimal. No action required." },
  { id: "D-2", ndvi: 0.78, msg: "Crop health is optimal. No action required." },
  { id: "D-3", ndvi: 0.82, msg: "Crop health is optimal. No action required." }
];

export default function CropHealth() {
  const [activeSector, setActiveSector] = useState(SECTORS.find(s => s.id === "B-3"));

  const getHealthStatus = (ndvi) => {
    if (ndvi > 0.7) return { status: "HEALTHY", color: "var(--km-success)", bg: "#f0fdf4", border: "#bbf7d0", icon: <CheckCircle color="var(--km-success)" /> };
    if (ndvi >= 0.5) return { status: "WARNING", color: "var(--km-saffron-deep)", bg: "#fffbeb", border: "#fde68a", icon: <AlertTriangle color="var(--km-saffron-deep)" /> };
    return { status: "DEFICIENT", color: "var(--km-alert)", bg: "#fef2f2", border: "#fecaca", icon: <Activity color="var(--km-alert)" /> };
  };

  const getColorCode = (ndvi) => {
    if (ndvi > 0.7) return "#4ade80"; // Bright green
    if (ndvi >= 0.5) return "#fbbf24"; // Amber/Yellow
    return "#ef4444"; // Red
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      <div className="km-card" style={{ backgroundColor: "#1e293b", color: "#f8fafc" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div>
               <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 10px 0", fontSize: "1.5rem" }}>
                  <Satellite size={28} color="#93c5fd" /> Crop Health (NDVI) Satellite View
               </h2>
               <p style={{ margin: 0, opacity: 0.8, maxWidth: "600px", lineHeight: "1.5" }}>
                 Live multispectral imagery from Sentinel-2 satellite. Green sectors represent healthy dense vegetation. Red/Yellow sectors require immediate attention.
               </p>
            </div>
            <div style={{ display: "flex", gap: "15px", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", padding: "10px 15px", borderRadius: "8px" }}>
               <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem" }}>
                 <div style={{ width: "12px", height: "12px", backgroundColor: "#4ade80", borderRadius: "2px" }}></div> {">"} 0.70 Healthy
               </div>
               <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem" }}>
                 <div style={{ width: "12px", height: "12px", backgroundColor: "#fbbf24", borderRadius: "2px" }}></div> {">"} 0.50 Warning
               </div>
               <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem" }}>
                 <div style={{ width: "12px", height: "12px", backgroundColor: "#ef4444", borderRadius: "2px" }}></div> {"<"} 0.50 Deficient
               </div>
            </div>
         </div>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "stretch" }}>
         
         {/* Map Grid Section */}
         <div className="km-card" style={{ flex: 1.5, minWidth: "300px", padding: "30px", backgroundColor: "#f1f5f9" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
               <Map size={20} /> Field Sector Map
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", aspectRatio: "4/3" }}>
               {SECTORS.map((sector) => {
                  const isActive = activeSector.id === sector.id;
                  return (
                    <div 
                      key={sector.id} 
                      onClick={() => setActiveSector(sector)}
                      style={{ 
                        backgroundColor: getColorCode(sector.ndvi),
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        textShadow: "0px 1px 3px rgba(0,0,0,0.4)",
                        boxShadow: isActive ? "0 0 0 4px #1e293b" : "0 4px 6px rgba(0,0,0,0.1)",
                        transform: isActive ? "scale(0.95)" : "scale(1)",
                        transition: "all 0.2s ease-in-out",
                        position: "relative",
                        overflow: "hidden"
                      }}
                    >
                       <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.1) 100%)" }}></div>
                       <div style={{ fontSize: "1.2rem", fontWeight: "900", zIndex: 1 }}>{sector.id}</div>
                       <div style={{ fontSize: "0.85rem", fontWeight: "bold", zIndex: 1 }}>NDVI: {sector.ndvi}</div>
                    </div>
                  );
               })}
            </div>
         </div>

         {/* Analytics Panel */}
         <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div className="km-card" style={{ 
               backgroundColor: getHealthStatus(activeSector.ndvi).bg,
               border: `2px solid ${getHealthStatus(activeSector.ndvi).border}`,
               height: "100%"
            }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                 <div>
                    <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Selected Area</div>
                    <h2 style={{ margin: "5px 0", fontSize: "2rem", color: "#0f172a" }}>Sector {activeSector.id}</h2>
                 </div>
                 <div style={{ padding: "10px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    {getHealthStatus(activeSector.ndvi).icon}
                 </div>
               </div>

               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px", borderBottom: `1px solid ${getHealthStatus(activeSector.ndvi).border}`, paddingBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>NDVI Index</div>
                    <div style={{ fontSize: "2.5rem", fontWeight: "black", color: getHealthStatus(activeSector.ndvi).color, lineHeight: "1" }}>{activeSector.ndvi}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Status</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "900", color: getHealthStatus(activeSector.ndvi).color, letterSpacing: "1px" }}>{getHealthStatus(activeSector.ndvi).status}</div>
                  </div>
               </div>

               <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                  <Search size={24} color="#64748b" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                     <div style={{ fontSize: "0.9rem", color: "#334155", fontWeight: "bold", marginBottom: "5px" }}>AI Action Suggestion:</div>
                     <div style={{ fontSize: "1.1rem", color: "#0f172a", lineHeight: "1.4" }}>
                       <strong>Sector {activeSector.id}:</strong> {activeSector.msg}
                     </div>
                  </div>
               </div>

               {activeSector.ndvi < 0.7 && (
                  <button className="km-btn km-btn--primary" style={{ width: "100%", marginTop: "30px", padding: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontSize: "1.05rem", backgroundColor: getHealthStatus(activeSector.ndvi).color }}>
                    <Leaf size={18} color="#fff" /> Schedule Corrective Action
                  </button>
               )}
            </div>

         </div>
      </div>
    </div>
  );
}
