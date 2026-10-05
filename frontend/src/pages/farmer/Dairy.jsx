import React, { useState } from "react";
import {
  Activity, Droplet, TrendingUp, Calendar, HeartPulse,
  Plus, Shield, ShoppingCart, Info, ChevronDown, ChevronUp
} from "lucide-react";

const DAIRY_BRANDS = [
  {
    id: "kmf",
    name: "KMF Nandini",
    fullName: "Karnataka Milk Federation – Nandini",
    logo: "N",
    color: "#1565C0",
    bgGrad: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
    badgeColor: "#E3F2FD",
    badgeText: "#1565C0",
    established: "1974",
    region: "Karnataka",
    tagline: "Quality Excellence from Cow to Consumer",
    products: [
      { name: "Nandini Toned Milk", variant: "Standardised", fat: "3.0%", snf: "8.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 44, badge: "🔵 Standard", description: "Pasteurised & homogenised toned milk for daily use." },
      { name: "Nandini Full Cream", variant: "Full Cream", fat: "6.0%", snf: "9.0%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 56, badge: "🟠 Full Cream", description: "Rich, creamy full cream milk – ideal for sweets & coffee." },
      { name: "Nandini Buffalo Milk", variant: "Buffalo", fat: "6.5%", snf: "9.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 62, badge: "🟣 Buffalo", description: "Pure buffalo milk with high fat for richer taste." },
      { name: "Nandini Desi Cow", variant: "Desi Cow", fat: "3.5%", snf: "8.5%", type: "Tetra Pack", sizes: ["200 mL", "500 mL", "1 L"], ratePerLitre: 52, badge: "🟢 A2 Desi", imagePath: "/milk/nandini-cow-milk.png", description: "Sourced from indigenous desi cow breeds. A2 protein rich." },
      { name: "Nandini Healthy Life", variant: "Skimmed", fat: "0.5%", snf: "9.0%", type: "Tetra Pack", sizes: ["200 mL", "1 L"], ratePerLitre: 40, badge: "💚 Diet", description: "Low-fat skimmed milk for health-conscious consumers." },
      { name: "Nandini Gold", variant: "Premium", fat: "4.5%", snf: "8.5%", type: "Tetra Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 58, badge: "🏅 Gold", description: "Premium standardised milk with enriched nutrition." },
      { name: "Nandini Shubham", variant: "Double Toned", fat: "1.5%", snf: "9.0%", type: "Poly Pack", sizes: ["500 mL"], ratePerLitre: 36, badge: "⚪ Light", description: "Double toned milk – ideal for daily cooking needs." },
      { name: "Nandini Special", variant: "Fortified", fat: "4.0%", snf: "8.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 54, badge: "🌟 Special", description: "Fortified with Vitamins A & D. For growing children." },
    ],
  },
  {
    id: "amul",
    name: "Amul",
    fullName: "Gujarat Cooperative Milk Marketing Federation – Amul",
    logo: "A",
    color: "#C62828",
    bgGrad: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
    badgeColor: "#FFEBEE",
    badgeText: "#C62828",
    established: "1946",
    region: "Pan India",
    tagline: "The Taste of India",
    products: [
      { name: "Amul Gold", variant: "Full Cream", fat: "6.0%", snf: "9.0%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 66, badge: "🏅 Gold", description: "Full cream milk – rich in fat for premium taste." },
      { name: "Amul Taaza", variant: "Toned", fat: "3.0%", snf: "8.5%", type: "Tetra Pack", sizes: ["200 mL", "500 mL", "1 L"], ratePerLitre: 52, badge: "🔵 Taaza", imagePath: "/milk/amul-taaza.png", description: "Fresh toned milk processed and packed hygienically." },
      { name: "Amul Slim & Trim", variant: "Skimmed", fat: "0.5%", snf: "9.0%", type: "Tetra Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 46, badge: "💚 Slim", description: "Zero fat skimmed milk – perfect for fitness lovers." },
      { name: "Amul Buffalo Milk", variant: "Buffalo", fat: "6.5%", snf: "9.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 68, badge: "🟣 Buffalo", description: "Pure buffalo milk – dense, rich and nutritious." },
      { name: "Amul Cow Milk", variant: "Cow", fat: "4.0%", snf: "8.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 58, badge: "🐄 Cow Milk", imagePath: "/milk/amul-cow-milk.png", description: "Cow milk. Confirm pack size and nutrition details on the product label." },
      { name: "Amul A2 Desi Gir", variant: "A2 Desi Cow", fat: "4.0%", snf: "8.7%", type: "Tetra Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 80, badge: "🌿 A2", description: "A2 beta-casein protein from purebred Gir cows." },
      { name: "Amul Shakti", variant: "Standardised", fat: "4.5%", snf: "8.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 58, badge: "💪 Shakti", description: "Enriched with calcium and protein. For active families." },
    ],
  },
  {
    id: "mother",
    name: "Mother Dairy",
    fullName: "Mother Dairy Fruit & Vegetable Pvt. Ltd.",
    logo: "MD",
    color: "#2E7D32",
    bgGrad: "linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)",
    badgeColor: "#E8F5E9",
    badgeText: "#2E7D32",
    established: "1974",
    region: "North India",
    tagline: "Swadesh ka Swad",
    products: [
      { name: "Mother Dairy Full Cream", variant: "Full Cream", fat: "6.0%", snf: "9.0%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 64, badge: "🟠 Full Cream", description: "Thick and creamy milk for daily home use." },
      { name: "Mother Dairy Toned", variant: "Toned", fat: "3.0%", snf: "8.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 50, badge: "🔵 Toned", imagePath: "/milk/mother-dairy-toned.png", description: "Good tasting toned milk packed under NDDB supervision." },
      { name: "Mother Dairy Token", variant: "Buffalo", fat: "5.0%", snf: "9.0%", type: "Token Booth", sizes: ["Per Litre"], ratePerLitre: 56, badge: "🟣 Token", description: "Freshly dispensed at Mother Dairy token milk booths." },
      { name: "MD Double Toned", variant: "Double Toned", fat: "1.5%", snf: "9.0%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 44, badge: "⚪ Double Toned", description: "Low calorie option for weight-conscious households." },
      { name: "Mother Dairy Cow Milk", variant: "Cow", fat: "3.5%", snf: "8.5%", type: "Tetra Pack", sizes: ["200 mL", "500 mL", "1 L"], ratePerLitre: 54, badge: "🐄 Cow Milk", description: "Pure cow milk for health and wellness." },
    ],
  },
  {
    id: "heritage",
    name: "Heritage",
    fullName: "Heritage Foods Ltd.",
    logo: "H",
    color: "#E65100",
    bgGrad: "linear-gradient(135deg, #F57F17 0%, #E65100 100%)",
    badgeColor: "#FFF3E0",
    badgeText: "#E65100",
    established: "1992",
    region: "South India",
    tagline: "Good Food Good Life",
    products: [
      { name: "Heritage Full Cream", variant: "Full Cream", fat: "6.0%", snf: "9.0%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 62, badge: "🟠 Full Cream", imagePath: "/milk/heritage-full-cream.png", description: "Creamy full fat milk for every occasion." },
      { name: "Heritage Toned", variant: "Toned", fat: "3.0%", snf: "8.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 48, badge: "🔵 Toned", imagePath: "/milk/heritage-toned.png", description: "Standard toned milk for everyday family needs." },
      { name: "Heritage Cow Milk", variant: "Cow", fat: "3.5%", snf: "8.5%", type: "Poly Pack", sizes: ["500 mL", "1 L"], ratePerLitre: 52, badge: "🟢 Cow", description: "Pure natural cow milk with wholesome goodness." },
      { name: "Heritage Slim", variant: "Skimmed", fat: "0.5%", snf: "8.7%", type: "Tetra Pack", sizes: ["500 mL"], ratePerLitre: 44, badge: "💚 Slim", description: "Low-fat skimmed milk for diet-conscious consumers." },
      { name: "Heritage Homogenised", variant: "Standardised", fat: "4.5%", snf: "8.5%", type: "Tetra Pack", sizes: ["200 mL", "1 L"], ratePerLitre: 56, badge: "⭐ Premium", description: "Homogenised milk for smooth, uniform texture." },
    ],
  },
];

const getFatStyle = (fat) => {
  const f = parseFloat(fat);
  if (f >= 6.0) return { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" };
  if (f >= 4.0) return { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" };
  if (f >= 3.0) return { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" };
  if (f >= 1.5) return { bg: "#FAFAFA", text: "#546E7A", border: "#CFD8DC" };
  return { bg: "#E0F7FA", text: "#006064", border: "#80DEEA" };
};

function ProductCard({ product, brandColor, brandName, brandImagePath }) {
  const fatStyle = getFatStyle(product.fat);
  const brandShort = brandName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const packageImagePath = product.imagePath || brandImagePath;
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #EEF2F7", overflow: "hidden", boxShadow: "0 4px 14px rgba(12, 28, 42, 0.06)" }}>
      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, background: fatStyle.bg, color: fatStyle.text, border: `1px solid ${fatStyle.border}`, padding: "3px 9px", borderRadius: "20px", whiteSpace: "nowrap" }}>{product.badge}</span>
          <span style={{ fontSize: "0.7rem", color: "#888", background: "#F5F5F5", padding: "3px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>{product.type}</span>
        </div>

        <div style={{ minHeight: "158px", background: "#F8FAFC", border: "1px solid #E8ECF0", borderRadius: "14px", padding: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          {packageImagePath && !imageUnavailable ? (
            <img
              src={packageImagePath}
              alt={product.imagePath ? `${product.name} milk package reference photo` : `${brandName} milk package reference photo; product variant may differ`}
              loading="lazy"
              onError={() => setImageUnavailable(true)}
              style={{ display: "block", width: "100%", height: "126px", objectFit: "contain", borderRadius: "8px", background: "#fff" }}
            />
          ) : (
            <div aria-label={`${brandName} ${product.variant} package photo placeholder`} style={{ width: "100%", height: "126px", display: "grid", placeItems: "center", borderRadius: "8px", background: `linear-gradient(135deg, ${brandColor}12, ${brandColor}24)`, color: brandColor, fontSize: "2rem", fontWeight: 900 }}>
              {brandShort}
            </div>
          )}
          <span style={{ fontSize: "0.65rem", color: "#667085", textAlign: "center" }}>
            {product.imagePath ? "Reference package photo · size may vary" : "Brand package reference · variant/size may differ"}
          </span>
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1A2340" }}>{product.name}</div>
          <div style={{ fontSize: "0.78rem", color: "#888" }}>{product.variant}</div>
        </div>
        <div style={{ fontSize: "0.78rem", color: "#666", lineHeight: 1.5 }}>{product.description}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div style={{ background: fatStyle.bg, border: `1px solid ${fatStyle.border}`, borderRadius: "8px", padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "0.62rem", color: fatStyle.text, fontWeight: 700, letterSpacing: "0.06em" }}>FAT</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: fatStyle.text }}>{product.fat}</div>
          </div>
          <div style={{ background: "#F3F0FF", border: "1px solid #D1C4E9", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "0.62rem", color: "#5E35B1", fontWeight: 700, letterSpacing: "0.06em" }}>SNF</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#5E35B1" }}>{product.snf}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {product.sizes.map((sz) => {
            const isOneLitre = /1\s*(l|litre|liter)/i.test(sz);
            return (
              <span
                key={sz}
                style={{
                  fontSize: "0.72rem",
                  background: isOneLitre ? brandColor : "#F0F4FF",
                  color: isOneLitre ? "#fff" : "#3949AB",
                  border: isOneLitre ? "1px solid transparent" : "1px solid #C5CAE9",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontWeight: 700,
                  boxShadow: isOneLitre ? "0 6px 16px rgba(21, 101, 192, 0.16)" : "none"
                }}
              >
                {sz}
              </span>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop: "1px solid #F0F0F0", background: "linear-gradient(90deg, #FAFBFF, #F0F4FF)", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.62rem", color: "#999", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Rate / Litre</div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: brandColor }}>₹{product.ratePerLitre}.00</div>
        </div>
        <div style={{ background: brandColor, color: "#fff", padding: "5px 12px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>/ L</div>
      </div>
    </div>
  );
}

function BrandSection({ brand }) {
  const [expanded, setExpanded] = useState(true);
  const brandImagePath = brand.products.find((product) => product.imagePath)?.imagePath;
  const minRate = Math.min(...brand.products.map((p) => p.ratePerLitre));
  const maxRate = Math.max(...brand.products.map((p) => p.ratePerLitre));
  const minFat = Math.min(...brand.products.map((p) => parseFloat(p.fat)));
  const maxFat = Math.max(...brand.products.map((p) => parseFloat(p.fat)));

  return (
    <div style={{ background: "#fff", borderRadius: "18px", border: "1.5px solid #E8ECF0", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div style={{ background: brand.bgGrad, padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", userSelect: "none" }} onClick={() => setExpanded((e) => !e)}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "52px", height: "52px", background: "rgba(255,255,255,0.15)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>{brand.logo}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: 0, color: "#fff", fontSize: "1.3rem", fontWeight: 800 }}>{brand.name}</h2>
              <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: "0.7rem", padding: "2px 10px", borderRadius: "20px", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}>Est. {brand.established}</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.8rem", marginTop: "2px" }}>{brand.fullName}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.74rem", fontStyle: "italic" }}>&ldquo;{brand.tagline}&rdquo; · {brand.region}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem", fontWeight: 600 }}>PRODUCTS</div>
            <div style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 900, lineHeight: 1 }}>{brand.products.length}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {expanded ? <ChevronUp size={18} color="#fff" /> : <ChevronDown size={18} color="#fff" />}
          </div>
        </div>
      </div>

      {expanded && (
        <>
          <div style={{ background: "#F8FAFF", borderBottom: "1px solid #EEF2FF", padding: "11px 24px", display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#555" }}>📊 Rate:</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: brand.color, background: brand.badgeColor, padding: "4px 12px", borderRadius: "20px", border: `1.5px solid ${brand.color}30` }}>₹{minRate} – ₹{maxRate} / litre</span>
            <span style={{ fontSize: "0.78rem", color: "#999" }}>|</span>
            <span style={{ fontSize: "0.78rem", color: "#555" }}>🧈 FAT: <strong>{minFat.toFixed(1)}% – {maxFat.toFixed(1)}%</strong></span>
          </div>
          <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {brand.products.map((product) => (
              <ProductCard key={product.name} product={product} brandColor={brand.color} brandName={brand.name} brandImagePath={brandImagePath} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const VET_HOSPITALS = [
  { name: "Bengaluru Rural Veterinary Hospital", pincode: "560123", distanceKm: 3.4, phone: "080-2345-1101", address: "Kundana, Bengaluru Rural" },
  { name: "Nandini Animal Care Centre", pincode: "560124", distanceKm: 5.2, phone: "080-2345-2202", address: "Dodballapur Road, Bengaluru Rural" },
  { name: "Krishi Seva Veterinary Clinic", pincode: "560110", distanceKm: 7.8, phone: "080-2345-3303", address: "Devanahalli, Bengaluru Rural" },
  { name: "Ananthapura Veterinary Hospital", pincode: "560117", distanceKm: 9.1, phone: "080-2345-4404", address: "Hoskote, Bengaluru Rural" },
];

export default function Dairy() {
  const [activeTab, setActiveTab] = useState("rates");
  const [healthTasks, setHealthTasks] = useState([
    { icon: "⚠️", title: "FMD Vaccination Due", desc: "Cow KA-04-1234 requires Foot & Mouth Disease vaccination.", action: "Mark Completed", urgent: true, status: "pending" },
    { icon: "📅", title: "Pregnancy Check", desc: "Cow KA-04-5678 is at Day 90. Schedule vet visit.", action: "Schedule Vet", urgent: false, status: "pending" },
  ]);
  const [selectedVetTask, setSelectedVetTask] = useState(null);
  const [vetPincode, setVetPincode] = useState("560123");
  const [vetResult, setVetResult] = useState(null);

  const getNearestVetHospital = (pincode) => {
    const rawPincode = String(pincode || "").trim();
    if (!rawPincode) {
      return null;
    }

    const normalized = rawPincode.replace(/\D/g, "");
    if (!normalized) {
      return null;
    }

    const matchingHospitals = VET_HOSPITALS.filter((hospital) => (
      hospital.pincode === normalized ||
      hospital.pincode.startsWith(normalized.slice(0, 3)) ||
      normalized.startsWith(hospital.pincode.slice(0, 3))
    ));

    if (!matchingHospitals.length) {
      return null;
    }

    return [...matchingHospitals].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  };

  const handleHealthAction = (task) => {
    if (task.title === "FMD Vaccination Due") {
      setHealthTasks((currentTasks) => currentTasks.map((item) => item.title === task.title ? { ...item, status: "completed", action: "Completed" } : item));
      setVetResult({
        title: "Vaccination marked complete",
        message: "Cow KA-04-1234 has been marked as vaccinated for FMD.",
      });
      return;
    }

    setSelectedVetTask(task.title);
    setVetResult(null);
  };

  const handleFindNearestVet = () => {
    const nearestHospital = getNearestVetHospital(vetPincode);
    if (!nearestHospital) {
      setVetResult({
        title: "No nearby hospital found",
        message: "Please enter a valid Karnataka pincode near the farm to find the nearest veterinary clinic.",
      });
      return;
    }

    setVetResult({
      title: "Nearest veterinary check-up point",
      message: `${nearestHospital.name} is the closest option for your pincode ${vetPincode}. It is ${nearestHospital.distanceKm} km away and can be reached at ${nearestHospital.phone}.`,
      address: nearestHospital.address,
    });
  };

  const handleMarkVetScheduled = () => {
    if (!selectedVetTask) {
      return;
    }

    setHealthTasks((currentTasks) => currentTasks.map((item) => item.title === selectedVetTask ? { ...item, status: "scheduled", action: "Scheduled" } : item));
    setSelectedVetTask(null);
    const nearestHospital = getNearestVetHospital(vetPincode);
    if (nearestHospital) {
      setVetResult({
        title: "Vet visit scheduled",
        message: `Cow KA-04-5678 is scheduled for a vet check. Nearest hospital: ${nearestHospital.name} (${nearestHospital.distanceKm} km away).`,
        address: nearestHospital.address,
      });
    }
  };

  const [cows] = useState([
    { id: "KA-04-1234", breed: "HF Cross", age: "4 Yrs", status: "Milking", yield: "15 L/day" },
    { id: "KA-04-5678", breed: "Jersey", age: "3 Yrs", status: "Dry (Pregnant)", yield: "-" },
    { id: "KA-04-9012", breed: "Sindhi", age: "5 Yrs", status: "Milking", yield: "12 L/day" },
  ]);

  const [milkLogs] = useState([
    { id: "INV-1001", date: "2023-10-25", shift: "Morning", quantity: "75 L", fat: "3.8%", snf: "8.5%", revenue: "₹2,400" },
    { id: "INV-1002", date: "2023-10-25", shift: "Evening", quantity: "70 L", fat: "4.0%", snf: "8.6%", revenue: "₹2,240" },
    { id: "INV-1003", date: "2023-10-24", shift: "Morning", quantity: "72 L", fat: "3.7%", snf: "8.4%", revenue: "₹2,304" },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const TABS = [
    { key: "rates", label: "🥛 Dairy Brands & Rates" },
    { key: "overview", label: "📊 My Overview" },
    { key: "cows", label: "🐄 Cattle" },
    { key: "milk", label: "📋 Milk Log" },
    { key: "health", label: "🩺 Health" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      <div style={{ display: "flex", gap: "0", flexWrap: "wrap", borderBottom: "2px solid #E8ECF0", marginBottom: "24px", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "11px 18px", fontSize: "0.82rem",
              fontWeight: activeTab === tab.key ? 700 : 500,
              border: "none",
              borderBottom: activeTab === tab.key ? "3px solid #1565C0" : "3px solid transparent",
              background: "none", cursor: "pointer",
              color: activeTab === tab.key ? "#1565C0" : "#666",
              transition: "all 0.18s", whiteSpace: "nowrap", marginBottom: "-2px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "rates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 55%, #1976D2 100%)", borderRadius: "18px", padding: "28px", color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: "-30px", right: "80px", width: "100px", height: "100px", background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🥛</span>
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", opacity: 0.75, textTransform: "uppercase" }}>Krishi Mitra · Dairy brands</div>
                  <h1 style={{ margin: 0, fontSize: "1.55rem", fontWeight: 900 }}>Milk Brands &amp; Indicative Prices</h1>
                </div>
              </div>
              <p style={{ margin: "8px 0 0 0", opacity: 0.82, fontSize: "0.86rem", maxWidth: "560px", lineHeight: 1.6 }}>
                Browse familiar dairy brands, package photos, product variants, and listed pack sizes. Sample prices are for demonstration and may not match current local prices.
              </p>
              <div style={{ display: "flex", gap: "14px", marginTop: "18px", flexWrap: "wrap" }}>
                {[
                  { label: "Brands Listed", value: `${DAIRY_BRANDS.length}` },
                  { label: "Total Products", value: `${DAIRY_BRANDS.reduce((a, b) => a + b.products.length, 0)}` },
                  { label: "Price Range", value: "₹36 – ₹80 / L" },
                  { label: "FAT Range", value: "0.5% – 6.5%" },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: "rgba(255,255,255,0.13)", borderRadius: "10px", padding: "10px 16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <div style={{ fontSize: "0.62rem", opacity: 0.72, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{stat.label}</div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800 }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "#FFFDE7", border: "1.5px solid #FFF176", borderRadius: "12px", padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <Info size={18} color="#F9A825" style={{ marginTop: "2px", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#795548", marginBottom: "8px" }}>🧈 FAT % Guide for Farmers</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { label: "≥ 6.0% — Full Cream / Buffalo", bg: "#FFF3E0", color: "#E65100", border: "#FFCC80" },
                  { label: "4.0–5.9% — Premium / Cow", bg: "#E8F5E9", color: "#2E7D32", border: "#A5D6A7" },
                  { label: "3.0–3.9% — Toned / Standard", bg: "#E3F2FD", color: "#1565C0", border: "#90CAF9" },
                  { label: "1.5–2.9% — Double Toned", bg: "#FAFAFA", color: "#546E7A", border: "#CFD8DC" },
                  { label: "0.5–1.4% — Skimmed / Diet", bg: "#E0F7FA", color: "#006064", border: "#80DEEA" },
                ].map((g) => (
                  <span key={g.label} style={{ fontSize: "0.72rem", background: g.bg, color: g.color, border: `1px solid ${g.border}`, padding: "3px 10px", borderRadius: "20px", fontWeight: 600 }}>
                    {g.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {DAIRY_BRANDS.map((brand) => (
            <BrandSection key={brand.id} brand={brand} />
          ))}

          <div style={{ textAlign: "center", fontSize: "0.74rem", color: "#667085", padding: "14px", borderTop: "1px solid #EEE" }}>
            Sample prices and product details are illustrative, not live or independently verified. Package photos are references supplied for this project; check the actual label and local retailer for size, ingredients, and current price.
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div className="km-card" style={{ display: "flex", alignItems: "center", gap: "15px", borderLeft: "4px solid var(--km-forest)" }}>
              <div style={{ backgroundColor: "rgba(11,61,46,0.1)", padding: "10px", borderRadius: "50%" }}><Activity size={24} color="var(--km-forest)" /></div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)", textTransform: "uppercase", fontWeight: "bold" }}>Total Cows</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--km-forest-deep)" }}>12</div>
              </div>
            </div>
            <div className="km-card" style={{ display: "flex", alignItems: "center", gap: "15px", borderLeft: "4px solid var(--km-saffron)" }}>
              <div style={{ backgroundColor: "rgba(224,141,36,0.1)", padding: "10px", borderRadius: "50%" }}><Droplet size={24} color="var(--km-saffron-deep)" /></div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)", textTransform: "uppercase", fontWeight: "bold" }}>Today's Milk</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--km-forest-deep)" }}>145 L</div>
              </div>
            </div>
            <div className="km-card" style={{ display: "flex", alignItems: "center", gap: "15px", borderLeft: "4px solid var(--km-success)" }}>
              <div style={{ backgroundColor: "rgba(45,106,79,0.1)", padding: "10px", borderRadius: "50%" }}><TrendingUp size={24} color="var(--km-success)" /></div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)", textTransform: "uppercase", fontWeight: "bold" }}>Today's Revenue</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--km-forest-deep)" }}>₹4,640</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div className="km-card" style={{ flex: 2, minWidth: "280px" }}>
              <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", marginBottom: "15px" }}>🏷️ Live Milk Price – KMF Nandini</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--km-paper-dim)", padding: "15px", borderRadius: "8px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>Bengaluru Rural District</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--km-forest)" }}>₹32.00 / Litre</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--km-success)", fontWeight: "bold" }}>▲ +₹1.50 from last week</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--km-ink-soft)" }}>Standard: 3.5% FAT / 8.5% SNF</div>
                </div>
              </div>
            </div>
            <div className="km-card" style={{ flex: 1, minWidth: "220px" }}>
              <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", marginBottom: "15px" }}>🔔 Smart Alerts</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li style={{ fontSize: "0.82rem", display: "flex", gap: "10px", alignItems: "center", color: "var(--km-alert)" }}><HeartPulse size={16} /><strong>Vaccination Due:</strong> Cow KA-04-1234 (FMD)</li>
                <li style={{ fontSize: "0.82rem", display: "flex", gap: "10px", alignItems: "center", color: "var(--km-saffron-deep)" }}><Calendar size={16} /><strong>Pregnancy Check:</strong> Cow KA-04-5678 (Day 90)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cows" && (
        <div className="km-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--km-forest-deep)", margin: 0 }}>🐄 Livestock Register</h3>
            <button className="km-btn km-btn--primary" style={{ display: "flex", alignItems: "center", gap: "5px" }}><Plus size={16} /> Add Cow</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "540px" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--km-paper-dim)", textAlign: "left" }}>
                  {['Cow ID', 'Breed', 'Age', 'Status', 'Yield'].map((h) => (
                    <th key={h} style={{ padding: "12px", borderBottom: "1px solid var(--km-line)", color: "var(--km-ink-soft)", fontSize: "0.82rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cows.map((cow, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--km-line)" }}>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{cow.id}</td>
                    <td style={{ padding: "12px" }}>{cow.breed}</td>
                    <td style={{ padding: "12px" }}>{cow.age}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: cow.status.includes("Pregnant") ? "#FFF3E0" : "#E8F5E9", color: cow.status.includes("Pregnant") ? "#E65100" : "#2E7D32", borderRadius: "20px", padding: "4px 10px", fontSize: "0.75rem", fontWeight: 700 }}>{cow.status}</span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{cow.yield}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "milk" && (
        <div className="km-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--km-forest-deep)", margin: 0 }}>📋 Daily Milk Log</h3>
            <button className="km-btn km-btn--primary" style={{ display: "flex", alignItems: "center", gap: "5px" }}><Plus size={16} /> Log Milk</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "580px" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--km-paper-dim)", textAlign: "left" }}>
                  {["Invoice #", "Date", "Shift", "Quantity", "FAT / SNF", "Revenue", "Action"].map((h) => (
                    <th key={h} style={{ padding: "12px", borderBottom: "1px solid var(--km-line)", color: "var(--km-ink-soft)", fontSize: "0.82rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {milkLogs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--km-line)" }}>
                    <td style={{ padding: "12px", fontWeight: "bold", fontSize: "0.82rem" }}>{log.id}</td>
                    <td style={{ padding: "12px", fontSize: "0.85rem" }}>{log.date}</td>
                    <td style={{ padding: "12px" }}>{log.shift}</td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{log.quantity}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ fontWeight: 700, color: "#E65100" }}>{log.fat}</span>
                      <span style={{ color: "#ccc", margin: "0 4px" }}>/</span>
                      <span style={{ fontWeight: 700, color: "#5E35B1" }}>{log.snf}</span>
                    </td>
                    <td style={{ padding: "12px", color: "var(--km-success)", fontWeight: "bold" }}>{log.revenue}</td>
                    <td style={{ padding: "12px" }}>
                      <button onClick={() => setSelectedInvoice(log)} className="km-btn km-btn--outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>View Bill</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "health" && (
        <div className="km-card">
          <h3 style={{ fontSize: "1.2rem", color: "var(--km-forest-deep)", marginBottom: "20px" }}>🩺 Health &amp; Veterinary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {healthTasks.map((item, idx) => (
              <div key={idx} style={{ padding: "15px", border: `1px solid ${item.urgent ? "#FFCDD2" : "#FFF9C4"}`, borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", background: item.urgent ? "#FFF5F5" : "#FFFDE7" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "1.6rem" }}>{item.icon}</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", color: "#333" }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#777" }}>{item.desc}</p>
                    {item.status === "completed" && (
                      <span style={{ display: "inline-block", marginTop: "8px", fontSize: "0.7rem", fontWeight: 700, color: "#1B5E20", background: "#E8F5E9", borderRadius: "20px", padding: "4px 8px" }}>Completed</span>
                    )}
                    {item.status === "scheduled" && (
                      <span style={{ display: "inline-block", marginTop: "8px", fontSize: "0.7rem", fontWeight: 700, color: "#6D4C41", background: "#FFF3E0", borderRadius: "20px", padding: "4px 8px" }}>Vet scheduled</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleHealthAction(item)}
                  className="km-btn km-btn--outline"
                  style={{ whiteSpace: "nowrap", opacity: item.status === "completed" || item.status === "scheduled" ? 0.72 : 1 }}
                  disabled={item.status === "completed" || item.status === "scheduled"}
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>

          {selectedVetTask && (
            <div style={{ marginTop: "18px", padding: "18px", border: "1px solid #DDE9F5", borderRadius: "12px", background: "#F8FBFF" }}>
              <h4 style={{ margin: "0 0 12px", color: "var(--km-forest-deep)" }}>Find the nearest vet hospital</h4>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ flex: "1 1 180px", display: "grid", gap: "6px", fontSize: "0.8rem", color: "#444" }}>
                  Farm pincode
                  <input
                    type="text"
                    value={vetPincode}
                    onChange={(event) => setVetPincode(event.target.value)}
                    placeholder="Enter pincode"
                    className="km-input"
                    style={{ minWidth: "160px" }}
                  />
                </label>
                <button onClick={handleFindNearestVet} className="km-btn km-btn--primary" style={{ alignSelf: "end" }}>Check nearest hospital</button>
              </div>
              <button onClick={handleMarkVetScheduled} className="km-btn km-btn--outline" style={{ marginTop: "12px" }}>Schedule this vet check</button>
            </div>
          )}

          {vetResult && (
            <div style={{ marginTop: "18px", padding: "16px", borderRadius: "12px", border: "1px solid #DDEBF7", background: "#F3FAFF" }}>
              <h4 style={{ margin: "0 0 8px", color: "var(--km-forest-deep)" }}>{vetResult.title}</h4>
              <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.6, color: "#4B5563" }}>{vetResult.message}</p>
              {vetResult.address && (
                <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "#374151" }}><strong>Address:</strong> {vetResult.address}</p>
              )}
            </div>
          )}
        </div>
      )}

      {selectedInvoice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div className="km-card" style={{ maxWidth: "500px", width: "100%", position: "relative", padding: "30px" }}>
            <button onClick={() => setSelectedInvoice(null)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#999" }}>✖</button>
            <div id="print-invoice-area" style={{ fontFamily: "monospace", color: "#333" }}>
              <div style={{ textAlign: "center", borderBottom: "2px dashed #ccc", paddingBottom: "15px", marginBottom: "15px" }}>
                <h2 style={{ margin: "0 0 5px 0", color: "#222" }}>KRISHI MITRA DAIRY CO-OP</h2>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>GSTIN: 29AABCU9603R1ZM<br />Kundana, Bengaluru Rural</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.9rem" }}>
                <span><strong>Receipt No:</strong> {selectedInvoice.id}</span>
                <span><strong>Date:</strong> {selectedInvoice.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "0.9rem" }}>
                <span><strong>Farmer ID:</strong> FID-KA-AE2D66</span>
                <span><strong>Shift:</strong> {selectedInvoice.shift}</span>
              </div>
              <table style={{ width: "100%", borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", marginBottom: "20px", fontSize: "0.9rem", textAlign: "left" }}>
                <thead><tr><th style={{ padding: "8px 0" }}>Item</th><th style={{ padding: "8px 0" }}>Metrics</th><th style={{ padding: "8px 0", textAlign: "right" }}>Amount</th></tr></thead>
                <tbody><tr>
                  <td style={{ padding: "8px 0" }}>Raw Milk ({selectedInvoice.quantity})</td>
                  <td style={{ padding: "8px 0" }}>Fat: {selectedInvoice.fat}<br />SNF: {selectedInvoice.snf}</td>
                  <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "bold" }}>{selectedInvoice.revenue}</td>
                </tr></tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "bold", borderBottom: "2px dashed #ccc", paddingBottom: "15px", marginBottom: "15px" }}>
                <span>TOTAL PAYABLE</span><span>{selectedInvoice.revenue}</span>
              </div>
              <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#555" }}>
                Thank you for your contribution to the cooperative.<br />This is a computer generated invoice.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => {
                const printContent = document.getElementById("print-invoice-area").innerHTML;
                const originalContent = document.body.innerHTML;
                document.body.innerHTML = printContent;
                window.print();
                document.body.innerHTML = originalContent;
                window.location.reload();
              }} className="km-btn km-btn--primary">🖨️ Print Bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
