import { createContext, useContext, useState } from "react";
import { TRANSLATIONS } from "../i18n/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => localStorage.getItem("preferredLanguage") || "en");

    function setLanguage(code) {
        localStorage.setItem("preferredLanguage", code);
        setLanguageState(code);
    }

    function t(key) {
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used inside a LanguageProvider");
    return context;
}
