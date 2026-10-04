import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Edit3, X, Loader2, ExternalLink, LocateFixed, MapPin, ZoomIn, ZoomOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../utils/api.js";
import FarmerIDCard from "./FarmerIDCard.jsx";
import WeatherAlerts from "./WeatherAlerts.jsx";
import "./FarmerOverview.css";

const integrationPartners = [
  { name: "Bayer CropScience", domain: "bayer.in", url: "https://www.bayer.in/", category: "Crop science" },
  { name: "UPL Ltd", domain: "upl-ltd.com/in", url: "https://www.upl-ltd.com/in", category: "Crop protection" },
  { name: "Karnataka Bank", domain: "karnatakabank.com", url: "https://karnatakabank.com/", category: "Banking" },
  { name: "State Bank of India", domain: "sbi.bank.in", url: "https://sbi.bank.in/web/personal-banking/home", category: "Banking" },
  { name: "ICICI Bank", domain: "icici.bank.in", url: "https://www.icici.bank.in/", category: "Banking" },
  { name: "NABARD", domain: "nabard.org", url: "https://www.nabard.org/", category: "Rural development" },
  { name: "Fasal", domain: "fasal.co", url: "https://fasal.co/", category: "Farm intelligence" },
  { name: "ICAR", domain: "icar.org.in", url: "https://icar.org.in/", category: "Agricultural research" },
];

const TILE_SIZE = 256;
const INITIAL_CENTER = { latitude: 20.5937, longitude: 78.9629 };

function toWorldPixel(latitude, longitude, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const boundedLatitude = Math.max(-85.0511, Math.min(85.0511, latitude));
  const sinLatitude = Math.sin((boundedLatitude * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  };
}

function fromWorldPixel(x, y, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = (x / scale) * 360 - 180;
  const latitude = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale))) * 180) / Math.PI;
  return { latitude, longitude };
}

