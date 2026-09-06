"use client";

import React from "react";
import Link from "next/link";
import { HeartPulse, ShieldAlert, ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Emergency Medical Disclaimer Callout */}
        <div className="rounded-2xl p-4 sm:p-5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Clinical & Safety Disclaimer: </span>
            SwasthyaSetu is an AI-powered pre-consultation case-taking and triage support tool built for hospital OPD waiting rooms. It is strictly non-diagnostic and does not replace medical advice, clinical judgment, or prescription by licensed AYUSH physicians. In cases of critical chest pain, severe trauma, or acute breathing difficulty, patients must immediately report to emergency services (Emergency 112).
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Swasthya<span className="text-emerald-600 dark:text-emerald-400">Setu</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI-Powered Multilingual Pre-Consultation & Case-Taking Software for AYUSH Hospitals.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <ThemeToggle />
              <span className="text-xs text-slate-400">Dark / Light Mode</span>
            </div>
          </div>

          {/* Column 2: Interfaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Application Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/patient" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
                  Patient Kiosk / Web Intake <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1">
                  Doctor OPD Queue & Dashboard <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Multimodal Prescription OCR
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Adaptive AI Interview Engine
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: AYUSH Protocols */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              AYUSH Clinical Schemas
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#ayush-clinical" className="hover:text-emerald-600 dark:hover:text-emerald-400">Dashavidha Pariksha (10-Fold)</a></li>
              <li><a href="#ayush-clinical" className="hover:text-emerald-600 dark:hover:text-emerald-400">Prakriti & Dosha Assessment</a></li>
              <li><a href="#ayush-clinical" className="hover:text-emerald-600 dark:hover:text-emerald-400">Agni & Koshtha Clinical Profiling</a></li>
              <li><a href="#ayush-clinical" className="hover:text-emerald-600 dark:hover:text-emerald-400">Ashtavidha Pariksha Integration</a></li>
            </ul>
          </div>

          {/* Column 4: Standards & Tech */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Standards & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-emerald-600 dark:text-emerald-400 font-medium">ABDM Architecture Ready</span></li>
              <li><span>Supabase PostgreSQL + RLS Security</span></li>
              <li><span>Gemini Vision AI for Document OCR</span></li>
              <li><span>Web Speech API Multilingual Engine</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SwasthyaSetu (स्वास्थ्यसेतु). Built for Smart India Hackathon & Modern AYUSH OPDs.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-slate-800 dark:hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-800 dark:hover:text-slate-300">Terms of Clinical Use</a>
            <a href="#abdm" className="hover:text-slate-800 dark:hover:text-slate-300">ABDM Guidelines</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
