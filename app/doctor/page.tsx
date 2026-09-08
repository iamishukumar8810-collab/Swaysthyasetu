"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  User,
  Home,
  Users,
  Stethoscope,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Mic,
  Languages,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Edit3,
  Printer,
  X,
  Plus,
  Play,
  Share2,
  Database,
  Calendar,
  MessageSquare,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage, LanguageCode } from "@/context/LanguageContext";

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  type: string;
  color: string;
}

interface AlertItem {
  id: string;
  type: "danger" | "warning" | "success" | "info";
  title: string;
  desc: string;
  resolved: boolean;
}

interface ChecklistItem {
  label: string;
  checked: boolean;
  missing?: boolean;
}

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  time: string;
  language: string;
  status: string;
  chiefComplaint: string;
  duration: string;
  currentMedicines: string;
  allergies: string;
  insights: string;
  prakriti: string;
  agni: string;
  previousTreatment: string;
  familyHistory: string;
  completeness: number;
  checklist: ChecklistItem[];
  alerts: AlertItem[];
  timeline: TimelineItem[];
  ayushAssessment: {
    dosha: string;
    dhatu: string;
    srotas: string;
    nidana: string;
    chikitsa: string;
  };
  medicalHistory: {
    pastConditions: string;
    surgeries: string;
    lifestyle: string;
  };
}