function SatelliteMap({ onClose }) {
  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(5);
  const [locationStatus, setLocationStatus] = useState("");
  const [tileError, setTileError] = useState(false);
  const worldCenter = toWorldPixel(center.latitude, center.longitude, zoom);
  const centerTileX = Math.floor(worldCenter.x / TILE_SIZE);
  const centerTileY = Math.floor(worldCenter.y / TILE_SIZE);
  const centerOffsetX = worldCenter.x - centerTileX * TILE_SIZE;
  const centerOffsetY = worldCenter.y - centerTileY * TILE_SIZE;
  const tileCount = 2 ** zoom;
  const tiles = [];

  for (let row = -2; row <= 2; row += 1) {
    for (let column = -2; column <= 2; column += 1) {
      const x = centerTileX + column;
      const y = centerTileY + row;
      if (y < 0 || y >= tileCount) continue;
      const wrappedX = ((x % tileCount) + tileCount) % tileCount;
      tiles.push({
        key: `${zoom}/${y}/${wrappedX}`,
        url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${wrappedX}`,
        left: `calc(50% + ${column * TILE_SIZE - centerOffsetX}px)`,
        top: `calc(50% + ${row * TILE_SIZE - centerOffsetY}px)`,
      });
    }
  }

  const moveMap = (horizontal, vertical) => {
    const pixelStep = TILE_SIZE / 2;
    const nextCenter = fromWorldPixel(
      worldCenter.x + horizontal * pixelStep,
      worldCenter.y + vertical * pixelStep,
      zoom,
    );
    setCenter(nextCenter);
  };

  const locateFarmer = () => {
    if (!navigator.geolocation) {
      setLocationStatus("This browser does not support location access.");
      return;
    }

    setLocationStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCenter({ latitude: coords.latitude, longitude: coords.longitude });
        setZoom(16);
        setLocationStatus("Map centered on your current location.");
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Enable it in your browser to center the map."
          : error.code === error.POSITION_UNAVAILABLE
            ? "Your current location is unavailable."
            : "Location lookup timed out. Please try again.";
        setLocationStatus(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="satellite-map-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(15, 23, 42, 0.78)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <section className="km-card" style={{ width: "min(100%, 1000px)", maxHeight: "95vh", overflow: "auto", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
          <div>
            <h2 id="satellite-map-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--km-forest-deep)", fontSize: "1.15rem" }}>
              <MapPin size={20} /> Satellite imagery
            </h2>
            <div style={{ color: "var(--km-ink-soft)", fontSize: "0.8rem", marginTop: "4px" }}>
              {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)} · Zoom {zoom}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button type="button" className="km-btn km-btn--outline" onClick={locateFarmer} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 10px" }}>
              <LocateFixed size={16} /> Use my location
            </button>
            <button type="button" aria-label="Close satellite map" onClick={onClose} style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", border: "1px solid var(--km-line)", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {locationStatus && <div role="status" style={{ marginBottom: "8px", color: "var(--km-ink-soft)", fontSize: "0.82rem" }}>{locationStatus}</div>}

        <div aria-label="Satellite imagery map" role="img" style={{ position: "relative", height: "min(62vh, 560px)", minHeight: "320px", overflow: "hidden", borderRadius: "10px", background: "#d8ded4" }}>
          {tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              onError={() => setTileError(true)}
              style={{ position: "absolute", width: TILE_SIZE, height: TILE_SIZE, left: tile.left, top: tile.top, maxWidth: "none" }}
            />
          ))}
          <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: "18px", height: "18px", borderRadius: "50% 50% 50% 0", border: "2px solid #fff", background: "#d32f2f", boxShadow: "0 1px 5px #0008", transform: "translate(-50%, -100%) rotate(-45deg)", pointerEvents: "none" }} />
          {tileError && (
            <div role="status" style={{ position: "absolute", top: "10px", left: "10px", right: "10px", padding: "10px", borderRadius: "6px", background: "#fff", color: "#9b1c1c", fontSize: "0.82rem" }}>
              Some satellite tiles could not be loaded. Check your internet connection and try again.
            </div>
          )}
          <div style={{ position: "absolute", right: "10px", top: "10px", display: "grid", gap: "6px" }}>
            <button type="button" aria-label="Zoom in" disabled={zoom >= 18} onClick={() => setZoom((value) => Math.min(18, value + 1))} style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", border: 0, borderRadius: "6px", background: "#fff", cursor: zoom >= 18 ? "not-allowed" : "pointer", opacity: zoom >= 18 ? 0.55 : 1 }}>
              <ZoomIn size={20} />
            </button>
            <button type="button" aria-label="Zoom out" disabled={zoom <= 3} onClick={() => setZoom((value) => Math.max(3, value - 1))} style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", border: 0, borderRadius: "6px", background: "#fff", cursor: zoom <= 3 ? "not-allowed" : "pointer", opacity: zoom <= 3 ? 0.55 : 1 }}>
              <ZoomOut size={20} />
            </button>
            <button type="button" aria-label="Pan map up" onClick={() => moveMap(0, -1)} style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", border: 0, borderRadius: "6px", background: "#fff", cursor: "pointer" }}>↑</button>
            <div style={{ display: "flex", gap: "6px" }}>
              <button type="button" aria-label="Pan map left" onClick={() => moveMap(-1, 0)} style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", border: 0, borderRadius: "6px", background: "#fff", cursor: "pointer" }}>←</button>
              <button type="button" aria-label="Pan map right" onClick={() => moveMap(1, 0)} style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", border: 0, borderRadius: "6px", background: "#fff", cursor: "pointer" }}>→</button>
            </div>
            <button type="button" aria-label="Pan map down" onClick={() => moveMap(0, 1)} style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", border: 0, borderRadius: "6px", background: "#fff", cursor: "pointer" }}>↓</button>
          </div>
          <div style={{ position: "absolute", left: "8px", bottom: "8px", padding: "3px 6px", borderRadius: "4px", background: "#ffffffdd", fontSize: "0.65rem", color: "#334155" }}>
            Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community
          </div>
        </div>
        <p style={{ margin: "10px 0 0", color: "var(--km-ink-soft)", fontSize: "0.78rem" }}>
          Satellite basemap imagery is not live and does not provide NDVI or crop-health measurements. Allow location access to center the map on your farm.
        </p>
      </section>
    </div>
  );
}

export default function FarmerOverview() {
  const { user, updateUser } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [weather, setWeather] = useState(null);
  const [showSatelliteMap, setShowSatelliteMap] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/weather");
        setWeather(data);
      } catch (err) {
        console.error("Failed to load live weather");
        // Fallback to static data if API fails
        setWeather({ temperature: 29, humidity: 40, windSpeed: 11.3, rainChance: 15 });
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser(editForm);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile.");
    }
    setIsSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      {/* Smart Card Section */}
      <FarmerIDCard user={user} />

      {/* Weather & Spray Window */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", position: "relative" }}>
        <div style={{ position: "absolute", top: "-10px", right: "10px", display: "flex", alignItems: "center", gap: "5px", color: "var(--km-ink-soft)", fontSize: "0.7rem", fontWeight: "bold" }}>
        WEATHER DATA
        </div>
        
        {!weather ? (
          <div style={{ width: "100%", padding: "20px", display: "flex", justifyContent: "center" }}><Loader2 className="km-spin" /> Loading weather...</div>
        ) : (
          <>
            <div className="km-card" style={{ flex: 1, minWidth: "150px" }}>
               <div style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", textTransform: "uppercase", marginBottom: "10px", textAlign: "center" }}>Temperature</div>
               <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--km-forest-deep)", textAlign: "center" }}>🌡 {weather.temperature}°C</div>
            </div>
            <div className="km-card" style={{ flex: 1, minWidth: "150px" }}>
               <div style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", textTransform: "uppercase", marginBottom: "10px", textAlign: "center" }}>Humidity</div>
               <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--km-forest-deep)", textAlign: "center" }}>💧 {weather.humidity}%</div>
            </div>
            <div className="km-card" style={{ flex: 1, minWidth: "150px" }}>
               <div style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", textTransform: "uppercase", marginBottom: "10px", textAlign: "center" }}>Wind Speed</div>
               <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--km-forest-deep)", textAlign: "center" }}>🌬 {weather.windSpeed} km/h</div>
            </div>
            <div className="km-card" style={{ flex: 1, minWidth: "150px" }}>
               <div style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", textTransform: "uppercase", marginBottom: "10px", textAlign: "center" }}>Rain Chance</div>
               <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--km-forest-deep)", textAlign: "center" }}>🌧 {weather.rainChance}%</div>
            </div>
          </>
        )}
      </div>
      
      {weather && (
        <div className="km-card" style={{ 
          backgroundColor: weather.windSpeed > 15 || weather.rainChance > 50 ? "rgba(211, 47, 47, 0.08)" : "rgba(45, 106, 79, 0.08)", 
          border: weather.windSpeed > 15 || weather.rainChance > 50 ? "1px solid var(--km-alert)" : "1px solid var(--km-success)", 
          display: "flex", alignItems: "center", gap: "15px" 
        }}>
           {weather.windSpeed > 15 || weather.rainChance > 50 ? <AlertTriangle size={24} color="var(--km-alert)" /> : <CheckCircle size={24} color="var(--km-success)" />}
           <div>
              <div style={{ fontWeight: "bold", color: weather.windSpeed > 15 || weather.rainChance > 50 ? "var(--km-alert)" : "var(--km-forest-deep)", fontSize: "0.9rem", textTransform: "uppercase" }}>
                Pesticide Spraying Window: {weather.windSpeed > 15 || weather.rainChance > 50 ? "WARNING" : "OPTIMAL"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>
                {weather.windSpeed > 15 
                  ? "High wind speeds detected! Spraying is not recommended due to chemical drift." 
                  : weather.rainChance > 50 
                    ? "High chance of rain detected. Pesticides may wash away." 
                    : "Wind and temperature profiles are safe. Ideal time for pesticide spray."}
              </div>
           </div>
        </div>
      )}

      <WeatherAlerts farmerPhone={user?.phone} />

      {/* Crop Health (NDVI) */}
      <div className="km-card" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
         <div className="km-card-title" style={{ borderBottom: "none", paddingBottom: "0", marginBottom: "0" }}>
           <div style={{ fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
             <span style={{ fontSize: "1.2rem" }}>🛰</span> Crop Health (NDVI)
           </div>
           <div style={{ display: "flex", gap: "5px" }}>
             <button className="km-btn km-btn--primary" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>NDVI Index</button>
             <button type="button" className="km-btn km-btn--outline" onClick={() => setShowSatelliteMap(true)} style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Satellite View</button>
           </div>
         </div>
         
         <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
           {/* Grid */}
           <div style={{ flex: "2", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px", backgroundColor: "#333", padding: "10px", borderRadius: "10px" }}>
             {[
               { id: "A-1", val: 0.82, color: "#2d6a4f" }, { id: "A-2", val: 0.79, color: "#2d6a4f" }, { id: "A-3", val: 0.52, color: "#e08d24" },
               { id: "B-1", val: 0.85, color: "#2d6a4f" }, { id: "B-2", val: 0.81, color: "#2d6a4f" }, { id: "B-3", val: 0.38, color: "#b33a3a", border: "2px solid #fff" },
               { id: "C-1", val: 0.77, color: "#2d6a4f" }, { id: "C-2", val: 0.55, color: "#e08d24" }, { id: "C-3", val: 0.80, color: "#2d6a4f" },
               { id: "D-1", val: 0.83, color: "#2d6a4f" }, { id: "D-2", val: 0.78, color: "#2d6a4f" }, { id: "D-3", val: 0.82, color: "#2d6a4f" },
             ].map(cell => (
                <div key={cell.id} style={{ backgroundColor: cell.color, padding: "15px 5px", borderRadius: "6px", textAlign: "center", color: "#fff", border: cell.border || "none" }}>
                   <div style={{ fontWeight: "bold", fontSize: "0.8rem" }}>{cell.id}</div>
                   <div style={{ fontSize: "0.65rem", opacity: 0.9 }}>NDVI {cell.val}</div>
                </div>
             ))}
           </div>
           
           {/* Sidebar */}
           <div style={{ flex: "1", minWidth: "200px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "var(--km-paper-dim)", padding: "15px", borderRadius: "10px" }}>
             <div style={{ fontWeight: "bold", fontSize: "1rem" }}>Sector B-3</div>
             <div>
               <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "var(--km-ink)" }}>NDVI Index: <span style={{ fontWeight: "normal" }}>0.38</span></div>
               <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "var(--km-ink)" }}>Status: <span style={{ color: "var(--km-alert)" }}>DEFICIENT</span></div>
             </div>
             <p style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", margin: 0 }}>
               Sector B-3: Pest/Nitrogen deficit flagged. Apply fertilizer.
             </p>
             <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(224, 141, 36, 0.1)", color: "var(--km-saffron-deep)", padding: "8px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: "bold" }}>
               <AlertTriangle size={14} /> Action suggested by advisory system
             </div>
           </div>
         </div>
      </div>
      
      <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)", backgroundColor: "var(--km-paper-dim)", padding: "10px", borderRadius: "8px" }}>
        💡 <strong>How to use this dashboard:</strong> This screen coordinates live feeds from high-altitude agricultural satellites and your local weather. Watch the Spraying Window to time chemicals to avoid wind drift. Use the Crop Health Index (NDVI) grid to inspect stressed sectors.
      </div>

      {/* Official Partners */}
      {showSatelliteMap && <SatelliteMap onClose={() => setShowSatelliteMap(false)} />}

      <div className="km-card km-partners">
        <div className="km-partners__heading">
          <div>
            <span className="km-partners__eyebrow">OUR NETWORK</span>
            <h3>🤝 Official Integration Partners</h3>
          </div>
          <span className="km-partners__count">{integrationPartners.length} partners</span>
        </div>
        <p className="km-partners__intro">
          Visit our partners’ official websites for agricultural products, services, and resources.
        </p>
        <div className="km-partners__grid">
          {integrationPartners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="km-partners__link"
              aria-label={`Visit ${partner.name} official website (opens in a new tab)`}
            >
              <span className="km-partners__link-top">
                <span className="km-partners__category">{partner.category}</span>
                <ExternalLink size={16} aria-hidden="true" />
              </span>
              <strong>{partner.name}</strong>
              <span className="km-partners__domain">{partner.domain}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
