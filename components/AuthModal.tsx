"use client";

import React, { useState } from "react";
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  UserCheck, 
  Stethoscope, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  KeyRound
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: "patient" | "doctor";
}

export function AuthModal({ isOpen, onClose, initialRole = "patient" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"patient" | "doctor">(initialRole);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);
    // auto advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleDemoPatient = () => {
    // Redirect or set state for demo patient
    window.location.href = "/patient?demo=true";
  };

  const handleDemoDoctor = () => {
    // Redirect or set state for demo doctor
    window.location.href = "/doctor?demo=true";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            ABDM & AYUSH Compliant Auth
          </div>
          <h3 className="text-2xl font-bold">
            {isSignUp ? "Create your Account" : "Sign In to SwasthyaSetu"}
          </h3>
          <p className="text-emerald-100/90 text-sm mt-1">
            Access secure pre-consultation case sheets & OPD queues
          </p>

          {/* Role Tabs */}
          <div className="flex bg-emerald-950/30 p-1 rounded-xl mt-5">
            <button
              onClick={() => { setActiveTab("patient"); setOtpSent(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "patient"
                  ? "bg-white text-emerald-900 shadow-md font-semibold"
                  : "text-emerald-100 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Patient / Kiosk
            </button>
            <button
              onClick={() => { setActiveTab("doctor"); setOtpSent(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "doctor"
                  ? "bg-white text-teal-950 shadow-md font-semibold"
                  : "text-emerald-100 hover:text-white"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctor / Staff
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-5">
          {/* Patient View */}
          {activeTab === "patient" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Verification Mode</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAuthMethod("otp")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      authMethod === "otp"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold"
                        : "hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Mobile OTP (Fastest)
                  </button>
                  <button 
                    onClick={() => setAuthMethod("password")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      authMethod === "password"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold"
                        : "hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Email / ABHA ID
                  </button>
                </div>
              </div>

              {authMethod === "otp" ? (
                <div className="space-y-3">
                  {!otpSent ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Indian Mobile Number
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 pr-2 border-r border-slate-300 dark:border-slate-700">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="98765 43210"
                          className="w-full pl-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 font-mono tracking-wider"
                        />
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      <button
                        onClick={() => setOtpSent(true)}
                        disabled={phoneNumber.length < 10}
                        className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        Send OTP via SMS
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Enter 6-Digit OTP sent to +91 {phoneNumber}
                        </label>
                        <button 
                          onClick={() => setOtpSent(false)}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <div className="flex justify-between gap-2">
                        {otpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleDemoPatient}
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        Verify & Start Intake
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email or ABHA Health ID
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@swasthyasetu.in or 14-digit ABHA"
                        className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                      />
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                      />
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <button
                    onClick={handleDemoPatient}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl shadow-md transition-all text-sm"
                  >
                    {isSignUp ? "Create Patient Account" : "Sign In & Begin"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Doctor View */}
          {activeTab === "doctor" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor / Staff Email
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-teal-500">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.sharma@ayush-hospital.gov.in"
                    className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-teal-500">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" defaultChecked />
                  Remember this workstation
                </label>
                <a href="#forgot" className="text-teal-600 dark:text-teal-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <button
                onClick={handleDemoDoctor}
                className="w-full mt-2 bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                Access Doctor OPD Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Social / Google Auth divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Or Instant Demo Access
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* Quick Demo Launchers */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDemoPatient}
              className="p-3 text-left rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Patient View
                </span>
                <span className="text-[10px] bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded font-mono">1-Click</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                Try AI Voice & Touch Pre-Consultation
              </p>
            </button>

            <button
              onClick={handleDemoDoctor}
              className="p-3 text-left rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-100/60 dark:hover:bg-teal-950/40 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5" /> Doctor OPD
                </span>
                <span className="text-[10px] bg-teal-200/80 dark:bg-teal-900 text-teal-900 dark:text-teal-200 px-1.5 py-0.5 rounded font-mono">1-Click</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                Inspect AI Case Sheets & Live Queue
              </p>
            </button>
          </div>

          {/* Toggle between Sign in and Sign up */}
          <div className="text-center pt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              {isSignUp 
                ? "Already have an account? Sign in here" 
                : "New patient or clinic? Register for SwasthyaSetu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
