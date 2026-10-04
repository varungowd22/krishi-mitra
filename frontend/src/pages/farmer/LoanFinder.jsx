import { Banknote, Check, Landmark } from "lucide-react";
import { useState } from "react";
import { estimateEmi, estimateKccInterest } from "./loanCalculations.js";
import "./LoanFinder.css";

const DOCUMENTS = {
  en: "Aadhaar, land record (RTC / Pahani / Khata), bank passbook, passport photo, and mobile number.",
  hi: "आधार, भूमि रिकॉर्ड (RTC / पहाणी / खाता), बैंक पासबुक, पासपोर्ट फोटो और मोबाइल नंबर।",
  te: "ఆధార్, భూమి రికార్డు (RTC / పహాణి / ఖాతా), బ్యాంకు పాస్‌బుక్, పాస్‌పోర్ట్ ఫోటో, మొబైల్ నంబర్.",
};

const WARNINGS = {
  en: "Never pay an agent to arrange a KCC. Visit your bank branch or a Common Service Centre (CSC). Confirm current rates, limits, eligibility, and documents with the bank before applying.",
  hi: "KCC दिलाने के लिए किसी एजेंट को पैसे न दें। बैंक शाखा या कॉमन सर्विस सेंटर (CSC) जाएं। आवेदन से पहले मौजूदा ब्याज दर, सीमा और पात्रता बैंक से जांचें।",
  te: "KCC ఇప్పిస్తామని ఏజెంట్‌కు డబ్బు ఇవ్వకండి. బ్యాంకు శాఖ లేదా కామన్ సర్వీస్ సెంటర్ (CSC)ను సంప్రదించండి. దరఖాస్తు ముందు తాజా వడ్డీ రేటు, పరిమితి, అర్హతను బ్యాంకులో నిర్ధారించుకోండి.",
};

