import React, { useEffect, useRef, useState } from "react";
import { Plane, Tractor, Calendar, MapPin, Calculator, Play, Video, CheckCircle, ChevronRight, Volume2, VolumeX, X, Clock } from "lucide-react";
import "./Drones.css";
import { loadWorkspace, saveWorkspace } from "../../utils/workspace.js";
import { getCurrentLocation } from "../../utils/geolocation.js";

export default function Drones() {
  const [activeTab, setActiveTab] = useState("drones");
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const adVideoRef = useRef(null);
  const [acres, setAcres] = useState(1);
  const [crop, setCrop] = useState("Paddy");
  const [purpose, setPurpose] = useState("Pesticide Spray");
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadWorkspace("drone-bookings")
      .then((savedBookings) => {
        if (!cancelled && Array.isArray(savedBookings)) setBookings(savedBookings);
      })
      .catch((error) => {
        if (!cancelled) setBookingError(error.response?.data?.message || "Unable to load saved drone bookings.");
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isAdOpen) return undefined;
    const timer = window.setTimeout(() => {
      setSkipCountdown(5);
      setIsAdOpen(true);
    }, 5 * 60 * 1000);
    return () => window.clearTimeout(timer);
  }, [isAdOpen]);

  useEffect(() => {
    if (!isAdOpen || skipCountdown === 0) return undefined;
    const timer = window.setTimeout(() => {
      setSkipCountdown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [isAdOpen, skipCountdown]);

  useEffect(() => {
    if (!isAdOpen || !adVideoRef.current) return;
    const video = adVideoRef.current;
    video.muted = isMuted;
    video.currentTime = 0;
    video.play().catch(() => setPlaybackBlocked(true));
  }, [isAdOpen]);

  const closeAd = () => {
    setIsAdOpen(false);
    setPlaybackBlocked(false);
  };

  const toggleAdSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (adVideoRef.current) adVideoRef.current.muted = nextMuted;
  };

  const handleBooking = async () => {
    if (!Number.isFinite(acres) || acres < 1) {
      setBookingError("Enter a valid farm size of at least one acre.");
      return;
    }
    if (!location.trim()) {
      setBookingError("Set your farm location using GPS or enter it manually.");
      return;
    }
    const booking = {
      id: `DR-${crypto.randomUUID()}`,
      crop,
      acres,
      purpose,
      location,
      status: "requested",
      createdAt: new Date().toISOString(),
    };
    setIsBooking(true);
    setBookingError("");
    setBookingMessage("");
    try {
      const savedBookings = await saveWorkspace("drone-bookings", [...bookings, booking]);
      setBookings(savedBookings);
      setBookingMessage(`Booking request ${booking.id} is saved on this device and will sync automatically.`);
    } catch (error) {
      setBookingError(error.response?.data?.message || "Booking was not saved. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError("");
    try {
      const coordinates = await getCurrentLocation();
      setLocation(`${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`);
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setIsLocating(false);
    }
  };

  const equipment = [
    { type: "Mahindra Tractor 575 DI", hp: "45 HP", rate: "₹600 / Hour", distance: "2.4 km away", owner: "Ramesh K." },
    { type: "John Deere 5310", hp: "55 HP", rate: "₹750 / Hour", distance: "4.1 km away", owner: "Shivakumar" },
    { type: "Swaraj 744 FE (With Rotavator)", hp: "48 HP", rate: "₹900 / Hour", distance: "1.2 km away", owner: "Kisan Cooperative" },
    { type: "Kubota Multi-Crop Harvester", hp: "Harvester", rate: "₹2,500 / Acre", distance: "8.5 km away", owner: "APMC Syndicate" },
    { type: "Automatic Seed Drill", hp: "Implement", rate: "₹300 / Hour", distance: "3.0 km away", owner: "Prakash T." }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      {/* Sub-Navigation */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--km-line)", paddingBottom: "10px" }}>
        <button 
          onClick={() => setActiveTab("drones")}
          className={`km-btn ${activeTab === "drones" ? "km-btn--primary" : "km-btn--outline"}`}
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plane size={18} /> Smart Drone Spraying (AI)
        </button>
        <button 
          onClick={() => setActiveTab("equipment")}
          className={`km-btn ${activeTab === "equipment" ? "km-btn--primary" : "km-btn--outline"}`}
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Tractor size={18} /> Equipment Rental Marketplace
        </button>
      </div>

      {activeTab === "drones" && (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          {/* Left Column: Booking Form */}
          <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="km-card">
              <h3 style={{ fontSize: "1.1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px 0" }}>
                 <Calendar size={20} /> Book AI Spraying Drone
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                 <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Select Crop Type</label>
                    <select 
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
                    >
                      <option>Paddy</option>
                      <option>Sugarcane</option>
                      <option>Maize</option>
                      <option>Cotton</option>
                      <option>Tomato</option>
                    </select>
                 </div>
                 
                 <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Land Size (Acres)</label>
                    <input 
                      type="number" 
                      value={acres}
                      onChange={(e) => setAcres(Number(e.target.value))}
                      style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px" }} 
                      min="1"
                    />
                 </div>

                 <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Purpose</label>
                    <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px" }}>
                      <option>Pesticide Spray</option>
                      <option>Liquid Fertilizer Spray</option>
                      <option>Micro-Nutrient Boost</option>
                    </select>
                 </div>

                 <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Farm Location (GPS or address)</label>
                    <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                       <input
                         type="text"
                         value={location}
                         onChange={(event) => { setLocation(event.target.value); setLocationError(""); }}
                         placeholder="Use GPS or enter your farm location"
                         aria-label="Farm location"
                         style={{ flex: 1, minWidth: 0, padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                       />
                       <button 
                         type="button"
                         onClick={handleGetLocation} 
                         disabled={isLocating}
                         aria-label={isLocating ? "Getting current location" : "Use current location"}
                         className="km-btn km-btn--outline" 
                         style={{ padding: "0 15px" }}
                         title="Use Current Location"
                       >
                         {isLocating ? <MapPin size={18} className="km-spin" /> : <MapPin size={18} />}
                       </button>
                    </div>
                    {location.trim() && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", marginTop: "6px", color: "var(--km-forest)", fontSize: "0.8rem" }}
                      >
                        Check this location in Google Maps
                      </a>
                    )}
                 </div>

                 {locationError && <div role="alert" style={{ color: "var(--km-alert)", fontSize: "0.85rem" }}>{locationError}</div>}
                 {bookingError && <div role="alert" style={{ color: "var(--km-alert)", fontSize: "0.85rem" }}>{bookingError}</div>}
                 {bookingMessage && <div role="status" style={{ color: "var(--km-success)", fontSize: "0.85rem" }}>{bookingMessage}</div>}
                 <button type="button" disabled={isBooking} onClick={handleBooking} className="km-btn km-btn--primary" style={{ marginTop: "10px", width: "100%", padding: "12px", fontSize: "1rem" }}>
                   {isBooking ? "Saving booking..." : "Confirm Booking"}
                 </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Calculator & Tracking */}
          <div style={{ flex: 1.5, minWidth: "350px", display: "flex", flexDirection: "column", gap: "20px" }}>
             
             {/* AI Calculator */}
             <div className="km-card" style={{ borderLeft: "4px solid var(--km-saffron)" }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 15px 0" }}>
                   <Calculator size={20} color="var(--km-saffron-deep)" /> AI Spraying Calculation
                </h3>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(224, 141, 36, 0.1)", padding: "15px", borderRadius: "8px", border: "1px dashed var(--km-saffron)" }}>
                   <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Area</div>
                      <div style={{ fontSize: "1.4rem", color: "var(--km-saffron-deep)", fontWeight: "bold" }}>{acres} Acres</div>
                   </div>
                   <ChevronRight size={24} color="#ccc" />
                   <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Crop</div>
                      <div style={{ fontSize: "1.2rem", color: "var(--km-ink)", fontWeight: "bold" }}>{crop}</div>
                   </div>
                   <ChevronRight size={24} color="#ccc" />
                   <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Fluid Req.</div>
                      <div style={{ fontSize: "1.4rem", color: "var(--km-success)", fontWeight: "bold" }}>{acres * 10} Liters</div>
                   </div>
                </div>
                
                <div style={{ marginTop: "15px", fontSize: "0.85rem", color: "var(--km-ink-soft)", lineHeight: "1.5" }}>
                  <strong>💡 AI Insight:</strong> Based on the {crop} canopy density, the drone will automatically adjust its nozzle flow rate to 2.5L/min, ensuring optimal leaf coverage while saving 30% chemical usage compared to manual spraying.
                </div>
             </div>

             <div className="km-card km-sponsored-card">
                <div className="km-sponsored-card__eyebrow">
                  <span><Video size={16} /> Sponsored video</span>
                  <span className="km-sponsored-card__ad-label">AD</span>
                </div>
                <div className="km-sponsored-card__content">
                  <div className="km-sponsored-card__play-icon" aria-hidden="true"><Play size={24} fill="currentColor" /></div>
                  <p className="km-sponsored-card__kicker">SMARTER FARMING, LESS EFFORT</p>
                  <h3>See precision drone spraying in action</h3>
                  <p>Discover how targeted spraying can help protect your crops and save on chemicals.</p>
                  <button className="km-sponsored-card__watch" type="button" onClick={() => { setSkipCountdown(5); setIsAdOpen(true); }}>
                    <Play size={16} fill="currentColor" /> Watch video
                  </button>
                </div>
                <div className="km-sponsored-card__footer">
                  <span><CheckCircle size={15} /> A short, skippable video</span>
                  <span><Clock size={14} /> Repeats every 5 min</span>
                </div>
             </div>

             {/* Live Tracking Placeholder */}
             <div className="km-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "15px", backgroundColor: "#f9f7f0", borderBottom: "1px solid #e0d5c1" }}>
                   <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                      <Plane size={18} /> Drone Live Tracking
                   </h3>
                </div>
                <div style={{ width: "100%", height: "200px", backgroundColor: "#e8f4f8", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
                   {/* Dummy Map Area */}
                   <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(#0072bc 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                   
                   <div style={{ textAlign: "center", zIndex: 1 }}>
                     <Plane size={40} color="var(--km-alert)" style={{ transform: "rotate(45deg)", marginBottom: "10px" }} />
                     <div style={{ backgroundColor: "#fff", padding: "5px 10px", borderRadius: "15px", fontSize: "0.75rem", fontWeight: "bold", border: "1px solid #ccc", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                       Drone Idle. Awaiting Booking.
                     </div>
                   </div>
                </div>
             </div>

          </div>
        </div>
      )}

      {activeTab === "equipment" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ backgroundColor: "var(--km-forest)", color: "#fff", padding: "20px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div>
                <h2 style={{ margin: "0 0 5px 0", fontSize: "1.4rem" }}>Equipment Rental Marketplace</h2>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Rent tractors, harvesters, and tools from verified local farmers and hubs.</p>
             </div>
             <Tractor size={48} opacity={0.2} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {equipment.map((eq, idx) => (
               <div key={idx} className="km-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                       <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--km-forest-deep)" }}>{eq.type}</h3>
                       <span style={{ backgroundColor: "#f0f8ff", color: "#0072bc", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold", border: "1px solid #b3d4e5" }}>
                         {eq.hp}
                       </span>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>
                          <MapPin size={16} color="var(--km-alert)" /> {eq.distance}
                       </div>
                       <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>
                          <CheckCircle size={16} color="var(--km-success)" /> Verified Owner: {eq.owner}
                       </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #ccc", paddingTop: "15px" }}>
                     <div>
                        <div style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Rental Rate</div>
                        <div style={{ fontSize: "1.1rem", color: "var(--km-saffron-deep)", fontWeight: "bold" }}>{eq.rate}</div>
                     </div>
                     <button className="km-btn km-btn--primary" style={{ padding: "8px 20px" }}>Book Now</button>
                  </div>
               </div>
            ))}
          </div>

        </div>
      )}

      {isAdOpen && (
        <div className="km-ad-overlay" role="presentation">
          <section className="km-ad-dialog" role="dialog" aria-modal="true" aria-labelledby="km-ad-title">
            <div className="km-ad-dialog__header">
              <div>
                <span className="km-ad-dialog__sponsored"><Video size={15} /> SPONSORED VIDEO</span>
                <h2 id="km-ad-title">Drone spraying in action</h2>
              </div>
              <span className="km-sponsored-card__ad-label">AD</span>
            </div>
            <div className="km-ad-dialog__player">
              <video
                ref={adVideoRef}
                playsInline
                muted={isMuted}
                preload="metadata"
                aria-label="Sponsored drone spraying video"
                onEnded={closeAd}
              >
                <source src="/drone-spraying.mp4" type="video/mp4" />
                Your browser does not support the video element.
              </video>
              {playbackBlocked && (
                <button
                  className="km-ad-dialog__play"
                  type="button"
                  onClick={() => {
                    setPlaybackBlocked(false);
                    adVideoRef.current?.play().catch(() => setPlaybackBlocked(true));
                  }}
                >
                  <Play size={20} fill="currentColor" /> Play video
                </button>
              )}
            </div>
            <div className="km-ad-dialog__footer">
              <span className="km-ad-dialog__note">A quick look at smarter crop care</span>
              <div className="km-ad-dialog__actions">
                <button className="km-ad-dialog__sound" type="button" onClick={toggleAdSound} aria-label={isMuted ? "Turn sound on" : "Mute video"}>
                  {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  {isMuted ? "Unmute" : "Mute"}
                </button>
                <button className="km-ad-dialog__skip" type="button" onClick={closeAd} disabled={skipCountdown > 0}>
                  {skipCountdown > 0 ? `Skip in ${skipCountdown}s` : <>Skip ad <X size={16} /></>}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
