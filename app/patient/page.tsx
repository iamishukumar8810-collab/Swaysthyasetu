"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Home, 
  Heart, 
  Stethoscope, 
  FileText, 
  Calendar, 
  Pill, 
  Leaf, 
  MessageSquare, 
  Settings, 
  Search, 
  Bell, 
  CalendarCheck, 
  CalendarClock, 
  UploadCloud, 
  UserPlus, 
  UserCheck, 
  History, 
  Activity, 
  Bot, 
  Mic, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sun, 
  Moon, 
  Utensils, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Flower2,
  X,
  Plus,
  Trash2,
  Clock,
  Check,
  HelpCircle,
  FileUp,
  RotateCcw
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import Chatbot from "@/components/Chatbot";
import { useLanguage } from "@/context/LanguageContext";
import { 
  initialPatientData, 
  PatientProfile, 
  Medication, 
  ConsultationVisit, 
  MedicalReport 
} from "@/lib/patient-data";
import { DoctorProfile, getDoctors, subscribeToDoctors } from "@/lib/doctorStore";

export default function PatientDashboardPage() {
  const { t, language } = useLanguage();
  // --- Persistent State ---
  const [patientData, setPatientData] = useState<{
    profile: PatientProfile;
    medicines: Medication[];
    visits: ConsultationVisit[];
    reports: MedicalReport[];
  }>(initialPatientData);

  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [symptomInput, setSymptomInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: "user" | "ai"; text: string; time: string }>>([]);

  // Doctors directory (published doctors)
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);

  useEffect(() => {
    try {
      setDoctors(getDoctors());
      const unsub = subscribeToDoctors((updated) => setDoctors(updated || []));
      return () => unsub && unsub();
    } catch (e) {
      console.error("Failed to load doctors directory", e);
    }
  }, []);

  // Notification dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Report Processed", desc: "Blood Test Report extracted successfully via OCR.", time: "10 mins ago", read: false },
    { id: 2, title: "Follow-up Reminder", desc: "Your physician suggested an Agni checkup this week.", time: "2 hours ago", read: false },
  ]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [showWellnessModal, setShowWellnessModal] = useState<{ open: boolean; title: string; desc: string; content: string } | null>(null);

  // Form states for modals
  const [newApptDoctor, setNewApptDoctor] = useState("");
  const [newApptDate, setNewApptDate] = useState("Tomorrow, 10:30 AM");
  const [newApptReason, setNewApptReason] = useState("Acidity and stomach discomfort follow-up");

  const [newReportName, setNewReportName] = useState("");
  const [newReportType, setNewReportType] = useState<"PDF" | "Image" | "Lab">("PDF");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [durationInput, setDurationInput] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("swasthya_setu_patient_data");
      if (saved) {
        setPatientData(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load patient data from localStorage", e);
    }
  }, []);

  // Sync to localStorage
  const savePatientData = (updated: typeof patientData) => {
    setPatientData(updated);
    try {
      localStorage.setItem("swasthya_setu_patient_data", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  // Dynamic Greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
  // Dynamic Case Readiness Score Calculation
  const calculateReadiness = () => {
    let score = 78; // Base with 5 items checked
    if (patientData.profile.durationOfSymptoms) {
      score += 22; // Completes to 100%
    }
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadiness();

  // Booking Appointment Action
  const handleConfirmBooking = () => {
    const updated = {
      ...patientData,
      profile: {
        ...patientData.profile,
        nextAppointment: {
          scheduled: true,
          date: newApptDate,
          doctor: newApptDoctor.split(" (")[0],
          specialty: newApptDoctor.includes("(") ? newApptDoctor.split("(")[1].replace(")", "") : "Ayurveda",
        },
      },
      visits: [
        {
          id: `vis-${Date.now()}`,
          doctorName: newApptDoctor.split(" (")[0],
          specialty: newApptDoctor.includes("(") ? newApptDoctor.split("(")[1].replace(")", "") : "Ayurveda",
          date: newApptDate,
          reason: newApptReason,
          status: "Upcoming" as const,
        },
        ...patientData.visits,
      ],
    };

    savePatientData(updated);
    setShowBookModal(false);
    triggerToast(`Appointment scheduled with ${newApptDoctor.split(" (")[0]}!`);
  };

  const handleCancelAppointment = () => {
    const updated = {
      ...patientData,
      profile: {
        ...patientData.profile,
        nextAppointment: {
          scheduled: false,
        },
      },
    };
    savePatientData(updated);
    triggerToast("Scheduled appointment cancelled.");
  };

  const handleFileSelection = (file?: File | null) => {
    if (!file) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"]; 
    const isAllowed = file.type === "application/pdf" || /^image\/(jpeg|png|webp)$/i.test(file.type);

    if (!isAllowed) {
      triggerToast("Please upload a PDF, JPG, PNG, or WEBP file.");
      return;
    }

    setSelectedFile(file);
    if (!newReportName.trim()) {
      setNewReportName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Uploading Report Action
  const handleUploadReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      triggerToast("Please choose a file to upload");
      return;
    }

    if (!newReportName.trim()) {
      triggerToast("Please enter a name for the report");
      return;
    }

    const fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    const url = URL.createObjectURL(selectedFile);

    const newReport: MedicalReport = {
      id: `rep-${Date.now()}`,
      name: newReportName.trim(),
      date: "Today • " + new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      type: newReportType,
      size: fileSize,
      url,
    };

    const updated = {
      ...patientData,
      reports: [newReport, ...patientData.reports],
    };

    savePatientData(updated);
    setNewReportName("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowUploadModal(false);
    triggerToast(`Report "${newReport.name}" uploaded & queued for OCR!`);
  };

  const handleDeleteReport = (id: string, name: string) => {
    const updated = {
      ...patientData,
      reports: patientData.reports.filter((r) => r.id !== id),
    };
    savePatientData(updated);
    triggerToast(`Deleted report: ${name}`);
  };

  // Complete Profile Action (Updates Duration -> 100% Readiness)
  const handleCompleteReadiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationInput.trim()) {
      triggerToast("Please select or enter the symptom duration");
      return;
    }

    const updated = {
      ...patientData,
      profile: {
        ...patientData.profile,
        durationOfSymptoms: durationInput,
      },
    };

    savePatientData(updated);
    setShowReadinessModal(false);
    triggerToast("Profile completed! Case readiness is now 100% ✓");
  };

  // Conversational AI Health Assistant Handler
  const handleTalkToAi = () => {
    if (!symptomInput.trim()) {
      triggerToast("Please type or speak your symptoms first");
      return;
    }

    const userText = symptomInput.trim();
    setSymptomInput("");
    setIsAiThinking(true);

    const newChat = [
      ...aiChatHistory,
      { role: "user" as const, text: userText, time: "Just now" },
    ];
    setAiChatHistory(newChat);

    setTimeout(() => {
      // Dynamic response tailored to symptoms
      let aiReply = "Namaste! I have analyzed your symptoms. ";
      const lower = userText.toLowerCase();

      if (lower.includes("pet") || lower.includes("stomach") || lower.includes("acid") || lower.includes("jalan") || lower.includes("burn")) {
        aiReply += "Your symptoms point towards Pitta dosha aggravation and hyper-acidic Agni (Amlapitta). I recommend taking coriander seed infused water, avoiding sour/fermented foods, and taking your Avipattikar Churna after dinner.";
      } else if (lower.includes("sleep") || lower.includes("neend") || lower.includes("tired") || lower.includes("fatigue")) {
        aiReply += "Disturbed sleep and fatigue indicate Vata vitiation. Practice 5 minutes of Sheetali Pranayama before sleeping, and take 1/2 teaspoon of Ashwagandha powder with warm milk at bedtime.";
      } else {
        aiReply += "I have documented these symptoms into your pre-consultation sheet. The attending physician will review them during your OPD consultation.";
      }

      // Automatically add new symptom to patient concerns if not already present
      const firstWord = userText.length > 25 ? userText.slice(0, 25) + "…" : userText;
      if (!patientData.profile.concerns.includes(firstWord)) {
        const updated = {
          ...patientData,
          profile: {
            ...patientData.profile,
            concerns: [firstWord, ...patientData.profile.concerns.slice(0, 4)],
          },
        };
        savePatientData(updated);
      }

      setAiChatHistory([
        ...newChat,
        { role: "ai" as const, text: aiReply, time: "Just now" },
      ]);
      setIsAiThinking(false);
      triggerToast("AI clinical assessment updated!");
    }, 1200);
  };

  // Voice recognition simulation
  const handleStartVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      triggerToast("Listening… Speak your symptoms in Hindi or English");
      setTimeout(() => {
        setSymptomInput("Mujhe pet me tez jalan aur khana khane ke baad bhari-pan lagta hai.");
        setIsRecording(false);
        triggerToast("Voice transcribed successfully!");
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  // Removed demo reset to avoid persisting mock/demo data in production

  // Filtering based on Search Query
  const filteredVisits = patientData.visits.filter((v) =>
    v.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReports = patientData.reports.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F9F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans selection:bg-[#0E7C4A] selection:text-white">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-[#CFEBDB]/80 dark:border-slate-800 flex flex-col justify-between p-5 shrink-0 hidden lg:flex">
        <div className="space-y-6">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-3 group px-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0E7C4A] flex items-center justify-center text-white shadow-md shadow-[#0E7C4A]/25 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-[#123B2C] dark:text-white tracking-tight">
                Swasthya<span className="text-[#0E7C4A] dark:text-emerald-400">Setu</span>
              </span>
              <p className="text-[10.5px] text-[#7A8B84] dark:text-slate-400 font-medium">
                Patient Portal
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-2">
            {[
              { id: "home", label: "Home", icon: Home },
              { id: "my-health", label: "My Health", icon: Heart },
              { id: "consultations", label: "Consultations", icon: Stethoscope },
              { id: "reports", label: "Reports & Documents", icon: FileText },
              { id: "appointments", label: "Appointments", icon: Calendar },
              { id: "medications", label: "Medications", icon: Pill },
              { id: "ayush-insights", label: "AYUSH Insights", icon: Leaf },
              { id: "messages", label: "Messages", icon: MessageSquare },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    if (item.id === "consultations" || item.id === "appointments") {
                      setShowBookModal(true);
                    } else if (item.id === "reports") {
                      setShowUploadModal(true);
                    } else if (item.id === "medications") {
                      setShowMedicineModal(true);
                    } else if (item.id === "my-health") {
                      setShowReadinessModal(true);
                    } else {
                      triggerToast(`Viewing ${item.label}`);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#EAF7EF] dark:bg-emerald-950/70 text-[#0E7C4A] dark:text-emerald-300 shadow-sm"
                      : "text-[#7A8B84] dark:text-slate-400 hover:text-[#123B2C] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#0E7C4A] dark:text-emerald-400" : ""}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Decorative Card */}
        <div className="space-y-2">
          <div className="relative rounded-3xl p-4 bg-gradient-to-br from-[#EAF7EF] to-[#DFF3E7] dark:from-emerald-950/50 dark:to-slate-800/50 border border-[#CFEBDB] dark:border-slate-800 overflow-hidden text-left">
            <div className="relative z-10 space-y-1">
              <span className="text-xs font-bold text-[#0E7C4A] dark:text-emerald-400 block">
                Ayurveda
              </span>
              <p className="text-xs font-semibold text-[#123B2C] dark:text-white leading-tight">
                for a healthier tomorrow
              </p>
            </div>
            <Leaf className="absolute -bottom-2 -right-2 w-16 h-16 text-[#0E7C4A]/15 dark:text-emerald-400/10 pointer-events-none" />
          </div>

          {/* Demo reset removed to prevent restoring mock/sample data */}
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOPBAR */}
        <header className="bg-white dark:bg-slate-900 border-b border-[#CFEBDB]/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          {/* Brand for mobile */}
          <div className="flex items-center gap-3">
            <Link href="/" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0E7C4A] flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#123B2C] dark:text-white">
                Swasthya<span className="text-[#0E7C4A]">Setu</span>
              </span>
            </Link>

            <div className="hidden xl:block">
              <span className="text-lg font-extrabold text-[#123B2C] dark:text-white">
                Swasthya Setu
              </span>
              <span className="text-xs text-[#7A8B84] dark:text-slate-400 ml-2">
                Your Health • Our Tradition • Better Tomorrow
              </span>
            </div>
          </div>

          {/* Dynamic Live Search Bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="relative flex items-center bg-[#F4F9F6] dark:bg-slate-800 border border-[#CFEBDB] dark:border-slate-700 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#0E7C4A] focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-[#7A8B84] mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors, symptoms, reports..."
                className="w-full text-xs sm:text-sm bg-transparent outline-none text-[#123B2C] dark:text-slate-100 placeholder-[#7A8B84]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#7A8B84] hover:text-[#123B2C] p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions: Language Selector, Theme Toggle, Notifications, Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 relative">
            <LanguageSelector />
            <ThemeToggle />

            {/* Notification Bell with Dynamic Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-full bg-[#EAF7EF] dark:bg-slate-800 border border-[#CFEBDB] dark:border-slate-700 flex items-center justify-center text-[#123B2C] dark:text-slate-200 hover:bg-[#DFF3E7] transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#CFEBDB] dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-[#123B2C] dark:text-white">Notifications</span>
                    <button
                      onClick={() => {
                        setNotifications(notifications.map((n) => ({ ...n, read: true })));
                        triggerToast("Marked all as read");
                      }}
                      className="text-[10px] text-[#0E7C4A] hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-[#F4F9F6] dark:bg-slate-800 text-xs space-y-0.5">
                        <div className="flex justify-between font-bold text-[#123B2C] dark:text-white">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-[#7A8B84] font-normal">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#7A8B84] leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-[#123B2C] text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                RK
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-[#123B2C] dark:text-white block leading-tight">
                  {patientData.profile.name}
                </span>
                <span className="text-[11px] text-[#7A8B84] dark:text-slate-400">
                  Patient ({patientData.profile.prakriti})
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
          
          {/* 1. DYNAMIC WELCOME BANNER */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#EAF7EF] via-[#E1F6EB] to-[#EAF7EF] dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/30 border border-[#CFEBDB] dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1 z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2C] dark:text-white tracking-tight">
                {language === "en" ? `${getGreeting()}, ${patientData.profile.name}!` : t("patient.greeting", `${getGreeting()}, ${patientData.profile.name}!`)}
              </h1>
              <p className="text-sm text-[#7A8B84] dark:text-slate-300">
                {t("patient.tagline", "Your health journey matters. Let's take the next step together.")}
              </p>
            </div>

            {/* Dynamic Next Appointment Pill */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 z-10">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-[#CFEBDB] dark:border-slate-700 shadow-xs">
                <Calendar className="w-5 h-5 text-[#0E7C4A]" />
                <div className="text-left">
                  <span className="text-[11px] font-bold text-[#7A8B84] dark:text-slate-400 block uppercase">
                    Next Appointment
                  </span>
                  <span className="text-xs font-semibold text-[#123B2C] dark:text-white">
                    {patientData.profile.nextAppointment.scheduled
                      ? `${patientData.profile.nextAppointment.date} (${patientData.profile.nextAppointment.doctor})`
                      : "Not scheduled"}
                  </span>
                </div>
              </div>

              {patientData.profile.nextAppointment.scheduled ? (
                <button
                  onClick={handleCancelAppointment}
                  className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel Booking
                </button>
              ) : (
                <button
                  onClick={() => setShowBookModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-[#0A5E39] hover:bg-[#0E7C4A] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  Book Appointment
                </button>
              )}
            </div>

            <Leaf className="absolute -left-4 -bottom-4 w-24 h-24 text-[#0E7C4A]/10 pointer-events-none" />
            <Leaf className="absolute -right-4 -top-4 w-24 h-24 text-[#0E7C4A]/10 pointer-events-none" />
          </div>

          {/* 2. FOUR QUICK ACTION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Action 1: Book Consultation */}
            <div 
              onClick={() => setShowBookModal(true)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 hover:border-[#0E7C4A] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#EAF7EF] dark:bg-emerald-950 text-[#0E7C4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#123B2C] dark:text-white group-hover:text-[#0E7C4A] transition-colors">
                    Book Consultation
                  </h4>
                  <p className="text-[11.5px] text-[#7A8B84] dark:text-slate-400">
                    Find an AYUSH doctor
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A8B84] group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Action 2: Upload Reports */}
            <div 
              onClick={() => setShowUploadModal(true)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 hover:border-[#0E7C4A] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#EAF7EF] dark:bg-emerald-950 text-[#0E7C4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#123B2C] dark:text-white group-hover:text-[#0E7C4A] transition-colors">
                    Upload Reports
                  </h4>
                  <p className="text-[11.5px] text-[#7A8B84] dark:text-slate-400">
                    Add your medical reports
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A8B84] group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Action 3: Update Health Info */}
            <div 
              onClick={() => setShowReadinessModal(true)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 hover:border-[#0E7C4A] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#EAF7EF] dark:bg-emerald-950 text-[#0E7C4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#123B2C] dark:text-white group-hover:text-[#0E7C4A] transition-colors">
                    Update Health Info
                  </h4>
                  <p className="text-[11.5px] text-[#7A8B84] dark:text-slate-400">
                    Help us give better care
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A8B84] group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Action 4: View Medical History */}
            <div 
              onClick={() => triggerToast(`Displaying ${patientData.visits.length} recorded consultations.`)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 hover:border-[#0E7C4A] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#EAF7EF] dark:bg-emerald-950 text-[#0E7C4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#123B2C] dark:text-white group-hover:text-[#0E7C4A] transition-colors">
                    View Medical History
                  </h4>
                  <p className="text-[11.5px] text-[#7A8B84] dark:text-slate-400">
                    Your past visits & reports
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A8B84] group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

          </div>

          {/* 3. TWO-COLUMN DASHBOARD GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT / MAIN COLUMN (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* SECTION: YOUR HEALTH SUMMARY */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#123B2C] dark:text-white">
                      Your Health Summary
                    </h3>
                    <p className="text-xs text-[#7A8B84] dark:text-slate-400">
                      A quick view of your recent activity and health information.
                    </p>
                  </div>
                  <button 
                    onClick={() => triggerToast("Prakriti: Pitta-Kapha | Agni: Tikshna | Sara: Madhyama")}
                    className="text-xs font-semibold text-[#0E7C4A] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Full History &rarr;
                  </button>
                </div>

                {/* 4 Summary Stat Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                  
                  {/* Current Concerns */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/60 border border-[#CFEBDB]/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#0E7C4A]" />
                      <span className="text-xs font-bold text-[#123B2C] dark:text-white">
                        Current Concerns
                      </span>
                    </div>
                    <ul className="text-xs text-[#7A8B84] dark:text-slate-300 space-y-1 pl-1">
                      {patientData.profile.concerns.map((c, i) => (
                        <li key={i} className="truncate">• {c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Current Medicines */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/60 border border-[#CFEBDB]/80 dark:border-slate-700/80 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-[#0E7C4A]" />
                        <span className="text-xs font-bold text-[#123B2C] dark:text-white">
                          Current Medicines
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#123B2C] dark:text-slate-200 mt-2">
                        {patientData.medicines.length} medicines
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMedicineModal(true)}
                      className="w-full py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#CFEBDB] text-[11px] font-bold text-[#0E7C4A] hover:bg-[#EAF7EF] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Last Consultation */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/60 border border-[#CFEBDB]/80 dark:border-slate-700/80 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-[#0E7C4A]" />
                      <span className="text-xs font-bold text-[#123B2C] dark:text-white">
                        Last Consultation
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#123B2C] dark:text-slate-200">
                      {patientData.visits[0]?.date || "None"}
                    </p>
                    <p className="text-[11px] text-[#7A8B84] truncate">
                      {patientData.visits[0]?.doctorName || "N/A"}
                    </p>
                    <span className="inline-block text-[10px] font-bold bg-[#EAF7EF] text-[#0E7C4A] px-2 py-0.5 rounded-full">
                      Ayurveda
                    </span>
                  </div>

                  {/* Next Follow-up */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/60 border border-[#CFEBDB]/80 dark:border-slate-700/80 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-[#0E7C4A]" />
                        <span className="text-xs font-bold text-[#123B2C] dark:text-white">
                          Next Follow-up
                        </span>
                      </div>
                      <p className="text-xs text-[#7A8B84] mt-2 truncate">
                        {patientData.profile.nextAppointment.scheduled
                          ? patientData.profile.nextAppointment.date
                          : "Not scheduled"}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBookModal(true)}
                      className="w-full py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#CFEBDB] text-[11px] font-bold text-[#0E7C4A] hover:bg-[#EAF7EF] transition-colors cursor-pointer"
                    >
                      {patientData.profile.nextAppointment.scheduled ? "Reschedule" : "Book Now"}
                    </button>
                  </div>

                </div>
              </div>

              {/* SECTION: TWO ADJACENT CARDS (Your Recent Visits & Your Reports) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Your Recent Visits (Dynamic Filtered List) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0E7C4A]" /> Your Recent Visits
                    </h3>
                    <span className="text-xs text-[#7A8B84] font-medium">
                      {filteredVisits.length} visits
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredVisits.length === 0 ? (
                      <p className="text-xs text-[#7A8B84] py-4 text-center">No visits match your search.</p>
                    ) : (
                      filteredVisits.slice(0, 3).map((visit) => (
                        <div 
                          key={visit.id}
                          className="p-3.5 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/50 border border-[#CFEBDB]/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-center shrink-0 pr-2 border-r border-[#CFEBDB] dark:border-slate-700">
                              <span className="text-xs font-black text-[#123B2C] dark:text-white block">
                                {visit.date.split(" ")[0]}
                              </span>
                              <span className="text-[10px] text-[#7A8B84] uppercase block">
                                {visit.date.split(" ")[1] || "Visit"}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#123B2C] dark:text-white">
                                {visit.doctorName}
                              </h4>
                              <p className="text-[10.5px] text-[#0E7C4A] font-medium">{visit.specialty}</p>
                              <p className="text-[11px] text-[#7A8B84] mt-0.5 line-clamp-1">
                                Reason: {visit.reason}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 space-y-1.5">
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              visit.status === "Completed"
                                ? "text-[#0E7C4A] bg-[#EAF7EF]"
                                : "text-amber-700 bg-amber-50"
                            }`}>
                              {visit.status}
                            </span>
                            <button 
                              onClick={() => triggerToast(`Doctor Note: ${visit.prescriptionNotes || visit.reason}`)}
                              className="block text-[10.5px] font-semibold text-[#7A8B84] hover:text-[#0E7C4A] cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Your Reports (Dynamic List with Upload and Delete) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0E7C4A]" /> Your Reports
                      </h3>
                      <span className="text-xs text-[#7A8B84] font-medium">
                        {filteredReports.length} uploaded
                      </span>
                    </div>

                    <div className="space-y-2.5 mt-3">
                      {filteredReports.length === 0 ? (
                        <p className="text-xs text-[#7A8B84] py-4 text-center">No reports found.</p>
                      ) : (
                        filteredReports.slice(0, 3).map((report) => (
                          <div 
                            key={report.id}
                            className="p-2.5 rounded-xl bg-[#F4F9F6] dark:bg-slate-800/50 border border-[#CFEBDB]/80 dark:border-slate-700/60 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="w-4 h-4 text-[#0E7C4A] shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-[#123B2C] dark:text-white truncate">
                                  {report.name}
                                </h4>
                                <p className="text-[10px] text-[#7A8B84]">
                                  {report.date} • {report.type} {report.size && `(${report.size})`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                onClick={() => triggerToast(`Downloading ${report.name}…`)}
                                className="p-1.5 rounded-lg hover:bg-white text-[#7A8B84] hover:text-[#0E7C4A] cursor-pointer"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteReport(report.id, report.name)}
                                className="p-1.5 rounded-lg hover:bg-white text-[#7A8B84] hover:text-red-500 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full mt-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#CFEBDB] hover:bg-[#EAF7EF] text-xs font-bold text-[#0E7C4A] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload More Reports</span>
                  </button>
                </div>

              </div>

              {/* SECTION: AYUSH WELLNESS & LIFESTYLE (Interactive Modals) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#0E7C4A]" /> AYUSH Wellness & Lifestyle
                  </h3>
                  <p className="text-xs text-[#7A8B84] dark:text-slate-400">
                    Small steps for a healthier you • Based on your Prakriti ({patientData.profile.prakriti}) and health history
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                  {/* Diet Suggestion */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/50 border border-[#CFEBDB]/80 dark:border-slate-700/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#0E7C4A] flex items-center justify-center">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#123B2C] dark:text-white">Diet Suggestion</h4>
                      <p className="text-[11px] text-[#7A8B84] leading-relaxed">
                        Light and warm meals, avoid spicy and oily food.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowWellnessModal({
                        open: true,
                        title: "Ayurvedic Diet Plan (Ahara)",
                        desc: "Personalized for Pitta-Kapha Constitution",
                        content: initialPatientData.wellness.diet.content,
                      })}
                      className="text-[11px] font-bold text-[#0E7C4A] hover:underline text-left cursor-pointer pt-1"
                    >
                      View Plan &rarr;
                    </button>
                  </div>

                  {/* Daily Routine */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/50 border border-[#CFEBDB]/80 dark:border-slate-700/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#0E7C4A] flex items-center justify-center">
                        <Sun className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#123B2C] dark:text-white">Daily Routine</h4>
                      <p className="text-[11px] text-[#7A8B84] leading-relaxed">
                        Improve sleep, reduce screen time before bed.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowWellnessModal({
                        open: true,
                        title: "Dinacharya Routine",
                        desc: "Optimal Circadian Rhythms for Better Sleep",
                        content: initialPatientData.wellness.routine.content,
                      })}
                      className="text-[11px] font-bold text-[#0E7C4A] hover:underline text-left cursor-pointer pt-1"
                    >
                      View Routine &rarr;
                    </button>
                  </div>

                  {/* Herbal Guidance */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/50 border border-[#CFEBDB]/80 dark:border-slate-700/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#0E7C4A] flex items-center justify-center">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#123B2C] dark:text-white">Herbal Guidance</h4>
                      <p className="text-[11px] text-[#7A8B84] leading-relaxed">
                        Ashwagandha & Brahmi for stress and fatigue.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowWellnessModal({
                        open: true,
                        title: "Classical Herbal Rasayanas",
                        desc: "Rejuvenative herbs for vitality and calmness",
                        content: initialPatientData.wellness.herbs.content,
                      })}
                      className="text-[11px] font-bold text-[#0E7C4A] hover:underline text-left cursor-pointer pt-1"
                    >
                      Learn More &rarr;
                    </button>
                  </div>

                  {/* Mind & Stress */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/50 border border-[#CFEBDB]/80 dark:border-slate-700/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#0E7C4A] flex items-center justify-center">
                        <Flower2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#123B2C] dark:text-white">Mind & Stress</h4>
                      <p className="text-[11px] text-[#7A8B84] leading-relaxed">
                        Try 5 minutes of deep breathing every day.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowWellnessModal({
                        open: true,
                        title: "Pranayama & Manas Shanti",
                        desc: "Breathwork techniques for calming the mind",
                        content: initialPatientData.wellness.mind.content,
                      })}
                      className="text-[11px] font-bold text-[#0E7C4A] hover:underline text-left cursor-pointer pt-1"
                    >
                      View Tips &rarr;
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. DYNAMIC AI HEALTH ASSISTANT */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#EAF7EF] dark:bg-emerald-950 text-[#0E7C4A] flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#123B2C] dark:text-white">
                      AI Health Assistant
                    </h3>
                    <p className="text-xs text-[#7A8B84] dark:text-slate-400">
                      Tell us your symptoms in your own words.
                    </p>
                  </div>
                </div>

                {/* Chat History if any */}
                {aiChatHistory.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2.5 p-2.5 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800/70 border border-[#CFEBDB]/60 text-xs">
                    {aiChatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl ${
                          msg.role === "user"
                            ? "bg-[#0E7C4A] text-white ml-auto max-w-[85%]"
                            : "bg-white dark:bg-slate-900 text-[#123B2C] dark:text-slate-100 border border-[#CFEBDB] mr-auto max-w-[90%]"
                        }`}
                      >
                        <span className="text-[9.5px] opacity-75 block font-mono">
                          {msg.role === "user" ? "You" : "Swasthya AI"}
                        </span>
                        <p className="mt-0.5 leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input with Voice Mic */}
                <div className="relative rounded-2xl border border-[#CFEBDB] dark:border-slate-700 bg-[#F4F9F6] dark:bg-slate-800 p-3 focus-within:border-[#0E7C4A] focus-within:bg-white transition-all">
                  <textarea
                    rows={3}
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="Describe what's bothering you..."
                    className="w-full text-xs sm:text-sm bg-transparent outline-none text-[#123B2C] dark:text-slate-100 placeholder-[#7A8B84] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleTalkToAi();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] text-[#7A8B84]">
                      {isRecording ? "Listening…" : "Voice or text"}
                    </span>
                    <button
                      type="button"
                      onClick={handleStartVoice}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        isRecording 
                          ? "bg-red-500 text-white animate-pulse" 
                          : "text-[#7A8B84] hover:text-[#0E7C4A] hover:bg-[#EAF7EF]"
                      }`}
                      title="Speak with Voice"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Talk to AI Button */}
                <button
                  disabled={isAiThinking}
                  onClick={handleTalkToAi}
                  className="w-full py-3 rounded-2xl bg-[#0A5E39] hover:bg-[#0E7C4A] disabled:opacity-60 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAiThinking ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Analyzing with AYUSH AI…</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      <span>Talk to AI</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-[#7A8B84] text-center">
                  You can also type your message.
                </p>
              </div>

              {/* 2. DYNAMIC CASE READINESS GAUGE (78% -> 100%) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#0E7C4A]" />
                  <h3 className="text-sm font-bold text-[#123B2C] dark:text-white">
                    Your Case Readiness
                  </h3>
                </div>

                {/* Circular Progress & Message */}
                <div className="flex items-center gap-4">
                  {/* Dynamic Circular Gauge */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#EAF7EF] dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={readinessScore === 100 ? "text-emerald-500" : "text-[#0E7C4A]"}
                        strokeDasharray={`${readinessScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-[#123B2C] dark:text-white font-mono">
                      {readinessScore}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#123B2C] dark:text-white">
                      {readinessScore === 100 ? "Your case is 100% Ready!" : "Your case is almost ready!"}
                    </h4>
                    <p className="text-[11px] text-[#7A8B84] dark:text-slate-400">
                      {readinessScore === 100 ? "Verified for doctor inspection." : "1 important detail missing."}
                    </p>
                  </div>
                </div>

                {/* Dynamic Readiness Checklist */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-[#123B2C] dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" />
                    <span>Chief complaint</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#123B2C] dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" />
                    <span>Current medicines ({patientData.medicines.length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#123B2C] dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" />
                    <span>Previous treatment</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#123B2C] dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" />
                    <span>Reports ({patientData.reports.length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#123B2C] dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" />
                    <span>AYUSH history ({patientData.profile.prakriti})</span>
                  </div>

                  {/* Duration of Symptoms: Warning or Checked */}
                  {patientData.profile.durationOfSymptoms ? (
                    <div className="flex items-center gap-2 text-[#123B2C] dark:text-slate-200 font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Duration: {patientData.profile.durationOfSymptoms}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span>Duration of symptoms</span>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500">Please specify</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Complete Profile Button */}
                {readinessScore === 100 ? (
                  <div className="w-full py-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center border border-emerald-300 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Profile Complete & Ready ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReadinessModal(true)}
                    className="w-full py-3 rounded-2xl bg-[#0A5E39] hover:bg-[#0E7C4A] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Complete Your Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* 4. FOOTER BANNER STRIP */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-[#EAF7EF] to-[#DFF3E7] dark:from-emerald-950/40 dark:to-slate-900 border border-[#CFEBDB] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#123B2C] dark:text-slate-200 font-medium text-center sm:text-left">
              <Leaf className="w-4 h-4 text-[#0E7C4A] shrink-0" />
              <span>
                Better health with the wisdom of Ayurveda • Personalized care. Natural healing.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#0E7C4A] dark:text-emerald-400 font-bold">
              <Leaf className="w-3.5 h-3.5" />
              <span>Heal Naturally</span>
            </div>
          </div>

        </main>
      </div>

      {/* --- MODALS --- */}

      {/* 1. BOOK APPOINTMENT MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-[#123B2C]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#CFEBDB] p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0E7C4A]" />
                Book Consultation
              </h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#123B2C] dark:text-slate-200 mb-1">Select AYUSH Doctor</label>
                <select
                  value={newApptDoctor}
                  onChange={(e) => setNewApptDoctor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#CFEBDB] bg-[#F4F9F6] dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                >
                  {doctors.length > 0 ? (
                    doctors.map((d) => (
                      <option key={d.id} value={`${d.name} (${d.specialty})`}>
                        {d.name} — {d.specialty} (₹{d.consultationFee})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No registered AYUSH doctors available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#123B2C] dark:text-slate-200 mb-1">Date & Time Slot</label>
                <select
                  value={newApptDate}
                  onChange={(e) => setNewApptDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#CFEBDB] bg-[#F4F9F6] dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                >
                  <option value="Tomorrow, 10:30 AM">Tomorrow, 10:30 AM</option>
                  <option value="Tomorrow, 02:00 PM">Tomorrow, 02:00 PM</option>
                  <option value="Friday, 11:15 AM">Friday, 11:15 AM</option>
                  <option value="Next Monday, 04:30 PM">Next Monday, 04:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#123B2C] dark:text-slate-200 mb-1">Chief Reason for Consultation</label>
                <input
                  type="text"
                  value={newApptReason}
                  onChange={(e) => setNewApptReason(e.target.value)}
                  placeholder="e.g. Acidity & digestion issues"
                  className="w-full p-2.5 rounded-xl border border-[#CFEBDB] bg-[#F4F9F6] dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#EAF7EF] text-[11px] text-[#0E7C4A] space-y-0.5">
                <span className="font-bold">✓ Pre-Consultation Sync Active</span>
                <p>Your current symptoms and uploaded reports will automatically be structured for the doctor.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowBookModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="px-5 py-2 rounded-xl bg-[#0A5E39] hover:bg-[#0E7C4A] text-white text-xs font-bold shadow-md"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. UPLOAD REPORT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#123B2C]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#CFEBDB] p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#0E7C4A]" />
                Upload Medical Document
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#123B2C] dark:text-slate-200 mb-1">Document Name</label>
                <input
                  type="text"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="e.g. Endoscopy Report / Thyroid Profile"
                  className="w-full p-2.5 rounded-xl border border-[#CFEBDB] bg-[#F4F9F6] dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123B2C] dark:text-slate-200 mb-1">Document Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["PDF", "Image", "Lab"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewReportType(t)}
                      className={`py-2 rounded-xl border text-xs font-semibold ${
                        newReportType === t
                          ? "bg-[#EAF7EF] border-[#0E7C4A] text-[#0E7C4A]"
                          : "border-slate-200 dark:border-slate-700 text-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelection(e.dataTransfer.files?.[0] || null);
                }}
                className="border-2 border-dashed border-[#CFEBDB] rounded-2xl p-6 text-center space-y-1.5 cursor-pointer hover:bg-[#EAF7EF]/40 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => handleFileSelection(e.target.files?.[0] || null)}
                />
                <FileUp className="w-8 h-8 text-[#0E7C4A] mx-auto" />
                <span className="font-bold text-[#123B2C] dark:text-white block text-xs">
                  {selectedFile ? selectedFile.name : "Choose file or drag & drop"}
                </span>
                <p className="text-[10px] text-[#7A8B84]">Supported: PDF, JPG, PNG, WEBP up to 15MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A5E39] hover:bg-[#0E7C4A] text-white text-xs font-bold shadow-md"
                >
                  Upload & Run OCR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. VIEW MEDICINE DETAILS MODAL */}
      {showMedicineModal && (
        <div className="fixed inset-0 z-50 bg-[#123B2C]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#CFEBDB] p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0E7C4A]" />
                Active Medications ({patientData.medicines.length})
              </h3>
              <button onClick={() => setShowMedicineModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {patientData.medicines.map((med) => (
                <div key={med.id} className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800 border border-[#CFEBDB] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#123B2C] dark:text-white">{med.name}</span>
                    <span className="font-mono text-[11px] bg-[#EAF7EF] text-[#0E7C4A] px-2 py-0.5 rounded-full font-bold">
                      {med.dosage}
                    </span>
                  </div>
                  <p className="text-[#7A8B84]">• Frequency: <strong>{med.frequency}</strong></p>
                  <p className="text-[#7A8B84]">• Timing: <strong>{med.timing}</strong></p>
                  <p className="text-[11px] text-[#0E7C4A] pt-1">Prescribed by: {med.prescribedBy} ({med.duration})</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowMedicineModal(false)}
                className="px-5 py-2 rounded-xl bg-[#0A5E39] text-white text-xs font-bold shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLETE READINESS (100% GAUGE) MODAL */}
      {showReadinessModal && (
        <div className="fixed inset-0 z-50 bg-[#123B2C]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#CFEBDB] p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0E7C4A]" />
                Complete Your Pre-Consultation Profile
              </h3>
              <button onClick={() => setShowReadinessModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteReadiness} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#123B2C] dark:text-slate-200 mb-1">
                  How long have you had these symptoms? (Duration)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["2 - 3 Days", "1 - 2 Weeks", "1 Month", "Chronic (> 6 Months)"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDurationInput(opt)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        durationInput === opt
                          ? "bg-[#0E7C4A] text-white border-[#0E7C4A]"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#123B2C] dark:text-slate-200 mb-1">
                  Or specify custom duration
                </label>
                <input
                  type="text"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  placeholder="e.g. 5 days post eating spicy food"
                  className="w-full p-2.5 rounded-xl border border-[#CFEBDB] bg-[#F4F9F6] dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#EAF7EF] text-[11px] text-[#0E7C4A]">
                💡 Adding symptom duration completes your case sheet readiness from <strong>78% to 100%</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReadinessModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A5E39] hover:bg-[#0E7C4A] text-white text-xs font-bold shadow-md"
                >
                  Save & Complete (100%)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. WELLNESS DETAILS MODAL */}
      {showWellnessModal && showWellnessModal.open && (
        <div className="fixed inset-0 z-50 bg-[#123B2C]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#CFEBDB] p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-[#0E7C4A]" />
                  {showWellnessModal.title}
                </h3>
                <p className="text-xs text-[#7A8B84]">{showWellnessModal.desc}</p>
              </div>
              <button onClick={() => setShowWellnessModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F9F6] dark:bg-slate-800 text-xs text-[#123B2C] dark:text-slate-200 leading-relaxed space-y-2">
              <p>{showWellnessModal.content}</p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowWellnessModal(null)}
                className="px-5 py-2 rounded-xl bg-[#0A5E39] text-white text-xs font-bold shadow-md"
              >
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      <div
        className={`fixed left-1/2 bottom-6 -translate-x-1/2 z-50 bg-[#123B2C] text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl transition-all duration-300 pointer-events-none flex items-center gap-2 ${
          showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span>{toastMessage}</span>
      </div>

    </div>
  );
}
