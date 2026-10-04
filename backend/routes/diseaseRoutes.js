import express from "express";
import mongoose from "mongoose";
import DiseaseScan from "../models/DiseaseScan.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = express.Router();
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    cropName: { type: "STRING" },
    diagnosis: { type: "STRING" },
    confidencePercent: { type: "NUMBER" },
    severity: { type: "STRING", enum: ["low", "moderate", "high", "uncertain"] },
    visualFindings: { type: "ARRAY", items: { type: "STRING" } },
    recommendedActions: { type: "ARRAY", items: { type: "STRING" } },
    medicineName: { type: "STRING" },
    dosageGuidance: { type: "STRING" },
    needsExpertReview: { type: "BOOLEAN" },
  },
  required: [
    "cropName",
    "diagnosis",
    "confidencePercent",
    "severity",
    "visualFindings",
    "recommendedActions",
    "medicineName",
    "dosageGuidance",
    "needsExpertReview",
  ],
};

router.use(protect, allowRoles("farmer"));

router.post("/analyze", async (req, res) => {
  const { imageBase64, mimeType, cropName } = req.body;
  if (typeof mimeType !== "string" || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return res.status(400).json({ message: "Upload a PNG, JPEG, or WebP crop image.", code: "INVALID_IMAGE_TYPE" });
  }
  if (typeof imageBase64 !== "string" || !imageBase64 || imageBase64.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) {
    return res.status(400).json({ message: "Upload a crop image no larger than 5 MB.", code: "IMAGE_TOO_LARGE" });
  }
  const image = Buffer.from(imageBase64, "base64");
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES || image.toString("base64").replace(/=+$/, "") !== imageBase64.replace(/=+$/, "")) {
    return res.status(400).json({ message: "The uploaded image data is invalid or larger than 5 MB.", code: "INVALID_IMAGE" });
  }
  if (cropName !== undefined && (typeof cropName !== "string" || cropName.length > 80)) {
    return res.status(400).json({ message: "Crop name must be 80 characters or fewer.", code: "INVALID_CROP_NAME" });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      message: "AI crop scanning is not configured yet. Set GEMINI_API_KEY in the backend hosting environment.",
      code: "AI_NOT_CONFIGURED",
    });
  }

  const prompt = [
    "Analyze the attached crop leaf photograph for visible disease or pest symptoms.",
    cropName?.trim() ? `The farmer says the crop is: ${cropName.trim()}. Treat this as a clue, not a fact.` : "Identify the likely crop if the image permits.",
    "Return a cautious visual triage, not a definitive diagnosis. If the image is unclear, not a leaf, or the cause is uncertain, say so and set severity to uncertain.",
    "List only visual findings actually visible in the image. Do not invent confidence, lab results, yield loss, official approval, or local pesticide registration.",
    "Recommend practical low-risk first steps and when to contact a local agriculture extension officer.",
    "Do not prescribe a pesticide dose. Set dosageGuidance to 'Follow the registered product label; confirm with a local agriculture officer.'",
    "Do not claim a medicine is government-approved. If a medicine cannot be responsibly identified from the image, set medicineName to 'No specific medicine recommended from this image'.",
    "Write the response in clear English suitable for a farmer.",
  ].join(" ");

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL || "gemini-flash-latest")}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: ANALYSIS_SCHEMA,
            temperature: 0.2,
          },
        }),
        signal: AbortSignal.timeout(45000),
      }
    );
  } catch (error) {
    console.error("Gemini crop analysis request failed.", error.message);
    return res.status(502).json({ message: "AI crop analysis could not reach the provider. Check the connection and try again.", code: "AI_PROVIDER_UNAVAILABLE" });
  }

  if (!response.ok) {
    console.error(`Gemini crop analysis returned HTTP ${response.status}.`);
    return res.status(response.status === 429 ? 503 : 502).json({
      message: response.status === 429
        ? "AI crop analysis is temporarily rate-limited. Please try again shortly."
        : "AI crop analysis is temporarily unavailable. Check the Gemini API configuration and try again.",
      code: response.status === 429 ? "AI_RATE_LIMITED" : "AI_PROVIDER_ERROR",
    });
  }

  let analysis;
  try {
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    analysis = JSON.parse(text);
  } catch (error) {
    console.error("Gemini crop analysis returned an invalid response.", error.message);
    return res.status(502).json({ message: "AI crop analysis returned an unreadable result. Please try again with a clearer image.", code: "AI_INVALID_RESPONSE" });
  }

  if (
    typeof analysis.cropName !== "string" ||
    typeof analysis.diagnosis !== "string" ||
    !Number.isFinite(analysis.confidencePercent) ||
    analysis.confidencePercent < 0 || analysis.confidencePercent > 100 ||
    !["low", "moderate", "high", "uncertain"].includes(analysis.severity) ||
    !Array.isArray(analysis.visualFindings) ||
    !Array.isArray(analysis.recommendedActions) ||
    typeof analysis.medicineName !== "string" ||
    typeof analysis.dosageGuidance !== "string" ||
    typeof analysis.needsExpertReview !== "boolean"
  ) {
    console.error("Gemini crop analysis response did not match the required result fields.");
    return res.status(502).json({ message: "AI crop analysis returned an incomplete result. Please try again.", code: "AI_INVALID_RESPONSE" });
  }

  const result = {
    ...analysis,
    confidencePercent: Math.round(analysis.confidencePercent * 10) / 10,
    visualFindings: analysis.visualFindings.filter((item) => typeof item === "string").slice(0, 6),
    recommendedActions: analysis.recommendedActions.filter((item) => typeof item === "string").slice(0, 6),
  };

  if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(req.user._id)) {
    try {
      const scan = await DiseaseScan.create({
        farmer: req.user._id,
        cropName: result.cropName,
        diseaseDetected: result.diagnosis,
        confidencePercent: result.confidencePercent,
        recommendedMedicine: result.medicineName,
        dosage: result.dosageGuidance,
        severity: result.severity,
        visualFindings: result.visualFindings,
        recommendedActions: result.recommendedActions,
        scanDate: new Date(),
      });
      result.scanId = scan._id;
      result.scanSaved = true;
    } catch (error) {
      console.error("Crop analysis completed but its scan history could not be saved.", error.message);
      result.scanSaved = false;
    }
  } else {
    result.scanSaved = false;
  }

  return res.json({
    analysis: result,
    notice: "AI image analysis is an initial screening, not a confirmed diagnosis. Verify treatment and local registration with an agriculture officer and follow the product label.",
  });
});

export default router;
