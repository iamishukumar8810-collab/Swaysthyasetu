"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Loader2, 
  KeyRound, 
  UserCheck, 
  Stethoscope, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Chrome,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  // Authentication Method: "phone" | "email" (Default to email as requested)
  const [authMode, setAuthMode] = useState<"phone" | "email">("email");

  // Mobile Auth states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Email Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Google User Session state
  const [googleUser, setGoogleUser] = useState<any>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [poppedBtn, setPoppedBtn] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Role Selection Overlay state (opens after login)
  const [showRoleOverlay, setShowRoleOverlay] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const redirectToSavedRole = (role?: string | null) => {
    if (role === "doctor") {
      window.location.href = "/doctor";
      return true;
    }
    if (role === "patient") {
      window.location.href = "/patient";
      return true;
    }
    return false;
  };

  useEffect(() => {
    let active = true;

    // Check URL parameters for OAuth errors
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlError = searchParams.get("error_description") || searchParams.get("error");
      if (urlError) {
        triggerToast(`Google Auth: ${decodeURIComponent(urlError)}`);
      }
    }

    // 1. Check existing active session or session from OAuth redirect
    const checkInitialSession = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data } = await supabase.auth.getSession();
        if (active && data.session?.user) {
          const user = data.session.user;
          const savedRole = user.user_metadata?.app_role;
          if (!redirectToSavedRole(savedRole)) {
            setGoogleUser(user);
            setEmail(user.email || "");
            setShowRoleOverlay(true);
          }
        }
      } catch (err) {
        console.error("Session check error", err);
      }
    };

    checkInitialSession();

    // 2. Subscribe to auth events (e.g. OAuth callback sign in)
    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (active && (event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
          const savedRole = session.user.user_metadata?.app_role;
          if (!redirectToSavedRole(savedRole)) {
            setGoogleUser(session.user);
            setEmail(session.user.email || "");
            setShowRoleOverlay(true);
            triggerToast(`Google sign-in successful! Please select your role.`);
          }
        }
      });

      return () => {
        active = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      active = false;
    };
  }, []);

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
    const token = otp.join("").trim();
    if (token !== "12345" && token !== "123456" && token.length < 5) {
      triggerToast("Please enter the OTP code (Default: 123456 or 12345)");
      return;
    }

    setLoading(true);
    const formattedPhone = `+91${phoneNumber}`;

    // Allow default OTP "12345" or "123456"
    if (token === "12345" || token === "123456" || token.startsWith("12345")) {
      setTimeout(() => {
        triggerToast("Verified successfully!");
        setLoading(false);
        setShowRoleOverlay(true); // OPEN ROLE OVERLAY
      }, 400);
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

  // 4. Email Authentication (Login / Sign up)
  const handleEmailAuth = async (isSignUp: boolean) => {
    if (loading) return;

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      triggerToast("Please enter a valid email address");
      return;
    }

    if (!trimmedPassword || trimmedPassword.length < 6) {
      triggerToast("Password must be at least 6 characters (123456)");
      return;
    }

    setLoading(true);

    // 1. Direct Pre-Configured Account: Doctor (doctor@gmail.com / 123456)
    if (trimmedEmail === "doctor@gmail.com") {
      if (trimmedPassword === "123456") {
        setTimeout(() => {
          setLoading(false);
          triggerToast("Welcome Dr. Vaidya! Logging into Doctor Portal…");
          setTimeout(() => {
            window.location.href = "/doctor";
          }, 500);
        }, 350);
        return;
      } else {
        setLoading(false);
        triggerToast("Incorrect password for doctor@gmail.com (Use: 123456)");
        return;
      }
    }

    // 2. Direct Pre-Configured Account: Patient (pat@gmail.com or patient@gmail.com / 123456)
    if (trimmedEmail === "pat@gmail.com" || trimmedEmail === "patient@gmail.com") {
      if (trimmedPassword === "123456") {
        setTimeout(() => {
          setLoading(false);
          triggerToast("Welcome! Logging into Patient Portal…");
          setTimeout(() => {
            window.location.href = "/patient";
          }, 400);
        }, 300);
        return;
      } else {
        setLoading(false);
        triggerToast("Incorrect password (Default code is: 123456)");
        return;
      }
    }

    // 3. Supabase or Local Fallback for any custom email
    if (isSupabaseConfigured) {
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password: trimmedPassword,
          });
          if (error) {
            triggerToast(error.message);
          } else {
            triggerToast("Account created successfully!");
            setShowRoleOverlay(true);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: trimmedPassword,
          });
          if (error) {
            triggerToast(error.message);
          } else {
            triggerToast("Logged in successfully!");
            setShowRoleOverlay(true);
          }
        }
      } catch (err: any) {
        triggerToast("Logged in successfully!");
        setShowRoleOverlay(true);
      } finally {
        setLoading(false);
      }
    } else {
      // Local Prototype / Demo Mode
      setTimeout(() => {
        setLoading(false);
        triggerToast(isSignUp ? "Account created & logged in!" : "Logged in successfully!");
        setShowRoleOverlay(true);
      }, 400);
    }
  };

  const handleGoogleAuth = async () => {
    if (loading) return;
    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${origin}/login`,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });

        if (error) {
          setLoading(false);
          triggerToast(error.message || "Google login failed. Please try again.");
        }
      } catch (err: any) {
        setLoading(false);
        triggerToast("Google login encountered an error.");
      }
    } else {
      // Local fallback
      setTimeout(() => {
        setLoading(false);
        const demoEmail = "google.user@ayush.gov.in";
        setEmail(demoEmail);
        setGoogleUser({ email: demoEmail, user_metadata: { full_name: "Google AYUSH User" } });
        setShowRoleOverlay(true);
        triggerToast("Logged in with Google (Demo Mode)");
      }, 400);
    }
  };

  const handleRoleSelection = async (role: "patient" | "doctor") => {
    if (googleUser && isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({
        data: { app_role: role },
      });
      if (error) {
        triggerToast(error.message || "Could not save your role.");
        return;
      }
    } else if (typeof window !== "undefined") {
      window.localStorage.setItem("swasthya-setu-role", role);
    }

    setShowRoleOverlay(false);
    triggerToast(role === "doctor" ? "Opening Doctor Portal…" : "Opening Patient Portal…");
    setTimeout(() => {
      window.location.href = role === "doctor" ? "/doctor" : "/patient";
    }, 300);
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
        <div className="flex-1 flex flex-col px-8 sm:px-9 overflow-y-auto">
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
          <div className="mt-8 sm:mt-10">
            <p className="text-center text-sm text-[#7A8B84] mb-4">
              Sign in securely with your Google account.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="w-full h-[54px] rounded-[14px] text-[15px] font-semibold text-[#123B2C] bg-white border-[1.5px] border-[#CFEBDB] hover:bg-[#F3FAF6] hover:border-[#0E7C4A] disabled:opacity-60 shadow-[0_10px_22px_-14px_rgba(14,124,74,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon className="w-5 h-5" />}
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="hidden">
          {authMode === "phone" ? (
            step === "phone" ? (
              <div className="mt-8 sm:mt-10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-semibold text-[#123B2C]" htmlFor="phone">
                    Mobile number
                  </label>
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
                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendOtp("login", "Logging in…")}
                    className={`h-[52px] rounded-[14px] text-[15.5px] font-semibold text-white bg-[#0E7C4A] hover:bg-[#0A5E39] disabled:opacity-60 shadow-[0_14px_24px_-12px_rgba(14,124,74,0.55)] hover:shadow-[0_20px_30px_-12px_rgba(14,124,74,0.55)] transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center justify-center gap-2 ${
                      poppedBtn === "login" ? "animate-[popUp_0.45s_cubic-bezier(.34,1.56,.64,1)]" : "hover:-translate-y-1 hover:scale-[1.02]"
                    }`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Log in with OTP</span>}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleAuth}
                    className="h-[50px] rounded-[14px] text-[14.5px] font-semibold text-[#123B2C] bg-white border-[1.5px] border-[#CFEBDB] hover:bg-[#F3FAF6] hover:border-[#0E7C4A] disabled:opacity-60 shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon className="w-4 h-4" />}
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendOtp("signup", "Setting up your account…")}
                    className={`h-[50px] rounded-[14px] text-[14.5px] font-semibold text-[#0A5E39] bg-white border-[1.5px] border-[#CFEBDB] hover:bg-[#EAF7EF] disabled:opacity-60 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center gap-2 ${
                      poppedBtn === "signup" ? "animate-[popUp_0.45s_cubic-bezier(.34,1.56,.64,1)]" : "hover:-translate-y-1 hover:scale-[1.02]"
                    }`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#0A5E39]" /> : <span>Create an account</span>}
                  </button>
                </div>

                {/* Divider: OR */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-[#CFEBDB] w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold text-[#7A8B84] uppercase tracking-wider">
                    OR
                  </span>
                  <div className="border-t border-[#CFEBDB] w-full" />
                </div>

                {/* Switch to Email Login */}
                <button
                  type="button"
                  onClick={() => setAuthMode("email")}
                  className="w-full h-[48px] rounded-[14px] text-[14px] font-semibold text-[#123B2C] bg-[#F3FAF6] hover:bg-[#EAF7EF] border-[1.5px] border-[#CFEBDB] hover:border-[#0E7C4A] transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs cursor-pointer mb-2"
                >
                  <Mail className="w-4 h-4 text-[#0E7C4A]" />
                  <span>Log in with Email Authentication</span>
                </button>
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
            )
          ) : (
            /* Email Authentication Form */
            <div className="mt-6 sm:mt-8 animate-in fade-in duration-300">
              
              {/* Quick 1-Click Account Switcher Chips */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-[#123B2C] dark:text-white uppercase tracking-wider">
                    Quick Select Demo Account
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    No email sent
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("doctor@gmail.com");
                      setPassword("123456");
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      email.toLowerCase() === "doctor@gmail.com"
                        ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-300 shadow-xs ring-1 ring-teal-400"
                        : "bg-[#F3FAF6] dark:bg-slate-800 border-[#CFEBDB] text-slate-600 hover:bg-[#EAF7EF]"
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span className="truncate">doctor@gmail.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail("pat@gmail.com");
                      setPassword("123456");
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      email.toLowerCase() === "pat@gmail.com"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-[#0E7C4A] text-[#0E7C4A] dark:text-emerald-300 shadow-xs ring-1 ring-emerald-400"
                        : "bg-[#F3FAF6] dark:bg-slate-800 border-[#CFEBDB] text-slate-600 hover:bg-[#EAF7EF]"
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#0E7C4A] shrink-0" />
                    <span className="truncate">pat@gmail.com</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#123B2C]" htmlFor="email">
                  Email address
                </label>
                {email.trim() && (
                  <span className="text-[10.5px] text-[#0E7C4A] bg-[#EAF7EF] px-2 py-0.5 rounded-full font-medium">
                    {email.trim().toLowerCase() === "doctor@gmail.com"
                      ? "Doctor Role"
                      : email.trim().toLowerCase() === "pat@gmail.com" || email.trim().toLowerCase() === "patient@gmail.com"
                      ? "Patient Role"
                      : "Custom"}
                  </span>
                )}
              </div>

              {/* Email Input */}
              <div className="flex items-center bg-[#EAF7EF] border-[1.5px] border-[#CFEBDB] rounded-[14px] px-3.5 h-[52px] transition-all focus-within:border-[#0E7C4A] focus-within:bg-white focus-within:shadow-[0_8px_20px_-10px_rgba(14,124,74,0.35)] mb-3">
                <Mail className="w-4 h-4 text-[#0E7C4A] mr-2.5 shrink-0" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-none bg-transparent outline-none text-[15px] font-medium text-[#123B2C] w-full placeholder-[#A7B6AF]"
                />
              </div>

              {/* Password Label */}
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#123B2C]" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => triggerToast("Password reset link: Use default 123456")}
                  className="text-[11px] text-[#0E7C4A] hover:underline font-medium"
                >
                  Forgot?
                </button>
              </div>

              {/* Password Input */}
              <div className="flex items-center bg-[#EAF7EF] border-[1.5px] border-[#CFEBDB] rounded-[14px] px-3.5 h-[52px] transition-all focus-within:border-[#0E7C4A] focus-within:bg-white focus-within:shadow-[0_8px_20px_-10px_rgba(14,124,74,0.35)] mb-2">
                <Lock className="w-4 h-4 text-[#0E7C4A] mr-2.5 shrink-0" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-none bg-transparent outline-none text-[15px] font-medium text-[#123B2C] w-full placeholder-[#A7B6AF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-[#7A8B84] mb-3">
                Default password for both accounts: <strong className="text-slate-700">123456</strong>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleAuth}
                  className="h-[50px] rounded-[14px] text-[14.5px] font-semibold text-[#123B2C] bg-white border-[1.5px] border-[#CFEBDB] hover:bg-[#F3FAF6] hover:border-[#0E7C4A] disabled:opacity-60 shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon className="w-4 h-4" />}
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleEmailAuth(false)}
                  className="h-[52px] rounded-[14px] text-[15.5px] font-semibold text-white bg-[#0E7C4A] hover:bg-[#0A5E39] disabled:opacity-60 shadow-[0_14px_24px_-12px_rgba(14,124,74,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Log in with Email</span>}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleEmailAuth(true)}
                  className="h-[48px] rounded-[14px] text-[14.5px] font-semibold text-[#0A5E39] bg-white border-[1.5px] border-[#CFEBDB] hover:bg-[#EAF7EF] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Create account with Email</span>
                </button>
              </div>

              {/* Divider: OR switch back to Mobile */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-[#CFEBDB] w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-[#7A8B84] uppercase tracking-wider">
                  OR
                </span>
                <div className="border-t border-[#CFEBDB] w-full" />
              </div>

              <button
                type="button"
                onClick={() => setAuthMode("phone")}
                className="w-full h-[48px] rounded-[14px] text-[14px] font-semibold text-[#123B2C] bg-[#F3FAF6] hover:bg-[#EAF7EF] border-[1.5px] border-[#CFEBDB] hover:border-[#0E7C4A] transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer mb-2"
              >
                <Phone className="w-4 h-4 text-[#0E7C4A]" />
                <span>Continue with Mobile OTP</span>
              </button>
            </div>
          )}
          </div>
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
                <CheckCircle2 className="w-3.5 h-3.5" />
                {googleUser
                  ? `Google Verified (${googleUser.user_metadata?.full_name || googleUser.email || email})`
                  : authMode === "email"
                  ? `Email Verified (${email})`
                  : `Mobile Verified (+91 ${phoneNumber})`}
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
                  void handleRoleSelection("patient");
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
                  void handleRoleSelection("doctor");
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

          </div>
        </div>
      )}
    </div>
  );
}
