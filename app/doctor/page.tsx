"use client";

import React, { useState, useRef, useEffect } from "react";
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
  CheckCircle,
  Star,
  Award,
  MapPin,
  Trash2,
  Eye,
  SlidersHorizontal,
  Download,
  ExternalLink
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage, LanguageCode } from "@/context/LanguageContext";
import {
  DoctorProfile,
  getCurrentDoctorProfile,
  saveCurrentDoctorProfile,
  publishDoctorProfileToSupabase,
  unpublishCurrentDoctorProfile,
  getDoctorQueue,
  getDoctorQueueFromSupabase,
  subscribeToDoctorQueue,
  QueuedPatient,
  QueuedPatientReport,
  downloadPatientReport,
} from "@/lib/doctorStore";
import {
  AIIntakeSummary,
  getAIIntakeSummary,
  subscribeToAIIntake,
  markAIIntakeAccepted,
} from "@/lib/aiIntakeStore";

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

const INITIAL_PATIENTS: PatientData[] = [];

const DEFAULT_PATIENT: PatientData = {
  id: "",
  name: "Unknown Patient",
  age: 0,
  gender: "",
  phone: "",
  time: "",
  language: "",
  status: "",
  chiefComplaint: "",
  duration: "",
  currentMedicines: "",
  allergies: "",
  insights: "",
  prakriti: "",
  agni: "",
  previousTreatment: "",
  familyHistory: "",
  completeness: 0,
  checklist: [],
  alerts: [],
  timeline: [],
  ayushAssessment: {
    dosha: "",
    dhatu: "",
    srotas: "",
    nidana: "",
    chikitsa: "",
  },
  medicalHistory: {
    pastConditions: "",
    surgeries: "",
    lifestyle: "",
  },
};

