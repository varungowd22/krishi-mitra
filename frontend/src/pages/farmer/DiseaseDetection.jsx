import React, { useState } from "react";
import { Upload, Scan, Search, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default function DiseaseDetection() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(URL.createObjectURL(e.target.files[0]));
      setResult(null); // Reset on new upload
    }
  };

  const handleScan = () => {
    if (!file) return;
    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI processing delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        disease: "Leaf Blast",
        confidence: "98.8%",
        recommendation: "Carbendazim",
        dosage: "25ml / 15L Water",
        severity: "High"
      });
    }, 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <div className="km-card" style={{ borderLeft: "4px solid var(--km-forest)" }}>
        <h3 style={{ fontSize: "1.2rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 10px 0" }}>
          <Scan size={24} /> AI Crop Disease Detection
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--km-ink-soft)", margin: 0 }}>
          Upload a clear image of the affected crop leaf. Our Gemini AI engine will analyze the image, detect the disease, and recommend the best government-approved medicine.
        </p>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Upload & Scan Section */}
        <div className="km-card" style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h4 style={{ margin: 0, color: "var(--km-forest-deep)" }}>1. Upload Leaf Image</h4>
          
          <label style={{
            border: "2px dashed #a4cda9",
            borderRadius: "8px",
            padding: "30px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "rgba(11, 61, 46, 0.02)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px"
          }}>
            {file ? (
              <img src={file} alt="Uploaded Crop" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", objectFit: "cover" }} />
            ) : (
              <>
                <div style={{ padding: "15px", backgroundColor: "#fff", borderRadius: "50%", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                  <Upload size={30} color="var(--km-forest)" />
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Click to Upload or Drag & Drop</div>
                <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>PNG, JPG up to 5MB</div>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>

          <button 
            onClick={handleScan} 
            disabled={!file || isAnalyzing}
            className="km-btn km-btn--primary" 
            style={{ width: "100%", padding: "12px", fontSize: "1.1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
          >
            {isAnalyzing ? (
              <>
                <Search className="animate-spin" size={20} /> Analyzing Image with Gemini AI...
              </>
            ) : (
              <>
                <Scan size={20} /> Run AI Scan
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="km-card" style={{ flex: 1, minWidth: "300px", position: "relative" }}>
          <h4 style={{ margin: "0 0 20px 0", color: "var(--km-forest-deep)" }}>2. AI Analysis Result</h4>
          
          {!result && !isAnalyzing && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--km-ink-soft)" }}>
              <ShieldCheck size={50} opacity={0.2} style={{ marginBottom: "15px" }} />
              <p style={{ textAlign: "center", margin: 0 }}>Upload an image and run the scan to see AI predictions and medicine recommendations.</p>
            </div>
          )}

          {isAnalyzing && (
             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--km-forest)" }}>
               {/* Custom CSS loader can be added here, using simple pulsing text for now */}
               <div style={{ fontSize: "1.2rem", fontWeight: "bold", animation: "pulse 1.5s infinite" }}>Processing AI Models...</div>
               <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", marginTop: "10px" }}>Identifying pathogens & nutrient deficiencies</div>
             </div>
          )}

          {result && !isAnalyzing && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", animation: "fadeIn 0.5s ease-out" }}>
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "15px", display: "flex", gap: "15px", alignItems: "flex-start" }}>
                <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#991B1B", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>Disease Detected</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "black", color: "#7F1D1D", margin: "5px 0" }}>{result.disease}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#991B1B" }}>
                    <CheckCircle size={14} /> AI Confidence: <strong>{result.confidence}</strong>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "rgba(11, 61, 46, 0.05)", border: "1px solid var(--km-forest)", borderRadius: "8px", padding: "15px" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--km-forest-deep)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "10px" }}>Recommended Treatment</div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>Medicine</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--km-ink)" }}>{result.recommendation}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>Recommended Dosage</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--km-ink)" }}>{result.dosage}</div>
                  </div>
                </div>
              </div>

              <button className="km-btn km-btn--outline" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", width: "100%", padding: "10px" }}>
                <ShoppingCart size={18} /> Buy Medicine from Verified Vendors
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
