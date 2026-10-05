# Krishi Mitra (ಕೃಷಿ ಮಿತ್ರ) — Smart Agriculture Platform

A full-stack MERN web application for an MCA major project, unifying five
farmer-welfare modules into one platform with three role-based portals:
**Farmer**, **Agriculture Officer / Admin**, and **Vendor**.

---

## 1. Modules

| # | Module | What it does |
|---|--------|---------------|
| 1 | **Farmer Loan & Debt Tracker** | Farmers log loans taken from moneylenders/banks/cooperatives, track repayments, and get an automatic high-interest "debt trap" risk flag (>30% annual interest). Admin gets a district-wide risk report. |
| 2 | **Mandi Price Alert System** | Daily mandi (market) prices per crop are published by the officer. Farmers set a target price per crop; the system shows which alerts are currently triggered (simulating an SMS alert). |
| 3 | **Crop Insurance Claim Portal** | Farmers file claims with photo evidence of crop damage, and track status through a visual timeline (Submitted to Under Review to Field Inspection to Approved/Rejected to Paid). Officers process and update claims. |
| 4 | **Irrigation Water Scheduling** | Officers create a turn-based canal water rotation schedule. Farmers see their own slot and the full fairness rotation for their canal block. |
| 5 | **Fake Pesticide & Seed Detector** | Farmers scan a product barcode (camera or manual entry) to check it against a government-approved product registry. Vendors register genuine stock; officers can flag counterfeit products. Scan history and counterfeit hotspot reports are kept. |

**Signature design element:** every status across all 5 modules (loan status,
claim status, irrigation slot status, scan result) is rendered as a rotated
"rubber stamp" badge, tying the whole app to a unifying government-paperwork
visual identity (forest green + saffron, tricolor hairline, serif headings).

---

## 2. Tech Stack

- **Frontend:** React 18 + Vite, React Router v6, Axios, `lucide-react` icons,
  `html5-qrcode` for camera barcode scanning, bilingual (English + Kannada)
  via a lightweight custom i18n context.
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT auth with bcrypt
  password hashing, role-based access control (`farmer` / `admin` / `vendor`).
- **Styling:** Hand-written CSS design system (no Tailwind/UI kit) — see
  `frontend/src/styles/theme.css` for the full token system.

---

## 3. Project Structure

```
krishi-mitra/
├── backend/
│   ├── models/         # Mongoose schemas (User, Loan, MandiPrice, PriceAlert,
│   │                     InsuranceClaim, IrrigationSlot, Product, ScanLog)
│   ├── routes/         # Express route handlers, one file per module
│   ├── middleware/      auth.js (JWT verify + role guard)
│   ├── seed/            seedData.js (demo data for instant evaluation)
│   └── server.js
└── frontend/
    └── src/
        ├── pages/farmer/   # 5 module pages + FarmerDashboard shell
        ├── pages/admin/    # 5 module pages + AdminOverview + AdminDashboard shell
        ├── pages/vendor/   # VendorDashboard
        ├── components/     # Header, StampBadge, ProtectedRoute
        ├── context/        # AuthContext, LangContext
        ├── locales/         translations.js (en / kn)
        ├── utils/           api.js (axios instance)
        └── styles/          theme.css (design tokens)
```

---

## 4. Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas
  connection string

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if your MongoDB URI is different

# Load demo data (3 farmers, 1 admin, 1 vendor, sample loans/claims/prices/etc.)
npm run seed

