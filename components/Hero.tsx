"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Mic, 
  Stethoscope, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Languages, 
  FileText, 
  Clock, 
  Activity,
  AlertTriangle,
  Play
} from "lucide-react";

interface HeroProps {
  onOpenAuth?: (role?: "patient" | "doctor") => void;
}

export function Hero({ onOpenAuth }: HeroProps = {}) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[400px] bg-gradient-to-tr from-emerald-400/20 via-teal-300/15 to-transparent dark:from-emerald-600/15 dark:via-teal-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm animate-in fade-in duration-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AI-Powered Pre-Consultation for AYUSH Hospitals</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Patient Tells History.{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">
              AI Structures the Case.
            </span>{" "}
            Doctor Heals Faster.
          </h1>

          {/* Hindi sub-caption */}
          <p className="text-sm md:text-base font-medium text-emerald-700 dark:text-emerald-400 italic">
            "मरीज़ बोलेगा, AI लिखेगा, डॉक्टर तुरंत उपचार करेगा।"
          </p>

          {/* Value proposition description */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate 70% of routine OPD case-taking time. Empower patients with multilingual voice & touch intake, handwritten prescription OCR, and structured <strong>Dashavidha Pariksha</strong> case sheets for physicians.
          </p>

          {/* Interactive Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/patient"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 transition-all text-base group"
            >
              <Mic className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
              <span>Launch Patient Intake (Kiosk / Web)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/doctor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold border border-slate-200 dark:border-slate-800 shadow-md transition-all text-base group"
            >
              <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:rotate-12 transition-transform" />
              <span>Doctor OPD Dashboard</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 pt-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Web Speech API Voice Enabled
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Non-Diagnostic (Physician in Full Control)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ABDM & AYUSH Ready
            </span>
          </div>
        </div>

        {/* Interactive Visual Hero Mockup */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-3xl p-3 bg-gradient-to-b from-emerald-200/50 via-teal-100/30 to-slate-100/50 dark:from-emerald-950/40 dark:via-slate-900/40 dark:to-slate-900/60 border border-emerald-200/60 dark:border-slate-800 shadow-2xl backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-800 overflow-hidden">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-slate-400 dark:text-slate-500">
                    swasthyasetu.ayush.gov.in/live-triage
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                    Live OPD Sync Active
                  </span>
                </div>
              </div>

              {/* Mockup Grid: Patient Pre-Consultation (Left) -> AI Synthesis (Center) -> Doctor Sheet (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5">
                
                {/* Column 1: Patient Interface Preview (4 cols) */}
                <div className="md:col-span-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/50 p-4 border border-emerald-100 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-emerald-600" /> Patient Voice Mode (Hindi/Eng)
                      </span>
                      <span className="text-[10px] bg-emerald-200/70 dark:bg-emerald-900 px-2 py-0.5 rounded-full">Step 3/8</span>
                    </div>

                    {/* Chat simulation */}
                    <div className="space-y-2.5 text-xs">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl rounded-tl-none border border-slate-200/60 dark:border-slate-700 shadow-sm">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px]">AI Assistant:</p>
                        <p className="text-slate-700 dark:text-slate-200 mt-0.5">
                          "Namaste Ramesh ji! Please tell me, what brings you here today?"
                        </p>
                      </div>

                      <div className="bg-emerald-600 text-white p-2.5 rounded-xl rounded-tr-none ml-auto max-w-[85%] shadow-sm">
                        <p className="text-[11px] opacity-80">Patient (Voice Input):</p>
                        <p className="font-medium mt-0.5">
                          "I have stomach pain and severe acidity since 2 days."
                        </p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl rounded-tl-none border border-slate-200/60 dark:border-slate-700 shadow-sm">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px]">AI Adaptive Follow-up:</p>
                        <p className="text-slate-700 dark:text-slate-200 mt-0.5">
                          "Do you feel pain immediately after eating? Any nausea or bloating?"
                        </p>
                        <div className="flex gap-1.5 mt-2">
                          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
                            Yes, after food
                          </span>
                          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
                            Bloating
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Uploaded: 2 Prescriptions</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">OCR Processed</span>
                  </div>
                </div>

                {/* Column 2: AI Processing & Synthesis (3 cols) */}
                <div className="md:col-span-3 rounded-2xl bg-teal-50/40 dark:bg-slate-800/30 p-4 border border-teal-100 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" /> AI Document & Triage Engine
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                          OCR Extracted Timeline:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                          • <strong>Jan 2024:</strong> Pantoprazole 40mg OD + Antacid Gel
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                          • <strong>Nov 2023:</strong> Health Checkup (Gastritis noted)
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300">
                        <div className="flex items-center gap-1 font-bold text-[10px] text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" /> Attention Flag (Non-Diagnostic)
                        </div>
                        <p className="text-[10px] mt-0.5 leading-snug">
                          Recurrent acidity on chronic PPI for &gt;6 months. AYUSH Agni assessment suggested.
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                          AYUSH Baseline Captured:
                        </span>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">
                          Agni: Manda (Weak digestion) | Koshtha: Krura (Constipated) | Nidra: Disturbed
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="inline-block text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2.5 py-1 rounded-full">
                      Token: AYUH-2024-08725
                    </span>
                  </div>
                </div>

                {/* Column 3: Doctor Verified Case Sheet (5 cols) */}
                <div className="md:col-span-5 rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Ramesh Kumar</span>
                          <span className="text-[11px] font-normal text-slate-500">45 Y / Male</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">OPD Card: AYUH-2024-08725</p>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready for Doctor
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">
                          Chief Complaint
                        </span>
                        <p className="text-slate-800 dark:text-slate-200">
                          Epigastric stomach pain & burning sensation since 2 days, aggravated post-meals.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">
                            Current Rx
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-mono text-[10px]">
                            Pantoprazole 40mg OD
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">
                            Dashavidha Pariksha
                          </span>
                          <p className="text-emerald-700 dark:text-emerald-400 font-medium text-[10px]">
                            Prakriti: Pitta-Kapha
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl text-[10px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Physician Action:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Dr. Sharma can edit, add Nadi Pariksha notes, and click "Generate Verified Case Sheet".
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      href="/doctor/case-sheet/AYUH-2024-08725"
                      className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                    >
                      View Full Clinical Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[10px] text-slate-400">Avg OPD time: 2 mins</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
