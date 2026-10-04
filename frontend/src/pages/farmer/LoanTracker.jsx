import React, { useEffect, useState } from "react";
import { Wallet, Calculator, FileText, CheckCircle, Search, Landmark, Percent, TrendingUp, IndianRupee, Tractor, Printer, Banknote } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../utils/api.js";
import { loadWorkspace, saveWorkspace } from "../../utils/workspace.js";
import LoanFinder from "./LoanFinder.jsx";

const fmtINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const TRACTOR_LENDERS = [
  { lender: "SBI Tractor Loan", rate: 9.1 },
  { lender: "Canara Bank", rate: 9.4 },
  { lender: "NABARD-linked co-op bank", rate: 8.0 },
  { lender: "ICICI Bank", rate: 10.2 },
];

export default function LoanTracker() {
  const [activeTab, setActiveTab] = useState("loanfinder");
  const [loading, setLoading] = useState(false);

  // Form states
  const [landArea, setLandArea] = useState("");
  const [cropType, setCropType] = useState("");
  const [existingLoans, setExistingLoans] = useState("");
  const [cows, setCows] = useState("");
  const [dailyProduction, setDailyProduction] = useState("");

  // Result states
  const [loanOffers, setLoanOffers] = useState(null);
  const [dairyEstimate, setDairyEstimate] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  // Tractor Form States
  const tractorBrands = [
    { brand: "Mahindra 575 DI", price: 750000 },
    { brand: "Swaraj 744 FE", price: 820000 },
    { brand: "John Deere 5310", price: 1050000 },
    { brand: "Massey Ferguson 241", price: 680000 },
    { brand: "Sonalika DI 745", price: 710000 },
  ];
  const [selectedTractor, setSelectedTractor] = useState(tractorBrands[1].brand);
  const [tractorPrice, setTractorPrice] = useState(820000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [tractorInterest, setTractorInterest] = useState(9.5);
  const [tractorYears, setTractorYears] = useState(5);
  const [processingFeePercent, setProcessingFeePercent] = useState(1);
  const [selectedLender, setSelectedLender] = useState("");
  const [lenderSaveStatus, setLenderSaveStatus] = useState("");
  const [lenderSaveError, setLenderSaveError] = useState("");
  const [loanPlanLoaded, setLoanPlanLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadWorkspace("tractor-loan")
      .then((savedPlan) => {
        if (cancelled || !savedPlan) return;
        if (typeof savedPlan.selectedTractor === "string") setSelectedTractor(savedPlan.selectedTractor);
        if (Number.isFinite(savedPlan.tractorPrice)) setTractorPrice(savedPlan.tractorPrice);
        if (Number.isFinite(savedPlan.downPaymentPercent)) setDownPaymentPercent(savedPlan.downPaymentPercent);
        if (Number.isFinite(savedPlan.tractorYears)) setTractorYears(savedPlan.tractorYears);
        if (Number.isFinite(savedPlan.processingFeePercent)) setProcessingFeePercent(savedPlan.processingFeePercent);
        if (Number.isFinite(savedPlan.tractorInterest)) setTractorInterest(savedPlan.tractorInterest);
        if (typeof savedPlan.selectedLender === "string") setSelectedLender(savedPlan.selectedLender);
      })
      .catch((error) => {
        if (!cancelled) setLenderSaveError(error.response?.data?.message || "Unable to load your saved tractor loan plan.");
      })
      .finally(() => {
        if (!cancelled) setLoanPlanLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loanPlanLoaded) return undefined;
    const timer = window.setTimeout(() => {
      saveWorkspace("tractor-loan", {
        selectedTractor,
        tractorPrice,
        downPaymentPercent,
        tractorYears,
        processingFeePercent,
        selectedLender,
        tractorInterest,
      }).catch((error) => {
        setLenderSaveError(error.response?.data?.message || "The loan plan could not be saved on this device.");
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [loanPlanLoaded, selectedTractor, tractorPrice, downPaymentPercent, tractorYears, processingFeePercent, selectedLender, tractorInterest]);

  const checkEligibility = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/loans/check-eligibility", {
        landArea: Number(landArea),
        cropType,
        existingLoans: Number(existingLoans)
      });
      setLoanOffers(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const estimateDairy = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/loans/dairy-estimate", {
        cows: Number(cows),
        dailyProduction: Number(dailyProduction)
      });
      setDairyEstimate(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Tractor Calculation
  const tractorPriceVal = tractorPrice;
  const downPaymentVal = (tractorPriceVal * downPaymentPercent) / 100;
  const tractorLoanAmount = tractorPriceVal - downPaymentVal;
  const processingFeeVal = (tractorLoanAmount * processingFeePercent) / 100;
  
  const tRate = tractorInterest / 12 / 100;
  const tMonths = tractorYears * 12;
  const tractorEMI = tractorLoanAmount > 0 ? (tractorLoanAmount * tRate * Math.pow(1 + tRate, tMonths)) / (Math.pow(1 + tRate, tMonths) - 1) : 0;
  const tractorTotalInterest = (tractorEMI * tMonths) - tractorLoanAmount;
  const totalPayable = tractorLoanAmount + tractorTotalInterest;
  const tractorTotalCost = tractorPriceVal + tractorTotalInterest + processingFeeVal;
  const interestCostPerYear = tractorTotalInterest / tractorYears;
  const farmIncomeNeeded = tractorEMI * 12 * 2.5; // arbitrary formula for farm income

  const handleSelectLender = async (bank) => {
    setSelectedLender(bank.lender);
    setTractorInterest(bank.rate);
    setLenderSaveStatus("");
    setLenderSaveError("");
    try {
      await saveWorkspace("tractor-loan", {
        selectedTractor,
        tractorPrice,
        downPaymentPercent,
        tractorYears,
        processingFeePercent,
        selectedLender: bank.lender,
        tractorInterest: bank.rate,
      });
      setLenderSaveStatus(`${bank.lender} selected. Your calculator preference is saved on this device and will sync automatically.`);
    } catch (error) {
      setLenderSaveError(error.response?.data?.message || "The lender selection was not saved. Please try again when the database is available.");
    }
  };

  // Amortisation schedule
  const amortisation = [];
  let bal = tractorLoanAmount;
  for (let y = 1; y <= tractorYears; y++) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    for(let m = 1; m <= 12; m++) {
      let interestForMonth = bal * tRate;
      let principalForMonth = tractorEMI - interestForMonth;
      yearInterest += interestForMonth;
      yearPrincipal += principalForMonth;
      bal -= principalForMonth;
    }
    amortisation.push({
      year: `Year ${y}`,
      paid: tractorEMI * 12,
      principal: yearPrincipal,
      interest: yearInterest,
      balance: Math.max(0, bal)
    });
  }

  // Chart Data
  const chartData = [{ year: 'Y0', balance: tractorLoanAmount, tractorValue: tractorPriceVal }];
  let currentBalance = tractorLoanAmount;
  let currentTractorValue = tractorPriceVal;
  
  for (let i = 1; i <= tractorYears; i++) {
    const yearData = amortisation[i-1];
    currentTractorValue = currentTractorValue * 0.9; // 10% depreciation
    chartData.push({
      year: `Y${i}`,
      balance: Math.max(0, Math.round(yearData.balance)),
      tractorValue: Math.round(currentTractorValue)
    });
  }

  const handlePrint = (offer) => {
    setInvoiceToPrint({
       ...loanOffers,
       offer
    });
    setTimeout(() => {
       window.print();
    }, 100);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", position: "relative" }}>
      
      {/* Sub-Navigation */}
      <div className="no-print" style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--km-line)", paddingBottom: "10px", overflowX: "auto" }}>
        <button
          type="button"
          onClick={() => setActiveTab("loanfinder")}
          className={`km-btn ${activeTab === "loanfinder" ? "km-btn--primary" : "km-btn--outline"}`}
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
        >
          <Banknote size={18} /> Loan Finder & Calculators
        </button>
        <button 
          onClick={() => setActiveTab("advisor")}
          className={`km-btn ${activeTab === "advisor" ? "km-btn--primary" : "km-btn--outline"}`}
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
        >
          <Search size={18} /> AI Loan Advisor
        </button>
        <button 
          onClick={() => setActiveTab("tractor")}
          className={`km-btn ${activeTab === "tractor" ? "km-btn--primary" : "km-btn--outline"}`}
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
        >
          <Tractor size={18} /> Tractor Loan
        </button>
        <button 
          onClick={() => setActiveTab("dairy")}
          className={`km-btn ${activeTab === "dairy" ? "km-btn--primary" : "km-btn--outline"}`}
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
        >
          <Calculator size={18} /> Dairy Estimator
        </button>
        <button 
          onClick={() => setActiveTab("documents")}
          className={`km-btn ${activeTab === "documents" ? "km-btn--primary" : "km-btn--outline"}`}
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
        >
          <FileText size={18} /> Documents
        </button>
      </div>

      <div className="no-print">
      {activeTab === "loanfinder" && <LoanFinder />}
      {activeTab === "advisor" && (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          {/* Left Column: Form */}
          <div className="km-card" style={{ flex: 1, minWidth: "300px" }}>
             <h3 style={{ fontSize: "1.1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px 0" }}>
                <Landmark size={20} /> Check Loan Eligibility
             </h3>
             <form onSubmit={checkEligibility} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                   <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Land Area (Acres)</label>
                   <input type="number" required value={landArea} onChange={e => setLandArea(e.target.value)} className="km-input" min="0.1" step="0.1" />
                </div>
                <div>
                   <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Primary Crop</label>
                   <select required value={cropType} onChange={e => setCropType(e.target.value)} className="km-input">
                     <option value="">Select Crop</option>
                     <option value="Paddy">Paddy / Rice</option>
                     <option value="Sugarcane">Sugarcane</option>
                     <option value="Cotton">Cotton</option>
                     <option value="Vegetables">Vegetables</option>
                   </select>
                </div>
                <div>
                   <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Existing Loans (₹)</label>
                   <input type="number" value={existingLoans} onChange={e => setExistingLoans(e.target.value)} className="km-input" />
                </div>
                <button type="submit" disabled={loading} className="km-btn km-btn--primary" style={{ marginTop: "10px", width: "100%", padding: "12px", fontSize: "1rem" }}>
                  {loading ? "Calculating..." : "Find Best Loan Offers"}
                </button>
             </form>
          </div>

          {/* Right Column: Results */}
          <div style={{ flex: 1.5, minWidth: "350px", display: "flex", flexDirection: "column", gap: "20px" }}>
             {loanOffers ? (
               <>
                 <div className="km-card" style={{ borderLeft: "4px solid var(--km-success)" }}>
                    <div style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Maximum Eligible KCC Loan</div>
                    <div style={{ fontSize: "2rem", color: "var(--km-success)", fontWeight: "bold", margin: "10px 0" }}>
                       {fmtINR(loanOffers.totalEligibleAmount)}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--km-ink)" }}>
                      Based on Scale of Finance: {fmtINR(loanOffers.scaleOfFinanceApplied)}/acre for {cropType}.
                    </div>
                 </div>

                 {loanOffers.totalSubsidy > 0 && (
                   <div className="km-card" style={{ backgroundColor: "rgba(11, 61, 46, 0.05)", border: "1px solid var(--km-forest)" }}>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                       <div style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--km-forest-deep)", fontWeight: "bold" }}>Govt Subsidy Eligibility</div>
                       <CheckCircle size={18} color="var(--km-success)" />
                     </div>
                     <div style={{ fontSize: "1.5rem", color: "var(--km-forest-deep)", fontWeight: "bold" }}>
                       {fmtINR(loanOffers.totalSubsidy)}
                     </div>
                     <div style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", marginTop: "5px" }}>
                       ({fmtINR(loanOffers.subsidyPerAcre)} per acre calculation applied)
                     </div>
                     <div style={{ marginTop: "10px", padding: "8px", backgroundColor: "#fff", borderRadius: "5px", fontSize: "0.75rem", color: "var(--km-alert)", borderLeft: "3px solid var(--km-alert)" }}>
                       ⚠️ {loanOffers.approvalNote}
                     </div>
                   </div>
                 )}

                 <div className="km-card">
                    <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", margin: "0 0 15px 0" }}>Recommended Bank Offers & EMI (1 Yr)</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                       {loanOffers.offers.map((offer, idx) => (
                         <div key={idx} style={{ 
                           display: "flex", 
                           justifyContent: "space-between", 
                           padding: "15px", 
                           backgroundColor: offer.isRecommended ? "rgba(11, 61, 46, 0.05)" : "#fff",
                           border: offer.isRecommended ? "1px solid var(--km-forest)" : "1px solid #e0d5c1",
                           borderRadius: "8px",
                           alignItems: "center",
                           flexWrap: "wrap",
                           gap: "10px"
                         }}>
                            <div style={{ flex: 1, minWidth: "150px" }}>
                               <div style={{ fontWeight: "bold", color: "var(--km-forest-deep)", fontSize: "1.05rem" }}>
                                 {offer.bankName} {offer.isRecommended && <span style={{ fontSize: "0.65rem", backgroundColor: "var(--km-success)", color: "#fff", padding: "2px 6px", borderRadius: "10px", marginLeft: "5px", verticalAlign: "middle" }}>Top Pick</span>}
                               </div>
                               <div style={{ fontSize: "0.8rem", color: "var(--km-ink-soft)", marginTop: "4px" }}>
                                 Effective Rate: <strong style={{ color: "var(--km-ink)" }}>{offer.effectiveRate}%</strong> 
                                 <span style={{ fontSize: "0.7rem", color: "var(--km-success)", display: "block", marginTop: "2px" }}>(After 3% Subvention)</span>
                               </div>
                            </div>
                            <div style={{ flex: 1, textAlign: "right", minWidth: "150px" }}>
                               <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold" }}>Monthly Payment (EMI)</div>
                               <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--km-saffron-deep)" }}>
                                  {fmtINR(offer.monthlyEMI)}
                               </div>
                               <div style={{ fontSize: "0.7rem", color: "var(--km-ink)", marginTop: "4px" }}>
                                 Yearly Total: <strong>{fmtINR(offer.yearlyTotal)}</strong>
                               </div>
                            </div>
                            <button onClick={() => handlePrint(offer)} className="km-btn km-btn--primary" style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px", marginLeft: "auto" }}>
                               <Printer size={14} /> Print Bill
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
               </>
             ) : (
               <div className="km-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", color: "var(--km-ink-soft)" }}>
                  <Landmark size={48} opacity={0.2} style={{ marginBottom: "15px" }} />
                  <p>Enter your land and crop details to see personalized loan offers from top agricultural banks.</p>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === "tractor" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
           
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--km-forest-deep)", color: "white", padding: "15px 20px", borderRadius: "8px" }}>
             <h3 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "10px" }}>
               Tractor Loan Calculator • ಟ್ರ್ಯಾಕ್ಟರ್ ಸಾಲ
             </h3>
             <span style={{ backgroundColor: "var(--km-success)", padding: "5px 15px", borderRadius: "20px", fontSize: "0.9rem", fontWeight: "bold" }}>Instant EMI</span>
           </div>

           <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "stretch" }}>
             
             {/* Left Column: Loan Details */}
             <div className="km-card" style={{ flex: 1.5, minWidth: "300px", padding: "20px" }}>
               <h4 style={{ fontSize: "0.9rem", color: "var(--km-ink-soft)", margin: "0 0 20px 0", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>Loan Details</h4>
               
               <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                  <div>
                    <select 
                      className="km-input" 
                      value={selectedTractor} 
                      onChange={(e) => {
                        const brand = e.target.value;
                        setSelectedTractor(brand);
                        const found = tractorBrands.find(t => t.brand === brand);
                        if (found) setTractorPrice(found.price);
                      }}
                      style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", marginBottom: "5px" }}
                    >
                      {tractorBrands.map(t => <option key={t.brand} value={t.brand}>{t.brand} - {fmtINR(t.price)}</option>)}
                      <option value="Custom">Custom Brand / Price</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                       <span>Tractor price</span>
                       <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--km-ink)" }}>{fmtINR(tractorPrice)}</span>
                    </label>
                    <input type="range" min="100000" max="2500000" step="10000" value={tractorPrice} onChange={e => {setTractorPrice(Number(e.target.value)); setSelectedTractor("Custom");}} style={{ width: "100%", accentColor: "var(--km-success)" }} />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                       <span>Down payment</span>
                       <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--km-ink)" }}>{downPaymentPercent}% • {fmtINR(downPaymentVal)}</span>
                    </label>
                    <input type="range" min="0" max="50" step="1" value={downPaymentPercent} onChange={e => setDownPaymentPercent(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--km-success)" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                       <span>Interest rate (p.a.)</span>
                       <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--km-ink)" }}>{tractorInterest}%</span>
                    </label>
                    <input type="range" min="5" max="20" step="0.1" value={tractorInterest} onChange={e => { setTractorInterest(Number(e.target.value)); setSelectedLender(""); setLenderSaveStatus(""); }} style={{ width: "100%", accentColor: "var(--km-success)" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                       <span>Tenure</span>
                       <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--km-ink)" }}>{tractorYears * 12} months ({tractorYears} yrs)</span>
                    </label>
                    <input type="range" min="1" max="10" step="1" value={tractorYears} onChange={e => setTractorYears(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--km-success)" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                       <span>Processing fee</span>
                       <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--km-ink)" }}>{processingFeePercent}% • {fmtINR(processingFeeVal)}</span>
                    </label>
                    <input type="range" min="0" max="5" step="0.1" value={processingFeePercent} onChange={e => setProcessingFeePercent(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--km-success)" }} />
                  </div>
               </div>
             </div>

             {/* Right Column: EMI Summary */}
             <div className="km-card" style={{ flex: 1, minWidth: "300px", padding: "20px" }}>
               <h4 style={{ fontSize: "0.9rem", color: "var(--km-ink-soft)", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>Monthly EMI</h4>
               <div style={{ fontSize: "2.8rem", fontWeight: "bold", color: "var(--km-forest-deep)", marginBottom: "25px" }}>
                 {fmtINR(tractorEMI)}
               </div>

               <div style={{ display: "flex", width: "100%", height: "14px", borderRadius: "7px", overflow: "hidden", marginBottom: "12px" }}>
                 <div style={{ width: `${(tractorLoanAmount/totalPayable)*100}%`, backgroundColor: "var(--km-success)" }}></div>
                 <div style={{ width: `${(tractorTotalInterest/totalPayable)*100}%`, backgroundColor: "var(--km-saffron-deep)" }}></div>
               </div>
               
               <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--km-ink-soft)", marginBottom: "25px" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                   <div style={{ width: "12px", height: "12px", backgroundColor: "var(--km-success)", borderRadius: "3px" }}></div>
                   <span>Principal {fmtINR(tractorLoanAmount)} ({Math.round((tractorLoanAmount/totalPayable)*100)}%)</span>
                 </div>
                 <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                   <div style={{ width: "12px", height: "12px", backgroundColor: "var(--km-saffron-deep)", borderRadius: "3px" }}></div>
                   <span>Interest {fmtINR(tractorTotalInterest)}</span>
                 </div>
               </div>

               <table style={{ width: "100%", fontSize: "0.95rem", color: "var(--km-ink)" }}>
                 <tbody>
                   <tr><td style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>Loan amount</td><td style={{ padding: "10px 0", textAlign: "right", fontWeight: "bold", borderBottom: "1px solid #eee" }}>{fmtINR(tractorLoanAmount)}</td></tr>
                   <tr><td style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>Total interest</td><td style={{ padding: "10px 0", textAlign: "right", fontWeight: "bold", borderBottom: "1px solid #eee" }}>{fmtINR(tractorTotalInterest)}</td></tr>
                   <tr><td style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>Total payable</td><td style={{ padding: "10px 0", textAlign: "right", fontWeight: "bold", borderBottom: "1px solid #eee" }}>{fmtINR(totalPayable)}</td></tr>
                   <tr><td style={{ padding: "10px 0" }}>Processing fee</td><td style={{ padding: "10px 0", textAlign: "right", fontWeight: "bold" }}>{fmtINR(processingFeeVal)}</td></tr>
                 </tbody>
               </table>
             </div>
           </div>

           {/* 4 Info Cards */}
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
             <div className="km-card" style={{ padding: "20px" }}>
               <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold", marginBottom: "5px" }}>Down Payment</div>
               <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--km-ink)" }}>{fmtINR(downPaymentVal)}</div>
             </div>
             <div className="km-card" style={{ padding: "20px" }}>
               <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold", marginBottom: "5px" }}>Total Cost of Tractor</div>
               <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--km-ink)" }}>{fmtINR(tractorTotalCost)}</div>
             </div>
             <div className="km-card" style={{ padding: "20px" }}>
               <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold", marginBottom: "5px" }}>Interest Cost / Yr</div>
               <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--km-ink)" }}>{fmtINR(interestCostPerYear)}</div>
             </div>
             <div className="km-card" style={{ padding: "20px" }}>
               <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--km-ink-soft)", fontWeight: "bold", marginBottom: "5px" }}>Farm Income Needed</div>
               <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--km-ink)" }}>{fmtINR(farmIncomeNeeded)}/yr</div>
             </div>
           </div>

           {/* Chart */}
           <div className="km-card" style={{ height: "450px", padding: "25px" }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--km-ink-soft)", margin: "0 0 25px 0", textTransform: "uppercase", fontWeight: "bold" }}>Loan Balance vs Tractor Value (10%/yr depreciation)</h4>
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="year" fontSize={13} tickLine={false} axisLine={false} tickMargin={15} />
                    <YAxis yAxisId="left" fontSize={13} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v/1000)}k`} tickMargin={15} />
                    <RechartsTooltip formatter={(val) => fmtINR(val)} />
                    <Legend wrapperStyle={{ fontSize: "14px", top: "-15px" }} align="right" verticalAlign="top" iconType="square" />
                    <Line yAxisId="left" type="monotone" dataKey="tractorValue" name="Tractor value" stroke="var(--km-success)" strokeWidth={3} dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="balance" name="Loan balance" stroke="#dc3545" strokeWidth={3} dot={false} />
                 </LineChart>
              </ResponsiveContainer>
           </div>

           {/* Amortisation Table */}
           <div className="km-card" style={{ padding: "25px", overflowX: "auto" }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--km-ink-soft)", margin: "0 0 20px 0", textTransform: "uppercase", fontWeight: "bold" }}>Amortisation Schedule • Yearly</h4>
              <table style={{ width: "100%", fontSize: "0.95rem", color: "var(--km-ink)", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ textAlign: "left", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>YEAR</th>
                    <th style={{ textAlign: "right", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>PAID</th>
                    <th style={{ textAlign: "right", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>PRINCIPAL</th>
                    <th style={{ textAlign: "right", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>INTEREST</th>
                    <th style={{ textAlign: "right", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {amortisation.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "15px 10px", fontWeight: "bold" }}>{row.year}</td>
                      <td style={{ padding: "15px 10px", textAlign: "right" }}>{fmtINR(row.paid)}</td>
                      <td style={{ padding: "15px 10px", textAlign: "right" }}>{fmtINR(row.principal)}</td>
                      <td style={{ padding: "15px 10px", textAlign: "right" }}>{fmtINR(row.interest)}</td>
                      <td style={{ padding: "15px 10px", textAlign: "right", fontWeight: "bold" }}>{fmtINR(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>

           {/* Lender Comparison */}
           <div className="km-card" style={{ padding: "25px", overflowX: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--km-ink-soft)", margin: 0, textTransform: "uppercase", fontWeight: "bold" }}>Lender Comparison</h4>
                {selectedLender && <span style={{ fontSize: "0.8rem", color: "var(--km-success)", fontWeight: "bold" }}>Selected: {selectedLender}</span>}
              </div>
              <p style={{ margin: "0 0 15px", fontSize: "0.82rem", color: "var(--km-ink-soft)" }}>
                Select a lender to use its indicative rate. Calculator changes save automatically on this device and sync when the database is available.
              </p>
              {lenderSaveError && <div role="alert" style={{ marginBottom: 12, color: "var(--km-alert)", fontSize: "0.85rem" }}>{lenderSaveError}</div>}
              {lenderSaveStatus && <div role="status" style={{ marginBottom: 12, color: "var(--km-success)", fontSize: "0.85rem" }}>{lenderSaveStatus}</div>}
              <table style={{ width: "100%", fontSize: "0.95rem", color: "var(--km-ink)", borderCollapse: "collapse", marginBottom: "20px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ textAlign: "left", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>LENDER</th>
                    <th style={{ textAlign: "right", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>RATE</th>
                    <th style={{ textAlign: "right", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>EMI</th>
                    <th style={{ textAlign: "right", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>TOTAL INTEREST</th>
                    <th style={{ textAlign: "right", padding: "15px 10px", color: "var(--km-ink-soft)", fontSize: "0.85rem" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {TRACTOR_LENDERS.map((bank) => {
                    const bRate = bank.rate / 12 / 100;
                    const bEmi = (tractorLoanAmount * bRate * Math.pow(1 + bRate, tMonths)) / (Math.pow(1 + bRate, tMonths) - 1);
                    const bInterest = (bEmi * tMonths) - tractorLoanAmount;
                    const isSelected = selectedLender === bank.lender;
                    return (
                      <tr key={bank.lender} style={{ borderBottom: "1px solid #eee", backgroundColor: isSelected ? "rgba(45,106,79,0.08)" : "transparent" }}>
                        <td style={{ padding: "15px 10px", fontWeight: "bold", color: "var(--km-forest-deep)" }}>{bank.lender}</td>
                        <td style={{ padding: "15px 10px", textAlign: "right" }}>{bank.rate}%</td>
                        <td style={{ padding: "15px 10px", textAlign: "right", fontWeight: "bold" }}>{fmtINR(bEmi)}</td>
                        <td style={{ padding: "15px 10px", textAlign: "right" }}>{fmtINR(bInterest)}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button
                            type="button"
                            disabled={!loanPlanLoaded}
                            onClick={() => handleSelectLender(bank)}
                            className={`km-btn ${isSelected ? "km-btn--success" : "km-btn--outline"}`}
                            style={{ whiteSpace: "nowrap", padding: "7px 10px", fontSize: "0.78rem" }}
                          >
                            {isSelected ? "Selected" : "Select bank"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ fontSize: "0.85rem", color: "var(--km-ink-soft)" }}>Rates are indicative for this prototype. Selecting a bank saves your calculator preference; it does not submit a loan application. Confirm current rates and eligibility with the bank before applying.</div>
           </div>

        </div>
      )}

      {activeTab === "dairy" && (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="km-card" style={{ flex: 1, minWidth: "300px" }}>
             <h3 style={{ fontSize: "1.1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px 0" }}>
                <Calculator size={20} /> Dairy Farming Estimator
             </h3>
             <form onSubmit={estimateDairy} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                   <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Number of Cows / Buffaloes</label>
                   <input type="number" required value={cows} onChange={e => setCows(e.target.value)} className="km-input" min="1" />
                </div>
                <div>
                   <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--km-ink-soft)" }}>Total Daily Milk (Liters)</label>
                   <input type="number" required value={dailyProduction} onChange={e => setDailyProduction(e.target.value)} className="km-input" />
                </div>
                <button type="submit" disabled={loading} className="km-btn km-btn--primary" style={{ marginTop: "10px", width: "100%", padding: "12px", fontSize: "1rem" }}>
                  {loading ? "Calculating..." : "Generate NABARD Estimate"}
                </button>
             </form>
          </div>

          <div style={{ flex: 1.5, minWidth: "350px", display: "flex", flexDirection: "column", gap: "20px" }}>
             {dairyEstimate ? (
               <div className="km-card">
                  <h3 style={{ fontSize: "1rem", color: "var(--km-forest-deep)", borderBottom: "1px solid #e0d5c1", paddingBottom: "10px", marginBottom: "15px" }}>NABARD Project Report (Simulated)</h3>
                  
                  <div className="km-grid km-grid-2" style={{ gap: "15px", marginBottom: "20px" }}>
                     <div style={{ backgroundColor: "#f9f7f0", padding: "15px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--km-ink-soft)" }}>Total Project Cost</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--km-ink)" }}>{fmtINR(dairyEstimate.projectCost)}</div>
                     </div>
                     <div style={{ backgroundColor: "rgba(11, 61, 46, 0.05)", padding: "15px", borderRadius: "8px", border: "1px solid var(--km-forest)" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--km-forest)" }}>Eligible Bank Finance (85%)</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--km-forest-deep)" }}>{fmtINR(dairyEstimate.eligibleLoan)}</div>
                     </div>
                  </div>

                  <h4 style={{ fontSize: "0.9rem", color: "var(--km-ink)", margin: "0 0 10px 0" }}>Monthly Operations Estimate</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                     <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                       <span>Estimated Milk Revenue:</span> <strong>{fmtINR(dairyEstimate.monthlyRevenue)}</strong>
                     </li>
                     <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--km-alert)" }}>
                       <span>Estimated Feed Cost:</span> <strong>- {fmtINR(dairyEstimate.monthlyFeedCost)}</strong>
                     </li>
                     <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", borderTop: "1px solid #e0d5c1", paddingTop: "8px", marginTop: "4px" }}>
                       <span>Expected Profit:</span> <strong style={{ color: "var(--km-success)" }}>{fmtINR(dairyEstimate.monthlyProfit)}</strong>
                     </li>
                  </ul>

                  <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f0f8ff", borderRadius: "6px", fontSize: "0.8rem", color: "#0072bc", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                     <TrendingUp size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                     <div>
                       <strong>Subsidy Scheme Identified:</strong><br/>
                       {dairyEstimate.subsidies[0]}<br/>
                       Mandatory Insurance: {dairyEstimate.recommendedInsurance}
                     </div>
                  </div>
               </div>
             ) : (
               <div className="km-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", color: "var(--km-ink-soft)" }}>
                  <Calculator size={48} opacity={0.2} style={{ marginBottom: "15px" }} />
                  <p>Enter your herd details to generate a simulated NABARD dairy project report.</p>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="km-card">
           <h3 style={{ fontSize: "1.1rem", color: "var(--km-forest-deep)", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px 0" }}>
              <FileText size={20} /> Bank Loan Document Checklist
           </h3>
           <p style={{ fontSize: "0.9rem", color: "var(--km-ink)", marginBottom: "20px" }}>
             Keep these documents ready before visiting the bank branch to speed up your loan processing.
           </p>
           
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div style={{ border: "1px solid #e0d5c1", borderRadius: "8px", padding: "15px" }}>
                 <h4 style={{ margin: "0 0 10px 0", color: "var(--km-forest-deep)" }}>Identity & Address</h4>
                 <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Aadhaar Card</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> PAN Card / Form 60</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Passport Size Photos (3)</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Voter ID / Driving License</li>
                 </ul>
              </div>
              
              <div style={{ border: "1px solid #e0d5c1", borderRadius: "8px", padding: "15px" }}>
                 <h4 style={{ margin: "0 0 10px 0", color: "var(--km-forest-deep)" }}>Agriculture Records</h4>
                 <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> RTC / Pahani (Land Records)</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Encumbrance Certificate (EC)</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Crop Insurance Details</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Existing Kisan Credit Card</li>
                 </ul>
              </div>

              <div style={{ border: "1px solid #e0d5c1", borderRadius: "8px", padding: "15px" }}>
                 <h4 style={{ margin: "0 0 10px 0", color: "var(--km-forest-deep)" }}>Financials & Subsidies</h4>
                 <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> 6 Months Bank Statement</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Income Certificate</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Caste Certificate (For Govt Subsidies)</li>
                   <li style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle size={14} color="var(--km-success)"/> Milk Society Passbook (For Dairy Loans)</li>
                 </ul>
              </div>
           </div>
        </div>
      )}
      </div>

      {/* Print Invoice Modal Section */}
      {invoiceToPrint && (
        <div className="print-only" style={{ padding: "40px", backgroundColor: "#fff", color: "#000", fontFamily: "Arial, sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "3px solid var(--km-forest-deep)", paddingBottom: "20px", marginBottom: "30px" }}>
             <div>
               <h1 style={{ margin: 0, fontSize: "2rem", color: "var(--km-forest-deep)" }}>OFFICIAL LOAN INVOICE</h1>
               <div style={{ fontSize: "1rem", color: "#555", marginTop: "5px" }}>Krishi Mitra Financial Services</div>
             </div>
             <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
               <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
               <div><strong>Invoice #:</strong> KM-{Math.floor(Math.random()*100000)}</div>
             </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
             <div>
               <h3 style={{ margin: "0 0 10px 0", color: "#333", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Farmer Details</h3>
               <div>Land Area: {invoiceToPrint.landArea || landArea} Acres</div>
               <div>Crop Type: {invoiceToPrint.cropType || cropType}</div>
               <div>Status: <strong style={{ color: "var(--km-success)" }}>Awaiting Officer Verification</strong></div>
             </div>
             <div style={{ textAlign: "right" }}>
               <h3 style={{ margin: "0 0 10px 0", color: "#333", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Bank Offer</h3>
               <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{invoiceToPrint.offer.bankName}</div>
               <div>Interest Rate: {invoiceToPrint.offer.effectiveRate}%</div>
             </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
             <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                   <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ccc" }}>Description</th>
                   <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid #ccc" }}>Amount</th>
                </tr>
             </thead>
             <tbody>
                <tr>
                   <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>Scale of Finance Eligible Amount</td>
                   <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #eee" }}>{fmtINR(invoiceToPrint.totalEligibleAmount)}</td>
                </tr>
                <tr>
                   <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>Government Subsidy Allocation</td>
                   <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #eee" }}>{fmtINR(invoiceToPrint.totalSubsidy)}</td>
                </tr>
                <tr>
                   <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>Monthly EMI (12 Months)</td>
                   <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #eee" }}>{fmtINR(invoiceToPrint.offer.monthlyEMI)}</td>
                </tr>
                <tr style={{ backgroundColor: "#fafafa" }}>
                   <td style={{ padding: "12px", fontWeight: "bold", borderTop: "2px solid #333", borderBottom: "2px solid #333" }}>Total Yearly Payment</td>
                   <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", borderTop: "2px solid #333", borderBottom: "2px solid #333" }}>{fmtINR(invoiceToPrint.offer.yearlyTotal)}</td>
                </tr>
             </tbody>
          </table>

          <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
             <div style={{ textAlign: "center", width: "200px" }}>
               <div style={{ borderBottom: "1px solid #000", height: "40px" }}></div>
               <div style={{ marginTop: "10px", fontSize: "0.85rem" }}>Farmer Signature</div>
             </div>
             <div style={{ textAlign: "center", width: "200px" }}>
               <div style={{ borderBottom: "1px solid #000", height: "40px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}><strong style={{ color: "#aaa" }}>Pending</strong></div>
               <div style={{ marginTop: "10px", fontSize: "0.85rem" }}>Agricultural Officer Verification</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
