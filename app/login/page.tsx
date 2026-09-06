"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [poppedBtn, setPoppedBtn] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 1800);
  };

  const handleWiggleLeaf = () => {
    setIsWiggling(false);
    requestAnimationFrame(() => {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 600);
    });
  };

  const handleBtnClick = (btnId: string, message: string, isSubmit: boolean = false) => {
    setPoppedBtn(btnId);
    triggerToast(message);
    setTimeout(() => setPoppedBtn(null), 500);

    if (isSubmit) {
      if (phoneNumber.length === 10) {
        setTimeout(() => {
          setStep("otp");
          triggerToast("OTP sent to +91 " + phoneNumber);
        }, 600);
      } else {
        triggerToast("Please enter a valid 10-digit number");
      }
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) {
      const next = document.getElementById(`login-otp-${index + 1}`);
      next?.focus();
    }
  };

  const verifyOtp = () => {
    triggerToast("Logging in to Swasthya Setu…");
    setTimeout(() => {
      window.location.href = "/patient";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#DDEAE2] flex items-center justify-center p-0 sm:p-6 font-sans select-none">
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
              <label className="text-[13px] font-semibold text-[#123B2C] mb-2 block" htmlFor="phone">
                Mobile number
              </label>

              <div className="flex items-center bg-[#EAF7EF] border-[1.5px] border-[#CFEBDB] rounded-[14px] px-4 h-[56px] transition-all focus-within:border-[#0E7C4A] focus-within:bg-white focus-within:shadow-[0_8px_20px_-10px_rgba(14,124,74,0.35)] focus-within:-translate-y-[1px]">
                <span className="text-[15px] font-semibold text-[#123B2C] pr-3 border-r-[1.5px] border-[#CFEBDB] mr-3">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your 10-digit number"
                  maxLength={10}
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="border-none bg-transparent outline-none text-[16px] text-[#123B2C] w-full placeholder-[#A7B6AF]"
                />
              </div>

              <p className="text-[12.5px] text-[#7A8B84] mt-2.5">
                We'll send a one-time code to verify it's you.
              </p>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleBtnClick("login", "Logging in…", true)}
                  className={`h-[52px] rounded-[14px] text-[15.5px] font-semibold text-white bg-[#0E7C4A] hover:bg-[#0A5E39] shadow-[0_14px_24px_-12px_rgba(14,124,74,0.55)] hover:shadow-[0_20px_30px_-12px_rgba(14,124,74,0.55)] transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center justify-center ${
                    poppedBtn === "login" ? "animate-[popUp_0.45s_cubic-bezier(.34,1.56,.64,1)]" : "hover:-translate-y-1 hover:scale-[1.02]"
                  }`}
                >
                  <span>Log in</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBtnClick("signup", "Setting up your account…", true)}
                  className={`h-[52px] rounded-[14px] text-[15.5px] font-semibold text-[#0A5E39] bg-white border-[1.5px] border-[#CFEBDB] hover:bg-[#EAF7EF] hover:shadow-[0_16px_26px_-14px_rgba(18,59,44,0.25)] transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center justify-center ${
                    poppedBtn === "signup" ? "animate-[popUp_0.45s_cubic-bezier(.34,1.56,.64,1)]" : "hover:-translate-y-1 hover:scale-[1.02]"
                  }`}
                >
                  <span>Create an account</span>
                </button>
              </div>
            </div>
          ) : (
            /* OTP Verification Step */
            <div className="mt-8 sm:mt-10 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[13px] font-semibold text-[#123B2C]">
                  Enter 6-digit OTP
                </label>
                <button
                  onClick={() => setStep("phone")}
                  className="text-xs text-[#0E7C4A] font-semibold hover:underline"
                >
                  Change number
                </button>
              </div>

              <div className="flex justify-between gap-1.5 my-3">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`login-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-[#CFEBDB] bg-[#EAF7EF] text-[#123B2C] focus:bg-white focus:border-[#0E7C4A] outline-none"
                  />
                ))}
              </div>

              <p className="text-[12px] text-[#7A8B84] text-center">
                OTP sent to +91 {phoneNumber || "9876543210"}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={verifyOtp}
                  className="h-[52px] rounded-[14px] text-[15.5px] font-semibold text-white bg-[#0E7C4A] hover:bg-[#0A5E39] shadow-md transition-all flex items-center justify-center"
                >
                  Verify & Continue
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast("New OTP sent via SMS")}
                  className="text-xs text-[#0A5E39] font-medium text-center hover:underline py-1"
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
    </div>
  );
}
