"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Loader2, 
  KeyRound, 
  UserCheck, 
  Stethoscope, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight 
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  // Default mobile number: 9636462356
  const [phoneNumber, setPhoneNumber] = useState("9636462356");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [poppedBtn, setPoppedBtn] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  // Default OTP: 12345 (5 digits)
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  // Role Selection Overlay state (opens after login)
  const [showRoleOverlay, setShowRoleOverlay] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const handleWiggleLeaf = () => {
    setIsWiggling(false);
    requestAnimationFrame(() => {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 600);
    });
  };

  // 1. Send OTP
  const handleSendOtp = async (btnId: string, actionName: string) => {
    if (loading) return;

    if (phoneNumber.length !== 10) {
      triggerToast("Please enter a valid 10-digit mobile number");
      return;
    }

    setPoppedBtn(btnId);
    setTimeout(() => setPoppedBtn(null), 500);
    setLoading(true);

    const formattedPhone = `+91${phoneNumber}`;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (error) {
          setStep("otp");
          triggerToast(`OTP Sent! Default code: 12345`);
        } else {
          setStep("otp");
          triggerToast(`OTP sent to ${formattedPhone}`);
        }
      } catch (err: any) {
        setStep("otp");
        triggerToast(`OTP Sent! Default code: 12345`);
      } finally {
        setLoading(false);
      }
    } else {
      // Local Prototype / Default Mode
      setTimeout(() => {
        setLoading(false);
        setStep("otp");
        triggerToast(`OTP sent to ${formattedPhone} (Code: 12345)`);
      }, 500);
    }
  };

  // Handle OTP input & paste
  const handleOtpChange = (index: number, val: string) => {
    // If pasting whole code like "12345"
    if (val.length > 1) {
      const cleaned = val.replace(/\D/g, "").slice(0, 5);
      if (cleaned.length > 1) {
        const newOtp = [...otp];
        cleaned.split("").forEach((char, i) => {
          if (i < 5) newOtp[i] = char;
        });
        setOtp(newOtp);
        const lastIndex = Math.min(cleaned.length - 1, 4);
        document.getElementById(`login-otp-${lastIndex}`)?.focus();
        return;
      }
      val = val[val.length - 1];
    }
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 4) {
      const next = document.getElementById(`login-otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`login-otp-${index - 1}`);
      prev?.focus();
    }
  };

  // 2. Verify OTP & Open Role Selection Overlay
  const handleVerifyOtp = async () => {
    const token = otp.join("");
    if (token.length !== 5) {
      triggerToast("Please enter the 5-digit OTP (12345)");
      return;
    }

    setLoading(true);
    const formattedPhone = `+91${phoneNumber}`;

    // Allow default OTP "12345"
    if (token === "12345") {
      setTimeout(() => {
        triggerToast("Verified successfully!");
        setLoading(false);
        setShowRoleOverlay(true); // OPEN ROLE OVERLAY
      }, 500);
      return;
    }

    // Otherwise check Supabase verifyOtp if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token,
          type: "sms",
        });

        if (error) {
          triggerToast(error.message || "Invalid OTP code. Use default: 12345");
          setLoading(false);
        } else {
          triggerToast("Verified successfully!");
          setLoading(false);
          setShowRoleOverlay(true); // OPEN ROLE OVERLAY
        }
      } catch (err: any) {
        triggerToast("Invalid OTP. Default code is 12345");
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        setLoading(false);
        triggerToast("Invalid OTP. Please enter 12345");
      }, 400);
    }
  };

  // 3. Resend OTP
  const handleResendOtp = async () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      triggerToast("New OTP sent: 12345");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#DDEAE2] flex items-center justify-center p-0 sm:p-6 font-sans select-none relative">
      {/* Back to website floating link on desktop */}
      <Link
        href="/"
        className="fixed top-6 left-6 hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-[#123B2C] dark:text-emerald-300 text-xs font-semibold shadow-sm hover:bg-white transition-all border border-[#CFEBDB]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Website
      </Link>

      {/* Phone container */}
      <div className="w-full sm:w-[390px] h-screen sm:h-[800px] bg-white sm:rounded-[44px] shadow-2xl sm:shadow-[0_30px_60px_-20px_rgba(18,59,44,0.35)] relative overflow-hidden flex flex-col border-0 sm:border sm:border-[#E4EEE8]">
        
        {/* Notch on phone */}
        <div className="hidden sm:block w-[120px] h-[26px] bg-[#0B0B0B] rounded-b-[18px] absolute top-0 left-1/2 -translate-x-1/2 z-20" />

        {/* Status bar spacer */}
        <div className="h-10 sm:h-[52px] shrink-0" />

        {/* Topbar */}
        <div className="flex justify-between items-center px-6 pt-1 shrink-0">
          <Link href="/" className="sm:hidden text-xs text-[#7A8B84] hover:text-[#0E7C4A] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="ml-auto">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#EAF7EF] border border-[#CFEBDB] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#DFF3E7] hover:-translate-y-0.5 hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Help chat"
              onClick={() => triggerToast("Opening help chat…")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path
                  d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.5997 3.4177 15.1116 4.15224 16.4238L3 21L7.72382 19.9694C8.99764 20.6314 10.4523 21 12 21Z"
                  stroke="#0E7C4A"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M8.5 10.5H15.5" stroke="#0E7C4A" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M8.5 13.5H12.5" stroke="#0E7C4A" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col px-8 sm:px-9">
          {/* Brand Block */}
          <div className="mt-8 sm:mt-12 flex flex-col items-center text-center">
            
            {/* Logo Mark with Floating & Wiggling Leaf */}
            <div
              className="w-[150px] h-[92px] flex items-center justify-center mb-2 relative cursor-pointer group"
              onClick={handleWiggleLeaf}
              title="Tap the leaf"
            >
              <svg viewBox="0 0 150 92" fill="none" className="w-[150px] h-[92px] overflow-visible">
                {/* Stone path: flatter ellipses, receding in scale */}
                <ellipse className="transition-transform duration-200 group-hover:-translate-y-0.5" cx="18" cy="78" rx="13" ry="4.4" fill="#B7DEC9" />
                <ellipse className="transition-transform duration-200 group-hover:-translate-y-0.5" cx="48" cy="83" rx="15.5" ry="5" fill="#8FC4A6" />
                <ellipse className="transition-transform duration-200 group-hover:-translate-y-0.5" cx="83" cy="80" rx="14" ry="4.6" fill="#A6D3BA" />
                <ellipse className="transition-transform duration-200 group-hover:-translate-y-0.5" cx="115" cy="74" rx="12" ry="4" fill="#CFEBDB" />

                {/* Floating Leaf */}
                <g className={`${isWiggling ? "animate-[leafWiggle_0.6s_ease-in-out]" : "animate-[leafFloat_4.5s_ease-in-out_infinite]"} origin-[70px_34px]`}>
                  <path
                    d="M62 6C82 12 96 26 92 44C89 58 66 63 56 52C46 41 44 16 62 6Z"
                    fill="#0E7C4A"
                  />
                  <path
                    d="M62 6C82 12 96 26 92 44C89 58 66 63 56 52C46 41 44 16 62 6Z"
                    fill="url(#leafSheen)"
                    opacity="0.5"
                  />
                  <path
                    d="M60 11C68 22 70 36 63 49"
                    stroke="#0A5E39"
                    strokeOpacity="0.55"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M64 18L73 22" stroke="#0A5E39" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                  <path d="M65 27L75 32" stroke="#0A5E39" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                  <path d="M64 36L72 42" stroke="#0A5E39" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                  <path d="M60 18L52 24" stroke="#0A5E39" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
                  <path d="M60 28L51 33" stroke="#0A5E39" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
                </g>

                <defs>
                  <linearGradient id="leafSheen" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="font-extrabold text-[24px] text-[#123B2C] tracking-tight m-0">
              Swasthya Setu
            </h1>
            <p className="text-[14px] text-[#7A8B84] mt-1.5 leading-[1.4]">
              Your bridge to accessible healthcare,<br />anywhere in India.
            </p>
          </div>

          {/* Form Block */}
          {step === "phone" ? (
            <div className="mt-8 sm:mt-10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-semibold text-[#123B2C]" htmlFor="phone">
                  Mobile number
                </label>
                <span className="text-[11px] text-[#0E7C4A] bg-[#EAF7EF] px-2 py-0.5 rounded-full font-medium">
                  Default: 9636462356
                </span>
              </div>

              <div className="flex items-center bg-[#EAF7EF] border-[1.5px] border-[#CFEBDB] rounded-[14px] px-4 h-[56px] transition-all focus-within:border-[#0E7C4A] focus-within:bg-white focus-within:shadow-[0_8px_20px_-10px_rgba(14,124,74,0.35)] focus-within:-translate-y-[1px]">
                <span className="text-[15px] font-semibold text-[#123B2C] pr-3 border-r-[1.5px] border-[#CFEBDB] mr-3">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="border-none bg-transparent outline-none text-[16px] font-medium text-[#123B2C] w-full placeholder-[#A7B6AF]"
                />
              </div>

              <p className="text-[12.5px] text-[#7A8B84] mt-2.5">
                We'll send a one-time code to verify it's you.
              </p>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendOtp("login", "Logging in…")}
                  className={`h-[52px] rounded-[14px] text-[15.5px] font-semibold text-white bg-[#0E7C4A] hover:bg-[#0A5E39] disabled:opacity-60 shadow-[0_14px_24px_-12px_rgba(14,124,74,0.55)] hover:shadow-[0_20px_30px_-12px_rgba(14,124,74,0.55)] transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center justify-center gap-2 ${
                    poppedBtn === "login" ? "animate-[popUp_0.45s_cubic-bezier(.34,1.56,.64,1)]" : "hover:-translate-y-1 hover:scale-[1.02]"
                  }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Log in</span>}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendOtp("signup", "Setting up your account…")}
                  className={`h-[52px] rounded-[14px] text-[15.5px] font-semibold text-[#0A5E39] bg-white border-[1.5px] border-[#CFEBDB] hover:bg-[#EAF7EF] disabled:opacity-60 hover:shadow-[0_16px_26px_-14px_rgba(18,59,44,0.25)] transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center justify-center gap-2 ${
                    poppedBtn === "signup" ? "animate-[popUp_0.45s_cubic-bezier(.34,1.56,.64,1)]" : "hover:-translate-y-1 hover:scale-[1.02]"
                  }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#0A5E39]" /> : <span>Create an account</span>}
                </button>
              </div>
            </div>
          ) : (
            /* OTP Verification Step with 5-digit boxes */
            <div className="mt-8 sm:mt-10 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[13px] font-semibold text-[#123B2C]">
                  Enter 5-digit OTP
                </label>
                <button
                  onClick={() => setStep("phone")}
                  className="text-xs text-[#0E7C4A] font-semibold hover:underline"
                >
                  Change number
                </button>
              </div>

              {/* 5 OTP input boxes */}
              <div className="flex justify-between gap-2 my-3">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`login-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-[#CFEBDB] bg-[#EAF7EF] text-[#123B2C] focus:bg-white focus:border-[#0E7C4A] outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              <div className="text-center space-y-1">
                <p className="text-[12px] text-[#7A8B84]">
                  OTP sent to +91 {phoneNumber}
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E7C4A] bg-[#EAF7EF] px-2.5 py-1 rounded-full border border-[#CFEBDB]">
                  <KeyRound className="w-3 h-3" /> Default Code: 12345
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleVerifyOtp}
                  className="h-[52px] rounded-[14px] text-[15.5px] font-semibold text-white bg-[#0E7C4A] hover:bg-[#0A5E39] disabled:opacity-60 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify & Continue</span>}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="text-xs text-[#0A5E39] font-medium text-center hover:underline py-1 cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto px-9 pb-8 text-center">
          <p className="text-[12px] text-[#7A8B84] m-0">
            <button
              type="button"
              onClick={() => triggerToast("Opening Help…")}
              className="text-[#7A8B84] hover:text-[#0A5E39] border-b border-[#C7D6CE] pb-[1px] cursor-pointer"
            >
              Help
            </button>
            <span className="mx-2 text-[#C7D6CE]">·</span>
            <button
              type="button"
              onClick={() => triggerToast("Opening Privacy Policy…")}
              className="text-[#7A8B84] hover:text-[#0A5E39] border-b border-[#C7D6CE] pb-[1px] cursor-pointer"
            >
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Toast Notification */}
        <div
          className={`absolute left-1/2 bottom-[110px] -translate-x-1/2 bg-[#123B2C] text-white text-[12.5px] font-medium px-4 py-2 rounded-xl pointer-events-none transition-all duration-200 whitespace-nowrap z-30 shadow-lg ${
            showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {toastMessage}
        </div>
      </div>

      {/* ROLE SELECTION OVERLAY (Opens after successful login) */}
      {showRoleOverlay && (
        <div className="fixed inset-0 z-50 bg-[#123B2C]/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[36px] shadow-2xl border border-[#CFEBDB] dark:border-slate-800 p-6 sm:p-10 relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#EAF7EF] dark:bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-100/50 dark:bg-teal-950/40 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="text-center relative z-10 mb-8 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7EF] dark:bg-emerald-950/80 border border-[#CFEBDB] dark:border-emerald-800 text-[#0E7C4A] dark:text-emerald-300 text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mobile Verified (+91 {phoneNumber})
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B2C] dark:text-white tracking-tight">
                Select Your Role
              </h2>
              <p className="text-sm text-[#7A8B84] dark:text-slate-400 max-w-md mx-auto">
                नमस्ते! Please select how you want to access Swasthya Setu.
              </p>
            </div>

            {/* Side-by-Side Role Cards (Left: Patient, Right: Doctor) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
              
              {/* LEFT CARD: PATIENT / KIOSK */}
              <div 
                onClick={() => {
                  triggerToast("Entering Patient Kiosk…");
                  setTimeout(() => window.location.href = "/patient", 500);
                }}
                className="group rounded-3xl p-6 bg-[#EAF7EF]/70 dark:bg-slate-800/60 border-2 border-[#CFEBDB] dark:border-slate-700 hover:border-[#0E7C4A] dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0E7C4A] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E7C4A] bg-white dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-[#CFEBDB] dark:border-emerald-800 font-mono">
                      Left Role
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#123B2C] dark:text-white mb-0.5 group-hover:text-[#0E7C4A] transition-colors">
                    Patient / Kiosk
                  </h3>
                  <p className="text-xs font-semibold text-[#0E7C4A] dark:text-emerald-400 mb-2">
                    मरीज़ / प्री-कंसल्टेशन
                  </p>
                  <p className="text-xs text-[#7A8B84] dark:text-slate-400 leading-relaxed mb-4">
                    Give medical history before meeting the doctor. Multilingual voice interview, upload prescriptions & get OPD token.
                  </p>

                  <div className="space-y-1.5 text-[11px] text-[#123B2C] dark:text-slate-300 mb-5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0E7C4A]" /> Voice & Touch Intake
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0E7C4A]" /> Prescription Document OCR
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0E7C4A]" /> Realtime Token AYUH-XXXX
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl bg-[#0E7C4A] group-hover:bg-[#0A5E39] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue as Patient</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* RIGHT CARD: DOCTOR / PHYSICIAN */}
              <div 
                onClick={() => {
                  triggerToast("Entering Doctor OPD Portal…");
                  setTimeout(() => window.location.href = "/doctor", 500);
                }}
                className="group rounded-3xl p-6 bg-teal-50/70 dark:bg-slate-800/60 border-2 border-teal-200 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-400 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-white dark:bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 font-mono">
                      Right Role
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#123B2C] dark:text-white mb-0.5 group-hover:text-teal-700 transition-colors">
                    Doctor / Vaidya
                  </h3>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2">
                    चिकित्सक / ओपीडी पोर्टल
                  </p>
                  <p className="text-xs text-[#7A8B84] dark:text-slate-400 leading-relaxed mb-4">
                    Access live OPD queue, review AI-synthesized Dashavidha Pariksha case sheets, inspect OCR records & verify case.
                  </p>

                  <div className="space-y-1.5 text-[11px] text-[#123B2C] dark:text-slate-300 mb-5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Live OPD Queue Triage
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Dashavidha Pariksha
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Split-Screen OCR & Sign-off
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl bg-teal-700 group-hover:bg-teal-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue as Doctor</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* Change number / Back option */}
            <div className="text-center mt-6 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setShowRoleOverlay(false);
                  setStep("phone");
                }}
                className="text-xs text-[#7A8B84] hover:text-[#0E7C4A] font-medium transition-colors cursor-pointer"
              >
                ← Sign in with a different mobile number
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
