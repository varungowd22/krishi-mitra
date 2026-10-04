import React, { useEffect, useState } from "react";
import { Zap, MapPin, Calculator, AlertTriangle, Clock, Battery, BatteryCharging, CheckCircle } from "lucide-react";
import api from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const toMinutes = (time) => {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59 || hours > (match[3] ? 12 : 23)) return null;
  if (match[3]) {
    hours %= 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
  }
  return hours * 60 + minutes;
};

const formatTime = (time) => {
  const minutes = toMinutes(time);
  if (minutes === null) return time || "—";
  const hour = Math.floor(minutes / 60) % 24;
  return `${String(hour).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
};

export default function Power() {
  const { user } = useAuth();
  const [district, setDistrict] = useState(user?.district || "Bengaluru Rural");
  const [taluk, setTaluk] = useState(user?.taluk || "Devanahalli");
  const [reportStatus, setReportStatus] = useState("idle"); // idle, submitting, success
  const [reportId, setReportId] = useState("");
  const [reportError, setReportError] = useState("");
  const [outages, setOutages] = useState([]);
  const [powerSchedule, setPowerSchedule] = useState(null);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    setIsScheduleLoading(true);
    Promise.all([
      api.get(`/power/schedule?district=${encodeURIComponent(district)}&taluk=${encodeURIComponent(taluk)}`),
      api.get("/power/outages"),
    ]).then(([scheduleResponse, outageResponse]) => {
      if (cancelled) return;
      setPowerSchedule(scheduleResponse.data[0] || null);
      setOutages(outageResponse.data);
      setLoadError("");
    }).catch((error) => {
      if (!cancelled) setLoadError(error.response?.data?.message || "Unable to load saved power data.");
    }).finally(() => {
      if (!cancelled) setIsScheduleLoading(false);
    });
    return () => { cancelled = true; };
  }, [district, taluk]);
  
  const districts = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
    "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
    "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada",
    "Vijayanagara", "Vijayapura", "Yadgir"
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const scheduleWindows = powerSchedule ? [
    {
      label: "Morning",
      start: powerSchedule.morningSupplyStart || powerSchedule.morningStart,
      end: powerSchedule.morningSupplyEnd || powerSchedule.morningEnd,
    },
    {
      label: "Afternoon",
      start: powerSchedule.afternoonSupplyStart || powerSchedule.afternoonStart,
      end: powerSchedule.afternoonSupplyEnd || powerSchedule.afternoonEnd,
    },
    {
      label: "Night",
      start: powerSchedule.nightSupplyStart || powerSchedule.nightStart,
      end: powerSchedule.nightSupplyEnd || powerSchedule.nightEnd,
    },
  ].filter((window) => toMinutes(window.start) !== null && toMinutes(window.end) !== null) : [];

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const supplyEnabled = powerSchedule && !["Maintenance", "Suspended"].includes(powerSchedule.status);
  const activeWindow = supplyEnabled && scheduleWindows.find((window) => {
    const start = toMinutes(window.start);
    const end = toMinutes(window.end);
    return start <= end
      ? currentMinutes >= start && currentMinutes < end
      : currentMinutes >= start || currentMinutes < end;
  });
  const nextWindow = supplyEnabled && scheduleWindows
    .filter((window) => toMinutes(window.start) > currentMinutes)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0];

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("GPS is not available in this browser. Select your district and taluk instead.");
      return;
    }
    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const coordinates = { latitude: coords.latitude, longitude: coords.longitude };
      setLocation({ ...coordinates, label: "GPS location found" });
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=en`
        );
        if (!response.ok) throw new Error("Location lookup is temporarily unavailable.");
        const result = await response.json();
        const address = result.address || {};
        const districtCandidate = address.state_district || address.county || address.city_district || "";
        const normalizedCandidate = districtCandidate.toLowerCase()
          .replace(/^bangalore\b/, "bengaluru")
          .replace(/\s+district$/, "")
          .trim();
        const matchedDistrict = districts.find((item) => {
          const normalizedItem = item.toLowerCase();
          return normalizedCandidate === normalizedItem || normalizedCandidate.includes(normalizedItem);
        });
        const matchedTaluk = address.subdistrict || address.municipality || address.town || address.city_district || address.city;
        if (matchedDistrict) setDistrict(matchedDistrict);
        if (matchedTaluk) setTaluk(matchedTaluk);
        setLocation({
          ...coordinates,
          label: [address.suburb || address.village || address.town || address.city, districtCandidate]
            .filter(Boolean)
            .join(", ") || result.display_name || "GPS location found",
        });
        if (!matchedDistrict) {
          setLocationError(`GPS found your location, but “${districtCandidate || "this area"}” is not in the district list. Choose your district manually to view its power schedule.`);
        }
      } catch (error) {
        setLocationError(`${error.message} Your GPS coordinates are shown; select your district and taluk to load the power schedule.`);
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? "Location permission was denied. Allow GPS access or select your district and taluk manually."
        : error.code === error.TIMEOUT
          ? "GPS location timed out. Try again or select your district and taluk manually."
          : "Could not read your GPS location. Select your district and taluk manually.";
      setLocationError(message);
      setIsLocating(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  };

  const handleReportPower = async () => {
    setReportStatus("submitting");
    setReportError("");
    try {
      const { data } = await api.post("/power/outage", {
        district,
        taluk,
        village: user?.village || "Kundana",
        pinCode: user?.pincode || "",
        details: "No power outside scheduled timings",
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      setReportId(data._id);
      setOutages((previous) => [data, ...previous]);
      setReportStatus("success");
    } catch (error) {
      setReportStatus("idle");
      setReportError(error.response?.data?.message || "Power outage report was not saved. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {loadError && <div role="alert" className="km-card" style={{ color: "var(--km-alert)" }}>{loadError}</div>}
      
      {/* Header Banner - BESCOM Official look */}
      <div style={{ 
        backgroundColor: "#e8f4fa", 
        border: "1px solid #b3d4e5", 
        padding: "15px 25px", 
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "20px"
      }}>
        <div style={{ 
          width: "60px", height: "60px", borderRadius: "50%", 
          backgroundColor: "#0072bc", color: "white", 
          display: "flex", justifyContent: "center", alignItems: "center", 
          fontWeight: "bold", fontSize: "1.5rem" 
        }}>
          B
        </div>
        <div>
          <div style={{ fontSize: "0.8rem", color: "#0072bc", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}>Government of Karnataka · {powerSchedule?.district || district}</div>
          <h2 style={{ margin: "5px 0 0 0", color: "#00558c", fontSize: "1.4rem" }}>{powerSchedule?.provider || "Local Electricity Supply Schedule"}</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Left Column: Location Selection & Live Schedule */}
        <div style={{ flex: 2, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="km-card">
            <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
               <MapPin size={18} /> Select Farm Location for Timing Grid
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                 <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--km-ink-soft)", textTransform: "uppercase" }}>District</label>
                 <select 
                   value={district} 
                   onChange={(e) => setDistrict(e.target.value)}
                   style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff" }}
                 >
                   {districts.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
              <div>
                 <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--km-ink-soft)", textTransform: "uppercase" }}>Taluk</label>
                 <input
                   value={taluk} 
                   onChange={(e) => setTaluk(e.target.value)}
                   placeholder="Enter taluk"
                   style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff" }}
                 />
              </div>
              <div>
                 <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--km-ink-soft)", textTransform: "uppercase" }}>Hobli (Optional)</label>
                 <select style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff" }}>
                   <option>Kundana</option>
                   <option>Kasaba</option>
                   <option>Vijayapura</option>
                 </select>
              </div>
              <div>
                 <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--km-ink-soft)", textTransform: "uppercase" }}>Village (Optional)</label>
                 <select style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff" }}>
                   <option>All Villages</option>
                   <option>Ardeshahalli</option>
                   <option>Binnamangala</option>
                 </select>
              </div>
            </div>
            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
               <button type="button" onClick={handleUseCurrentLocation} disabled={isLocating} className="km-btn km-btn--outline" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                 <MapPin size={16} /> {isLocating ? "Finding your location..." : "Use current location (GPS)"}
               </button>
               {location && (
                 <div role="status" style={{ fontSize: "0.82rem", color: "var(--km-ink-soft)" }}>
                   <strong>Your location:</strong> {location.label} ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
                 </div>
               )}
               <div style={{ fontSize: "0.72rem", color: "var(--km-ink-soft)" }}>
                 GPS coordinates are sent to OpenStreetMap to identify your district; they are not saved unless you submit an outage report.
               </div>
               {locationError && <div role="alert" style={{ color: "var(--km-alert)", fontSize: "0.82rem" }}>{locationError}</div>}
            </div>
          </div>

          {/* Today's Power Status */}
          <div className="km-card" style={{ borderLeft: `4px solid ${activeWindow ? "var(--km-success)" : "var(--km-saffron)"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                 <Zap size={18} color="var(--km-success)" /> Today's Power Status
               </h3>
               <span style={{ backgroundColor: activeWindow ? "rgba(45,106,79,0.1)" : "rgba(224,141,36,0.12)", color: activeWindow ? "var(--km-success)" : "var(--km-saffron-deep)", padding: "4px 10px", borderRadius: "15px", fontSize: "0.8rem", fontWeight: "bold" }}>
                 {isScheduleLoading ? "Loading schedule..." : !powerSchedule ? "No local schedule" : powerSchedule.status === "Maintenance" ? "Maintenance" : powerSchedule.status === "Suspended" ? "Supply suspended" : activeWindow ? `Scheduled now · ${activeWindow.label}` : nextWindow ? `Next supply · ${formatTime(nextWindow.start)}` : "No more supply today"}
               </span>
            </div>

            {powerSchedule ? <div style={{ marginTop: "7px", fontSize: "0.78rem", color: "var(--km-ink-soft)" }}>Schedule for {powerSchedule.village || powerSchedule.taluk}, {powerSchedule.district} · {powerSchedule.provider || "Power provider"}</div> : !isScheduleLoading && <div style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>No power schedule is saved for {taluk}, {district}. Use GPS or change the area above to check another location.</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "20px" }}>
               <div style={{ padding: "15px", backgroundColor: "#f0f8ff", borderRadius: "6px", textAlign: "center", border: "1px solid #dcebfa" }}>
                  <div style={{ fontSize: "0.75rem", color: "#555", textTransform: "uppercase", fontWeight: "bold", marginBottom: "5px" }}>Morning</div>
                  <div style={{ fontSize: "1.1rem", color: "#0072bc", fontWeight: "bold" }}>{formatTime(powerSchedule?.morningSupplyStart || powerSchedule?.morningStart)} - {formatTime(powerSchedule?.morningSupplyEnd || powerSchedule?.morningEnd)}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--km-success)", marginTop: "5px" }}><BatteryCharging size={12}/> Scheduled supply</div>
               </div>
               <div style={{ padding: "15px", backgroundColor: "#fdf8e2", borderRadius: "6px", textAlign: "center", border: "1px solid #f6eaba" }}>
                  <div style={{ fontSize: "0.75rem", color: "#555", textTransform: "uppercase", fontWeight: "bold", marginBottom: "5px" }}>Afternoon</div>
                  <div style={{ fontSize: "1.1rem", color: "#b58900", fontWeight: "bold" }}>{formatTime(powerSchedule?.afternoonSupplyStart || powerSchedule?.afternoonStart)} - {formatTime(powerSchedule?.afternoonSupplyEnd || powerSchedule?.afternoonEnd)}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--km-success)", marginTop: "5px" }}><BatteryCharging size={12}/> Scheduled supply</div>
               </div>
               <div style={{ padding: "15px", backgroundColor: "#f0f8ff", borderRadius: "6px", textAlign: "center", border: "1px solid #dcebfa" }}>
                  <div style={{ fontSize: "0.75rem", color: "#555", textTransform: "uppercase", fontWeight: "bold", marginBottom: "5px" }}>Night</div>
                  <div style={{ fontSize: "1.1rem", color: "#0072bc", fontWeight: "bold" }}>{formatTime(powerSchedule?.nightSupplyStart || powerSchedule?.nightStart)} - {formatTime(powerSchedule?.nightSupplyEnd || powerSchedule?.nightEnd)}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--km-success)", marginTop: "5px" }}><BatteryCharging size={12}/> Scheduled supply</div>
               </div>
            </div>
            
            <div style={{ marginTop: "15px", backgroundColor: "rgba(11, 61, 46, 0.05)", padding: "10px", borderRadius: "6px", fontSize: "0.85rem", color: "var(--km-ink)" }}>
               <strong>💡 Power schedule:</strong> {powerSchedule ? activeWindow ? `The ${activeWindow.label.toLowerCase()} supply window is scheduled now. This shows the local schedule, not a live grid status.` : nextWindow ? `The next listed supply window starts at ${formatTime(nextWindow.start)}. This shows the local schedule, not a live grid status.` : "There are no further supply windows listed for today." : "Choose a district and taluk with a saved schedule to see supply times."}
            </div>
          </div>
        </div>

        {/* Right Column: Calculators & Reporting */}
        <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "20px" }}>
           
           <div className="km-card">
              <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                 <Calculator size={18} /> Electricity Calculator
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                 <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Pump HP (Horsepower)</label>
                    <input type="number" defaultValue="5" style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginTop: "4px" }} />
                 </div>
                 <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Hours Used Today</label>
                    <input type="number" defaultValue="4" style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginTop: "4px" }} />
                 </div>
                 <div style={{ backgroundColor: "#f9f7f0", padding: "15px", borderRadius: "6px", marginTop: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                       <span style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)" }}>Est. Consumption:</span>
                       <strong style={{ color: "var(--km-forest-deep)" }}>14.9 kWh (Units)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                       <span style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)" }}>Est. Cost:</span>
                       <strong style={{ color: "var(--km-forest-deep)" }}>Free (Subsidy)</strong>
                    </div>
                 </div>
              </div>
           </div>

           <div className="km-card" style={{ borderLeft: "4px solid var(--km-alert)" }}>
              <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                 <AlertTriangle size={18} color="var(--km-alert)" /> Outage Report
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", lineHeight: "1.4" }}>
                Experiencing a power cut outside scheduled timings? Report it to BESCOM engineering support immediately.
              </p>

              {reportStatus === "idle" && (
                <button onClick={handleReportPower} className="km-btn km-btn--primary" style={{ width: "100%", backgroundColor: "var(--km-alert)", borderColor: "var(--km-alert)" }}>
                  Report No Power
                </button>
              )}

              {reportStatus === "submitting" && (
                <button disabled className="km-btn km-btn--outline" style={{ width: "100%", opacity: 0.7 }}>
                  Submitting Report...
                </button>
              )}

              {reportStatus === "success" && (
                <div style={{ backgroundColor: "var(--km-success-dim)", color: "var(--km-success)", padding: "10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: "bold" }}>
                  <CheckCircle size={18} /> Report saved successfully! Ticket ID: BSCM-{reportId}
                </div>
              )}
              {reportError && <p role="alert" style={{ color: "var(--km-alert)", fontSize: "0.85rem" }}>{reportError}</p>}
           </div>

           <div className="km-card">
              <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                 <Clock size={18} /> Recent Outage History
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {outages.length === 0 ? <span style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)" }}>No saved outage reports.</span> : outages.slice(0, 5).map((outage) => (
                  <div key={outage._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", borderBottom: "1px dashed var(--km-line)" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--km-ink)" }}>{new Date(outage.createdAt).toLocaleString()} · {outage.village}</div>
                    <span style={{ fontSize: "0.75rem", backgroundColor: "var(--km-paper-dim)", padding: "2px 6px", borderRadius: "4px" }}>{outage.status}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Future Enhancements section added based on user request */}
            <div className="km-card">
              <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", marginBottom: "15px", borderBottom: "1px solid var(--km-line)", paddingBottom: "10px" }}>
                Future Enhancements
              </h3>
              <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--km-ink)" }}>
                <li>Live integration with BESCOM or the relevant electricity provider (where APIs or official data are available).</li>
                <li>Smart meter integration for real-time consumption.</li>
                <li>IoT integration with farm pumps to automatically start when power is available.</li>
                <li>SMS and WhatsApp notifications.</li>
                <li>Offline access to the last downloaded schedule.</li>
              </ul>
              <p style={{ marginTop: "15px", fontSize: "0.85rem", color: "var(--km-ink-soft)", fontStyle: "italic", lineHeight: "1.4" }}>
                This module would make Krishi Mitra much more valuable because farmers could plan irrigation based on power availability while also managing electricity usage more effectively.
              </p>
            </div>
           
         </div>

      </div>
    </div>
  );
}
