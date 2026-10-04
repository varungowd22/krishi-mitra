import { useEffect, useRef, useState } from "react";
import { Activity, AlertTriangle, Camera, CheckCircle2, FlaskConical, ImagePlus, Leaf, RotateCcw, Scan, Search, ShieldCheck, Stethoscope } from "lucide-react";
import api from "../../utils/api.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SEVERITY_META = {
  low: { label: "Low", color: "#16794b", background: "#ecfdf3" },
  moderate: { label: "Moderate", color: "#a15c07", background: "#fffaeb" },
  high: { label: "High", color: "#b42318", background: "#fef3f2" },
  uncertain: { label: "Uncertain", color: "#475467", background: "#f2f4f7" },
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read this image. Choose a different photo and try again."));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string" || !dataUrl.includes(",")) {
        reject(new Error("Could not prepare this image for analysis. Please try another photo."));
        return;
      }
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });
}

export default function DiseaseDetection() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cropName, setCropName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectFile = (selectedFile) => {
    setErrorMessage("");
    setResult(null);
    if (!selectedFile) return;
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setPreviewUrl("");
      setErrorMessage("Choose a JPG, PNG, or WebP leaf image.");
      return;
    }
    if (selectedFile.size > MAX_IMAGE_SIZE) {
      setFile(null);
      setPreviewUrl("");
      setErrorMessage("This image is over 5 MB. Choose a smaller image and try again.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleScan = async () => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrorMessage("");
    setResult(null);
    try {
      const imageBase64 = await fileToBase64(file);
      const { data } = await api.post("/disease/analyze", {
        imageBase64,
        mimeType: file.type,
        cropName,
      });
      if (!data.analysis || typeof data.analysis.diagnosis !== "string") {
        throw new Error("The AI service returned an invalid analysis. Please try again.");
      }
      setResult(data);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Crop image analysis failed. Check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const severity = result ? SEVERITY_META[result.analysis.severity] || SEVERITY_META.uncertain : null;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header className="km-card" style={{ borderLeft: "4px solid var(--km-forest)", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, flex: "0 0 auto", borderRadius: 12, background: "rgba(11, 61, 46, 0.08)", color: "var(--km-forest)" }}>
          <Leaf size={25} />
        </span>
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontSize: "1.25rem", color: "var(--km-forest-deep)", margin: 0 }}>AI Crop Disease Detection</h2>
            <span style={{ borderRadius: 20, padding: "4px 9px", color: "var(--km-forest)", background: "#edf6ef", fontSize: "0.72rem", fontWeight: 800 }}>GEMINI IMAGE ANALYSIS</span>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--km-ink-soft)", margin: "7px 0 0", lineHeight: 1.55 }}>
            Upload a clear crop-leaf photo for a visual screening, key findings, and cautious next steps. This is not a confirmed diagnosis or a government-approved treatment.
          </p>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 18, alignItems: "start" }}>
        <section className="km-card" aria-labelledby="disease-upload-title" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ color: "var(--km-saffron-deep)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em" }}>STEP 1</div>
            <h3 id="disease-upload-title" style={{ margin: "4px 0 0", color: "var(--km-forest-deep)", fontSize: "1.05rem" }}>Upload a leaf photo</h3>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            aria-label="Choose or drop a crop leaf image"
            style={{
              minHeight: 230,
              width: "100%",
              padding: 16,
              border: `2px dashed ${isDragging ? "var(--km-forest)" : "#a4cda9"}`,
              borderRadius: 12,
              background: isDragging ? "rgba(11, 61, 46, 0.08)" : "rgba(11, 61, 46, 0.025)",
              color: "var(--km-ink)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Selected crop leaf preview" style={{ maxWidth: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 8 }} />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, overflowWrap: "anywhere" }}>{file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--km-forest)", fontSize: "0.8rem" }}><RotateCcw size={14} /> Change image</span>
              </>
            ) : (
              <>
                <span style={{ display: "grid", placeItems: "center", width: 54, height: 54, borderRadius: "50%", background: "#fff", color: "var(--km-forest)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <ImagePlus size={27} />
                </span>
                <strong style={{ textAlign: "center" }}>Tap to choose or drag a leaf photo here</strong>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--km-ink-soft)", fontSize: "0.78rem" }}><Camera size={15} /> JPG, PNG, or WebP · up to 5 MB</span>
              </>
            )}
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} hidden aria-label="Crop leaf image file" />

          <div>
            <label htmlFor="disease-crop-name" className="km-label">Crop (optional)</label>
            <input id="disease-crop-name" className="km-input" value={cropName} maxLength={80} onChange={(event) => setCropName(event.target.value)} placeholder="e.g. tomato, rice, ragi" />
          </div>

          {errorMessage && (
            <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 8, color: "#b42318", background: "#fef3f2", border: "1px solid #fecdca", fontSize: "0.85rem" }}>
              <AlertTriangle size={17} style={{ flex: "0 0 auto", marginTop: 1 }} /> {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleScan}
            disabled={!file || isAnalyzing}
            className="km-btn km-btn--primary"
            style={{ width: "100%", minHeight: 46, fontSize: "0.95rem" }}
          >
            {isAnalyzing ? <><Search className="km-spin" size={18} /> Analyzing image securely...</> : <><Scan size={18} /> Analyze leaf image</>}
          </button>
          <p style={{ margin: 0, color: "var(--km-ink-soft)", fontSize: "0.74rem", lineHeight: 1.45 }}>
            Your image is sent securely to the configured AI service for analysis. It is not stored with your scan history.
          </p>
        </section>

        <section className="km-card" aria-labelledby="disease-result-title" aria-live="polite" style={{ minHeight: 360 }}>
          <div style={{ color: "var(--km-saffron-deep)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em" }}>STEP 2</div>
          <h3 id="disease-result-title" style={{ margin: "4px 0 18px", color: "var(--km-forest-deep)", fontSize: "1.05rem" }}>Analysis report</h3>

          {!result && !isAnalyzing && (
            <div style={{ minHeight: 265, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--km-ink-soft)", padding: 16 }}>
              <span style={{ display: "grid", placeItems: "center", width: 64, height: 64, borderRadius: "50%", background: "#f3f7f3", color: "var(--km-forest)" }}><ShieldCheck size={34} /></span>
              <strong style={{ marginTop: 14, color: "var(--km-forest-deep)" }}>Your report will appear here</strong>
              <p style={{ maxWidth: 340, margin: "7px 0 0", fontSize: "0.84rem", lineHeight: 1.5 }}>Choose a clear image showing the affected leaf. The scan will show visible symptoms, an estimated confidence, and practical next steps.</p>
            </div>
          )}

          {isAnalyzing && (
            <div role="status" style={{ minHeight: 265, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--km-forest)", textAlign: "center" }}>
              <Activity size={38} className="km-spin" />
              <strong style={{ marginTop: 14 }}>Reviewing leaf symptoms</strong>
              <span style={{ marginTop: 5, color: "var(--km-ink-soft)", fontSize: "0.84rem" }}>Comparing visible patterns with crop disease indicators…</span>
            </div>
          )}

          {result && !isAnalyzing && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: 16, borderRadius: 10, background: severity.background, border: `1px solid ${severity.color}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", color: severity.color }}>POSSIBLE VISUAL FINDING</span>
                    <h4 style={{ margin: "5px 0", fontSize: "1.32rem", color: "var(--km-ink)", overflowWrap: "anywhere" }}>{result.analysis.diagnosis}</h4>
                    <span style={{ fontSize: "0.82rem", color: "var(--km-ink-soft)" }}>{result.analysis.cropName}</span>
                  </div>
                  <span style={{ flex: "0 0 auto", padding: "5px 10px", borderRadius: 30, color: severity.color, background: "#fff", fontSize: "0.74rem", fontWeight: 800 }}>
                    {severity.label} severity
                  </span>
                </div>
                <div style={{ marginTop: 15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--km-ink-soft)", fontSize: "0.74rem", marginBottom: 5 }}>
                    <span>Model confidence estimate</span><strong style={{ color: "var(--km-ink)" }}>{result.analysis.confidencePercent}%</strong>
                  </div>
                  <div role="progressbar" aria-label="Model confidence estimate" aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.analysis.confidencePercent} style={{ height: 7, borderRadius: 8, background: "#fff", overflow: "hidden" }}>
                    <div style={{ width: `${result.analysis.confidencePercent}%`, height: "100%", borderRadius: 8, background: severity.color }} />
                  </div>
                </div>
              </div>

              {result.analysis.visualFindings.length > 0 && (
                <div>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 8px", fontSize: "0.9rem", color: "var(--km-forest-deep)" }}><Search size={16} /> Visible signs</h4>
                  <ul style={{ margin: 0, paddingLeft: 20, color: "var(--km-ink)", fontSize: "0.84rem", lineHeight: 1.65 }}>
                    {result.analysis.visualFindings.map((finding, index) => <li key={`${index}-${finding}`}>{finding}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ padding: 14, border: "1px solid var(--km-line)", borderRadius: 9, background: "#fbfcfa" }}>
                <h4 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 8px", fontSize: "0.9rem", color: "var(--km-forest-deep)" }}><FlaskConical size={16} /> Treatment guidance</h4>
                <p style={{ margin: 0, fontSize: "0.86rem", lineHeight: 1.5 }}><strong>Medicine:</strong> {result.analysis.medicineName}</p>
                <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "var(--km-ink-soft)", lineHeight: 1.5 }}><strong>Dosage:</strong> {result.analysis.dosageGuidance}</p>
              </div>

              {result.analysis.recommendedActions.length > 0 && (
                <div>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 8px", fontSize: "0.9rem", color: "var(--km-forest-deep)" }}><CheckCircle2 size={16} /> Recommended next steps</h4>
                  <ol style={{ margin: 0, paddingLeft: 20, color: "var(--km-ink)", fontSize: "0.84rem", lineHeight: 1.65 }}>
                    {result.analysis.recommendedActions.map((action, index) => <li key={`${index}-${action}`}>{action}</li>)}
                  </ol>
                </div>
              )}

              {result.analysis.needsExpertReview && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: 11, borderRadius: 8, background: "#fffaeb", color: "#7a4b00", fontSize: "0.82rem", lineHeight: 1.45 }}>
                  <Stethoscope size={17} style={{ flex: "0 0 auto" }} />
                  Ask a local agriculture extension officer to confirm the cause before treating the crop.
                </div>
              )}

              <div role="note" style={{ display: "flex", alignItems: "flex-start", gap: 7, paddingTop: 10, borderTop: "1px solid var(--km-line)", color: "var(--km-ink-soft)", fontSize: "0.75rem", lineHeight: 1.5 }}>
                <AlertTriangle size={15} style={{ flex: "0 0 auto" }} />
                {result.notice} {result.analysis.scanSaved ? "Scan saved to your history." : "This result was not saved to scan history because the database is unavailable."}
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