export default function DoctorWorkspacePage() {
  const { language, setLanguage, t, currentLanguage, supportedLanguages } = useLanguage();

  const [patients, setPatients] = useState<PatientData[]>(INITIAL_PATIENTS);
  const [patientReports, setPatientReports] = useState<Record<string, any[]>>({});
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportsForModal, setReportsForModal] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Summary" | "AYUSH Assessment" | "Medical History" | "Reports">("Summary");
  const [activeSidebarTab, setActiveSidebarTab] = useState("Home");

  // Live Patient Queue State
  const [queueList, setQueueList] = useState<QueuedPatient[]>([]);
  const [queueSearch, setQueueSearch] = useState("");
  const [queueDoctorFilter, setQueueDoctorFilter] = useState("All");
  const [queueStatusFilter, setQueueStatusFilter] = useState("All");

  // Current Logged-in Doctor Profile & Listing State
  const defaultDoctorForm: DoctorProfile = {
    id: "",
    name: "",
    specialty: "",
    subSpecialty: "",
    qualifications: "",
    experienceYears: 0,
    hospital: "",
    location: "",
    rating: 0,
    reviewsCount: 0,
    consultationFee: 0,
    availableTimings: "",
    nextAvailableSlot: "",
    languages: [],
    expertise: [],
    about: "",
    phone: "",
    registrationNumber: "",
    isAvailableToday: false,
    isAyushVerified: false,
    isPublished: false,
    createdAt: new Date().toISOString(),
  };

  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile>(defaultDoctorForm);
  const [expertiseInput, setExpertiseInput] = useState<string>(defaultDoctorForm.expertise.join(", "));
  const [languagesInput, setLanguagesInput] = useState<string>(defaultDoctorForm.languages.join(", "));

  const filteredQueue = queueList.filter((item) => {
    const q = queueSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.userId && item.userId.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q)) ||
      (item.issue && item.issue.toLowerCase().includes(q)) ||
      (item.chiefComplaint && item.chiefComplaint.toLowerCase().includes(q)) ||
      (item.assignedDoctorName && item.assignedDoctorName.toLowerCase().includes(q));

    const matchesDoctor =
      queueDoctorFilter === "All" ||
      (queueDoctorFilter === "Me" && (
        (currentDoctor.id && item.assignedDoctorId === currentDoctor.id) ||
        (currentDoctor.name && item.assignedDoctorName === currentDoctor.name)
      )) ||
      item.assignedDoctorName === queueDoctorFilter;

    const matchesStatus =
      queueStatusFilter === "All" ||
      item.status === queueStatusFilter ||
      (item.severity && item.severity.toLowerCase() === queueStatusFilter.toLowerCase());

    return matchesSearch && matchesDoctor && matchesStatus;
  });

  // Load saved profile on mount
  useEffect(() => {
    // Load any queued patients added from Patient Portal bookings
    try {
      const queue = getDoctorQueue();
      if (queue && queue.length > 0) {
        setQueueList((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const additions = queue.filter((q) => !ids.has(q.id));
          return [...additions, ...prev];
        });

        setPatients((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newEntries = queue
            .filter((q: any) => !existingIds.has(q.id))
            .map((q: any) => ({
              id: q.id,
              name: q.name,
              age: q.age || 0,
              gender: q.gender || "",
              phone: q.phone || "",
              time: q.time || "",
              language: q.language || "",
              status: q.status || "Waiting",
              chiefComplaint: q.chiefComplaint || "",
              duration: q.duration || "",
              currentMedicines: q.medicines?.join(", ") || "",
              allergies: "",
              insights: "",
              prakriti: q.prakriti || "",
              agni: "",
              previousTreatment: "",
              familyHistory: "",
              completeness: 80,
              checklist: [],
              alerts: [],
              timeline: [],
              ayushAssessment: {
                dosha: "",
                dhatu: "",
                srotas: "",
                nidana: "",
                chikitsa: "",
              },
              medicalHistory: {
                pastConditions: "",
                surgeries: "",
                lifestyle: "",
              },
            } satisfies PatientData));
          // store reports map
          const reportsMap: Record<string, any[]> = {};
          queue.forEach((q: any) => {
            if (q.reports && q.reports.length > 0) {
              reportsMap[q.id] = q.reports;
            }
          });
          setPatientReports((prevRp) => ({ ...prevRp, ...reportsMap }));
          return [...newEntries, ...prev];
        });
      }
    } catch (e) {}

    const saved = getCurrentDoctorProfile();
    if (saved) {
      setCurrentDoctor(saved);
      setExpertiseInput(saved.expertise.join(", "));
      setLanguagesInput(saved.languages.join(", "));
      if (saved.isPublished) {
        void publishDoctorProfileToSupabase(saved).catch((error) => {
          triggerToast(error instanceof Error ? error.message : "Cloud profile sync failed.");
        });
      }
    }
    void getDoctorQueueFromSupabase().then((cloudQueue) => {
      if (!cloudQueue.length) return;
      setQueueList((prev) => {
        const byId = new Map(prev.map((patient) => [patient.id, patient]));
        cloudQueue.forEach((patient) => byId.set(patient.id, patient));
        return Array.from(byId.values());
      });
    }).catch((error) => {
      console.error("Failed to load cloud doctor queue", error);
    });
    const unsubQueue = subscribeToDoctorQueue((queue) => {
      if (!queue || queue.length === 0) return;
      setQueueList((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const additions = queue.filter((q) => !ids.has(q.id));
        return [...additions, ...prev];
      });

      setPatients((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newEntries = queue
          .filter((q: any) => !existingIds.has(q.id))
          .map((q: any) => ({
            id: q.id,
            name: q.name,
            age: q.age || 0,
            gender: q.gender || "",
            phone: q.phone || "",
            time: q.time || "",
            language: q.language || "",
            status: q.status || "Waiting",
            chiefComplaint: q.chiefComplaint || "",
            duration: q.duration || "",
            currentMedicines: q.medicines?.join(", ") || "",
            allergies: "",
            insights: "",
            prakriti: q.prakriti || "",
            agni: "",
            previousTreatment: "",
            familyHistory: "",
            completeness: 80,
            checklist: [],
            alerts: [],
            timeline: [],
            ayushAssessment: {
              dosha: "",
              dhatu: "",
              srotas: "",
              nidana: "",
              chikitsa: "",
            },
            medicalHistory: {
              pastConditions: "",
              surgeries: "",
              lifestyle: "",
            },
          } satisfies PatientData));
        // update reports map
        const reportsMap: Record<string, any[]> = {};
        queue.forEach((q: any) => {
          if (q.reports && q.reports.length > 0) {
            reportsMap[q.id] = q.reports;
          }
        });
        setPatientReports((prevRp) => ({ ...prevRp, ...reportsMap }));
        return [...newEntries, ...prev];
      });
    });
    return () => {
      unsubQueue && unsubQueue();
    };
  }, []);

  useEffect(() => {
    const refreshQueue = () => {
      const queue = getDoctorQueue();
      if (!queue.length) return;
      setQueueList((prev) => {
        const byId = new Map(prev.map((patient) => [patient.id, patient]));
        queue.forEach((patient) => byId.set(patient.id, patient));
        return Array.from(byId.values());
      });
      void getDoctorQueueFromSupabase().then((cloudQueue) => {
        if (!cloudQueue.length) return;
        setQueueList((prev) => {
          const byId = new Map(prev.map((patient) => [patient.id, patient]));
          cloudQueue.forEach((patient) => byId.set(patient.id, patient));
          return Array.from(byId.values());
        });
      }).catch((error) => console.error("Failed to refresh cloud doctor queue", error));
    };

    window.addEventListener("focus", refreshQueue);
    document.addEventListener("visibilitychange", refreshQueue);
    return () => {
      window.removeEventListener("focus", refreshQueue);
      document.removeEventListener("visibilitychange", refreshQueue);
    };
  }, []);

  // Handler to open case sheet directly from the Live Patient Queue table
  const handleConsultFromQueue = (item: QueuedPatient) => {
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) return prev;
      const newPatient: PatientData = {
        id: item.id,
        name: item.name,
        age: item.patientAge || item.age || 0,
        gender: item.patientGender || item.gender || "",
        phone: item.phone || "",
        time: item.time || "",
        language: item.language || "",
        status: (item.status as any) || "Waiting",
        chiefComplaint: item.issue || item.chiefComplaint || "Consultation Request",
        duration: item.duration || "",
        currentMedicines: item.medicines?.join(", ") || "",
        allergies: "",
        insights: item.prakriti || "",
        prakriti: item.prakriti || "",
        agni: "",
        previousTreatment: "",
        familyHistory: "",
        completeness: 85,
        checklist: [],
        alerts: (item.severity === "High" || item.severity === "severe") ? [{
          id: "severe-flag",
          type: "danger",
          title: "🚨 High Severity Case",
          desc: item.issue || "Patient reported acute or severe symptoms during AI case-taking",
          resolved: false
        }] : [],
        timeline: [],
        ayushAssessment: {
          dosha: item.prakriti || "",
          dhatu: "",
          srotas: "",
          nidana: item.issue || "",
          chikitsa: "",
        },
        medicalHistory: {
          pastConditions: "",
          surgeries: "",
          lifestyle: "Sedentary",
        },
      };
      return [newPatient, ...prev];
    });

    if (item.reports && item.reports.length > 0) {
      setPatientReports((prev) => ({
        ...prev,
        [item.id]: item.reports,
      }));
    }

    setSelectedPatientId(item.id);
    setActiveSidebarTab("Home");
    triggerToast(`Opened consultation workspace for ${item.name} (${item.userId || item.id})`);
  };

  // AI Intake Summary State synced from Patient Portal
  const [aiIntake, setAiIntake] = useState<AIIntakeSummary | null>(null);
  const [showAIIntakeModal, setShowAIIntakeModal] = useState(false);

  useEffect(() => {
    const summary = getAIIntakeSummary();
    setAiIntake(summary);
    if (summary) {
      setPatients((prev) =>
        prev.map((p) => {
          const matchesIntake = summary && (p.id === summary.patientId || (summary.patientName && p.name === summary.patientName));
          if (matchesIntake) {
            return {
              ...p,
              chiefComplaint: summary.chiefComplaint || p.chiefComplaint,
              duration: summary.duration || p.duration,
              insights: `${summary.predictedDosha} (${summary.severity} severity)`,
              alerts: summary.isRedFlag
                ? [
                    {
                      id: "ai-red-flag",
                      type: "danger" as const,
                      title: "🚩 AI Triage Red Flag",
                      desc: summary.redFlagReasons.join(" • ") || "Severe pain / chronic duration",
                      resolved: false,
                    },
                    ...p.alerts.filter((a) => a.id !== "ai-red-flag"),
                  ]
                : p.alerts,
            };
          }
          return p;
        })
      );
    }

    const unsub = subscribeToAIIntake((updated) => {
      setAiIntake(updated);
        if (updated) {
        setPatients((prev) =>
          prev.map((p) => {
            const matchesIntake = updated && (p.id === updated.patientId || (updated.patientName && p.name === updated.patientName));
            if (matchesIntake) {
              return {
                ...p,
                chiefComplaint: updated.chiefComplaint || p.chiefComplaint,
                duration: updated.duration || p.duration,
                insights: `${updated.predictedDosha} (${updated.severity} severity)`,
                alerts: updated.isRedFlag
                  ? [
                      {
                        id: "ai-red-flag",
                        type: "danger" as const,
                        title: "🚩 AI Triage Red Flag",
                        desc: updated.redFlagReasons.join(" • ") || "Severe pain / chronic duration",
                        resolved: false,
                      },
                      ...p.alerts.filter((a) => a.id !== "ai-red-flag"),
                    ]
                  : p.alerts,
              };
            }
            return p;
          })
        );
        triggerToast(`New AI Clinical Intake Summary received for ${updated.patientName || 'patient'}!`);
      }
    });

    return () => unsub();
  }, []);

  const handleImportAISummary = () => {
    if (!aiIntake) return;
    setPatients((prev) =>
      prev.map((p) => {
        const matchesIntake = aiIntake && (p.id === aiIntake.patientId || (aiIntake.patientName && p.name === aiIntake.patientName));
        if (matchesIntake) {
          return {
            ...p,
            chiefComplaint: aiIntake.chiefComplaint || p.chiefComplaint,
            duration: aiIntake.duration || p.duration,
            insights: `${aiIntake.predictedDosha} (${aiIntake.severity} severity)`,
          };
        }
        return p;
      })
    );
    markAIIntakeAccepted(aiIntake.id);
    triggerToast(`AI Clinical Intake Summary imported into ${aiIntake.patientName || 'patient'}'s Case Sheet!`);
    setShowAIIntakeModal(false);
  };

  const handlePublishDoctorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoctor.name.trim() || !currentDoctor.hospital.trim()) {
      triggerToast("Please enter doctor name and hospital/clinic.");
      return;
    }

    const doctorId =
      currentDoctor.id && currentDoctor.id.trim()
        ? currentDoctor.id
        : `doc-${Date.now()}`;

    const updatedProfile: DoctorProfile = {
      ...currentDoctor,
      id: doctorId,
      name: currentDoctor.name.trim(),
      specialty: currentDoctor.specialty || "Ayurveda",
      subSpecialty: currentDoctor.subSpecialty.trim() || `${currentDoctor.specialty || "Ayurveda"} Specialist`,
      qualifications: currentDoctor.qualifications.trim() || "BAMS, MD (Ayurveda)",
      experienceYears: Number(currentDoctor.experienceYears) || 1,
      hospital: currentDoctor.hospital.trim(),
      location: currentDoctor.location.trim() || "India",
      rating: Number(currentDoctor.rating) || 4.9,
      reviewsCount: Number(currentDoctor.reviewsCount) || 1,
      consultationFee: Number(currentDoctor.consultationFee) || 500,
      availableTimings: currentDoctor.availableTimings.trim() || "Mon - Sat (10:00 AM - 04:00 PM)",
      nextAvailableSlot: currentDoctor.nextAvailableSlot.trim() || "Today, 4:00 PM",
      languages: languagesInput.split(",").map((s) => s.trim()).filter(Boolean),
      expertise: expertiseInput.split(",").map((s) => s.trim()).filter(Boolean),
      about: currentDoctor.about.trim() || "Registered AYUSH Medical Practitioner.",
      phone: currentDoctor.phone.trim(),
      registrationNumber: currentDoctor.registrationNumber.trim() || "AYU-DEL-2015-08129",
      isPublished: true,
      isSeedDoctor: false,
    };

    try {
      await publishDoctorProfileToSupabase(updatedProfile);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Cloud publish failed. Nothing was published.");
      return;
    }
    const saved = saveCurrentDoctorProfile(updatedProfile);
    setCurrentDoctor(saved);
    triggerToast("Your Doctor Profile has been published! Patients can now see your card on the consultation page.");
  };

  const handleUnpublishDoctorProfile = () => {
    unpublishCurrentDoctorProfile(currentDoctor.id);
    const updated = { ...currentDoctor, isPublished: false };
    setCurrentDoctor(updated);
    triggerToast("Profile unpublished. Your card is now hidden from the patient consultation page.");
  };

  const handleToggleDoctorAvailability = () => {
    const updated = { ...currentDoctor, isAvailableToday: !currentDoctor.isAvailableToday };
    setCurrentDoctor(updated);
    if (updated.isPublished) {
      saveCurrentDoctorProfile(updated);
    }
    triggerToast(`Status set to: ${updated.isAvailableToday ? "Available Today" : "Offline / Busy"}`);
  };

  // Notifications Popover
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: "New pre-consultation ready", desc: "A patient completed AI intake via mobile.", time: "5 min ago", read: false },
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
    doctorPrescription: "",
    doctorNotes: ""
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDoctorDragOver, setIsDoctorDragOver] = useState(false);

  // Active patient object (use a safe default when patients list is empty)
  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0] || DEFAULT_PATIENT;

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

  // Handle Document Upload & Processing
  const processUploadedFile = (file: File) => {
    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const isImg = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    const newTimelineItem: TimelineItem = {
      id: `doc-${Date.now()}`,
      date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      title: `${file.name} (Uploaded by Doctor)`,
      type: isPdf ? "Lab Report" : isImg ? "Prescription" : "Clinical Document",
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDoctorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDoctorDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Handle quick tag upload mock
  const handleQuickUpload = (docType: string) => {
    const newTimelineItem: TimelineItem = {
      id: `doc-quick-${Date.now()}`,
      date: "May 2024",
      title: `${docType} Attached - ${currentDoctor.name || 'Attending Physician'}`,
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
                  {currentDoctor.name || 'Attending Physician'}
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
              { id: "DoctorListing", label: t("nav.doctorListing", "Doctor Listing"), icon: Stethoscope, badge: currentDoctor.isPublished ? "Live" : "Draft" },
              { id: "Queue", label: t("nav.patientQueue", "Patient Queue"), icon: Users, badge: patients.length.toString() },
              { id: "Consultations", label: t("nav.consultations", "Consultations"), icon: Calendar, badge: null },
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
                {t("banner.welcome", `Welcome, ${currentDoctor.name || 'Physician'}`)}
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

            {/* Quick Switch between Case Sheet, Live Queue, and Doctor Profile */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveSidebarTab("Home")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSidebarTab !== "DoctorListing" && activeSidebarTab !== "Queue"
                    ? "bg-[#0E7C4A] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Case Sheet</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab("Queue")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSidebarTab === "Queue"
                    ? "bg-[#0E7C4A] text-white shadow-sm"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 hover:bg-amber-100"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Patient Queue</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeSidebarTab === "Queue"
                    ? "bg-white text-[#0E7C4A]"
                    : "bg-[#0E7C4A] text-white"
                }`}>
                  {queueList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarTab("DoctorListing")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSidebarTab === "DoctorListing"
                    ? "bg-[#0E7C4A] text-white shadow-sm"
                    : "bg-[#EAF7EF] text-[#0E7C4A] dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-[#d8f0e1]"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>My Doctor Profile ({currentDoctor.isPublished ? "Live" : "Draft"})</span>
              </button>
            </div>
          </div>

          {activeSidebarTab === "DoctorListing" ? (
            <div className="space-y-6">
              {/* Doctor Listing Header & Status */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      currentDoctor.isPublished 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                    }`}>
                      {currentDoctor.isPublished ? "● Published & Live on Patient Directory" : "○ Draft Profile (Not Visible to Patients)"}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Physician Profile &amp; Directory Manager
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    My Doctor Profile &amp; Public Listing
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Complete your details to show your doctor card on the patient consultation page. Only published doctors appear to patients.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleDoctorAvailability}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      currentDoctor.isAvailableToday
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {currentDoctor.isAvailableToday ? "● Available Today" : "○ Offline Today"}
                  </button>

                  <Link
                    href="/patient"
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0E7C4A]" />
                    <span>View Patient Side</span>
                  </Link>
                </div>
              </div>

              {/* 2-Column: Form on Left, Live Patient Card Preview on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Form (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] dark:bg-emerald-950 text-[#0E7C4A] dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Physician Information &amp; Clinical Details
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Doctors can only manage their own profile details.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handlePublishDoctorProfile} className="space-y-4 text-xs">
                    {/* Row 1: Name & Specialty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Full Name with Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={currentDoctor.name}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, name: e.target.value })}
                          placeholder="e.g. Dr. Name"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          AYUSH Clinical Specialty *
                        </label>
                        <select
                          value={currentDoctor.specialty}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, specialty: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        >
                          <option value="Ayurveda">Ayurveda</option>
                          <option value="Panchakarma">Panchakarma</option>
                          <option value="Yoga & Naturopathy">Yoga &amp; Naturopathy</option>
                          <option value="Unani">Unani</option>
                          <option value="Siddha">Siddha</option>
                          <option value="Homeopathy">Homeopathy</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Sub-specialty & Qualifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Sub-Specialty / Super-focus
                        </label>
                        <input
                          type="text"
                          value={currentDoctor.subSpecialty}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, subSpecialty: e.target.value })}
                          placeholder="e.g. Kayachikitsa &amp; Nadi Pariksha"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Qualifications &amp; Degrees *
                        </label>
                        <input
                          type="text"
                          required
                          value={currentDoctor.qualifications}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, qualifications: e.target.value })}
                          placeholder="e.g. BAMS, MD (Kayachikitsa)"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    {/* Row 3: Experience, Hospital & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Experience (Years)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={currentDoctor.experienceYears}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, experienceYears: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Hospital / Clinic *
                        </label>
                        <input
                          type="text"
                          required
                          value={currentDoctor.hospital}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, hospital: e.target.value })}
                          placeholder="e.g. Charkha AYUSH Hospital"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          City / Location
                        </label>
                        <input
                          type="text"
                          value={currentDoctor.location}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, location: e.target.value })}
                          placeholder="e.g. New Delhi"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    {/* Row 4: Fee, Timings, Next Slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Consultation Fee (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={currentDoctor.consultationFee}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, consultationFee: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Available Timings
                        </label>
                        <input
                          type="text"
                          value={currentDoctor.availableTimings}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, availableTimings: e.target.value })}
                          placeholder="Mon - Sat (10 AM - 3 PM)"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Next Slot Display
                        </label>
                        <input
                          type="text"
                          value={currentDoctor.nextAvailableSlot}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, nextAvailableSlot: e.target.value })}
                          placeholder="e.g. Today, 4:00 PM"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    {/* Row 5: Registration & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          AYUSH Registration Number
                        </label>
                        <input
                          type="text"
                          value={currentDoctor.registrationNumber}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, registrationNumber: e.target.value })}
                          placeholder="e.g. AYU-DEL-2015-08129"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Contact Number / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={currentDoctor.phone}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, phone: e.target.value })}
                          placeholder="e.g. +91 96364 62356"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    {/* Row 6: Rating & Reviews */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Doctor Rating (1.0 to 5.0)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={currentDoctor.rating}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, rating: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Verified Reviews Count
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={currentDoctor.reviewsCount}
                          onChange={(e) => setCurrentDoctor({ ...currentDoctor, reviewsCount: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    {/* Row 7: Clinical Expertise Tags */}
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Areas of Clinical Expertise (comma-separated tags)
                      </label>
                      <input
                        type="text"
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        placeholder="Panchakarma, Nadi Pariksha, Joint Pain, Digestive Health, Stress Relief"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                      />
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        These tags appear on your patient-facing doctor card for quick patient discovery.
                      </p>
                    </div>

                    {/* Row 8: Languages */}
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Languages Spoken (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={languagesInput}
                        onChange={(e) => setLanguagesInput(e.target.value)}
                        placeholder="Hindi, English, Sanskrit"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    {/* Row 9: About / Clinical Philosophy */}
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        About / Clinical Approach
                      </label>
                      <textarea
                        rows={3}
                        value={currentDoctor.about}
                        onChange={(e) => setCurrentDoctor({ ...currentDoctor, about: e.target.value })}
                        placeholder="Brief summary of your clinical expertise and holistic patient approach..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A] text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    {/* Checkbox: Available Today */}
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        id="doctorAvailToday"
                        checked={currentDoctor.isAvailableToday}
                        onChange={(e) => setCurrentDoctor({ ...currentDoctor, isAvailableToday: e.target.checked })}
                        className="w-4 h-4 rounded text-[#0E7C4A] focus:ring-[#0E7C4A] cursor-pointer"
                      />
                      <label htmlFor="doctorAvailToday" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer text-xs">
                        Mark as &quot;Available Today&quot; (Allows instant online &amp; walk-in consultation booking)
                      </label>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      {currentDoctor.isPublished ? (
                        <button
                          type="button"
                          onClick={handleUnpublishDoctorProfile}
                          className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          Unpublish from Patient Directory
                        </button>
                      ) : (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          ⚠️ Profile is currently unpublished / draft.
                        </span>
                      )}

                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Save &amp; Publish Profile</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: Live Patient Card Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                  {/* Live Preview Card */}
                  <div className="bg-gradient-to-br from-[#EAF7EF]/80 via-white to-[#F3FAF6] dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-5 rounded-3xl border border-[#CFEBDB] dark:border-emerald-900/40 shadow-md">
                    <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#D7ECE1] dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E7C4A] dark:text-emerald-400">
                          Live Patient Card Preview
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {currentDoctor.isPublished ? "🟢 Live on /patient" : "⚪ Preview Only"}
                      </span>
                    </div>

                    {/* Patient-facing Doctor Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[22px] border-[1.4px] border-[#D7ECE1] dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        {/* Top row: Avatar, Name, Verification, Availability */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0E7C4A] to-[#123B2C] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                                {currentDoctor.name ? currentDoctor.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2) : "DR"}
                              </div>
                              {currentDoctor.isAvailableToday && (
                                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5 animate-pulse" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                  {currentDoctor.name || "Dr. Name"}
                                </h3>
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9.5px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
                                  ✓ Verified
                                </span>
                              </div>

                              <p className="text-xs font-bold text-[#0E7C4A] dark:text-emerald-400 mt-0.5">
                                {currentDoctor.specialty} {currentDoctor.subSpecialty ? `• ${currentDoctor.subSpecialty}` : ""}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            currentDoctor.isAvailableToday
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}>
                            {currentDoctor.isAvailableToday ? "● Available Today" : "○ Offline"}
                          </span>
                        </div>

                        {/* Qualifications & Hospital */}
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {currentDoctor.qualifications || "Degrees"} • <span className="text-slate-500 font-normal">{currentDoctor.experienceYears} yrs experience</span>
                          </p>
                          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{currentDoctor.hospital || "Hospital / Clinic"}, {currentDoctor.location}</span>
                          </p>
                        </div>

                        {/* Rating & Fee Banner */}
                        <div className="mt-3.5 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{currentDoctor.rating}</span>
                            <span className="text-[11px] text-slate-400 font-normal">({currentDoctor.reviewsCount} reviews)</span>
                          </div>
                          <div className="font-extrabold text-[#0E7C4A] dark:text-emerald-400">
                            ₹{currentDoctor.consultationFee} <span className="text-[10px] font-normal text-slate-500">/ session</span>
                          </div>
                        </div>

                        {/* Expertise Pills */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(expertiseInput ? expertiseInput.split(",").map((s) => s.trim()).filter(Boolean) : []).slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#F3FAF6] dark:bg-emerald-950/40 text-[#0A5E39] dark:text-emerald-300 border border-[#D7ECE1] dark:border-emerald-900/40 text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Next Available Slot */}
                        <div className="mt-3 text-[11px] text-[#0E7C4A] dark:text-emerald-400 font-medium flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                          <span className="flex items-center gap-1">
                            ⚡ Next Slot: <b className="font-bold">{currentDoctor.nextAvailableSlot}</b>
                          </span>
                          <span className="text-[10px] text-slate-400">Reg: {currentDoctor.registrationNumber}</span>
                        </div>
                      </div>

                      {/* Mock Booking Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 px-3 rounded-xl bg-[#0E7C4A]/20 text-[#0E7C4A] dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Consultation (Patient View)</span>
                        </button>
                      </div>
                    </div>

                    {/* Visibility Notice */}
                    <div className="mt-3 p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>🛡️</span> Zero Mock Doctors Policy
                      </p>
                      <p>
                        Only real doctors who log in and save their profile appear to patients. You can unpublish anytime to temporarily remove yourself from patient bookings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeSidebarTab === "Queue" ? (
            <div className="space-y-6">
              {/* Queue Header & Stats */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real-time Sync Active
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      AYUSH OPD Consultation Triage
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                    <span>Live Patient Consultation Queue</span>
                    <span className="text-xs sm:text-sm px-3 py-0.5 rounded-full bg-[#EAF7EF] dark:bg-emerald-950 text-[#0E7C4A] dark:text-emerald-300 font-bold">
                      {filteredQueue.length} Patient{filteredQueue.length === 1 ? "" : "s"}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Cases submitted by patients after 4-step AI clinical case taking. Click any report to immediately download or open the case sheet to begin consultation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = getDoctorQueue();
                      setQueueList(updated);
                      triggerToast("Queue refreshed from latest patient submissions.");
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#0E7C4A]" />
                    <span>Refresh Queue</span>
                  </button>

                  <button
                    onClick={() => setActiveSidebarTab("Home")}
                    className="px-4 py-2 rounded-xl bg-[#0E7C4A] hover:bg-[#0B643B] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-800/20"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Go to Case Sheet</span>
                  </button>
                </div>
              </div>

              {/* Queue Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Total in Queue</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{queueList.length}</div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">Active OPD submissions</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">High Priority / Red Flags</div>
                  <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                    {queueList.filter((q) => q.severity === "High" || q.severity === "severe" || (q.status as string) === "Triaged").length}
                  </div>
                  <div className="text-[11px] text-red-500 mt-0.5">Requires urgent review</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Clinical Reports Attached</div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    {queueList.reduce((acc, q) => acc + (q.reports?.length || 0), 0)}
                  </div>
                  <div className="text-[11px] text-blue-500 mt-0.5">Direct 1-click download</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Assigned to You</div>
                  <div className="text-2xl font-black text-[#0E7C4A] dark:text-emerald-400 mt-1">
                    {queueList.filter((q) => currentDoctor.name && q.assignedDoctorName === currentDoctor.name).length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Direct patient referrals</div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    placeholder="Search User ID, Patient Name, Issue, Doctor..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0E7C4A]"
                  />
                  {queueSearch && (
                    <button
                      onClick={() => setQueueSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 font-medium">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#0E7C4A]" />
                    <span>Filter:</span>
                  </div>

                  {/* Doctor Filter */}
                  <select
                    value={queueDoctorFilter}
                    onChange={(e) => setQueueDoctorFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0E7C4A]"
                  >
                    <option value="All">All Assigned Doctors</option>
                    {currentDoctor.name && (
                      <option value="Me">Assigned to Me ({currentDoctor.name})</option>
                    )}
                    {Array.from(new Set(queueList.map((q) => q.assignedDoctorName).filter(Boolean))).map((docName) => (
                      <option key={docName} value={docName}>
                        {docName}
                      </option>
                    ))}
                  </select>

                  {/* Status / Severity Filter */}
                  <select
                    value={queueStatusFilter}
                    onChange={(e) => setQueueStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0E7C4A]"
                  >
                    <option value="All">All Severity / Status</option>
                    <option value="severe">High Severity (Severe)</option>
                    <option value="moderate">Moderate</option>
                    <option value="mild">Mild</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Triaged">Triaged</option>
                  </select>
                </div>
              </div>

              {/* CARD TABLE RENDERING */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                {filteredQueue.length === 0 ? (
                  <div className="py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      No matching patients in queue
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {queueSearch || queueDoctorFilter !== "All" || queueStatusFilter !== "All"
                        ? "Try adjusting your search query or reset your filters."
                        : "When patients complete AI Case Taking and submit their case, they will appear here in real time."}
                    </p>
                    {(queueSearch || queueDoctorFilter !== "All" || queueStatusFilter !== "All") && (
                      <button
                        onClick={() => {
                          setQueueSearch("");
                          setQueueDoctorFilter("All");
                          setQueueStatusFilter("All");
                        }}
                        className="mt-4 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <th className="py-3.5 px-4">User ID</th>
                          <th className="py-3.5 px-4">Patient Name &amp; Details</th>
                          <th className="py-3.5 px-4">Issue / Symptoms</th>
                          <th className="py-3.5 px-4 min-w-[220px]">Patient Report</th>
                          <th className="py-3.5 px-4">Assigned Doctor</th>
                          <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                        {filteredQueue.map((item) => {
                          const reports = item.reports || [];
                          const isHigh = item.severity === "High" || item.severity === "severe";
                          const isMod = item.severity === "Medium" || item.severity === "moderate";

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors group"
                            >
                              {/* 1. USER ID */}
                              <td className="py-4 px-4 align-top">
                                <div className="space-y-1">
                                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 block w-fit">
                                    {item.userId || item.id}
                                  </span>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{item.time || "Recently"}</span>
                                  </div>
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                      item.status === "In Consultation"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                        : (item.status as string) === "Triaged"
                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    }`}
                                  >
                                    {item.status || "Waiting"}
                                  </span>
                                </div>
                              </td>

                              {/* 2. PATIENT NAME */}
                              <td className="py-4 px-4 align-top">
                                <div className="space-y-1">
                                  <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                    <span>{item.name}</span>
                                    {isHigh && (
                                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High Priority" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    {item.age ? `${item.age} yrs` : ""} {item.gender ? `• ${item.gender}` : ""}
                                  </div>
                                  {item.phone && (
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      {item.phone}
                                    </div>
                                  )}
                                  {item.language && (
                                    <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      {item.language}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 3. ISSUE & SYMPTOMS */}
                              <td className="py-4 px-4 align-top">
                                <div className="space-y-1.5 max-w-xs">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs line-clamp-2">
                                    {item.issue || item.chiefComplaint || "General AYUSH OPD Case"}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {/* Severity pill */}
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isHigh
                                          ? "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-900"
                                          : isMod
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                                      }`}
                                    >
                                      {item.severity ? `${item.severity.toUpperCase()}` : "STANDARD"}
                                    </span>

                                    {/* Prakriti / Dosha */}
                                    {item.prakriti && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                                        {item.prakriti}
                                      </span>
                                    )}

                                    {item.duration && (
                                      <span className="text-[10px] text-slate-400">
                                        • {item.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 4. PATIENT REPORT (CLICK TO DOWNLOAD) */}
                              <td className="py-4 px-4 align-top">
                                {reports.length > 0 ? (
                                  <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      {reports.length} File{reports.length === 1 ? "" : "s"} Available
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      {reports.map((rep) => (
                                        <button
                                          key={rep.id}
                                          type="button"
                                          onClick={() => {
                                            downloadPatientReport(rep);
                                            triggerToast(`Downloading report: ${rep.name}`);
                                          }}
                                          className="group/btn text-left px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between gap-2 shadow-xs cursor-pointer"
                                          title={`Click to download ${rep.name}`}
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-6 h-6 rounded-lg bg-[#0E7C4A] text-white flex items-center justify-center shrink-0 shadow-xs">
                                              <FileText className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="truncate min-w-0">
                                              <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate group-hover/btn:text-[#0E7C4A] dark:group-hover/btn:text-emerald-300">
                                                {rep.name}
                                              </p>
                                              <p className="text-[9.5px] text-slate-400">
                                                {rep.type || "Document"} {rep.size ? `• ${rep.size}` : ""}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center shrink-0 text-[#0E7C4A] dark:text-emerald-400 group-hover/btn:bg-[#0E7C4A] group-hover/btn:text-white transition-colors">
                                            <Download className="w-3 h-3" />
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-2 text-slate-400 text-[11px] italic flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-slate-300" />
                                    <span>No reports attached</span>
                                  </div>
                                )}
                              </td>

                              {/* 5. ASSIGNED DOCTOR */}
                              <td className="py-4 px-4 align-top">
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                                    <Stethoscope className="w-3.5 h-3.5 text-[#0E7C4A]" />
                                    <span>{item.assignedDoctorName || "General AYUSH OPD"}</span>
                                  </div>
                                  {item.assignedDoctorSpecialty && (
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      {item.assignedDoctorSpecialty}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 6. ACTION: CONSULT / OPEN CASE SHEET */}
                              <td className="py-4 px-4 align-top text-right">
                                <button
                                  type="button"
                                  onClick={() => handleConsultFromQueue(item)}
                                  className="px-3.5 py-2 rounded-xl bg-[#0E7C4A] hover:bg-[#0B643B] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 ml-auto cursor-pointer"
                                >
                                  <span>Open Case</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Quick Queue Switcher Ribbon */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  {t("activePatientLabel", "Active Patient:")}
                </span>
                {patients.map((p) => {
                  const isCurrent = p.id === currentPatient.id;
                  const hasSummary = Boolean(aiIntake && (p.id === aiIntake.patientId || (aiIntake.patientName && p.name === aiIntake.patientName)));
                  const isRed = hasSummary && aiIntake?.isRedFlag;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border cursor-pointer ${
                        isCurrent
                          ? "bg-[#0E7C4A] text-white border-[#0E7C4A] shadow-md shadow-emerald-800/20"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-white animate-pulse" : "bg-emerald-500"}`} />
                      <span>{p.name}</span>
                      {hasSummary && (
                        <span className={`px-2 py-0.2 rounded-full text-[9.5px] font-extrabold ${
                          isRed
                            ? "bg-red-500 text-white animate-pulse"
                            : isCurrent
                            ? "bg-white/25 text-white"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                          {isRed ? "🚩 Red Flag" : "✨ AI Summary"}
                        </span>
                      )}
                      <span className={`text-[10px] font-mono ${isCurrent ? "text-emerald-100" : "text-slate-400"}`}>
                        ({p.id})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* AI CLINICAL INTAKE NOTIFICATION BANNER (When AI summary is present) */}
              {aiIntake && (currentPatient && (currentPatient.id === aiIntake.patientId || (aiIntake.patientName && currentPatient.name === aiIntake.patientName))) && (
                <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 ${
                  aiIntake.isRedFlag
                    ? "bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-900/60"
                    : "bg-gradient-to-r from-[#EAF7EF] to-white dark:from-emerald-950/40 dark:to-slate-900 border-[#CFEBDB] dark:border-emerald-900/50"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                      aiIntake.isRedFlag
                        ? "bg-red-600 text-white"
                        : "bg-[#0E7C4A] text-white"
                    }`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          AI Pre-Consultation Triage Summary Ready
                        </h4>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          aiIntake.severity === "High"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200 border border-red-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                        }`}>
                          {aiIntake.severity} Intensity • {aiIntake.duration}
                        </span>
                        {aiIntake.isRedFlag && (
                          <span className="px-2 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>CRITICAL RED FLAG</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                        Patient reported: &ldquo;{aiIntake.chiefComplaint}&rdquo; • <span className="text-[#0E7C4A] dark:text-emerald-400 font-bold">{aiIntake.predictedDosha}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowAIIntakeModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0E7C4A]" />
                      <span>View AI Summary</span>
                    </button>
                    <button
                      onClick={handleImportAISummary}
                      className="px-3.5 py-2 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept into Case Sheet</span>
                    </button>
                  </div>
                </div>
              )}

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
                  <button
                    onClick={() => {
                      const reps = patientReports[currentPatient.id] || [];
                      setReportsForModal(reps);
                      setShowReportsModal(true);
                    }}
                    className="ml-3 text-[#0E7C4A] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-xs"
                    disabled={!(patientReports[currentPatient.id] && patientReports[currentPatient.id].length > 0)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>See Reports</span>
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
                  <div className="space-y-4 pt-1">
                    {/* AI Intake Sync Notification Bar */}
                    {aiIntake && (currentPatient && (currentPatient.id === aiIntake.patientId || (aiIntake.patientName && currentPatient.name === aiIntake.patientName))) && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-[#0E7C4A] text-white flex items-center justify-center shrink-0">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                AI Intake Triage Available: <span className="font-semibold text-slate-700 dark:text-slate-200">&ldquo;{aiIntake.chiefComplaint}&rdquo;</span>
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                aiIntake.severity === "High"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                              }`}>
                                {aiIntake.severity} Intensity • {aiIntake.duration}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Ayurvedic insight: {aiIntake.predictedDosha} • Agni: {aiIntake.agniAssessment}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAIIntakeModal(true)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                          >
                            Review AI Triage
                          </button>
                          <button
                            type="button"
                            onClick={handleImportAISummary}
                            className="px-3 py-1.5 rounded-xl bg-[#0E7C4A] hover:bg-[#095934] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply to Case Sheet</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
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
                      onDragOver={(e) => { e.preventDefault(); setIsDoctorDragOver(true); }}
                      onDragLeave={() => setIsDoctorDragOver(false)}
                      onDrop={handleDoctorDrop}
                      className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer text-center space-y-2 transition-all select-none group ${
                        isDoctorDragOver
                          ? "border-[#0E7C4A] bg-emerald-50 dark:bg-emerald-950/40 scale-[0.99]"
                          : "border-slate-300 dark:border-slate-700 hover:border-[#0E7C4A] dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40"
                      }`}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
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
                        doctorPrescription: "",
                        doctorNotes: ""
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

          </>
          )}

        </main>
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE MODALS                                     */}
      {/* ======================================================== */}

      {/* MODAL 0: AI CLINICAL INTAKE SUMMARY MODAL */}
      {showAIIntakeModal && aiIntake && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#0E7C4A]/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0E7C4A] text-white flex items-center justify-center shadow-md shadow-[#0E7C4A]/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      AI Pre-Consultation Intake Summary
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      {aiIntake.aiProvider}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Patient: <strong className="text-slate-700 dark:text-slate-200">{aiIntake.patientName}</strong> ({aiIntake.patientId}) • {aiIntake.timestamp}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIIntakeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Red Flag Alert if applicable */}
              {aiIntake.isRedFlag && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-rose-900 dark:text-rose-100">
                      🚩 Red Flag Clinical Attention Required
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      Patient reported high pain severity or chronic duration exceeding standard safe thresholds. Immediate priority evaluation recommended.
                    </p>
                    {aiIntake.redFlagReasons && aiIntake.redFlagReasons.length > 0 && (
                      <ul className="list-disc list-inside space-y-0.5 pt-1 text-[11px] text-rose-800 dark:text-rose-200 font-medium">
                        {aiIntake.redFlagReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Status / Acceptance pill */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Status</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                  aiIntake.status === "Accepted into Case Sheet"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                }`}>
                  {aiIntake.status}
                </span>
              </div>

              {/* Key Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chief Complaint</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {aiIntake.chiefComplaint}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pain / Discomfort Severity</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      aiIntake.severity === "High"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
                        : aiIntake.severity === "Medium"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                    }`}>
                      {aiIntake.severity} Intensity
                    </span>
                    <span className="text-xs text-slate-500">Duration: <strong>{aiIntake.duration}</strong></span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Predicted AYUSH Dosha</span>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {aiIntake.predictedDosha}
                  </p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                    Agni: {aiIntake.agniAssessment}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice Verification</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{aiIntake.voiceTranscriptVerified ? "Speech-to-Text confirmed by Patient" : "Direct Patient Input"}</span>
                  </div>
                  {aiIntake.associatedSymptoms && (
                    <p className="text-[11px] text-slate-500 pt-0.5">
                      Associated: {aiIntake.associatedSymptoms}
                    </p>
                  )}
                </div>
              </div>

              {/* Verified Dialogue / Chat History Accordion */}
              {aiIntake.conversationHistory && aiIntake.conversationHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#0E7C4A]" />
                    <span>Patient Intake Dialogue History</span>
                  </h4>
                  <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                    {aiIntake.conversationHistory.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl text-xs ${
                          m.from === "bot"
                            ? "bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 text-slate-700 dark:text-slate-200"
                            : "bg-[#EAF7EF] dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ml-4 font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1">
                          <span>{m.from === "bot" ? "AI Assistant" : aiIntake.patientName}</span>
                          <span>{m.time}</span>
                        </div>
                        <p>{m.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowAIIntakeModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleImportAISummary}
                className="px-5 py-2.5 rounded-xl bg-[#0E7C4A] hover:bg-[#095934] text-white font-bold flex items-center gap-2 shadow-md shadow-[#0E7C4A]/25 transition-all text-xs"
              >
                <Check className="w-4 h-4" />
                <span>Import & Apply into Case Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SEE REPORTS */}
      {showReportsModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Patient Reports</h3>
              <button onClick={() => setShowReportsModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {reportsForModal && reportsForModal.length > 0 ? (
                reportsForModal.map((r: any) => (
                  <div key={r.id || r.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{r.name}</div>
                      <div className="text-[11px] text-slate-500">{r.date} • {r.type} • {r.size || "-"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-[#0E7C4A] text-white text-xs font-bold">Open</a>
                      ) : (
                        <button className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs" disabled>No file</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500">No reports attached for this patient yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

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
                    Attending Physician: {currentDoctor.name || '—'}
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
                      triggerToast(`Case Sheet Digitally Signed by ${currentDoctor.name || 'Physician'}.`);
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