# Start the API server (http://localhost:5000)
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Start the dev server (http://localhost:5173)
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`
(see `vite.config.js`), so both servers must be running together.

### Database-backed changes

MongoDB must be running and reachable through `MONGO_URI` for account changes,
insurance, irrigation, product-scan, power, and SOS records. Check
`http://localhost:5000/api/health`; the `database` field must report
`connected`. Profile edits, marketplace cart/orders, mandi price alerts, drone
bookings, and tractor-loan preferences save to the signed-in user's browser
immediately and retry database synchronization when the connection returns.
These offline copies are device-local until synchronization completes and are
not available on another device beforehand.

### AI crop disease scan

The disease scanner sends JPG, PNG, or WebP images up to 5 MB to Gemini from
the backend; the API key is never sent to the browser. Set `GEMINI_API_KEY`
in `backend/.env` for local development and in the backend host's private
environment settings for deployment. `GEMINI_MODEL` can select another
vision-capable Gemini model available to your API key. If the key is missing,
the scanner reports that configuration is needed instead of showing a made-up
diagnosis.

Scan history is saved only when MongoDB is connected. The AI output is an
initial visual screening, not a confirmed diagnosis or verified government
recommendation. Confirm the cause and any product registration, label, and
dosage with a local agriculture extension officer before treatment.

### Dairy brand catalogue

The farmer dairy page includes reference package photos supplied for this
project. Product pack sizes and prices are illustrative; check the actual
package label and a local retailer for current product details and prices.

### Emergency SOS alerts

Farmer SOS submissions are stored in MongoDB and appear in the officer
dashboard's emergency monitor, which checks for new alerts every five seconds
while the signed-in officer keeps the dashboard open. The officer can enable
device sound and browser notifications from the monitor; the farmer's phone
plays a short siren three seconds after the API confirms the SOS. Browser sound
and notification permissions, device sound settings, a reachable API, and a
connected MongoDB are required. This prototype does not send SMS, place calls,
or dispatch emergency services. Call **112** for immediate emergency help.

### Fixing an unavailable irrigation schedule

The irrigation API requires MongoDB. This project reads the connection string
from `backend/.env` using the name `MONGO_URI` (not `MONGODB_URI`):

```env
MONGO_URI=mongodb://127.0.0.1:27017/krishimitra
PORT=5000
```

On Windows, check and start the installed MongoDB service in an elevated
PowerShell window:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

If MongoDB is running in Docker Desktop instead, start Docker Desktop first,
then start the existing container:

```powershell
docker ps -a --filter "name=mongodb"
docker start mongodb
```

Run the API from the backend directory with `npm run dev`. It retries a
disconnected initial MongoDB connection automatically; after the database is
ready, check `http://localhost:5000/api/health` and confirm the database status
is `connected`, then use **Retry** in the irrigation page. The
`/api/irrigation/my` endpoint also requires a signed-in farmer session; opening
the API root at `http://localhost:5000/` only checks that the server responds.

An empty database has no assigned turns. The demo seed command (`npm run seed`)
creates sample irrigation turns, but it **deletes existing application data**
before reseeding; back up important data and verify the target database before
running it.

### Loan finder and repayment estimates

The farmer Loan Tracker includes a loan-purpose finder for crop KCC, allied
activities, warehouse-receipt finance, machinery, farm infrastructure, and
post-calamity support. It also includes KCC simple-interest and term-loan EMI
calculators plus a step-by-step checklist for preparing for a bank visit.
The calculator uses example rates
and limits supplied for this prototype; these are not verified current scheme
terms, bank offers, loan approvals, or subsidy promises. Farmers should confirm
current rates, eligibility, collateral, fees, and documents with their bank.

### Weather alerts

Farmers can preview a three-day Open-Meteo forecast and explicitly opt in to
rain (70% or higher), frost (2°C or lower), and heat (38°C or higher) warnings
by SMS, WhatsApp, or both. The alerts page requests GPS access only when the
farmer chooses **Use GPS**. Preferences and alert delivery history require a
connected MongoDB account.

To deliver messages, configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
`TWILIO_SMS_FROM`, and `TWILIO_WHATSAPP_FROM` in the backend environment. The
WhatsApp sender must be enabled for the Twilio account, and the SMS sender must
be valid for that account. Until configured, the app still previews warnings
but clearly reports that messages are not being sent. The backend checks
enabled farmers every 30 minutes; production deployments must keep a single
background worker running and use HTTPS for browser location access.

### Demo Login Credentials (created by the seed script)

These accounts are for local evaluation only. The seed script clears existing
database collections before inserting demo records; never run it against a
production database. The public deployment requires a separately provisioned
officer/vendor account and should not use these demo passwords.

| Role | Phone | Password | Name |
|------|-------|----------|------|
| Farmer | 9900000003 | farmer123 | Varun Gowda |
| Farmer | 9900000004 | farmer123 | Manjunatha K |
| Farmer | 9900000005 | farmer123 | Ramakka Hosalli |
| Officer/Admin | 9900000001 | admin123 | Prakash Rao |
| Vendor | 9900000002 | vendor123 | Lakshmi Agro Traders |

Try scanning barcode `8901030875315` in the Pesticide Detector for a
**genuine** result, or `8901030899999` for a **counterfeit** result.

---

## 5. Mobile GPS and Camera Requirements

Phone GPS and camera scanning require browser permission and a secure HTTPS
site. Plain-HTTP local Wi-Fi addresses such as `http://192.168.x.x:5173` are
not secure contexts on iPhone or Android, so GPS and camera access will be
blocked there. Open the deployed HTTPS site on each phone instead; during
local development, `localhost` is allowed on the computer running the app.
If a phone cannot get a location, allow location access for the site in the
browser and turn on the phone's Location Services. GPS actions show manual
area-selection alternatives where available. If camera access is unavailable,
the manual barcode entry field works identically.

---

## 6. Building for Production

```bash
cd frontend
npm run build       # outputs to frontend/dist
```

Serve `frontend/dist` with any static host, and deploy `backend/` to any
Node host (Render, Railway, etc.) with environment variables set for
`MONGO_URI` and `JWT_SECRET`.

### Public hosting on Render

The repository includes a Render Blueprint in [`render.yaml`](./render.yaml)
for a static frontend and Node API. To deploy:

1. Create a MongoDB Atlas cluster and database user. Add the Atlas connection
   string as `MONGO_URI` when Render requests the unsynced secret.
2. Create or sign in to GitHub, push this repository, and import it into Render
   as a Blueprint. The blueprint generates a production `JWT_SECRET` and
   configures the frontend API URL and SPA route rewrites. Add `GEMINI_API_KEY`
   to the backend service's private environment settings to enable crop scans;
   keep the key out of GitHub and the frontend settings.
3. Set a strong database user password, allow network access from Render
   using your production network policy, and wait for both services to deploy.
4. Open the Render static-site URL over HTTPS. Scan the QR code on the login
   page with a phone camera to open the same site. Each device must sign in.
   The browser scanner and installable app require HTTPS (localhost is also
   allowed during local development).

GitHub Actions builds the frontend and checks backend JavaScript syntax on
pushes and pull requests to `main`. Render can automatically redeploy when
changes are pushed after the GitHub repository is connected. The service
worker caches the app shell and static assets only; account data and API
features still require a reachable backend and MongoDB.

Never commit `.env` files, database URLs, JWT secrets, or carrier credentials.
Configure production secrets in the hosting provider’s environment settings.

---

## 7. Academic Context

Developed as an MCA final-year major project, Department of Computer
Science, St. Francis College (Koramangala), affiliated with Bengaluru City
University. See the accompanying project report and presentation for problem
statement, literature survey, system design (DFDs/ER diagrams), and testing
documentation.
