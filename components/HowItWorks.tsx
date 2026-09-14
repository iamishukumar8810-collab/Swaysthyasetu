"use client";

import React, { useState } from "react";
import { 
  Languages, 
  Mic, 
  Sparkles, 
  FileUp, 
  CheckCircle2, 
  Ticket, 
  Stethoscope, 
  FileSearch, 
  Edit3, 
  Printer,
  ArrowRight,
  UserCheck
} from "lucide-react";

export function HowItWorks() {
  const [activeWorkflow, setActiveWorkflow] = useState<"patient" | "doctor">("patient");

  const patientSteps = [
    {
      num: "01",
      icon: Languages,
      title: "Language & Interaction Mode",
      desc: "Patient selects preferred Indian language (Hindi, English, Telugu, Tamil, Bangla) and chooses Voice (Speak) or Touch (Tap) interaction.",
      detail: "Supports speech recognition in regional accents for maximum rural inclusivity."
    },
    {
      num: "02",
      icon: Sparkles,
      title: "Adaptive AI Pre-Consultation",
      desc: "AI asks what brings the patient to the hospital today. Follow-up questions dynamically adapt based on symptom severity, timing, and digestive health.",
      detail: "Captures core AYUSH indicators: Agni (hunger), Koshtha (bowels), and Nidra (sleep)."
    },
    {
      num: "03",
      icon: FileUp,
      title: "Document Upload & Vision OCR",
      desc: "Patient uploads photos or scans of prior paper prescriptions and lab reports using a phone camera or kiosk scanner.",
      detail: "Multimodal AI extracts past diagnoses, medications, dosages, and builds a clinical timeline."
    },
    {
      num: "04",
      icon: Ticket,
      title: "Case Summary & Token Ticket",
      desc: "Patient reviews a simplified summary of their complaint and receives a unique OPD token.",
      detail: "Realtime wait time estimation displayed on screen while patient waits in lobby."
    }
  ];

  const doctorSteps = [
    {
      num: "01",
      icon: Stethoscope,
      title: "OPD Queue & Realtime Triage",
      desc: "Doctor's desktop dashboard displays incoming queue of patients with chief complaints, age, token ID, and wait time updated via Supabase Realtime.",
      detail: "Zero manual data entry required by OPD receptionist."
    },
    {
      num: "02",
      icon: FileSearch,
      title: "Structured AI Case Sheet & Timeline",
      desc: "Doctor opens patient record with pre-synthesized Chief Complaints, HPI, past medication timeline, and Dashavidha Pariksha recommendations.",
      detail: "Attention flags highlight chronic drug dependencies and potential contraindications."
    },
    {
      num: "03",
      icon: Edit3,
      title: "Split OCR Inspector & Clinical Edit",
      desc: "Side-by-side view allows the physician to verify original prescription photos against AI-extracted data and make clinical edits in 1-click.",
      detail: "Doctor retains 100% diagnostic authority and final say."
    },
    {
      num: "04",
      icon: Printer,
      title: "Digital Verification & PDF Export",
      desc: "Doctor adds Nadi Pariksha notes, clicks 'Generate Verified Case Sheet', and prints or saves an official ABDM-compliant clinical record.",
      detail: "Consultation time reduced from 15 minutes to under 3 minutes."
    }
  ];

  const currentSteps = activeWorkflow === "patient" ? patientSteps : doctorSteps;

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
            <span>End-to-End Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How SwasthyaSetu Transforms the OPD Journey
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            A seamless bridge connecting patients in the waiting area to doctors in the consultation room.
          </p>

          {/* Workflow Mode Switcher Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner mt-4">
            <button
              onClick={() => setActiveWorkflow("patient")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeWorkflow === "patient"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Patient Pre-Consultation Flow
            </button>
            <button
              onClick={() => setActiveWorkflow("doctor")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeWorkflow === "doctor"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Doctor Clinical Workflow
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-200 dark:text-slate-800 group-hover:text-emerald-500/30 transition-colors font-mono">
                      {step.num}
                    </span>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                    💡 {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA for Active Workflow */}
        <div className="mt-12 text-center">
          {activeWorkflow === "patient" ? (
            <a
              href="/patient"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Test Patient Kiosk Flow</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <a
              href="/doctor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-md shadow-teal-700/20 transition-all"
            >
              <span>Explore Doctor OPD Queue</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

      </div>
    </section>
  );
}