const INITIAL_PATIENTS: PatientData[] = [
  {
    id: "AYUH-2024-08725",
    name: "Ramesh Kumar",
    age: 45,
    gender: "Male",
    phone: "9636462356",
    time: "10:30 AM",
    language: "Hindi",
    status: "Case Ready",
    chiefComplaint: "Joint pain (3 months)",
    duration: "3 months",
    currentMedicines: "Tab. PCM 500mg",
    allergies: "None",
    insights: "Vata-Pitta imbalance (Predicted)",
    prakriti: "Vata-Pitta",
    agni: "Manda (slightly low)",
    previousTreatment: "Painkillers (2 months)",
    familyHistory: "Diabetes (Father)",
    completeness: 92,
    checklist: [
      { label: "Chief complaint", checked: true },
      { label: "Duration", checked: true },
      { label: "Previous treatment", checked: true },
      { label: "Current medicines", checked: true },
      { label: "Family history", checked: true },
      { label: "Personal history", checked: true },
      { label: "Previous investigations", checked: false, missing: true }
    ],
    alerts: [
      { id: "alt-1", type: "danger", title: "New Symptom", desc: "Sleep disturbance", resolved: false },
      { id: "alt-2", type: "warning", title: "Missing Report", desc: "Previous prescription", resolved: false },
      { id: "alt-3", type: "warning", title: "Medicine Changed", desc: "Added Vitamin D", resolved: false },
      { id: "alt-4", type: "success", title: "No Critical Alerts", desc: "Vital signs normal", resolved: true }
    ],
    timeline: [
      { id: "t-1", date: "Apr 2023", title: "Lab Report (Hb 12.4)", type: "Lab Report", color: "text-emerald-600 bg-emerald-500" },
      { id: "t-2", date: "Aug 2023", title: "Prescription (PCM 500mg)", type: "Prescription", color: "text-teal-600 bg-teal-500" },
      { id: "t-3", date: "Jan 2024", title: "Hospitalization (Appendicitis)", type: "Discharge Summary", color: "text-amber-600 bg-amber-500" },
      { id: "t-4", date: "May 2024", title: "Current Consultation", type: "Active Intake", color: "text-emerald-600 bg-emerald-500" }
    ],
    ayushAssessment: {
      dosha: "Vata (Aggravated, 45%) • Pitta (Secondary, 35%) • Kapha (20%)",
      dhatu: "Asthi & Majja Dhatu Kshaya with mild Sandhivata lakshana",
      srotas: "Asthivaha Srotas & Purishavaha Srotas obstruction",
      nidana: "Ruksha/Sheeta Ahara intake, irregular sleep timings, sedentary desk work",
      chikitsa: "Snehan & Swedan, Janu Basti, Yogaraj Guggulu 1 tab BD, Ashwagandha Churna"
    },
    medicalHistory: {
      pastConditions: "Mild hyperacidity 1 year ago, controlled with lifestyle",
      surgeries: "Appendectomy (Laparoscopic) in Jan 2024 - Uneventful recovery",
      lifestyle: "Sedentary bank employee, sits 8+ hrs daily, vegetarian diet"
    }
  },
  {
    id: "AYUH-2024-08726",
    name: "Sita Devi",
    age: 58,
    gender: "Female",
    phone: "9876543210",
    time: "10:45 AM",
    language: "Hindi",
    status: "Waiting",
    chiefComplaint: "Bilateral knee joint pain & morning stiffness (Sandhigata Vata)",
    duration: "6 months",
    currentMedicines: "Ayurvedic Taila, Calcium 500mg",
    allergies: "Penicillin",
    insights: "Vata-Kapha Prakriti with degenerative joint changes",
    prakriti: "Vata-Kapha",
    agni: "Vishamagni",
    previousTreatment: "Local knee massage, Knee support brace",
    familyHistory: "Hypertension (Mother)",
    completeness: 86,
    checklist: [
      { label: "Chief complaint", checked: true },
      { label: "Duration", checked: true },
      { label: "Previous treatment", checked: true },
      { label: "Current medicines", checked: true },
      { label: "Family history", checked: true },
      { label: "Personal history", checked: true },
      { label: "Recent Serum Uric Acid & ESR", checked: false, missing: true }
    ],
    alerts: [
      { id: "alt-201", type: "warning", title: "Mobility Concern", desc: "Difficulty climbing stairs", resolved: false },
      { id: "alt-202", type: "info", title: "Dietary Assessment", desc: "Excess cold and dry foods reported", resolved: false },
      { id: "alt-203", type: "success", title: "No Critical Alerts", desc: "BP: 128/82 mmHg, Pulse 74", resolved: true }
    ],
    timeline: [
      { id: "t-201", date: "Nov 2023", title: "Bilateral Knee X-Ray (Mild OA)", type: "Lab Report", color: "text-teal-600 bg-teal-500" },
      { id: "t-202", date: "Feb 2024", title: "Ayurvedic Consultation (Janu Basti)", type: "Prescription", color: "text-emerald-600 bg-emerald-500" },
      { id: "t-203", date: "May 2024", title: "Current Follow-up OPD", type: "Active Intake", color: "text-emerald-600 bg-emerald-500" }
    ],
    ayushAssessment: {
      dosha: "Vata (50%) • Kapha (35%) • Pitta (15%)",
      dhatu: "Asthidhatu Shaithilya with Shoola in Sandhi",
      srotas: "Asthivaha & Rasavaha Srotas",
      nidana: "Cold weather aggravation, prolonged standing during kitchen chores",
      chikitsa: "Shallaki Tablet 500mg BD, Maharasnadi Kwath 20ml BD, Kshirabala Taila Matra Basti"
    },
    medicalHistory: {
      pastConditions: "Osteopenia diagnosed 2 years ago",
      surgeries: "None",
      lifestyle: "Homemaker, morning yoga (mild), vegetarian"
    }
  },
  {
    id: "AYUH-2024-08727",
    name: "Mohd. Ali",
    age: 33,
    gender: "Male",
    phone: "9823456781",
    time: "11:00 AM",
    language: "English",
    status: "In Progress",
    chiefComplaint: "Lower back pain radiating to left leg (Gridhrasi / Sciatica)",
    duration: "1.5 months",
    currentMedicines: "Tramadol SOS (Discontinued), Multivitamin",
    allergies: "None",
    insights: "Vata Vyadhi (Kati Graha with Gridhrasi lakshana)",
    prakriti: "Pitta-Vata",
    agni: "Tikshnagni",
    previousTreatment: "Physiotherapy (3 weeks, partial relief)",
    familyHistory: "None significant",
    completeness: 88,
    checklist: [
      { label: "Chief complaint", checked: true },
      { label: "Duration", checked: true },
      { label: "Previous treatment", checked: true },
      { label: "Current medicines", checked: true },
      { label: "Family history", checked: true },
      { label: "Personal history", checked: true },
      { label: "Lumbar Spine MRI disk", checked: false, missing: true }
    ],
    alerts: [
      { id: "alt-301", type: "danger", title: "Severe Pain Episode", desc: "VAS score 7/10 during morning hours", resolved: false },
      { id: "alt-302", type: "warning", title: "Missing Report", desc: "Lumbar Spine MRI disk copy", resolved: false },
      { id: "alt-303", type: "success", title: "No Critical Alerts", desc: "Normal lower limb deep tendon reflexes", resolved: true }
    ],
    timeline: [
      { id: "t-301", date: "Mar 2024", title: "Lumbar Spine X-Ray", type: "Lab Report", color: "text-emerald-600 bg-emerald-500" },
      { id: "t-302", date: "Apr 2024", title: "Physiotherapy Summary Sheet", type: "Discharge Summary", color: "text-teal-600 bg-teal-500" },
      { id: "t-303", date: "May 2024", title: "Current AYUSH OPD", type: "Active Intake", color: "text-emerald-600 bg-emerald-500" }
    ],
    ayushAssessment: {
      dosha: "Vata (55%) • Pitta (30%) • Kapha (15%)",
      dhatu: "Mamsa & Majja Dhatu Pratiloma Gati",
      srotas: "Majjavaha & Purishavaha Srotas",
      nidana: "Heavy bike riding & irregular lifting, prolonged sitting posture",
      chikitsa: "Kati Basti with Sahacharadi Taila, Trayodashanga Guggulu, Dashamoola Kwath"
    },
    medicalHistory: {
      pastConditions: "Occasional lumbar spasm since 2022",
      surgeries: "None",
      lifestyle: "Software Engineer, sedentary 9+ hours, gym enthusiast (suspended)"
    }
  }
];

