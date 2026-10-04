import React, { useState } from "react";
import { FlaskConical, Search, CheckCircle, Leaf, Zap } from "lucide-react";

export default function FertilizerRecommendation() {
  const [soilData, setSoilData] = useState({
    nitrogen: "Low",
    phosphorus: "Normal",
    potassium: "Medium",
    crop: "Tomato",
    area: 1
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI processing delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        recommendations: [
          { name: "Urea", quantity: "45 kg", role: "Boosts vegetative growth" },
          { name: "DAP", quantity: "25 kg", role: "Enhances root development" },
          { name: "MOP", quantity: "20 kg", role: "Improves disease resistance" }
        ],
        confidence: "96.5%"
      });
    }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <div className="km-card" style={{ borderLeft: "4px solid var(--km-saffron)" }}>
        <h3 style={{ fontSize: "1.2rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 10px 0" }}>
          <FlaskConical size={24} /> AI Fertilizer Recommendation
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--km-ink-soft)", margin: 0 }}>
          Enter your soil test results (NPK levels). Our AI will analyze the soil health and recommend the precise amount of fertilizers needed for your specific crop.
        </p>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Input Section */}
        <div className="km-card" style={{ flex: 1, minWidth: "300px" }}>
          <h4 style={{ margin: "0 0 20px 0", color: "var(--km-forest-deep)" }}>1. Soil Test Result</h4>
          
          <form onSubmit={handleScan} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
               <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Crop Type</label>
                  <select className="km-input" value={soilData.crop} onChange={e => setSoilData({...soilData, crop: e.target.value})}>
                    <option value="Tomato">Tomato</option>
                    <option value="Paddy">Paddy</option>
                    <option value="Sugarcane">Sugarcane</option>
                  </select>
               </div>
               <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Land Area (Acres)</label>
                  <input type="number" className="km-input" value={soilData.area} onChange={e => setSoilData({...soilData, area: Number(e.target.value)})} min="0.1" step="0.1" />
               </div>
            </div>

            <div style={{ borderTop: "1px solid var(--km-line)", margin: "10px 0" }} />

            <div>
               <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Nitrogen (N)</label>
               <select className="km-input" value={soilData.nitrogen} onChange={e => setSoilData({...soilData, nitrogen: e.target.value})}>
                 <option value="Low">Low</option>
                 <option value="Normal">Normal</option>
                 <option value="High">High</option>
               </select>
            </div>
            <div>
               <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Phosphorus (P)</label>
               <select className="km-input" value={soilData.phosphorus} onChange={e => setSoilData({...soilData, phosphorus: e.target.value})}>
                 <option value="Low">Low</option>
                 <option value="Normal">Normal</option>
                 <option value="High">High</option>
               </select>
            </div>
            <div>
               <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Potassium (K)</label>
               <select className="km-input" value={soilData.potassium} onChange={e => setSoilData({...soilData, potassium: e.target.value})}>
                 <option value="Low">Low</option>
                 <option value="Medium">Medium</option>
                 <option value="High">High</option>
               </select>
            </div>

            <button 
              type="submit"
              disabled={isAnalyzing}
              className="km-btn km-btn--primary" 
              style={{ width: "100%", padding: "12px", fontSize: "1.1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "10px" }}
            >
              {isAnalyzing ? (
                <>
                  <Search className="animate-spin" size={20} /> Calculating Needs...
                </>
              ) : (
                <>
                  <Zap size={20} /> Get AI Recommendation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="km-card" style={{ flex: 1, minWidth: "300px", position: "relative" }}>
          <h4 style={{ margin: "0 0 20px 0", color: "var(--km-forest-deep)" }}>2. AI Recommendation</h4>
          
          {!result && !isAnalyzing && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", color: "var(--km-ink-soft)" }}>
              <Leaf size={50} opacity={0.2} style={{ marginBottom: "15px" }} />
              <p style={{ textAlign: "center", margin: 0 }}>Submit your soil test results to see customized fertilizer recommendations.</p>
            </div>
          )}

          {isAnalyzing && (
             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", color: "var(--km-saffron-deep)" }}>
               <div style={{ fontSize: "1.2rem", fontWeight: "bold", animation: "pulse 1.5s infinite" }}>Optimizing Nutrient Ratios...</div>
               <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", marginTop: "10px" }}>Consulting agronomy databases</div>
             </div>
          )}

          {result && !isAnalyzing && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", animation: "fadeIn 0.5s ease-out" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", borderBottom: "1px solid var(--km-line)" }}>
                 <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Recommended for {soilData.area} Acre {soilData.crop}</div>
                 <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "var(--km-success)" }}>
                   <CheckCircle size={14} /> AI Match: {result.confidence}
                 </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.recommendations.map((rec, idx) => (
                   <div key={idx} style={{ 
                     display: "flex", 
                     justifyContent: "space-between", 
                     alignItems: "center", 
                     padding: "15px", 
                     backgroundColor: "rgba(11, 61, 46, 0.05)",
                     border: "1px solid var(--km-forest)",
                     borderRadius: "8px"
                   }}>
                      <div>
                         <div style={{ fontSize: "1.2rem", fontWeight: "black", color: "var(--km-forest-deep)" }}>{rec.name}</div>
                         <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)", marginTop: "2px" }}>{rec.role}</div>
                      </div>
                      <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--km-saffron-deep)" }}>
                         {rec.quantity}
                      </div>
                   </div>
                ))}
              </div>

              <div style={{ padding: "12px", backgroundColor: "#FEF9C3", borderRadius: "8px", fontSize: "0.8rem", color: "#854D0E", marginTop: "10px", borderLeft: "4px solid #EAB308" }}>
                <strong>Pro Tip:</strong> Split Nitrogen (Urea) application into 3 doses (basal, 30 days, 60 days) to prevent nutrient leaching.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
