"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HeartPulse, 
  Menu, 
  X, 
  Stethoscope, 
  UserCheck, 
  Sparkles, 
  ArrowRight
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  onOpenAuth?: (role?: "patient" | "doctor") => void;
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm border-b border-emerald-100/60 dark:border-slate-800/80 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Swasthya<span className="text-emerald-600 dark:text-emerald-400">Setu</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                स्वास्थ्यसेतु • Pre-Consultation AI
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a 
              href="#features" 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#ayush-clinical" 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <span>AYUSH Framework</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </a>
            <Link 
              href="/patient" 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Patient Kiosk
            </Link>
            <Link 
              href="/doctor" 
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1"
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Doctor OPD
            </Link>
          </nav>

          {/* Right Actions: Theme Toggle & Login/Signup */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {/* Quick Live Demo button */}
            <Link
              href="/patient"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Try Kiosk Demo
            </Link>

            {/* Sign In / Sign Up button navigating to the new design */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all duration-200 cursor-pointer"
            >
              <span>Login / Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3 text-base font-medium text-slate-700 dark:text-slate-200">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 hover:text-emerald-600"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 hover:text-emerald-600"
            >
              How It Works
            </a>
            <a 
              href="#ayush-clinical" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 hover:text-emerald-600"
            >
              AYUSH Framework (Dashavidha Pariksha)
            </a>
            <Link 
              href="/patient" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 text-emerald-600 font-semibold flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Patient Pre-Consultation (Kiosk / Web)
            </Link>
            <Link 
              href="/doctor" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 text-teal-600 font-semibold flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              Doctor OPD Dashboard
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md text-sm block"
            >
              Login / Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
