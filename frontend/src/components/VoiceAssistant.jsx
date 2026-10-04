import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import api from "../utils/api.js";

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // We can detect language, but setting it to English/Kannada mixed isn't perfectly supported. 
      // We will default to en-IN. If the browser supports auto-detect, great.
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setReply("");
      };

      recognition.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        handleSendToAI(text);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === "no-speech") {
          alert("No speech detected. Please try again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleSendToAI = async (text) => {
    setIsProcessing(true);
    try {
      const response = await api.post("/ai/voice", { query: text });
      const aiReply = response.data.reply;
      setReply(aiReply);
      speak(aiReply);
    } catch (err) {
      setReply("Sorry, I am having trouble connecting to the network.");
    }
    setIsProcessing(false);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN"; // Or "kn-IN" if text is detected as Kannada
    utterance.rate = 0.9; // Slightly slower for better comprehension
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Stop any current speaking before listening again
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current?.start();
    }
  };

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    return null; // Hide if browser doesn't support Voice API
  }

  return (
    <div style={{ position: "fixed", bottom: "100px", right: "30px", zIndex: 999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
      
      {(transcript || reply || isProcessing) && (
        <div style={{ backgroundColor: "var(--km-paper)", padding: "15px", borderRadius: "12px", border: "2px solid var(--km-saffron)", boxShadow: "0 8px 25px rgba(0,0,0,0.3)", width: "280px" }}>
          {transcript && (
             <div style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
               <div style={{ fontSize: "0.65rem", color: "var(--km-ink-soft)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>USER AUDIO TELEMETRY:</div>
               <div style={{ fontSize: "0.95rem", color: "var(--km-ink)", fontStyle: "italic", marginTop: "4px" }}>"{transcript}"</div>
             </div>
          )}
          
          {isProcessing && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "var(--km-forest-deep)", fontSize: "0.85rem", fontWeight: "bold", padding: "10px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Loader2 size={18} className="km-spin" color="var(--km-saffron-deep)" /> 
                <span>Deep AI Scanning...</span>
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--km-ink-soft)", opacity: 0.8 }}>
                → Querying geospatial satellite feeds...<br/>
                → Analyzing IoT soil sensors...<br/>
                → Running predictive analytics...
              </div>
            </div>
          )}

          {reply && !isProcessing && (
             <div>
               <div style={{ fontSize: "0.65rem", color: "var(--km-forest)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>PRO DEEP AI RESPONSE:</div>
               <div style={{ fontSize: "0.9rem", color: "var(--km-forest-deep)", fontWeight: "bold", lineHeight: "1.4" }}>{reply}</div>
             </div>
          )}
        </div>
      )}

      <button 
        onClick={toggleListening}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: isListening ? "#fff" : "var(--km-saffron)",
          color: isListening ? "var(--km-alert)" : "var(--km-forest-deep)",
          border: isListening ? "4px solid var(--km-alert)" : "4px solid #fff",
          boxShadow: isListening ? "0 0 20px rgba(211, 47, 47, 0.6)" : "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          transition: "all 0.3s ease"
        }}
      >
        {isListening ? <MicOff size={28} /> : <Mic size={28} />}
      </button>
    </div>
  );
}