export default function DoctorWorkspacePage() {
  const { language, setLanguage, t, currentLanguage, supportedLanguages } = useLanguage();

  const [patients, setPatients] = useState<PatientData[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("AYUH-2024-08725");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Summary" | "AYUSH Assessment" | "Medical History" | "Reports">("Summary");
  const [activeSidebarTab, setActiveSidebarTab] = useState("Home");

  // Notifications Popover
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: "New pre-consultation ready", desc: "Ramesh Kumar completed AI intake via mobile.", time: "5 min ago", read: false },
    { id: 2, title: "Lab Report Uploaded", desc: "Previous Hb 12.4 report synced to timeline.", time: "22 min ago", read: false },
    { id: 3, title: "Critical Alert Cleared", desc: "Vital signs verified normal by intake triage.", time: "1 hr ago", read: true },
  ]);

  // Interactive Modals
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("Have you had any previous X-rays, MRI, or blood tests for your joint pain?");
  const [isAnswering, setIsAnswering] = useState(false);

  const [showFinalCaseSheetModal, setShowFinalCaseSheetModal] = useState(false);
  const [isDigitallySigned, setIsDigitallySigned] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{
    chiefComplaint: string;
    currentMedicines: string;
    doctorPrescription: string;
    doctorNotes: string;
  }>({
    chiefComplaint: "",
    currentMedicines: "",
    doctorPrescription: "1. Yogaraj Guggulu 2 tabs BD\n2. Dashamoola Kwath 20ml BD\n3. Local application of Mahanarayana Taila twice daily",
    doctorNotes: "Advised Pathya Ahara: warm cooked meals, avoid fermented foods, curd, and cold water. Schedule follow-up after 14 days."
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active patient object
  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Filtered patients for search
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  // Handle Ask 1 More Question Completion
  const handleConfirmAnswer = () => {
    setIsAnswering(true);
    setTimeout(() => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === currentPatient.id) {
            const updatedChecklist = p.checklist.map((item) => {
              if (item.missing) {
                return { ...item, checked: true, missing: false };
              }
              return item;
            });
            const newTimelineItem: TimelineItem = {
              id: `t-added-${Date.now()}`,
              date: "May 2024",
              title: "Previous Investigation Confirmed (X-Ray Bilateral Knees)",
              type: "Investigation Note",
              color: "text-emerald-600 bg-emerald-500"
            };
            return {
              ...p,
              completeness: 100,
              checklist: updatedChecklist,
              timeline: [newTimelineItem, ...p.timeline]
            };
          }
          return p;
        })
      );
      setIsAnswering(false);
      setShowAskQuestionModal(false);
      triggerToast(t("completeness.infoCollected", "100% Information Collected!"));
    }, 600);
  };

  // Handle Document Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newTimelineItem: TimelineItem = {
      id: `doc-${Date.now()}`,
      date: "May 2024",
      title: `${file.name} (Uploaded by Doctor)`,
      type: file.name.endsWith(".pdf") ? "Lab Report" : "Prescription",
      color: "text-teal-600 bg-teal-500"
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === currentPatient.id) {
          return {
            ...p,
            timeline: [newTimelineItem, ...p.timeline]
          };
        }
        return p;
      })
    );

    triggerToast(`Document "${file.name}" processed & indexed to timeline!`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle quick tag upload mock
  const handleQuickUpload = (docType: string) => {
    const newTimelineItem: TimelineItem = {
      id: `doc-quick-${Date.now()}`,
      date: "May 2024",
      title: `${docType} Attached - Dr. Meera Sharma`,
      type: docType,
      color: "text-emerald-600 bg-emerald-500"
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === currentPatient.id) {
          return {
            ...p,
            timeline: [newTimelineItem, ...p.timeline]
          };
        }
        return p;
      })
    );
    triggerToast(`Quick document [${docType}] added to medical timeline.`);
  };

  // Dismiss / Resolve alert
  const handleToggleAlert = (alertId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === currentPatient.id) {
          const updatedAlerts = p.alerts.map((a) => (a.id === alertId ? { ...a, resolved: !a.resolved } : a));
          return { ...p, alerts: updatedAlerts };
        }
        return p;
      })
    );
    triggerToast("Alert status updated.");
  };

  // Save Doctor Edit Form
  const handleSaveEdit = () => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === currentPatient.id) {
          return {
            ...p,
            chiefComplaint: editForm.chiefComplaint || p.chiefComplaint,
            currentMedicines: editForm.currentMedicines || p.currentMedicines
          };
        }
        return p;
      })
    );
    setShowEditModal(false);
    triggerToast("Clinical notes and prescription saved successfully!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER / NAVBAR                                   */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Identity: Swasthya Setu */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0E7C4A] to-[#123B2C] flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                {/* Green Lotus / Leaf Emblem */}
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-2">
                  <path d="M12 3C8.5 7.5 4 10 4 15C4 18.5 7.5 21 12 21C16.5 21 20 18.5 20 15C20 10 15.5 7.5 12 3Z" fill="white" fillOpacity="0.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 3V21M12 12C9.5 9 6.5 13 4 15M12 12C14.5 9 17.5 13 20 15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-[#123B2C] dark:text-white tracking-tight group-hover:text-[#0E7C4A] transition-colors">
                    {t("brand.name", "Swasthya Setu")}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {t("brand.opdLive", "OPD Live")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                  {t("brand.tagline", "AI-Powered Pre-Consultation for AYUSH Hospitals")}
                </p>
              </div>
            </Link>
          </div>

          {/* Search Patient Bar (Center) */}
          <div className="relative flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder={t("header.searchPlaceholder", "Search patient (Name / ID / Mobile)")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-full text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-[11px]">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.id} • {p.phone}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        {p.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-slate-400 text-center">
                    {t("header.noPatientFound", "No matching patient in active OPD queue")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                  3
                </span>
              </button>

              {/* Dropdown notifications */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {t("header.notifications", "Doctor Notifications")}
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-emerald-600 hover:underline"
                    >
                      {t("header.markAllRead", "Mark all read")}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 transition-colors text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-800 dark:text-slate-200 text-[11px]">{n.title}</strong>
                          <span className="text-[9px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Profile Pill */}
            <div className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Dr. Meera Sharma
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {t("header.doctorTitle", "Physician (MD Ayurveda)")}
                </p>
              </div>
            </div>

            {/* ======================================================== */}
            {/* LANGUAGE SELECTOR BUTTON (Placed BEFORE Dark/Light Theme) */}
            {/* ======================================================== */}
            <LanguageSelector />

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. BODY WORKSPACE WITH SIDEBAR + MAIN CONTENT            */}
      {/* ======================================================== */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-4 flex flex-row md:flex-col justify-between overflow-x-auto gap-2">
          
          <nav className="space-y-1 w-full flex md:flex-col gap-1 md:gap-1">
            {[
              { id: "Home", label: t("nav.home", "Home"), icon: Home, badge: null },
              { id: "Queue", label: t("nav.patientQueue", "Patient Queue"), icon: Users, badge: patients.length.toString() },
              { id: "Consultations", label: t("nav.consultations", "Consultations"), icon: Stethoscope, badge: null },
              { id: "History", label: t("nav.patientHistory", "Patient History"), icon: Clock, badge: null },
              { id: "Reports", label: t("nav.reports", "Reports"), icon: FileText, badge: null },
              { id: "Analytics", label: t("nav.analytics", "Analytics"), icon: BarChart3, badge: null },
              { id: "Settings", label: t("nav.settings", "Settings"), icon: Settings, badge: null },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSidebarTab(item.id);
                    if (item.id === "Queue") {
                      triggerToast("Viewing Live OPD Queue with 3 active patients.");
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#EAF7EF] text-[#0E7C4A] dark:bg-emerald-950/70 dark:text-emerald-300 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#0E7C4A] dark:text-emerald-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-[#0E7C4A] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Card: Traditional Wisdom + Modern Intelligence */}
          <div className="hidden md:block mt-auto pt-6">
            <div className="p-4 rounded-2xl bg-[#EAF7EF]/80 dark:bg-emerald-950/40 border border-[#CFEBDB] dark:border-emerald-900/60 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-white dark:bg-emerald-900/80 shadow-sm flex items-center justify-center text-[#0E7C4A] dark:text-emerald-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#123B2C] dark:text-emerald-200 leading-tight">
                {t("nav.traditionalWisdom", "Traditional Wisdom")}
              </p>
              <span className="text-[10px] font-black text-[#0E7C4A] dark:text-emerald-400 block -mt-1">+</span>
              <p className="text-xs font-bold text-[#123B2C] dark:text-emerald-200 leading-tight">
                {t("nav.modernIntelligence", "Modern Intelligence")}
              </p>
            </div>
          </div>

        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-6 overflow-y-auto">
          
          {/* ======================================================== */}
          {/* WELCOME BANNER & VALUE BADGES                            */}
          {/* ======================================================== */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("banner.welcome", "Welcome, Dr. Meera Sharma")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t("banner.subtitle", "Let's make every consultation more complete and accurate.")}
              </p>
            </div>

            {/* 5 Characteristic Badges from Design */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { icon: Mic, label: t("badge.voiceTouch", "Voice + Touch Interface") },
                { icon: Languages, label: t("badge.multilingual", "Multilingual (12+ Languages)") },
                { icon: Sparkles, label: t("badge.ayushSpecific", "AYUSH Specific") },
                { icon: FileText, label: t("badge.documentIntelligence", "Document Intelligence") },
                { icon: ShieldCheck, label: t("badge.safeSecure", "Safe & Secure") },
              ].map((badge, idx) => {
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-xs"
                  >
                    <BadgeIcon className="w-3.5 h-3.5 text-[#0E7C4A] dark:text-emerald-400 shrink-0" />
                    <span>{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Queue Switcher Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              {t("activePatientLabel", "Active Patient:")}
            </span>
            {patients.map((p) => {
              const isCurrent = p.id === currentPatient.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border ${
                    isCurrent
                      ? "bg-[#0E7C4A] text-white border-[#0E7C4A] shadow-md shadow-emerald-800/20"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-white animate-pulse" : "bg-emerald-500"}`} />
                  <span>{p.name}</span>
                  <span className={`text-[10px] font-mono ${isCurrent ? "text-emerald-100" : "text-slate-400"}`}>
                    ({p.id})
                  </span>
                </button>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* MAIN 2-COLUMN GRID (Matching Layout from Uploaded Image) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: CARDS 1, 2, 3, 4, 5 (Takes 8 of 12 cols on desktop) */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* ==================================================== */}
              {/* CARD 1: PATIENT CASE-TAKING                          */}
              {/* ==================================================== */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
                
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0E7C4A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {t("card1.title", "Patient Case-Taking")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("card1.subtitle", "The patient shares their concerns in their preferred language, via voice or touch.")}
                    </p>
                  </div>
                </div>

                {/* Patient Selector Card + 4 Workflow Steps */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  
                  {/* Left Patient Pill Box */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold shadow-inner">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {currentPatient.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono">OPD ID: {currentPatient.id}</p>
                        <p className="text-[10px] text-slate-500">{t("card1.ageMale", "Age: 45 | Male")}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Languages className="w-3.5 h-3.5 text-[#0E7C4A]" />
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value as LanguageCode);
                            triggerToast(`Language switched to ${e.target.value}`);
                          }}
                          className="text-xs font-semibold bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                          {supportedLanguages.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.nativeName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setShowVoiceModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{t("card1.startInteraction", "Start Interaction")}</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Pipeline Steps Connected by Arrows */}
                  <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
                    {[
                      {
                        step: t("card1.step1", "1. Choose Language"),
                        desc: currentLanguage.nativeName,
                        icon: Languages,
                        active: true
                      },
                      {
                        step: t("card1.step2", "2. Voice / Touch Input"),
                        desc: t("card1.step2Desc", "Patient speaks or selects options"),
                        icon: Mic,
                        active: true
                      },
                      {
                        step: t("card1.step3", "3. AI Interview"),
                        desc: t("card1.step3Desc", "Adaptive questioning based on response"),
                        icon: MessageSquare,
                        active: true
                      },
                      {
                        step: t("card1.step4", "4. Case Summary"),
                        desc: t("card1.step4Desc", "Structured data and key findings"),
                        icon: FileSpreadsheet,
                        active: true
                      }
                    ].map((step, idx) => {
                      const StepIcon = step.icon;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-center space-y-1 relative group hover:border-[#0E7C4A] transition-all"
                        >
                          <div className="w-8 h-8 mx-auto rounded-full bg-[#EAF7EF] dark:bg-emerald-950/80 text-[#0E7C4A] dark:text-emerald-300 flex items-center justify-center mb-1 shadow-xs">
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                            {step.step}
                          </p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-400 line-clamp-2 leading-snug">
                            {step.desc}
                          </p>
                          {idx < 3 && (
                            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-300 dark:text-slate-600 absolute -right-2.5 top-1/2 -translate-y-1/2 z-10" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>

              {/* ==================================================== */}
              {/* CARD 2: AI PROCESSING & DATA FLOW                    */}
              {/* ==================================================== */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0E7C4A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {t("card2.title", "AI Processing & Data Flow")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("card2.subtitle", "AI extracts, structures and organizes the information.")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: t("card2.nlp", "Transcription & NLP"), icon: Mic, sub: t("card2.nlpSub", "Real-time speech to text") },
                    { label: t("card2.ayushKb", "AYUSH Knowledge Base"), icon: Sparkles, sub: t("card2.ayushKbSub", "Ayurveda / Siddha Ontologies") },
                    { label: t("card2.caseSheet", "Structured Case Sheet"), icon: FileText, sub: t("card2.caseSheetSub", "Standard OPD Format") },
                    { label: t("card2.storage", "Data Storage"), icon: Database, sub: t("card2.storageSub", "ABHA & EHR Compliant") },
                  ].map((flow, i) => {
                    const FlowIcon = flow.icon;
                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center space-y-1 relative"
                      >
                        <div className="w-8 h-8 mx-auto rounded-xl bg-white dark:bg-slate-700 text-[#0E7C4A] dark:text-emerald-400 flex items-center justify-center shadow-xs">
                          <FlowIcon className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">
                          {flow.label}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {flow.sub}
                        </p>
                        {i < 3 && (
                          <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                            <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ==================================================== */}
              {/* CARD 3: PATIENT CASE SHEET (PREVIEW)                 */}
              {/* ==================================================== */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0E7C4A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {t("card3.title", "Patient Case Sheet (Preview)")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("card3.subtitle", "AI-generated structured summary. Editable by doctor.")}
                    </p>
                  </div>
                </div>

                {/* Patient Demographics Bar */}
                <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {currentPatient.name}
                    </span>
                    <span className="text-slate-500">
                      {currentPatient.age} / {currentPatient.gender}
                    </span>
                    <span className="font-mono text-[11px] bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-md font-semibold">
                      OPD ID: {currentPatient.id}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowFinalCaseSheetModal(true)}
                    className="text-[#0E7C4A] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-xs"
                  >
                    <span>{t("card3.viewFullHistory", "View Full History")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 text-xs font-bold pt-1">
                  {(["Summary", "AYUSH Assessment", "Medical History", "Reports"] as const).map((tab) => {
                    const tabKey =
                      tab === "Summary"
                        ? "tab.summary"
                        : tab === "AYUSH Assessment"
                        ? "tab.ayushAssessment"
                        : tab === "Medical History"
                        ? "tab.medicalHistory"
                        : "tab.reports";

                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2.5 transition-all relative ${
                          activeTab === tab
                            ? "text-[#0E7C4A] dark:text-emerald-400"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        {t(tabKey, tab)}
                        {activeTab === tab && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E7C4A] dark:bg-emerald-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Summary Matrix */}
                {activeTab === "Summary" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    
                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("field.chiefComplaint", "Chief Complaint")}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentPatient.chiefComplaint}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("field.currentMedicines", "Current Medicines")}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentPatient.currentMedicines}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        {t("field.ayushInsights", "AYUSH Insights")}
                      </span>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        {currentPatient.insights}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("field.duration", "Duration")}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentPatient.duration}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("field.allergies", "Allergies")}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentPatient.allergies}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("field.prakriti", "Prakriti")}
                      </span>
                      <p className="text-xs font-bold text-[#0E7C4A] dark:text-emerald-300">
                        {currentPatient.prakriti}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("field.previousTreatment", "Previous Treatment")}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentPatient.previousTreatment}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("field.familyHistory", "Family History")}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentPatient.familyHistory}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("field.agni", "Agni")}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentPatient.agni}
                      </p>
                    </div>

                  </div>
                )}

                {/* Tab 2: AYUSH Assessment */}
                {activeTab === "AYUSH Assessment" && (
                  <div className="space-y-3 pt-1 text-xs">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#0E7C4A] dark:text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Dashavidha & Rogi Pariksha Findings</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Dosha State:</strong> {currentPatient.ayushAssessment.dosha}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Dhatu Lakshana:</strong> {currentPatient.ayushAssessment.dhatu}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Srotas Affected:</strong> {currentPatient.ayushAssessment.srotas}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Nidana (Etiology):</strong> {currentPatient.ayushAssessment.nidana}
                      </p>
                      <div className="pt-1 text-emerald-800 dark:text-emerald-200">
                        <strong>Suggested Chikitsa Siddhanta:</strong> {currentPatient.ayushAssessment.chikitsa}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Medical History */}
                {activeTab === "Medical History" && (
                  <div className="space-y-3 pt-1 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Past Illnesses:</strong> {currentPatient.medicalHistory.pastConditions}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Surgical History:</strong> {currentPatient.medicalHistory.surgeries}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Occupation & Dinacharya:</strong> {currentPatient.medicalHistory.lifestyle}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 4: Reports */}
                {activeTab === "Reports" && (
                  <div className="space-y-3 pt-1 text-xs">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentPatient.timeline.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{item.title}</p>
                            <span className="text-[10px] text-slate-400">{item.date} • {item.type}</span>
                          </div>
                          <button
                            onClick={() => triggerToast(`Viewing ${item.title}`)}
                            className="text-xs text-[#0E7C4A] hover:underline font-semibold"
                          >
                            View Record
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* ==================================================== */}
              {/* CARD 4: DOCUMENT INTELLIGENCE                        */}
              {/* ==================================================== */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0E7C4A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {t("card4.title", "Document Intelligence")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("card4.subtitle", "Upload reports and prescriptions. AI extracts and builds a timeline.")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* Left: Dropzone Area & Quick Document Tags */}
                  <div className="md:col-span-6 space-y-3">
                    
                    {/* Real Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Drag & Drop Visual Area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0E7C4A] dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer text-center space-y-2 transition-all group"
                    >
                      <div className="w-11 h-11 mx-auto rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-[#0E7C4A] group-hover:scale-110 transition-all">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">
                          {t("card4.dragDrop", "Drag & drop files here")}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t("card4.orBrowse", "or click to browse from device")}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="px-4 py-1.5 rounded-xl bg-[#0E7C4A] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 hover:bg-[#0A5E39]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t("card4.uploadBtn", "Upload Documents")}</span>
                      </button>

                      <p className="text-[9px] text-slate-400 pt-1">
                        {t("card4.supports", "Supports PDF, JPG, PNG (Max 10MB)")}
                      </p>
                    </div>

                    {/* Quick Document Category Shortcuts */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: t("docType.prescription", "Prescription"), type: "Prescription" },
                        { label: t("docType.labReport", "Lab Report"), type: "Lab Report" },
                        { label: t("docType.discharge", "Discharge Summary"), type: "Discharge Summary" },
                        { label: t("docType.other", "Other Documents"), type: "Other Document" },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickUpload(item.type)}
                          className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-[#EAF7EF] dark:hover:bg-emerald-950/60 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#0E7C4A] text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs text-left"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0E7C4A]" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Right: Medical Timeline */}
                  <div className="md:col-span-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                        {t("timeline.title", "Medical Timeline")}
                      </h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        {t("timeline.chronological", "Chronological")}
                      </span>
                    </div>

                    {/* Vertical Timeline Nodes */}
                    <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                      {currentPatient.timeline.map((event, idx) => (
                        <div key={event.id || idx} className="relative group">
                          {/* Dot */}
                          <span
                            className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                              idx === 0 ? "bg-emerald-500 animate-pulse" : "bg-teal-500"
                            }`}
                          />
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {event.date}
                            </span>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {event.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

              </div>

              {/* ==================================================== */}
              {/* CARD 5: DOCTOR ATTENTION BOX                         */}
              {/* ==================================================== */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0E7C4A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    5
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {t("card5.title", "Doctor Attention Box")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("card5.subtitle", "Key points that need your attention.")}
                    </p>
                  </div>
                </div>

                {/* Alerts List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentPatient.alerts.map((alert) => {
                    const isDanger = alert.type === "danger";
                    const isWarning = alert.type === "warning";

                    // Dynamic translated alert title
                    const translatedTitle =
                      alert.title === "New Symptom"
                        ? t("alert.newSymptom", alert.title)
                        : alert.title === "Missing Report"
                        ? t("alert.missingReport", alert.title)
                        : alert.title === "Medicine Changed"
                        ? t("alert.medicineChanged", alert.title)
                        : t("alert.noCriticalAlerts", alert.title);

                    const translatedDesc =
                      alert.desc === "Sleep disturbance"
                        ? t("alert.sleepDisturbance", alert.desc)
                        : alert.desc === "Previous prescription"
                        ? t("alert.prevPrescription", alert.desc)
                        : alert.desc === "Added Vitamin D"
                        ? t("alert.addedVitaminD", alert.desc)
                        : alert.desc === "Vital signs normal"
                        ? t("alert.vitalSignsNormal", alert.desc)
                        : alert.desc;

                    return (
                      <div
                        key={alert.id}
                        className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                          alert.resolved
                            ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70"
                            : isDanger
                            ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60"
                            : isWarning
                            ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60"
                            : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isDanger ? (
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {translatedTitle}
                            </span>
                            <button
                              onClick={() => handleToggleAlert(alert.id)}
                              className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                              title="Toggle Resolved"
                            >
                              {alert.resolved ? t("alert.resolved", "Resolved ✓") : t("alert.markDone", "Mark done")}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            {translatedDesc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            {/* ======================================================== */}
            {/* RIGHT COLUMN: CASE COMPLETENESS + CARD 6 (4 of 12 cols)  */}
            {/* ======================================================== */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* CASE COMPLETENESS CARD */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
                
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("completeness.title", "Case Completeness")}
                </h3>

                {/* Circular Meter Gauge */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                      {/* Background track circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Progress animated circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className={`${
                          currentPatient.completeness === 100
                            ? "stroke-[#0E7C4A]"
                            : "stroke-teal-600"
                        } transition-all duration-700 ease-out`}
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={
                          2 * Math.PI * 50 * (1 - currentPatient.completeness / 100)
                        }
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {currentPatient.completeness}%
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {t("completeness.caseComplete", "Case Complete")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checklist with Green Checkmarks */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {currentPatient.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs">
                      {item.checked ? (
                        <div className="w-4 h-4 rounded-full bg-[#0E7C4A] text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-2.5 h-2.5" />
                        </div>
                      )}

                      <span
                        className={`${
                          item.missing
                            ? "text-amber-600 dark:text-amber-400 font-bold"
                            : "text-slate-700 dark:text-slate-300 font-medium"
                        }`}
                      >
                        {item.missing
                          ? t("completeness.itemMissing", `1 item missing: ${item.label}`)
                          : item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ask 1 More Question Action */}
                {currentPatient.completeness < 100 ? (
                  <button
                    onClick={() => {
                      setShowAskQuestionModal(true);
                    }}
                    className="w-full py-3 rounded-2xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-md shadow-emerald-800/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t("completeness.askQuestion", "Ask 1 More Question")}</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#EAF7EF] dark:bg-emerald-950/60 border border-[#CFEBDB] dark:border-emerald-800 text-center">
                    <span className="text-xs font-bold text-[#0E7C4A] dark:text-emerald-300 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {t("completeness.infoCollected", "100% Information Collected!")}
                    </span>
                  </div>
                )}

              </div>

              {/* ==================================================== */}
              {/* CARD 6: FINAL CASE SHEET                             */}
              {/* ==================================================== */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0E7C4A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    6
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {t("card6.title", "Final Case Sheet")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("card6.subtitle", "Ready for doctor's review and confirmation.")}
                    </p>
                  </div>
                </div>

                {/* Case Ready Green Banner */}
                <div className="p-5 rounded-2xl bg-[#EAF7EF] dark:bg-emerald-950/40 border border-[#CFEBDB] dark:border-emerald-900 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#0E7C4A] text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-[#123B2C] dark:text-white">
                    {t("card6.caseReady", "Case Ready")}
                  </h4>
                  <p className="text-[11px] text-[#7A8B84] dark:text-emerald-200/80 leading-relaxed max-w-xs mx-auto">
                    {t("card6.caseReadyDesc", "All essential information collected. Please review and confirm.")}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setShowFinalCaseSheetModal(true)}
                    className="w-full py-3 rounded-2xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-md shadow-emerald-800/20 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t("card6.viewFinal", "View Final Case Sheet")}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditForm({
                        chiefComplaint: currentPatient.chiefComplaint,
                        currentMedicines: currentPatient.currentMedicines,
                        doctorPrescription: "1. Yogaraj Guggulu 2 tabs BD\n2. Dashamoola Kwath 20ml BD\n3. Local application of Mahanarayana Taila twice daily",
                        doctorNotes: "Advised Pathya Ahara: warm cooked meals, avoid fermented foods, curd, and cold water. Schedule follow-up after 14 days."
                      });
                      setShowEditModal(true);
                    }}
                    className="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[#0E7C4A] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 text-slate-500" />
                    <span>{t("card6.editRequest", "Edit / Request More Info")}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* ======================================================== */}
          {/* BOTTOM RIBBON: 4 VALUE PROPS + FROM FIRST INTERACTION... */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto flex-1">
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#0E7C4A] shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {t("ribbon.smartQuestions", "Smarter Questions")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t("ribbon.smartQuestionsSub", "Asks only what's needed")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-teal-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {t("ribbon.completeHistory", "Complete History")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t("ribbon.completeHistorySub", "Past visits, reports, medicines")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {t("ribbon.ayushFocused", "AYUSH Focused")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t("ribbon.ayushFocusedSub", "Dashavidha Pariksha & Prakriti")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-teal-700 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {t("ribbon.betterDecisions", "Better Decisions")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t("ribbon.betterDecisionsSub", "For doctors and patients")}
                  </p>
                </div>
              </div>

            </div>

            {/* Slogan with Leaf */}
            <div className="text-right shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
              <p className="text-xs font-serif italic text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <span>{t("ribbon.slogan", "From first interaction to better care")}</span>
                <span className="not-italic">🍃</span>
              </p>
            </div>

          </div>

        </main>
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE MODALS                                     */}
      {/* ======================================================== */}

      {/* MODAL 1: VOICE / TOUCH INTERACTION SIMULATOR */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#EAF7EF] text-[#0E7C4A] flex items-center justify-center font-bold">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Patient Voice Intake Simulation
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Patient: {currentPatient.name} • Language: {currentLanguage.nativeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Audio Wave Simulation */}
            <div className="p-6 rounded-2xl bg-slate-950 text-white text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 h-12">
                {[40, 65, 80, 50, 95, 70, 85, 60, 45, 90, 75, 55].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${isRecording ? h : 15}%` }}
                    className="w-1.5 bg-emerald-400 rounded-full transition-all duration-300 animate-pulse"
                  />
                ))}
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                {isRecording ? `Listening to Patient Voice in ${currentLanguage.nativeName}...` : "Click Speak to test real-time speech intake"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live NLP Transcription:</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                &ldquo;डॉक्टर साहब, मुझे 3 महीने से घुटनों में बहुत दर्द रहता है और सुबह अकड़न होती है...&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                {isRecording ? "Pause Audio" : "Simulate Speech"}
              </button>
              <button
                onClick={() => {
                  setShowVoiceModal(false);
                  triggerToast("Voice intake structured into Case Sheet successfully!");
                }}
                className="px-5 py-2 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-md"
              >
                Apply To Case Sheet
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: ASK 1 MORE QUESTION (Completes missing item) */}
      {showAskQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("completeness.itemMissing", "Fill 1 Missing Case Parameter")}
                  </h3>
                  <p className="text-[10px] text-slate-400">Current Completeness: {currentPatient.completeness}%</p>
                </div>
              </div>
              <button
                onClick={() => setShowAskQuestionModal(false)}
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                AI Automated Follow-Up Question:
              </label>
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E7C4A]"
                rows={2}
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-xs space-y-1">
              <span className="text-[10px] font-bold text-[#0E7C4A] dark:text-emerald-400 uppercase">
                Patient Answer (Auto-Received via Kiosk/Mobile):
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                &ldquo;Yes, had an X-Ray done 2 months ago at civil hospital showing mild joint space narrowing.&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAskQuestionModal(false)}
                className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={isAnswering}
                onClick={handleConfirmAnswer}
                className="px-5 py-2 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                {isAnswering ? <span>Updating...</span> : <span>Confirm & Reach 100%</span>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: VIEW FINAL CASE SHEET & DIGITAL SIGN-OFF */}
      {showFinalCaseSheetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            
            {/* Header with Print */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E7C4A] text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Official AYUSH Clinical Case Record
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Token: {currentPatient.id} • {t("brand.name", "Swasthya Setu")} Platform
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setShowFinalCaseSheetModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Case Sheet Printable View */}
            <div className="space-y-4 text-xs">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Patient Name</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{currentPatient.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Age / Gender</span>
                  <p className="font-bold text-slate-900 dark:text-white">{currentPatient.age} Y / {currentPatient.gender}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Phone Number</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">+91 {currentPatient.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Prakriti Analysis</span>
                  <p className="font-bold text-[#0E7C4A] dark:text-emerald-400">{currentPatient.prakriti}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Clinical Diagnosis & Chief Complaints
                </h4>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  {currentPatient.chiefComplaint} (Duration: {currentPatient.duration}). {currentPatient.insights}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  AYUSH Chikitsa (Treatment Plan)
                </h4>
                <p className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 font-medium">
                  {currentPatient.ayushAssessment.chikitsa}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Doctor Prescription & Notes
                </h4>
                <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 font-sans text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {editForm.doctorPrescription}
                  {"\n\n"}
                  {editForm.doctorNotes}
                </pre>
              </div>

              {/* Digital Signature Verification */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                    Attending Physician: Dr. Meera Sharma
                  </p>
                  <p className="text-[10px] text-slate-400">MD (Ayurveda Kayachikitsa), Reg. AYU-64219</p>
                </div>

                {isDigitallySigned ? (
                  <div className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Digitally Signed & Locked</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsDigitallySigned(true);
                      triggerToast("Case Sheet Digitally Signed by Dr. Meera Sharma.");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Digitally Sign & Lock Sheet</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: EDIT / REQUEST MORE INFO */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Edit Observations & Prescribe
                  </h3>
                  <p className="text-[10px] text-slate-400">Patient: {currentPatient.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Chief Complaint
                </label>
                <input
                  type="text"
                  value={editForm.chiefComplaint}
                  onChange={(e) => setEditForm({ ...editForm, chiefComplaint: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#0E7C4A]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ayurvedic Medicines & Formulations
                </label>
                <textarea
                  rows={3}
                  value={editForm.doctorPrescription}
                  onChange={(e) => setEditForm({ ...editForm, doctorPrescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#0E7C4A]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pathya-Apathya (Diet & Lifestyle Guidance)
                </label>
                <textarea
                  rows={2}
                  value={editForm.doctorNotes}
                  onChange={(e) => setEditForm({ ...editForm, doctorNotes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#0E7C4A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-3.5 py-2 rounded-xl text-slate-500 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-md"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FLOATING REAL-TIME TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#123B2C] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-600/40 animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
