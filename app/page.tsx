"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StatsSection } from "@/components/StatsSection";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { AyushSection } from "@/components/AyushSection";
import { Footer } from "@/components/Footer";
import { 
  UserCheck, 
  Stethoscope, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Landing Content */}
      <main className="flex-1">
        <Hero />
        <StatsSection />
        <Features />
        <HowItWorks />
        <AyushSection />

        {/* Call to Action Banner Section */}
        <section className="py-20 bg-gradient-to-b from-transparent via-emerald-50/50 to-emerald-100/30 dark:via-slate-900/40 dark:to-emerald-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl p-8 sm:p-12 md:p-16 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white overflow-hidden shadow-2xl">
              
              {/* Background Glows */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Ready to Experience the Pre-Consultation Prototype?
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  Modernize Your AYUSH OPD Waiting Room Today
                </h2>

                <p className="text-emerald-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                  Test the interactive patient pre-consultation flow with multilingual voice intake, or explore the physician queue with AI-generated Dashavidha Pariksha case sheets.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link
                    href="/patient"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-all shadow-lg text-base group"
                  >
                    <UserCheck className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                    <span>Open Patient Kiosk Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/doctor"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900/90 text-white font-bold border border-emerald-400/40 transition-all text-base group"
                  >
                    <Stethoscope className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                    <span>Open Doctor OPD Portal</span>
                  </Link>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-6 pt-6 text-xs text-emerald-100/80">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    No credit card or download needed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    Instant mock clinical data included
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
