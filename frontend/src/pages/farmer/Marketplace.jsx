import React, { useEffect, useState } from "react";
import { Search, ShoppingCart, Star, Plus, Minus, Tag, Truck, ShieldCheck, CreditCard, Receipt, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { useLang } from "../../context/LangContext.jsx";
import { loadWorkspace, saveWorkspace } from "../../utils/workspace.js";

const MOCK_PRODUCTS = [
  {
    id: "P1",
    name: "Coromandel Urea (50kg)",
    category: "Fertilizer",
    price: 266,
    rating: 4.8,
    vendor: "Govt Subsidized Agri Co.",
    tags: ["Govt Subsidized"],
    image: "/coromandel_urea.png",
  },
  {
    id: "P2",
    name: "Arka Rakshak Tomato Seeds",
    category: "Seeds",
    price: 450,
    rating: 4.9,
    vendor: "IIHR Bangalore",
    tags: ["High Yield", "Disease Resistant"],
    image: "/arka_rakshak_seeds.png",
  },
  {
    id: "P3",
    name: "Bayer Nativo Fungicide",
    category: "Pesticide",
    price: 800,
    rating: 4.5,
    vendor: "Bayer CropScience",
    tags: ["Premium"],
    image: "/nativo-fungicide.svg",
  },
  {
    id: "P4",
    name: "Drip Irrigation Kit (1 Acre)",
    category: "Irrigation",
    price: 12000,
    rating: 4.7,
    vendor: "Jain Irrigation",
    tags: ["Subsidy Eligible"],
    image: "/drip-irrigation-kit.svg",
  },
  {
    id: "P5",
    name: "Honda Water Pump (5HP)",
    category: "Machinery",
    price: 18500,
    rating: 4.6,
    vendor: "Honda Power",
    tags: ["Heavy Duty"],
    image: "/honda-water-pump.jpg",
  },
  {
    id: "P6",
    name: "Neem Cake Organic Manure",
    category: "Organic",
    price: 550,
    rating: 4.8,
    vendor: "Desi Organic Farms",
    tags: ["100% Organic"],
    image: "/neem-cake-organic-manure.svg",
  },
];

const DELIVERY_STAGES = [
  { key: "placed", label: "Order received" },
  { key: "processing", label: "Preparing order" },
  { key: "picked_up", label: "Picked up" },
  { key: "in_transit", label: "In transit" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function Marketplace() {
  const { t } = useLang();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [activeView, setActiveView] = useState("shop");

  useEffect(() => {
    let cancelled = false;
    loadWorkspace("marketplace")
      .then((savedData) => {
        if (cancelled || !savedData) return;
        setCart(Array.isArray(savedData.cart) ? savedData.cart : []);
        setOrders(Array.isArray(savedData.orders) ? savedData.orders : []);
      })
      .catch((error) => {
        if (!cancelled) setSaveError(error.response?.data?.message || "Unable to load your saved marketplace data.");
      })
      .finally(() => {
        if (!cancelled) setCartLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  const categories = ["All", "Seeds", "Fertilizer", "Pesticide", "Irrigation", "Machinery", "Organic"];

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const persistCart = async (nextCart, nextOrders = orders) => {
    setIsSaving(true);
    setSaveError("");
    try {
      const savedData = await saveWorkspace("marketplace", { cart: nextCart, orders: nextOrders });
      setCart(savedData.cart);
      setOrders(savedData.orders);
      return true;
    } catch (error) {
      setSaveError(error.response?.data?.message || "Your marketplace changes were not saved. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    const nextCart = existing
      ? cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      : [...cart, { ...product, qty: 1 }];
    return persistCart(nextCart);
  };

  const updateQty = (id, delta) => {
    const nextCart = cart
      .map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
      .filter((item) => item.qty > 0);
    return persistCart(nextCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handlePlaceOrder = async () => {
    const createdAt = new Date().toISOString();
    const order = {
      id: `ORD-${crypto.randomUUID()}`,
      items: cart,
      total: cartTotal,
      paymentMethod,
      status: "placed",
      carrier: "Delhivery",
      trackingNumber: "",
      createdAt,
      updates: [{
        id: crypto.randomUUID(),
        source: "Krishi Mitra",
        message: "Your order has been received. We’ll show preparation, pickup, and delivery updates here as they become available.",
        createdAt,
      }],
    };
    if (await persistCart([], [...orders, order])) {
      setOrderNumber(order.id);
      setOrderPlaced(true);
      setIsCheckout(false);
    }
  };

  if (orderPlaced) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", backgroundColor: "#DCFCE7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
           <ShieldCheck size={40} color="#16A34A" />
        </div>
        <h2 style={{ color: "var(--km-forest-deep)", marginBottom: "10px" }}>Order Saved Successfully</h2>
        <p style={{ color: "var(--km-ink-soft)", maxWidth: "400px", marginBottom: "20px" }}>
          Your order <strong>{orderNumber}</strong> is saved on this device and will sync automatically. Vendor confirmation is still required.
        </p>
        <button onClick={() => { setOrderPlaced(false); setActiveView("orders"); }} className="km-btn km-btn--primary">
          View my orders
        </button>
      </div>
    );
  }

  if (isCheckout) {
    return (
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {saveError && <div role="alert" className="km-card" style={{ width: "100%", color: "var(--km-alert)" }}>{saveError}</div>}
        <div className="km-card" style={{ flex: 2, minWidth: "300px" }}>
           <h3 style={{ margin: "0 0 20px 0", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px" }}>
             <ShoppingCart /> Checkout
           </h3>
           
           <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px" }}>
             {cart.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--km-line)", paddingBottom: "10px" }}>
                   <div>
                      <div style={{ fontWeight: "bold" }}>{item.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>Qty: {item.qty} x ₹{item.price}</div>
                   </div>
                   <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>₹{item.qty * item.price}</div>
                </div>
             ))}
           </div>
           
           <div style={{ backgroundColor: "#F0FDF4", padding: "15px", borderRadius: "8px", border: "1px dashed var(--km-success)", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                 <span style={{ color: "var(--km-ink-soft)" }}>Subtotal:</span>
                 <strong style={{ color: "var(--km-ink)" }}>₹{cartTotal}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                 <span style={{ color: "var(--km-ink-soft)" }}>Delivery Fee (Subsidized):</span>
                 <strong style={{ color: "var(--km-success)" }}>FREE</strong>
              </div>
              <div style={{ borderTop: "1px solid #ccc", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem" }}>
                 <strong style={{ color: "var(--km-forest-deep)" }}>Total Amount:</strong>
                 <strong style={{ color: "var(--km-forest-deep)" }}>₹{cartTotal}</strong>
              </div>
           </div>

           <h4 style={{ margin: "0 0 10px 0", color: "var(--km-ink)" }}>Select Payment Method</h4>
           <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: paymentMethod === "upi" ? "2px solid var(--km-success)" : "1px solid #ccc", borderRadius: "8px", cursor: "pointer", backgroundColor: paymentMethod === "upi" ? "#F0FDF4" : "#fff" }}>
                 <input type="radio" name="payment" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
                 <CreditCard size={18} color={paymentMethod === "upi" ? "var(--km-success)" : "#555"} /> <strong>UPI (Google Pay / PhonePe)</strong>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: paymentMethod === "cod" ? "2px solid var(--km-success)" : "1px solid #ccc", borderRadius: "8px", cursor: "pointer", backgroundColor: paymentMethod === "cod" ? "#F0FDF4" : "#fff" }}>
                 <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                 <Truck size={18} color={paymentMethod === "cod" ? "var(--km-success)" : "#555"} /> <strong>Cash on Delivery (COD)</strong>
              </label>
           </div>

           <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handlePlaceOrder} disabled={isSaving || !cartLoaded || cart.length === 0} className="km-btn km-btn--primary" style={{ flex: 1, padding: "15px", fontSize: "1.1rem" }}>{isSaving ? "Saving order..." : `Place Order (₹${cartTotal})`}</button>
              <button onClick={() => setIsCheckout(false)} className="km-btn km-btn--outline" style={{ padding: "15px" }}>Cancel</button>
           </div>
        </div>

        <div style={{ flex: 1, minWidth: "250px", display: "flex", flexDirection: "column", gap: "15px" }}>
           <div className="km-card" style={{ backgroundColor: "#F8FAFC" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "var(--km-ink)", display: "flex", alignItems: "center", gap: "8px" }}><Truck size={18}/> Delivery Details</h4>
              <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", lineHeight: 1.5 }}>
                 <strong>Varun Gowda</strong><br/>
                 Kundana, Devanahalli Taluk<br/>
                 Bengaluru Rural District - 560001<br/>
                 Ph: 9900000003
              </div>
           </div>
           
           <div className="km-card" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}>
              <h4 style={{ margin: "0 0 5px 0", color: "#991B1B", display: "flex", alignItems: "center", gap: "8px" }}><ShieldCheck size={18}/> Government Verified</h4>
              <div style={{ fontSize: "0.8rem", color: "#7F1D1D" }}>
                 All sellers are verified by the Dept. of Agriculture. You will receive an official GST invoice for your subsidy claims.
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {saveError && <div role="alert" className="km-card" style={{ width: "100%", color: "var(--km-alert)" }}>{saveError}</div>}
      {!cartLoaded && <div role="status" className="km-card" style={{ width: "100%" }}>Loading saved cart...</div>}

      <div role="tablist" aria-label="Marketplace pages" style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--km-line)", paddingBottom: "10px" }}>
        {[
          { id: "shop", label: "Shop", icon: ShoppingCart },
          { id: "orders", label: `My Orders${orders.length ? ` (${orders.length})` : ""}`, icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const selected = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveView(tab.id)}
              className={`km-btn ${selected ? "km-btn--primary" : "km-btn--outline"}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeView === "orders" ? (
        <section aria-label="My delivery tracking" style={{ display: "grid", gap: "14px" }}>
          <div className="km-card" style={{ background: "#F8FBF8", borderLeft: "4px solid var(--km-forest)" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.15rem", color: "var(--km-forest-deep)" }}>Delivery updates from Krishi Mitra</h2>
            <p style={{ margin: 0, color: "var(--km-ink-soft)", fontSize: "0.86rem", lineHeight: 1.5 }}>
              Order preparation, carrier pickup, transit, and delivery milestones will appear here. Delhivery tracking is shown as awaiting shipment details until the carrier tracking number is connected.
            </p>
          </div>
          {orders.length === 0 ? (
            <div className="km-card" style={{ textAlign: "center", padding: "34px 16px", color: "var(--km-ink-soft)" }}>
              <Truck size={28} aria-hidden="true" />
              <p style={{ marginBottom: 0 }}>You have no orders yet. Place an order to see its delivery progress here.</p>
            </div>
          ) : [...orders].reverse().map((order) => {
            const currentStage = Math.max(0, DELIVERY_STAGES.findIndex((stage) => stage.key === order.status));
            const updates = Array.isArray(order.updates) ? order.updates : [];
            const itemsText = (order.items || []).map((item) => `${item.name} × ${item.qty}`).join(", ");
            return (
              <article key={order.id} className="km-card" style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div>
                    <strong style={{ color: "var(--km-forest-deep)" }}>{order.id}</strong>
                    <div style={{ marginTop: "4px", color: "var(--km-ink-soft)", fontSize: "0.8rem" }}>
                      {new Date(order.createdAt).toLocaleString()} · {itemsText}
                    </div>
                  </div>
                  <span style={{ color: "var(--km-forest)", fontWeight: 800 }}>₹{Number(order.total || 0).toLocaleString("en-IN")}</span>
                </div>

                <div aria-label={`Delivery progress for ${order.id}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
                  {DELIVERY_STAGES.map((stage, index) => {
                    const isComplete = index <= currentStage;
                    return (
                      <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: "7px", color: isComplete ? "var(--km-forest)" : "#8A9290", fontSize: "0.74rem", fontWeight: isComplete ? 700 : 500 }}>
                        {isComplete ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        <span>{stage.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px", borderRadius: "8px", background: "#F5F8FC", color: "#46515D" }}>
                  <Truck size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                    <strong>{order.carrier || "Delhivery"} tracking</strong>
                    <div>{order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : "Carrier pickup and live tracking will appear after a shipment is booked."}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <strong style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--km-forest-deep)", fontSize: "0.86rem" }}>
                    <MessageCircle size={16} /> Krishi Mitra messages
                  </strong>
                  {updates.length ? updates.map((update) => (
                    <div key={update.id} style={{ paddingLeft: "12px", borderLeft: "2px solid #C8DCCF", fontSize: "0.8rem", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--km-ink-soft)" }}>{new Date(update.createdAt).toLocaleString()}</span>
                      <div>{update.message}</div>
                    </div>
                  )) : (
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--km-ink-soft)" }}>No delivery updates have arrived yet.</p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
      <div style={{ display: "flex", gap: "20px" }}>
      
      {/* Left Column: Products */}
      <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "15px" }}>
        
        {/* Search & Filter Bar */}
        <div className="km-card" style={{ padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
           <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
             <Search size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--km-ink-soft)" }} />
             <input 
               type="text" 
               className="km-input" 
               placeholder="Search seeds, fertilizers, machinery..." 
               style={{ paddingLeft: "35px", width: "100%" }}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "5px" }}>
             {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`km-btn ${activeCategory === cat ? "km-btn--primary" : "km-btn--outline"}`}
                 style={{ padding: "6px 12px", fontSize: "0.8rem", whiteSpace: "nowrap" }}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>

        {/* Product Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px" }}>
           {filteredProducts.map(product => {
              const inCart = cart.find(item => item.id === product.id);
              return (
                 <div key={product.id} className="km-card" style={{ padding: "0", display: "flex", flexDirection: "column", gap: "0", overflow: "hidden", borderRadius: "12px" }}>
                    <div style={{ width: "100%", height: "180px", backgroundColor: "#f1f1f1", overflow: "hidden", position: "relative" }}>
                       <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                       {product.tags.map((tag, i) => {
                          const tagColors = {
                            "Govt Subsidized": "#16A34A",
                            "High Yield": "#D97706",
                            "Disease Resistant": "#D97706",
                            "Premium": "#DC2626",
                            "Subsidy Eligible": "#059669",
                            "Heavy Duty": "#7C3AED",
                            "100% Organic": "#16A34A",
                          };
                          const bg = tagColors[tag] || "#6B7280";
                          return (
                            <span key={tag} style={{ position: "absolute", top: "8px", left: i === 0 ? "8px" : undefined, right: i === 1 ? "8px" : undefined, backgroundColor: bg, color: "white", fontSize: "0.68rem", padding: "3px 8px", borderRadius: "12px", fontWeight: "700", letterSpacing: "0.02em", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>
                              {tag}
                            </span>
                          );
                       })}
                    </div>
                    
                    <div style={{ flex: 1, padding: "12px 12px 0 12px" }}>
                       <div style={{ fontSize: "0.72rem", color: "var(--km-ink-soft)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{product.category}</div>
                       <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", lineHeight: 1.3, color: "var(--km-ink)", fontWeight: "700" }}>{product.name}</h4>
                       <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>
                          <ShieldCheck size={12} color="#16A34A" /> {product.vendor}
                       </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px 0 12px" }}>
                       <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--km-forest-deep)" }}>₹{product.price.toLocaleString("en-IN")}</div>
                       <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.82rem", color: "#B45309", fontWeight: "700" }}>
                          <Star size={13} fill="#F59E0B" color="#F59E0B" /> {product.rating}
                       </div>
                    </div>

                    <div style={{ padding: "10px 12px 12px 12px" }}>
                    {inCart ? (
                       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--km-paper-dim)", borderRadius: "8px", border: "2px solid #16A34A", padding: "4px 8px" }}>
                          <button disabled={isSaving} onClick={() => updateQty(product.id, -1)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#16A34A" }}><Minus size={16} /></button>
                          <strong style={{ fontSize: "0.95rem", color: "#16A34A" }}>{inCart.qty}</strong>
                          <button disabled={isSaving} onClick={() => updateQty(product.id, 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#16A34A" }}><Plus size={16} /></button>
                       </div>
                    ) : (
                       <button disabled={isSaving || !cartLoaded} onClick={() => addToCart(product)} className="km-btn km-btn--primary" style={{ width: "100%", padding: "10px", fontSize: "0.88rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", borderRadius: "8px", fontWeight: "700" }}>
                          <ShoppingCart size={15} /> Add to Cart
                       </button>
                    )}
                    </div>
                 </div>
              )
           })}
        </div>

      </div>

      {/* Right Column: Mini Cart */}
      <div style={{ flex: 1, minWidth: "280px" }}>
         <div className="km-card" style={{ position: "sticky", top: "20px" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "8px" }}>
               <ShoppingCart size={20} /> My Cart
            </h3>
            
            {cart.length === 0 ? (
               <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--km-ink-soft)", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <ShoppingCart size={30} opacity={0.3} style={{ marginBottom: "10px" }} />
                  <div>Your cart is empty.</div>
                  <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>Add items from the marketplace to proceed.</div>
               </div>
            ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {cart.map(item => (
                     <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "10px", borderBottom: "1px solid var(--km-line)" }}>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>{item.name}</div>
                           <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>₹{item.price} x {item.qty}</div>
                        </div>
                        <div style={{ fontWeight: "bold", fontSize: "0.9rem", marginLeft: "10px" }}>₹{item.price * item.qty}</div>
                     </div>
                  ))}
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
                     <span style={{ color: "var(--km-ink-soft)", fontWeight: "bold" }}>Total:</span>
                     <span style={{ fontSize: "1.3rem", fontWeight: "black", color: "var(--km-forest-deep)" }}>₹{cartTotal}</span>
                  </div>
                  
                  <button onClick={() => setIsCheckout(true)} className="km-btn km-btn--primary" style={{ width: "100%", padding: "10px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                     Proceed to Checkout <ShoppingCart size={16} />
                  </button>
               </div>
            )}
            
            <div style={{ marginTop: "15px", backgroundColor: "#FEF2F2", padding: "10px", borderRadius: "6px", fontSize: "0.75rem", color: "#991B1B", border: "1px dashed #FCA5A5" }}>
               <strong>Buyer Protection:</strong> 100% Secure payments. Return policy valid for 7 days on damaged goods.
            </div>
         </div>
      </div>
      </div>
      )}
    </div>
  );
}