const LOAN_SCHEMES = [
  {
    id: "kcc_crop",
    need: "crop",
    name: {
      en: "Kisan Credit Card (KCC) crop loan",
      hi: "किसान क्रेडिट कार्ड (KCC) फसल ऋण",
      te: "కిసాన్ క్రెడిట్ కార్డ్ (KCC) పంట రుణం",
    },
    how: {
      en: "Working capital for seed, fertilizer, crop protection, and farm labour. Interest benefits may apply to eligible short-term crop loans.",
      hi: "बीज, खाद, फसल सुरक्षा और खेत मजदूरी के लिए कार्यशील पूंजी। पात्र अल्पकालिक फसल ऋण पर ब्याज लाभ मिल सकता है।",
      te: "విత్తనాలు, ఎరువులు, పంట సంరక్షణ, వ్యవసాయ కూలీ కోసం పని మూలధనం. అర్హమైన స్వల్పకాలిక పంట రుణాలకు వడ్డీ ప్రయోజనం ఉండవచ్చు.",
    },
  },
  {
    id: "kcc_allied",
    need: "dairy",
    name: {
      en: "KCC for dairy, poultry, and fisheries",
      hi: "पशुपालन, मुर्गी और मत्स्य पालन के लिए KCC",
      te: "పాడి, కోళ్లు, చేపల పెంపకానికి KCC",
    },
    how: {
      en: "Working capital for eligible animal husbandry, poultry, and fisheries activities. Land ownership may not be required for some allied-activity KCCs; check with your bank.",
      hi: "पात्र पशुपालन, मुर्गी पालन और मत्स्य गतिविधियों के लिए कार्यशील पूंजी। कुछ KCC में भूमि का स्वामित्व जरूरी नहीं हो सकता; बैंक से पूछें।",
      te: "అర్హమైన పశుపోషణ, కోళ్ల పెంపకం, మత్స్య కార్యకలాపాలకు పని మూలధనం. కొన్ని అనుబంధ KCCలకు భూమి యాజమాన్యం అవసరం లేకపోవచ్చు; బ్యాంకును అడగండి.",
    },
  },
  {
    id: "warehouse",
    need: "storage",
    name: {
      en: "Post-harvest loan against warehouse receipt",
      hi: "गोदाम रसीद पर फसल कटाई के बाद ऋण",
      te: "గిడ్డంగి రసీదుపై పంట తర్వాత రుణం",
    },
    how: {
      en: "Store produce in an eligible warehouse and ask a lender about finance against its receipt, so you can consider selling later. Eligibility and any interest benefit depend on the current scheme rules.",
      hi: "पात्र गोदाम में उपज रखें और रसीद पर ऋण के बारे में पूछें, ताकि बाद में बेचने पर विचार कर सकें। पात्रता और ब्याज लाभ मौजूदा नियमों पर निर्भर हैं।",
      te: "అర్హమైన గిడ్డంగిలో పంట నిల్వ చేసి, రసీదుపై రుణం గురించి రుణదాతను అడగండి. అర్హత, వడ్డీ ప్రయోజనం ప్రస్తుత నిబంధనలపై ఆధారపడి ఉంటాయి.",
    },
  },
  {
    id: "equipment",
    need: "equipment",
    name: {
      en: "Tractor and farm machinery term loan",
      hi: "ट्रैक्टर और कृषि मशीनरी टर्म लोन",
      te: "ట్రాక్టర్, వ్యవసాయ యంత్రాల టర్మ్ లోన్",
    },
    how: {
      en: "A bank term loan repaid in instalments. Ask your agriculture office about available machinery subsidies before making a purchase.",
      hi: "किस्तों में चुकाया जाने वाला बैंक टर्म लोन। खरीदने से पहले कृषि कार्यालय से उपलब्ध मशीनरी सब्सिडी पूछें।",
      te: "వాయిదాల్లో చెల్లించే బ్యాంకు టర్మ్ లోన్. కొనుగోలు ముందు అందుబాటులో ఉన్న యంత్రాల సబ్సిడీ గురించి వ్యవసాయ కార్యాలయాన్ని అడగండి.",
    },
  },
  {
    id: "aif",
    need: "infra",
    name: {
      en: "Agriculture Infrastructure Fund (AIF)",
      hi: "कृषि अवसंरचना कोष (AIF)",
      te: "వ్యవసాయ మౌలిక సదుపాయాల నిధి (AIF)",
    },
    how: {
      en: "Financing support for eligible farm-gate infrastructure such as warehouses, cold storage, sorting, and processing. Current scheme coverage and benefits must be confirmed with the lender.",
      hi: "गोदाम, कोल्ड स्टोरेज, छंटाई और प्रसंस्करण जैसी पात्र कृषि अवसंरचना के लिए वित्त सहायता। वर्तमान लाभ बैंक से जांचें।",
      te: "గోదాములు, కోల్డ్ స్టోరేజ్, వడపోత, ప్రాసెసింగ్ వంటి అర్హమైన వ్యవసాయ మౌలిక సదుపాయాలకు ఆర్థిక సహాయం. ప్రస్తుత ప్రయోజనాలను రుణదాతతో నిర్ధారించండి.",
    },
  },
  {
    id: "calamity",
    need: "calamity",
    name: {
      en: "Support after crop loss or calamity",
      hi: "फसल नुकसान या आपदा के बाद सहायता",
      te: "పంట నష్టం లేదా విపత్తు తర్వాత సహాయం",
    },
    how: {
      en: "After a notified calamity, ask your bank promptly whether loan restructuring is available, and contact your insurer about any crop-insurance claim.",
      hi: "अधिसूचित आपदा के बाद बैंक से ऋण पुनर्गठन और बीमा कंपनी से फसल बीमा दावे के बारे में तुरंत पूछें।",
      te: "ప్రకటించిన విపత్తు తర్వాత రుణ పునర్వ్యవస్థీకరణ గురించి బ్యాంకును, పంట బీమా క్లెయిమ్ గురించి బీమా సంస్థను వెంటనే సంప్రదించండి.",
    },
  },
];

const NEEDS = [
  { id: "crop", label: "Seeds and crop expenses" },
  { id: "dairy", label: "Dairy, poultry, or fisheries" },
  { id: "storage", label: "Storing harvested produce" },
  { id: "equipment", label: "Tractor or farm machinery" },
  { id: "infra", label: "Farm infrastructure" },
  { id: "calamity", label: "Crop loss or calamity" },
];

const formatINR = (amount) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

export function getLoanRecommendations(need, amount, lang = "en") {
  const language = DOCUMENTS[lang] ? lang : "en";
  const loans = LOAN_SCHEMES
    .filter((scheme) => scheme.need === need)
    .map((scheme) => ({ id: scheme.id, name: scheme.name[language], how: scheme.how[language] }));
  if (amount > 0 && (need === "crop" || need === "dairy")) {
    loans.push({
      id: "kcc-estimate",
      estimate: estimateKccInterest(amount, 9, true, need === "dairy"),
    });
  }
  return { loans, documents: DOCUMENTS[language], warning: WARNINGS[language] };
}

