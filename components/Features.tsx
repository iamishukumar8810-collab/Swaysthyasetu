"use client";

import React from "react";
import { 
  Mic, 
  Sparkles, 
  FileScan, 
  Leaf, 
  AlertOctagon, 
  Clock, 
  ShieldCheck, 
  Languages, 
  Printer, 
  Activity,
  Layers,
  CheckCircle2
} from "lucide-react";

export function Features() {
  const featuresList = [
    {
      icon: Mic,
      tag: "Multimodal Accessibility",
      title: "Voice + Touch Multilingual Intake",
      desc: "Patients can speak naturally in Hindi, English, and regional Indian languages using browser-native Web Speech API, or use simple touch cards for noisy waiting rooms.",
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
      badge: "Speech-to-Text"
    },
    {
      icon: Sparkles,
      tag: "Dynamic Clinical Triage",
      title: "Adaptive AI Questioning Engine",
      desc: "No rigid static forms. The AI adapts follow-up questions in real time based on chief complaints, severity, post-meal pain triggers, and associated distress.",
      color: "from-teal-500 to-cyan-600",
      bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60",
      badge: "Context Aware"
    },
    {
      icon: FileScan,
      tag: "Vision OCR",
      title: "Handwritten Prescription Intelligence",
      desc: "Patients scan or upload old paper prescriptions and lab reports. Vision AI parses doctor notes, medicine names, dosages, and builds an accurate medical timeline.",
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60",
      badge: "Multimodal OCR"
    },
    {
      icon: Leaf,
      tag: "Domain Specialization",
      title: "AYUSH & Dashavidha Pariksha Ready",
      desc: "Captures core Ayurvedic clinical indicators during pre-consultation: Prakriti (Doshas), Agni (Digestive fire), Koshtha (Bowel pattern), and Nidra (Sleep quality).",
      color: "from-green-600 to-emerald-700",
      bg: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/60",
      badge: "Ayurveda Native"
    },
    {
      icon: AlertOctagon,
      tag: "Safety & Compliance",
      title: "Red-Flag Attention Highlighting",
      desc: "Alerts physicians to critical drug-herb interactions, chronic PPI use, or alarming red-flag symptoms. Non-diagnostic: physician maintains complete clinical control.",
      color: "from-amber-500 to-rose-600",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
      badge: "Decision Support"
    },
    {
      icon: Clock,
      tag: "Efficiency Boost",
      title: "Live OPD Queue & Realtime Sync",
      desc: "Generates unique tokens. Doctor OPD queue updates instantaneously via Supabase Realtime without page reloads.",
      color: "from-purple-500 to-violet-600",
      bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60",
      badge: "Realtime Sync"
    }
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50/60 dark:bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Core Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Built Specifically for High-Volume AYUSH OPDs
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Every feature is designed to reduce wait times, bridge the patient-doctor communication gap, and provide clean, physician-verified case sheets.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    {item.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore in live flow &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
