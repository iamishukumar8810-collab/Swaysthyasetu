"use client";

import React, { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useLanguage, LanguageCode } from "@/context/LanguageContext";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { language, setLanguage, currentLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button (placed before ThemeToggle) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-xs font-semibold"
        aria-label="Select language"
        title="Change Language / भाषा बदलें"
      >
        <Languages className="w-4 h-4 text-[#0E7C4A] dark:text-emerald-400 shrink-0" />
        <span className="max-w-[70px] sm:max-w-none truncate font-medium">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Language Selection Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 focus:outline-none">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Language / भाषा चुनें
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-0.5 px-1">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                    isSelected
                      ? "bg-[#EAF7EF] text-[#0E7C4A] dark:bg-emerald-950/70 dark:text-emerald-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <div>
                      <p className="leading-tight">{lang.nativeName}</p>
                      {lang.nativeName !== lang.name && (
                        <p className="text-[10px] text-slate-400 font-normal leading-tight">
                          {lang.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#0E7C4A] dark:text-emerald-400 stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