function LoanGuideChecklist() {
  const steps = [
    {
      title: "Pick the right purpose",
      text: "Choose the loan that matches your crop, dairy, equipment, or storage need before visiting the branch.",
    },
    {
      title: "Bring the key papers",
      text: "Keep Aadhaar, land or lease records, bank passbook, and recent farm details ready for verification.",
    },
    {
      title: "Confirm final terms",
      text: "Ask the bank for current interest rates, repayment period, collateral rules, and your application receipt.",
    },
  ];

  return (
    <section className="km-loan-finder__guide" aria-labelledby="loan-guide-title">
      <div className="km-loan-finder__guide-head">
        <div>
          <span className="km-loan-finder__eyebrow">KRISHI MITRA FARMER GUIDE</span>
          <h3 id="loan-guide-title">A loan, step by step</h3>
        </div>
        <span className="km-loan-finder__duration">3 STEPS</span>
      </div>

      <div className="km-loan-finder__checklist">
        {steps.map((step, index) => (
          <div className="km-loan-finder__check-item" key={step.title}>
            <span className="km-loan-finder__step-number">{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="km-loan-finder__video-note">
        Keep Aadhaar, land and lease papers only when applicable, and bank records ready. Your bank will confirm its exact documents and loan terms.
      </p>
    </section>
  );
}

export default function LoanFinder() {
  const [need, setNeed] = useState("crop");
  const [amount, setAmount] = useState("150000");
  const [language, setLanguage] = useState("en");
  const [recommendations, setRecommendations] = useState(null);
  const [kccAmount, setKccAmount] = useState("300000");
  const [kccMonths, setKccMonths] = useState("9");
  const [kccType, setKccType] = useState("crop");
  const [onTime, setOnTime] = useState(true);
  const [kccResult, setKccResult] = useState(null);
  const [emiPrincipal, setEmiPrincipal] = useState("500000");
  const [emiRate, setEmiRate] = useState("9.5");
  const [emiMonths, setEmiMonths] = useState("36");
  const [emiResult, setEmiResult] = useState(null);
  const [error, setError] = useState("");

  const findLoans = (event) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0 || parsedAmount > Number.MAX_SAFE_INTEGER) {
      setError("Enter a valid loan amount of zero or more within the safe calculation range.");
      return;
    }
    setError("");
    setRecommendations(getLoanRecommendations(need, parsedAmount, language));
  };

  const calculateKcc = (event) => {
    event.preventDefault();
    try {
      setKccResult(estimateKccInterest(Number(kccAmount), Number(kccMonths), onTime, kccType === "dairy"));
      setError("");
    } catch (calculationError) {
      setError(calculationError.message);
    }
  };

  const calculateEmi = (event) => {
    event.preventDefault();
    try {
      setEmiResult(estimateEmi(Number(emiPrincipal), Number(emiRate), Number(emiMonths)));
      setError("");
    } catch (calculationError) {
      setError(calculationError.message);
    }
  };

  return (
    <div className="km-loan-finder">
      <header className="km-loan-finder__hero">
        <span className="km-loan-finder__eyebrow"><Banknote size={15} /> FARMER LOAN GUIDE</span>
        <h2>Find a loan path that fits your farm</h2>
        <p>Explore possible schemes and estimate repayments. Your bank decides eligibility, current rates, and approval.</p>
      </header>

      <LoanGuideChecklist />

      <div className="km-loan-finder__language">
        <label htmlFor="loan-guide-language">Scheme information language</label>
        <select id="loan-guide-language" className="km-input" value={language} onChange={(event) => {
          setLanguage(event.target.value);
          setRecommendations(null);
        }}>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="te">తెలుగు</option>
        </select>
      </div>

      <div className="km-loan-finder__columns">
        <section className="km-loan-finder__panel" aria-labelledby="loan-scheme-search-title">
          <h3 id="loan-scheme-search-title"><Landmark size={19} /> Explore loan options</h3>
          <form className="km-loan-finder__form" onSubmit={findLoans}>
            <label>
              What is the loan for?
              <select className="km-input" value={need} onChange={(event) => setNeed(event.target.value)}>
                {NEEDS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>
              Approximate amount (₹; optional)
              <input className="km-input" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
            <button type="submit" className="km-btn km-btn--primary">Find possible schemes</button>
          </form>

          {recommendations && (
            <div className="km-loan-finder__results" aria-live="polite">
              <h4>Options to discuss with your bank</h4>
              {recommendations.loans.map((loan) => loan.estimate ? (
                <div className="km-loan-finder__estimate" key={loan.id}>
                  <strong>Illustrative KCC interest estimate · 9 months</strong>
                  <span>Estimated interest: {formatINR(loan.estimate.interest)}</span>
                  <span>Estimated total to repay: {formatINR(loan.estimate.totalToRepay)}</span>
                </div>
              ) : (
                <article className="km-loan-finder__scheme" key={loan.id}>
                  <h5>{loan.name}</h5>
                  <p>{loan.how}</p>
                </article>
              ))}
              <div className="km-loan-finder__documents">
                <strong><Check size={15} /> Documents to ask about</strong>
                <p>{recommendations.documents}</p>
              </div>
              <p className="km-loan-finder__warning">{recommendations.warning}</p>
            </div>
          )}
        </section>

        <div className="km-loan-finder__calculators">
          <section className="km-loan-finder__panel" aria-labelledby="kcc-calculator-title">
            <h3 id="kcc-calculator-title"><CalculatorIcon /> KCC interest estimate</h3>
            <form className="km-loan-finder__form" onSubmit={calculateKcc}>
              <label>
                Loan amount (₹)
                <input className="km-input" type="number" min="1" step="any" value={kccAmount} onChange={(event) => setKccAmount(event.target.value)} required />
              </label>
              <label>
                Term (months; up to 12)
                <input className="km-input" type="number" min="1" max="12" step="1" value={kccMonths} onChange={(event) => setKccMonths(event.target.value)} required />
              </label>
              <label>
                Loan category
                <select className="km-input" value={kccType} onChange={(event) => setKccType(event.target.value)}>
                  <option value="crop">Crop KCC (₹3 lakh reference limit)</option>
                  <option value="dairy">Allied activities (₹2 lakh reference limit)</option>
                </select>
              </label>
              <label className="km-loan-finder__check">
                <input type="checkbox" checked={onTime} onChange={(event) => setOnTime(event.target.checked)} />
                Estimate with on-time repayment benefit
              </label>
              <button className="km-btn km-btn--primary" type="submit">Estimate KCC interest</button>
            </form>
            {kccResult && (
              <div className="km-loan-finder__calculation" aria-live="polite">
                <div><span>Estimated interest</span><strong>{formatINR(kccResult.interest)}</strong></div>
                <div><span>Total to repay</span><strong>{formatINR(kccResult.totalToRepay)}</strong></div>
                <small>{kccResult.estimatedRate}; calculation applies the reference rules shown below.</small>
              </div>
            )}
          </section>

          <section className="km-loan-finder__panel" aria-labelledby="emi-calculator-title">
            <h3 id="emi-calculator-title"><Banknote size={19} /> Term-loan EMI estimate</h3>
            <form className="km-loan-finder__form" onSubmit={calculateEmi}>
              <label>
                Loan principal (₹)
                <input className="km-input" type="number" min="1" step="any" value={emiPrincipal} onChange={(event) => setEmiPrincipal(event.target.value)} required />
              </label>
              <label>
                Annual interest rate (%)
                <input className="km-input" type="number" min="0" max="100" step="0.1" value={emiRate} onChange={(event) => setEmiRate(event.target.value)} required />
              </label>
              <label>
                Repayment term (months)
                <input className="km-input" type="number" min="1" max="600" step="1" value={emiMonths} onChange={(event) => setEmiMonths(event.target.value)} required />
              </label>
              <button className="km-btn km-btn--primary" type="submit">Calculate monthly EMI</button>
            </form>
            {emiResult && (
              <div className="km-loan-finder__calculation" aria-live="polite">
                <div><span>Estimated monthly EMI</span><strong>{formatINR(emiResult.emi)}</strong></div>
                <div><span>Total interest</span><strong>{formatINR(emiResult.totalInterest)}</strong></div>
                <div><span>Total paid</span><strong>{formatINR(emiResult.totalPaid)}</strong></div>
              </div>
            )}
          </section>
        </div>
      </div>

      {error && <p className="km-loan-finder__error" role="alert">{error}</p>}

      <aside className="km-loan-finder__rate-note">
        <strong>Illustrative reference inputs — verify before applying</strong>
        <p>
          The calculators use the supplied example figures: crop KCC 7% base / 4% with an assumed on-time benefit;
          ₹3,00,000 crop and ₹2,00,000 allied-activity reference caps; and 9% above the cap.
          They are estimates only—not current scheme terms, a bank quote, sanction, or subsidy promise.
          Scheme rates, caps, collateral rules, fees, and eligibility can change; confirm all details with your bank.
        </p>
      </aside>
    </div>
  );
}

function CalculatorIcon() {
  return <span className="km-loan-finder__calculator-icon" aria-hidden="true">%</span>;
}
