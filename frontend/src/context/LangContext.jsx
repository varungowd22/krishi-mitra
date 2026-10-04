import { createContext, useContext, useState } from "react";
import { translations } from "../locales/translations.js";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("km_lang") || "en");

  const toggleLang = () => {
    const next = lang === "en" ? "kn" : "en";
    setLang(next);
    localStorage.setItem("km_lang", next);
  };

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
