import React, { useEffect, useState } from "react";
import { Edit2, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const DEFAULT_FARMER_PHOTO = "/farmer-placeholder.svg";

export default function FarmerIDCard({ user }) {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [name, setName] = useState(user?.name || "Varun Gowda");
  const [age, setAge] = useState(user?.age || "23");
  const [mobile, setMobile] = useState(user?.phone || "9353243474");
  const [address, setAddress] = useState(user?.address || "Keregodu, Devanahalli Taluk,\nMandya");
  const [pincode, setPincode] = useState(user?.pincode || "560001");
  const [photoUrl, setPhotoUrl] = useState(
    user?.photoUrl && user.photoUrl !== "/varun-profile.jpg" ? user.photoUrl : DEFAULT_FARMER_PHOTO
  );

  const saveProfileChanges = async (closeEditor = false) => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const savedUser = await updateUser({
        name: name.trim(),
        age: Number(age),
        phone: mobile.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        photoUrl: photoUrl.trim(),
      });
      setName(savedUser.name);
      setAge(String(savedUser.age ?? ""));
      setMobile(savedUser.phone);
      setAddress(savedUser.address || "");
      setPincode(savedUser.pincode || "");
      setPhotoUrl(
        savedUser.photoUrl && savedUser.photoUrl !== "/varun-profile.jpg"
          ? savedUser.photoUrl
          : DEFAULT_FARMER_PHOTO
      );
      setIsDirty(false);
      if (closeEditor) setIsEditing(false);
      setSaveSuccess("Saved on this device; database sync will retry automatically.");
    } catch (error) {
      setSaveError(error.response?.data?.message || "Could not save profile changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isEditing || !isDirty) return undefined;
    const timer = window.setTimeout(() => {
      void saveProfileChanges();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isEditing, isDirty, name, age, mobile, address, pincode, photoUrl]);

  const handleEditSave = async () => {
    if (!isEditing) {
      setSaveError("");
      setSaveSuccess("");
      setIsEditing(true);
      return;
    }
    await saveProfileChanges(true);
  };

  const farmerId = "FID-KA-AE2D66";
  const barcodeNumber = "*AE2D66*";
  const issuedDate = "6/22/2026";

  return (
    <>
      <style>{`
        .farmer-card-container * {
            box-sizing: border-box;
        }

        .farmer-card {
            width: 1060px;
            height: 600px;
            background: #ffffff;
            border: 2px solid #555;
            border-radius: 24px;
            margin: auto;
            position: relative;
            overflow: hidden;
            box-shadow: 0 5px 18px rgba(0, 0, 0, 0.18);
            font-family: Arial, Helvetica, sans-serif;
            color: #222;
        }

        .farmer-card::before {
            content: "";
            position: absolute;
            inset: 10px;
            border: 2px solid #777;
            border-radius: 18px;
            pointer-events: none;
        }

        .card-header {
            height: 125px;
            border-bottom: 1px solid #aaa;
            position: relative;
            display: flex;
            align-items: center;
            padding: 20px 35px;
        }

        .header-line {
            position: absolute;
            top: 0;
            left: 20px;
            right: 20px;
            height: 9px;
            background: linear-gradient(
                to right,
                #e47b32 0%,
                #e47b32 50%,
                #ffffff 50%,
                #ffffff 72%,
                #3c8c43 72%,
                #3c8c43 100%
            );
            border-radius: 8px 8px 0 0;
        }

        .gov-logo {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: #ef873d;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 25px;
            border: 4px solid #f5c092;
            flex-shrink: 0;
        }

        .gov-logo span {
            font-size: 34px;
            color: #555;
        }

        .department {
            line-height: 1.2;
        }

        .department h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            color: #3d4b55;
        }

        .department p {
            margin: 8px 0 0;
            font-size: 17px;
            font-weight: 600;
            color: #555;
        }

        .verified {
            position: absolute;
            right: 35px;
            top: 55px;
            background: #48515a;
            color: white;
            padding: 11px 20px;
            border-radius: 5px;
            font-size: 17px;
            font-weight: bold;
        }

        .card-body {
            position: relative;
            height: 365px;
            padding: 28px 65px;
        }

        .photo-section {
            position: absolute;
            left: 65px;
            top: 30px;
            width: 205px;
        }

        .photo-box {
            width: 205px;
            height: 230px;
            border: 2px solid #555;
            border-radius: 8px;
            overflow: hidden;
            background: #eee;
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .status {
            margin-top: 18px;
            width: 190px;
            height: 40px;
            border: 1px solid #777;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            font-weight: bold;
            font-size: 15px;
            color: #3d4b55;
        }

        .status-circle {
            width: 18px;
            height: 18px;
            border: 2px solid #64747b;
            border-radius: 50%;
            position: relative;
        }

        .status-circle::after {
            content: "";
            position: absolute;
            width: 6px;
            height: 3px;
            border-left: 2px solid #64747b;
            border-bottom: 2px solid #64747b;
            transform: rotate(-45deg);
            left: 4px;
            top: 5px;
        }

        .details {
            position: absolute;
            left: 310px;
            top: 30px;
            right: 55px;
        }

        .field {
            margin-bottom: 15px;
            text-align: left;
        }

        .label {
            font-size: 14px;
            color: #555;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .label span {
            text-transform: none;
            font-weight: normal;
        }

        .value {
            font-size: 21px;
            font-weight: 600;
            color: #222;
        }

        .farmer-name {
            font-size: 29px;
            font-family: Georgia, serif;
            font-weight: bold;
        }

        .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 70px;
        }

        .farmer-id {
            position: absolute;
            left: 65px;
            bottom: 20px;
            text-align: left;
        }

        .farmer-id .label {
            font-size: 14px;
        }

        .id-number {
            font-family: "Courier New", monospace;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .card-footer {
            position: absolute;
            left: 35px;
            right: 35px;
            bottom: 20px;
            height: 90px;
            border-top: 1px dashed #999;
        }

        .barcode {
            position: absolute;
            left: 5px;
            top: 12px;
            height: 43px;
            display: flex;
            align-items: stretch;
            gap: 3px;
        }

        .barcode i {
            display: block;
            background: #111;
            height: 43px;
        }

        .barcode i:nth-child(1) { width: 4px; }
        .barcode i:nth-child(2) { width: 2px; }
        .barcode i:nth-child(3) { width: 6px; }
        .barcode i:nth-child(4) { width: 3px; }
        .barcode i:nth-child(5) { width: 8px; }
        .barcode i:nth-child(6) { width: 2px; }
        .barcode i:nth-child(7) { width: 5px; }
        .barcode i:nth-child(8) { width: 3px; }
        .barcode i:nth-child(9) { width: 7px; }
        .barcode i:nth-child(10) { width: 2px; }
        .barcode i:nth-child(11) { width: 5px; }
        .barcode i:nth-child(12) { width: 3px; }
        .barcode i:nth-child(13) { width: 7px; }
        .barcode i:nth-child(14) { width: 3px; }
        .barcode i:nth-child(15) { width: 5px; }
        .barcode i:nth-child(16) { width: 2px; }
        .barcode i:nth-child(17) { width: 7px; }
        .barcode i:nth-child(18) { width: 3px; }
        .barcode i:nth-child(19) { width: 6px; }

        .barcode-number {
            position: absolute;
            left: 5px;
            top: 58px;
            font-family: monospace;
            font-size: 13px;
            letter-spacing: 2px;
        }

        .commissioner {
            position: absolute;
            right: 5px;
            top: 15px;
            text-align: right;
        }

        .commissioner strong {
            display: block;
            font-family: Georgia, serif;
            font-size: 21px;
            color: #555;
        }

        .commissioner p {
            margin: 2px 0;
            font-size: 13px;
            color: #555;
        }

        .issue {
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            color: #777;
            white-space: nowrap;
        }

        /* Responsive scaling */
        .farmer-card-wrapper {
            width: 100%;
            overflow: hidden;
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
        }

        .farmer-card-container {
            transform-origin: top center;
        }

        @media screen and (max-width: 1100px) {
            .farmer-card-container {
                transform: scale(min(1, calc((100vw - 40px) / 1060)));
                margin-bottom: calc(-600px * (1 - min(1, calc((100vw - 40px) / 1060))));
            }
        }
      `}</style>
      
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }} className="no-print">
        <button 
          onClick={handleEditSave}
          disabled={isSaving}
          className={`km-btn ${isEditing ? "km-btn--success" : "km-btn--primary"}`}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }}
        >
          {isSaving ? "Saving..." : isEditing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit ID Card</>}
        </button>
      </div>
      {(saveError || saveSuccess) && (
        <p role={saveError ? "alert" : "status"} style={{ color: saveError ? "var(--km-alert)" : "var(--km-success)", textAlign: "right", margin: "-8px 0 12px" }}>
          {saveError || saveSuccess}
        </p>
      )}

      <div className="farmer-card-wrapper">
        <div className="farmer-card-container">
          <div className="farmer-card">
              <div className="header-line"></div>
              <div className="card-header">
                  <div className="gov-logo">
                      <span style={{ color: "#000080", fontSize: "40px" }}>☸</span>
                  </div>
                  <div className="department">
                      <h1>
                          DEPARTMENT OF AGRICULTURE · GOVERNMENT OF
                          <br />
                          KARNATAKA
                      </h1>
                      <p>
                          ಕೃಷಿ ಇಲಾಖೆ · ಕರ್ನಾಟಕ ಸರ್ಕಾರ
                      </p>
                  </div>
                  <div className="verified">
                      Gov. Verified / ದೃಢೀಕೃತ
                  </div>
              </div>

              <div className="card-body">
                  <div className="photo-section">
                      <div className="photo-box">
                          <img src={photoUrl} alt="Farmer" onError={(e) => { e.target.src = "https://via.placeholder.com/205x230?text=Photo" }} />
                      </div>
                      <div className="status">
                          <div className="status-circle"></div>
                          ACTIVE / ಸಕ್ರಿಯ
                      </div>
                  </div>

                  <div className="details">
                      <div className="field">
                          <div className="label">
                              FARMER NAME / <span>ರೈತರ ಹೆಸರು</span>
                          </div>
                          <div className="value farmer-name">
                              {isEditing ? (
                                <input value={name} onChange={e => { setName(e.target.value); setIsDirty(true); }} style={{ fontSize: "29px", fontFamily: "Georgia, serif", fontWeight: "bold", width: "100%", border: "1px solid #ccc", padding: "2px 5px", borderRadius: "4px" }} />
                              ) : name}
                          </div>
                      </div>

                      <div className="two-columns">
                          <div className="field">
                              <div className="label">
                                  AGE / <span>ವಯಸ್ಸು</span>
                              </div>
                              <div className="value">
                                  {isEditing ? (
                                    <input value={age} onChange={e => { setAge(e.target.value); setIsDirty(true); }} style={{ fontSize: "21px", fontWeight: "600", width: "80px", border: "1px solid #ccc", padding: "2px 5px", borderRadius: "4px" }} />
                                  ) : age} Years
                              </div>
                          </div>
                          <div className="field">
                              <div className="label">
                                  MOBILE / <span>ಮೊಬೈಲ್</span>
                              </div>
                              <div className="value">
                                  {isEditing ? (
                                    <input value={mobile} onChange={e => { setMobile(e.target.value); setIsDirty(true); }} style={{ fontSize: "21px", fontWeight: "600", width: "100%", border: "1px solid #ccc", padding: "2px 5px", borderRadius: "4px" }} />
                                  ) : mobile}
                              </div>
                          </div>
                      </div>

                      <div className="field">
                          <div className="label">
                              RESIDENTIAL ADDRESS /
                              <span>ವಾಸಸ್ಥಳ ವಿಳಾಸ</span>
                          </div>
                          <div className="value" style={{ whiteSpace: "pre-line" }}>
                              {isEditing ? (
                                <textarea value={address} onChange={e => { setAddress(e.target.value); setIsDirty(true); }} style={{ fontSize: "21px", fontWeight: "600", width: "100%", border: "1px solid #ccc", padding: "2px 5px", borderRadius: "4px", resize: "none", height: "70px", fontFamily: "Arial" }} />
                              ) : address}
                          </div>
                      </div>

                      <div className="field">
                          <div className="label">
                              PINCODE / <span>ಪಿನ್ ಕೋಡ್</span>
                          </div>
                          <div className="value">
                              {isEditing ? (
                                <input value={pincode} onChange={e => { setPincode(e.target.value); setIsDirty(true); }} style={{ fontSize: "21px", fontWeight: "600", width: "150px", border: "1px solid #ccc", padding: "2px 5px", borderRadius: "4px" }} />
                              ) : pincode}
                          </div>
                      </div>
                  </div>

                  <div className="farmer-id">
                      <div className="label">
                          FARMER ID / <span>ರೈತ ಐಡಿ</span>
                      </div>
                      <div className="id-number">
                          {farmerId}
                      </div>
                  </div>
              </div>

              <div className="card-footer">
                  <div className="barcode">
                      <i></i><i></i><i></i><i></i><i></i>
                      <i></i><i></i><i></i><i></i><i></i>
                      <i></i><i></i><i></i><i></i><i></i>
                      <i></i><i></i><i></i><i></i>
                  </div>
                  <div className="barcode-number">
                      {barcodeNumber}
                  </div>

                  <div className="commissioner">
                      <strong>
                          AgriComm KA
                      </strong>
                      <p>
                          COMMISSIONER OF AGRICULTURE
                      </p>
                      <p>
                          ಕೃಷಿ ಆಯುಕ್ತರ ಕಚೇರಿ
                      </p>
                  </div>

                  <div className="issue">
                      Issued: {issuedDate} · Karnataka State Farmer Database
                  </div>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
