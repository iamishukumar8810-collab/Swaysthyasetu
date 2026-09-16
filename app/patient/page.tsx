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
  getStoredPatientData,
  addReportToPatientData,
  PatientProfile, 
  Medication, 
  ConsultationVisit, 
  MedicalReport 
} from "@/lib/patient-data";
import { 
  DoctorProfile, 
  getDoctors, 
  getPublishedDoctorsFromSupabase, 
  subscribeToDoctors, 
  addPatientToQueue, 
  saveDoctorQueueEntryToSupabase,
  addDoctorNotification
} from "@/lib/doctorStore";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateClinicalSummaryPDF, downloadPDF } from "@/lib/pdfGenerator";
import { AIIntakeSummary, saveAIIntakeSummary } from "@/lib/aiIntakeStore";
import { evaluateAyushDoshaAndAgni } from "@/lib/redFlag";

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
  const [aiStep, setAiStep] = useState<"symptoms" | "reports" | "medicines" | "review">("symptoms");
  const [aiSymptoms, setAiSymptoms] = useState<string[]>([]);
  const [aiSeverity, setAiSeverity] = useState(4);
  const [aiDescription, setAiDescription] = useState("");
  const [aiReports, setAiReports] = useState<Array<{ id: string; name: string; storagePath?: string; url?: string; type?: string; size?: number }>>([]);
  const [aiMedicines, setAiMedicines] = useState<Array<{ name: string; dose: string; frequency: string }>>([]);
  const [aiMedicineDraft, setAiMedicineDraft] = useState({ name: "", dose: "", frequency: "Once a day" });
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);
  const [takenDoses, setTakenDoses] = useState([true, true, false, false, false]);
  const [dietTab, setDietTab] = useState<"recommended" | "restricted">("recommended");
  const [settingsTab, setSettingsTab] = useState<"profile" | "notifications" | "privacy" | "language" | "linked">("profile");
  const [settingsToggles, setSettingsToggles] = useState({ appointments: true, medicines: true, reports: true, messages: true, wellness: false, offers: false, shareData: true, research: false, twoFactor: true });
  const [settingsLanguage, setSettingsLanguage] = useState("English");
  const [conversations, setConversations] = useState<Array<{ id: string; name: string; role: string; messages: Array<{ from: "me" | "them"; text: string; time: string }> }>>([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [newPerson, setNewPerson] = useState({ name: "", role: "Doctor" });
  const [searchQuery, setSearchQuery] = useState("");
  const [symptomInput, setSymptomInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: "user" | "ai"; text: string; time: string }>>([]);

  // Doctors directory (published doctors)
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [showDoctorSelectModal, setShowDoctorSelectModal] = useState(false);
  const [selectedDoctorForCase, setSelectedDoctorForCase] = useState<DoctorProfile | null>(null);
  const [doctorSearchFilter, setDoctorSearchFilter] = useState("");
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState("All");
  const [doctorDirectoryError, setDoctorDirectoryError] = useState("");

  useEffect(() => {
    try {
      const initialDocs = getDoctors();
      setDoctors(initialDocs);
      setSelectedDoctorForCase(initialDocs[0] || null);
      void getPublishedDoctorsFromSupabase().then((cloudDocs) => {
        setDoctorDirectoryError("");
        if (cloudDocs.length > 0) {
          setDoctors(cloudDocs);
          setSelectedDoctorForCase(cloudDocs[0]);
        }
      }).catch((error) => {
        console.error("Failed to load published doctors", error);
        setDoctorDirectoryError(error instanceof Error ? error.message : "Could not load published doctors.");
      });
      const unsub = subscribeToDoctors((updated) => {
        const docsList = updated && updated.length > 0 ? updated : getDoctors();
        setDoctors(docsList);
        setSelectedDoctorForCase((curr) =>
          docsList.find((doctor) => doctor.id === curr?.id) || docsList[0] || null
        );
      });
      return () => unsub && unsub();
    } catch (e) {
      console.error("Failed to load doctors directory", e);
    }
  }, []);

  useEffect(() => {
    if (!showDoctorSelectModal) return;

    let active = true;
    const refreshPublishedDoctors = async () => {
      const localDoctors = getDoctors();
      if (active && localDoctors.length > 0) {
        setDoctors(localDoctors);
        setSelectedDoctorForCase((current) => current || localDoctors[0]);
      }

      const cloudDoctors = await getPublishedDoctorsFromSupabase();
      if (active) setDoctorDirectoryError("");
      if (active && cloudDoctors.length > 0) {
        setDoctors(cloudDoctors);
        setSelectedDoctorForCase((current) =>
          cloudDoctors.find((doctor) => doctor.id === current?.id) || cloudDoctors[0]
        );
      }
    };

    void refreshPublishedDoctors().catch((error) => {
      if (active) {
        setDoctorDirectoryError(error instanceof Error ? error.message : "Could not load published doctors.");
      }
    });
    return () => {
      active = false;
    };
  }, [showDoctorSelectModal]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("swasthya_setu_conversations");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        setActiveConversationId(parsed[0]?.id || "");
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  }, []);

  const saveConversations = (updated: typeof conversations) => {
    setConversations(updated);
    try {
      localStorage.setItem("swasthya_setu_conversations", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save conversations", e);
    }
  };

  const addConversation = () => {
    const name = newPerson.name.trim();
    if (!name) {
      triggerToast("Enter a person name first");
      return;
    }
    const conversation = { id: `conversation-${Date.now()}`, name, role: newPerson.role || "Doctor", messages: [] as Array<{ from: "me" | "them"; text: string; time: string }> };
    saveConversations([...conversations, conversation]);
    setActiveConversationId(conversation.id);
    setNewPerson({ name: "", role: "Doctor" });
  };

  const sendMessage = () => {
    const text = messageDraft.trim();
    if (!text || !activeConversationId) return;
    const updated = conversations.map((conversation) => conversation.id === activeConversationId
      ? { ...conversation, messages: [...conversation.messages, { from: "me" as const, text, time: "Just now" }] }
      : conversation);
    saveConversations(updated);
    setMessageDraft("");
  };

  // Notification dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; desc: string; time: string; read: boolean }>>([]);

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
  const [newApptDate, setNewApptDate] = useState("");
  const [newApptReason, setNewApptReason] = useState("");

  const [newReportName, setNewReportName] = useState("");
  const [newReportType, setNewReportType] = useState<"PDF" | "Image" | "Lab">("PDF");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const aiFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [durationInput, setDurationInput] = useState("");

  // Load from sanitized localStorage & user auth on mount
  useEffect(() => {
    try {
      const loaded = getStoredPatientData();
      setPatientData(loaded);

      // If user is authenticated via Supabase, set profile name/phone from session if not set
      if (isSupabaseConfigured) {
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            const email = data.user.email || "";
            const authName = data.user.user_metadata?.full_name || email.split("@")[0] || "";
            if (authName) {
              setPatientData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  name: prev.profile.name || authName,
                  phone: prev.profile.phone || data.user.phone || "",
                },
              }));
            }
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.error("Failed to load patient data", e);
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

  // Dynamic Case Readiness Score Calculation from real data
  const calculateReadiness = () => {
    let score = 0;
    if (patientData.profile.name) score += 20;
    if (patientData.profile.concerns.length > 0) score += 20;
    if (patientData.medicines.length > 0) score += 20;
    if (patientData.reports.length > 0) score += 20;
    if (patientData.profile.durationOfSymptoms) score += 20;
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadiness();
  const aiReadiness = Math.min(100, 10 + (aiSymptoms.length ? 25 : 0) + (aiDescription.trim().length > 5 ? 15 : 0) + 5 + (aiReports.length ? 25 : 0) + (aiMedicines.length ? 20 : 0));
  const aiSeverityLabel = aiSeverity >= 7 ? "Severe" : aiSeverity >= 4 ? "Moderate" : "Mild";

  const toggleAiSymptom = (symptom: string) => {
    setAiSymptoms((current) => current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]);
  };

  const addAiMedicine = () => {
    if (!aiMedicineDraft.name.trim()) {
      triggerToast("Please enter a medicine name");
      return;
    }
    setAiMedicines((current) => [...current, { ...aiMedicineDraft, name: aiMedicineDraft.name.trim(), dose: aiMedicineDraft.dose.trim() || "-" }]);
    setAiMedicineDraft({ name: "", dose: "", frequency: "Once a day" });
  };

  const handleAiReportUpload = async (file?: File | null) => {
    if (!file) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      triggerToast("Please upload a PDF, JPG, PNG, or WEBP file.");
      return;
    }

    const reportId = crypto.randomUUID();
    let storagePath = "";
    let uploadedUrl = "";
    let uploadedToCloud = false;

    // Convert file to Base64 Data URL so it is immediately viewable, downloadable, and permanently attached
    const readAsDataUrl = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    try {
      uploadedUrl = await readAsDataUrl(file);
    } catch {
      uploadedUrl = URL.createObjectURL(file);
    }

    // Also attempt cloud sync if Supabase is available and user is authenticated
    if (isSupabaseConfigured) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          storagePath = `${userData.user.id}/${reportId}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
          const { error: uploadError } = await supabase.storage
            .from("medical-reports")
            .upload(storagePath, file, { contentType: file.type, upsert: false });
          if (!uploadError) {
            const { data: signed } = await supabase.storage
              .from("medical-reports")
              .createSignedUrl(storagePath, 60 * 60);
            if (signed?.signedUrl) uploadedUrl = signed.signedUrl;
            await supabase.from("medical_reports").insert({
              id: reportId,
              patient_id: userData.user.id,
              uploaded_by: userData.user.id,
              name: file.name,
              document_type: file.type === "application/pdf" ? "PDF" : "Image",
              storage_path: storagePath,
              file_size_bytes: file.size,
              mime_type: file.type,
            });
            uploadedToCloud = true;
          }
        }
      } catch (err) {
        console.warn("Cloud report upload skipped, saving locally", err);
      }
    }

    const newReportItem = {
      id: reportId,
      name: file.name,
      storagePath: storagePath || undefined,
      url: uploadedUrl,
      type: file.type,
      size: file.size,
    };

    setAiReports((current) => [...current, newReportItem]);

    // Also attach to patient's reports database
    const medicalReport: MedicalReport = {
      id: reportId,
      name: file.name,
      date: "Today",
      type: file.type === "application/pdf" ? "PDF" : "Image",
      size: file.size ? (file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`) : "180 KB",
      url: uploadedUrl,
    };
    addReportToPatientData(medicalReport);

    triggerToast(uploadedToCloud ? `Report "${file.name}" attached & synced to cloud!` : `Report "${file.name}" attached successfully!`);
  };

  const submitAiCase = async (doctorToAssign?: DoctorProfile | null) => {
    if (isAiSubmitting) return;
    setIsAiSubmitting(true);
    try {
      const assignedDoctor = doctorToAssign || selectedDoctorForCase || doctors[0] || null;

      // 1. Determine user ID (authenticated or local guest UID)
      let userId = patientData.profile.id || `PAT-${Math.floor(10000 + Math.random() * 90000)}`;
      if (isSupabaseConfigured) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            userId = userData.user.id;
          }
        } catch {
          // ignore
        }
      }

      const medicinesText = aiMedicines.length
        ? aiMedicines.map((medicine) => `${medicine.name} (${medicine.dose}, ${medicine.frequency})`).join(", ")
        : "None reported";
      const finalMessage = [
        `Generate the final AYUSH clinical case report for the doctor.`,
        `Symptoms: ${aiSymptoms.join(", ") || "None selected"}.`,
        `Severity: ${aiSeverity}/10.`,
        `Patient description: ${aiDescription.trim() || "Not provided"}.`,
        `Medicines: ${medicinesText}.`,
        `Reports uploaded: ${aiReports.length}.`,
        assignedDoctor ? `Assigned Doctor: ${assignedDoctor.name} (${assignedDoctor.specialty}).` : "",
      ].join(" ");
      const history = [
        ...aiSymptoms.map((symptom) => ({ from: "user", text: `Symptom: ${symptom}`, time: new Date().toISOString() })),
        ...(aiDescription.trim() ? [{ from: "user" as const, text: aiDescription.trim(), time: new Date().toISOString() }] : []),
        ...aiMedicines.map((medicine) => ({ from: "user", text: `Medicine: ${medicine.name}, ${medicine.dose}, ${medicine.frequency}`, time: new Date().toISOString() })),
      ];

      // 2. Clinical assessment with accurate dynamic AYUSH symptom engine
      const dynamicAyush = evaluateAyushDoshaAndAgni(aiSymptoms, aiDescription.trim());
      let evaluation = {
        complaint: aiDescription.trim() || aiSymptoms.join(", ") || "General AYUSH consultation",
        severity: aiSeverity >= 7 ? "High" : aiSeverity >= 4 ? "Medium" : "Mild",
        duration: durationInput.trim() || "Recent onset",
        associated: aiSymptoms.length > 1 ? aiSymptoms.slice(1).join(", ") : "None reported",
        dosha: dynamicAyush.dosha,
        agni: dynamicAyush.agni,
      };
      let aiText = `Recorded ${aiSymptoms.length} clinical symptoms with ${dynamicAyush.dosha} assessment for physician review.`;

      try {
        const analysisResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: finalMessage,
            history,
            metadata: {
              finalize: true,
              severity: aiSeverity >= 7 ? "High" : aiSeverity >= 4 ? "Medium" : "Mild",
              complaint: aiSymptoms.join(", "),
              doctorName: assignedDoctor?.name,
            },
          }),
        });
        if (analysisResponse.ok) {
          const analysis = await analysisResponse.json();
          if (analysis.clinicalEval) {
            evaluation = {
              ...evaluation,
              ...analysis.clinicalEval,
              dosha: analysis.clinicalEval.dosha || dynamicAyush.dosha,
              agni: analysis.clinicalEval.agni || dynamicAyush.agni,
            };
          }
          if (analysis.text) aiText = analysis.text;
        }
      } catch (apiErr) {
        console.warn("AI chat API offline, using built-in clinical fallback engine", apiErr);
      }

      const severity = evaluation.severity === "High" || evaluation.severity === "Mild" ? evaluation.severity : "Medium";
      const now = new Date().toISOString();
      const summaryId = crypto.randomUUID();

      const summary: AIIntakeSummary = {
        id: summaryId,
        patientId: userId,
        patientName: patientData.profile.name || "Patient",
        chiefComplaint: aiDescription.trim() || aiSymptoms.join(", ") || evaluation.complaint || "Clinical symptoms",
        patientDescription: aiDescription.trim() || undefined,
        severityScore: aiSeverity,
        severity,
        duration: durationInput.trim() || evaluation.duration || "Recent onset",
        associatedSymptoms: evaluation.associated || (aiSymptoms.length > 1 ? aiSymptoms.slice(1).join(", ") : "None reported"),
        currentMedicines: medicinesText,
        reportedSymptoms: aiSymptoms,
        uploadedReports: aiReports.map((report) => report.name),
        uploadedReportsDetail: aiReports.map((r) => ({
          name: r.name,
          type: r.type === "application/pdf" ? "PDF" : (r.type?.includes("image") ? "Image" : (r.type || "Document")),
          size: r.size ? (r.size > 1024 * 1024 ? `${(r.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(r.size / 1024)} KB`) : ""
        })),
        medicines: aiMedicines.map((medicine) => `${medicine.name} (${medicine.dose}, ${medicine.frequency})`),
        medicinesDetail: aiMedicines.map((m) => ({
          name: m.name,
          dose: m.dose,
          frequency: m.frequency
        })),
        predictedDosha: evaluation.dosha || "Pending doctor assessment",
        agniAssessment: evaluation.agni || "Pending doctor assessment",
        isRedFlag: severity === "High" || aiSeverity >= 7,
        redFlagReasons: aiSeverity >= 7 ? ["High symptom intensity reported by patient"] : [],
        aiProvider: "Swasthya AYUSH Clinical Engine",
        voiceTranscriptVerified: false,
        timestamp: now,
        conversationHistory: [
          ...history.map((item) => ({ from: item.from === "user" ? ("user" as const) : ("bot" as const), text: item.text, time: item.time })),
          { from: "bot", text: aiText, time: now },
        ],
        status: "Pending Doctor Review",
        assignedDoctor: assignedDoctor?.name,
        assignedDoctorId: assignedDoctor?.userId || assignedDoctor?.id,
        assignedDoctorSpecialty: assignedDoctor?.specialty,
        assignedDoctorQualifications: assignedDoctor?.qualifications,
        assignedDoctorHospital: assignedDoctor?.hospital,
        assignedDoctorFee: assignedDoctor?.consultationFee,
        patientAge: patientData.profile.age || 0,
        patientGender: patientData.profile.gender || "",
        patientPhone: patientData.profile.phone || "",
        readinessScore: aiReadiness,
      };

      // 3. Generate Clinical Summary PDF
      const pdf = generateClinicalSummaryPDF(summary);

      // 4. Construct comprehensive reports list for doctor download
      const patientReportItems = [
        ...aiReports.map((report) => ({
          id: report.id,
          name: report.name,
          type: report.type === "application/pdf" ? "PDF" : "Image",
          size: report.size ? `${Math.round(report.size / 1024)} KB` : "",
          url: report.url || report.storagePath || undefined,
          storagePath: report.storagePath,
          date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        })),
        {
          id: `summary-${summary.id}`,
          name: pdf.fileName,
          type: "PDF",
          size: "350 KB",
          url: pdf.dataUrl,
          date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          isGeneratedSummary: true,
        },
      ];

      // 5. Save to local reactive database (LocalStorage) & Doctor OPD Queue
      saveAIIntakeSummary(summary);
      const queueEntry = {
        id: summary.id,
        userId: userId,
        name: summary.patientName,
        age: patientData.profile.age || 0,
        gender: patientData.profile.gender || "Male",
        phone: patientData.profile.phone || "",
        token: `AYUH-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "Waiting",
        issue: summary.chiefComplaint || aiSymptoms.join(", ") || "Clinical symptoms",
        chiefComplaint: summary.chiefComplaint,
        severity: summary.severity,
        duration: summary.duration,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        prakriti: summary.predictedDosha,
        assignedDoctorId: assignedDoctor?.id || "",
        assignedDoctorName: assignedDoctor?.name || "General AYUSH OPD",
        assignedDoctorSpecialty: assignedDoctor?.specialty || "Ayurveda",
        reportedSymptoms: aiSymptoms,
        medicines: aiMedicines.map((medicine) => `${medicine.name} (${medicine.dose}, ${medicine.frequency})`),
        uploadedReports: aiReports.map((report) => report.name),
        patientAge: patientData.profile.age || 0,
        patientGender: patientData.profile.gender || "",
        reports: patientReportItems,
        reportsCount: patientReportItems.length,
        summaryPdfUrl: pdf.dataUrl,
        summaryPdfName: pdf.fileName,
        submittedAt: now,
      };
      addPatientToQueue(queueEntry);

      // Trigger instant real-time notification to the assigned doctor
      addDoctorNotification({
        doctorId: assignedDoctor?.id || assignedDoctor?.userId || undefined,
        title: `New Case: ${summary.patientName} (${queueEntry.token})`,
        desc: `AI Intake: ${aiSymptoms.slice(0, 3).join(", ") || summary.chiefComplaint}. Severity: ${summary.severity}.`,
        time: "Just now",
        read: false,
        patientId: userId,
        patientName: summary.patientName,
        token: queueEntry.token,
        severity: summary.severity,
        type: "new_patient",
      });

      if (assignedDoctor?.userId || assignedDoctor?.id) {
        try {
          await saveDoctorQueueEntryToSupabase(queueEntry);
        } catch (cloudErr) {
          console.error("Failed to save case to cloud doctor queue", cloudErr);
          throw cloudErr;
        }
      }

      // 6. Record in patient's consultations & next appointment
      const newConsultationVisit: ConsultationVisit = {
        id: `vis-${Date.now()}`,
        doctorName: assignedDoctor?.name || "AYUSH Specialist",
        specialty: assignedDoctor?.specialty || "Ayurveda",
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        reason: summary.chiefComplaint,
        status: "Upcoming",
        prescriptionNotes: `AI Case Intake submitted. Transmitted to ${assignedDoctor?.name || "OPD"}.`,
      };

      const updatedPatient = {
        ...patientData,
        profile: {
          ...patientData.profile,
          id: userId,
          nextAppointment: {
            scheduled: true,
            date: "Today",
            time: assignedDoctor?.nextAvailableSlot || "In Queue",
            doctor: assignedDoctor?.name || "AYUSH Specialist",
            specialty: assignedDoctor?.specialty || "Ayurveda",
          },
        },
        visits: [newConsultationVisit, ...patientData.visits],
      };
      savePatientData(updatedPatient);

      // 7. Optional cloud sync if logged in
      if (isSupabaseConfigured && !userId.startsWith("PAT-") && userId !== "guest-patient-local") {
        try {
          const pdfBlob = await (await fetch(pdf.dataUrl)).blob();
          const reportId = crypto.randomUUID();
          const storagePath = `${userId}/${reportId}-${pdf.fileName}`;
          await supabase.storage.from("medical-reports").upload(storagePath, pdfBlob, { contentType: "application/pdf", upsert: false });
          await supabase.from("medical_reports").insert({
            id: reportId,
            patient_id: userId,
            uploaded_by: userId,
            name: pdf.fileName,
            document_type: "PDF",
            storage_path: storagePath,
            file_size_bytes: pdfBlob.size,
            mime_type: "application/pdf",
            ai_summary: aiText,
            analyzed_at: now,
          });
          await supabase.from("ai_intake_summaries").insert({
            id: summary.id,
            patient_id: userId,
            symptoms: aiSymptoms,
            severity: aiSeverity,
            description: aiDescription.trim() || null,
            duration: summary.duration,
            medicine_ids: [],
            report_ids: [...aiReports.map((report) => report.id), reportId],
            status: "submitted",
            submitted_at: now,
          });
        } catch (cloudErr) {
          console.warn("Cloud sync skipped, local database updated successfully", cloudErr);
        }
      }

      setShowDoctorSelectModal(false);
      downloadPDF(pdf.dataUrl, pdf.fileName);
      triggerToast(`Case transmitted to ${assignedDoctor?.name || "Doctor"}! Added to Doctor OPD Queue.`);
      setActiveNav("home");
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "AI case submission failed.");
    } finally {
      setIsAiSubmitting(false);
    }
  };

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

  // Voice recognition
  const handleStartVoice = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
        recognition.onstart = () => {
          setIsRecording(true);
          triggerToast("Listening… Please speak your symptoms");
        };
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSymptomInput(transcript);
          setIsRecording(false);
          triggerToast("Voice transcribed successfully!");
        };
        recognition.onerror = () => {
          setIsRecording(false);
          triggerToast("Could not recognize voice. Please type your symptoms.");
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } catch {
        setIsRecording(false);
        triggerToast("Voice recognition not supported in this browser. Please type your symptoms.");
      }
    } else {
      triggerToast("Voice recognition not supported in this browser. Please type your symptoms.");
    }
  };

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
    <div className="min-h-screen bg-[#F3FAF6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans selection:bg-[#0E7C4A] selection:text-white">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-[246px] bg-white dark:bg-slate-900 border-r border-[#D7ECE1] dark:border-slate-800 flex flex-col justify-between px-4 py-[22px] shrink-0 hidden lg:flex">
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
          <nav className="space-y-0.5 pt-6">
            {[
              { id: "home", label: "Home", icon: Home },
              { id: "my-health", label: "My Health", icon: Heart },
              { id: "ai", label: "AI Case Taking", icon: Stethoscope, badge: "New" },
              { id: "reports", label: "Reports & Documents", icon: FileText },
              { id: "medications", label: "Medicines", icon: Pill },
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
                    if (item.id === "reports") {
                      setActiveNav("reports");
                    } else if (item.id === "medications") {
                      setActiveNav("medications");
                    } else if (item.id === "my-health") {
                      setActiveNav("my-health");
                    } else if (item.id === "ai") {
                      setAiStep("symptoms");
                      setActiveNav("ai");
                    } else {
                      triggerToast(`Viewing ${item.label}`);
                    }
                  }}
                    className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#0E7C4A] text-white shadow-sm"
                      : "text-[#123B2C] dark:text-slate-400 hover:text-[#123B2C] dark:hover:text-white hover:bg-[#EAF7EF] dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-[17px] h-[17px] ${isActive ? "text-white" : "text-[#0E7C4A]"}`} />
                  <span>{item.label}</span>
                  {item.badge && <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-[#EAF7EF] text-[#0E7C4A]"}`}>{item.badge}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Emergency action */}
        <div className="rounded-2xl p-4 bg-[#FDECE8] border border-[#F3D3CC] text-left cursor-pointer hover:bg-[#FBE2DD] transition-colors" onClick={() => triggerToast("Connecting you to emergency services…")}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-[#D9503A]" />
            <span className="w-5 h-5 rounded-md bg-[#D9503A] text-white flex items-center justify-center text-sm font-extrabold">+</span>
          </div>
          <p className="text-xs font-extrabold leading-tight text-[#B7402A]">Emergency /<br />Ambulance</p>
          <span className="block mt-1.5 text-[10px] text-[#B7402A]/80">Tap for immediate help</span>

        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOPBAR */}
        <header className="bg-white dark:bg-slate-900 border-b border-[#D7ECE1] dark:border-slate-800 px-4 sm:px-[30px] py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
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
            <div className="relative flex items-center bg-[#F3FAF6] dark:bg-slate-800 border border-[#D7ECE1] dark:border-slate-700 rounded-[12px] px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#0E7C4A] focus-within:bg-white transition-all">
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
                {(patientData.profile.name || "Patient").split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "PT"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-[#123B2C] dark:text-white block leading-tight">
                  {patientData.profile.name || "Patient"}
                </span>
                <span className="text-[11px] text-[#7A8B84] dark:text-slate-400">
                  {patientData.profile.prakriti ? `Patient (${patientData.profile.prakriti})` : "Patient Profile"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="p-4 sm:p-6 lg:px-[30px] lg:py-[26px] space-y-[22px] max-w-[1500px] mx-auto w-full">

          {activeNav === "ai" ? (
            <section className="space-y-[18px]">
              <div className="rounded-[20px] p-6 sm:px-[30px] sm:py-[26px] bg-gradient-to-r from-[#EAF7EF] to-[#DFF3E7] border border-[#D7ECE1] flex items-center justify-between gap-5">
                <div>
                  <h1 className="text-xl sm:text-[21px] font-extrabold text-[#123B2C]">🩺 AI Case Taking <span className="ml-2 rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold text-[#0E7C4A]">✨ Powered by AI</span></h1>
                  <p className="text-xs text-[#6C7D76] mt-2 max-w-2xl leading-relaxed">Walk through symptoms, reports and medicines below — we&apos;ll structure it all into a clean case sheet your doctor can read in seconds.</p>
                </div>
                <div className="rounded-2xl bg-white/75 px-5 py-3 text-center shrink-0"><strong className="block text-xl text-[#123B2C]">{aiReadiness}%</strong><span className="text-[10px] text-[#6C7D76]">Case Ready</span></div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {([['symptoms', 'Symptoms'], ['reports', 'Reports'], ['medicines', 'Medicines'], ['review', 'Review & Submit']] as const).map(([step, label], index) => (
                  <button key={step} onClick={() => setAiStep(step)} className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${aiStep === step ? 'bg-[#0E7C4A] border-[#0E7C4A] text-white' : 'bg-white border-[#D7ECE1] text-[#6C7D76]'}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${aiStep === step ? 'bg-white/20' : 'bg-[#F3FAF6]'}`}>{index + 1}</span>{label}</button>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
                <div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5 sm:p-6">
                  {aiStep === "symptoms" && <>
                    <h2 className="text-[15px] font-bold text-[#123B2C]">🎙️ Tell us your symptoms</h2><p className="text-[11px] text-[#6C7D76] mt-1">Tap everything that applies — you can add more detail below.</p>
                    <div className="flex flex-wrap gap-2 mt-4">{['Fatigue', 'Acidity', 'Headache', 'Poor Sleep', 'Joint Pain', 'Cough', 'Fever', 'Nausea', 'Anxiety'].map((symptom) => <button key={symptom} onClick={() => toggleAiSymptom(symptom)} className={`rounded-full border px-3.5 py-2 text-[11px] font-bold ${aiSymptoms.includes(symptom) ? 'bg-[#0E7C4A] border-[#0E7C4A] text-white' : 'bg-[#F3FAF6] border-[#D7ECE1] text-[#123B2C]'}`}>{symptom}</button>)}</div>
                    <label className="block mt-5 text-[11px] font-bold text-[#0E7C4A]">Overall severity</label>
                    <div className="flex items-center gap-3 mt-2"><input type="range" min="1" max="10" value={aiSeverity} onChange={(event) => setAiSeverity(Number(event.target.value))} className="flex-1 accent-[#0E7C4A]" /><span className="min-w-[82px] rounded-full bg-[#EAF7EF] px-2 py-1 text-center text-[10px] font-extrabold text-[#0A5E39]">{aiSeverityLabel} · {aiSeverity}/10</span></div>
                    <label className="block mt-5 text-[11px] font-bold text-[#0E7C4A]">Describe in your own words (optional)</label><textarea value={aiDescription} onChange={(event) => setAiDescription(event.target.value)} placeholder="e.g. I've been feeling tired since last week, worse in the evenings…" className="mt-2 min-h-[88px] w-full resize-y rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-3 text-xs text-[#123B2C] outline-none focus:border-[#0E7C4A]" />
                    <div className="mt-4 flex items-center justify-between gap-3"><button onClick={() => setAiStep("reports")} className="rounded-xl bg-[#0E7C4A] px-5 py-2.5 text-xs font-bold text-white">Next: Upload Reports →</button><span className="text-[10px] text-[#6C7D76]">◷ Step 1 of 4</span></div>
                  </>}
                  {aiStep === "reports" && <>
                    <h2 className="text-[15px] font-bold text-[#123B2C]">📄 Upload your reports</h2><p className="text-[11px] text-[#6C7D76] mt-1">Blood tests, prescriptions, scans — anything relevant to this visit.</p>
                    <div onClick={() => aiFileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void handleAiReportUpload(event.dataTransfer.files?.[0]); }} className="mt-5 w-full cursor-pointer rounded-xl border-2 border-dashed border-[#D7ECE1] bg-[#F3FAF6] p-8 text-center hover:border-[#0E7C4A]"><input ref={aiFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => { void handleAiReportUpload(event.target.files?.[0]); event.currentTarget.value = ""; }} /><UploadCloud className="mx-auto h-7 w-7 text-[#0E7C4A]" /><strong className="mt-2 block text-xs text-[#123B2C]">Click to upload a report</strong><span className="text-[10px] text-[#6C7D76]">PDF, JPG or PNG · up to 10MB</span></div>
                    <div className="mt-3 space-y-2">{aiReports.length ? aiReports.map((report) => <div key={report.id} className="flex items-center justify-between rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-3 text-xs"><span>📄 {report.name}</span><button onClick={() => setAiReports((current) => current.filter((item) => item.id !== report.id))} className="text-[#D9503A]">Remove</button></div>) : <p className="text-[11px] text-[#6C7D76]">No reports added yet.</p>}</div>
                    <div className="mt-4 flex items-center justify-between gap-3"><button onClick={() => setAiStep("medicines")} className="rounded-xl bg-[#0E7C4A] px-5 py-2.5 text-xs font-bold text-white">Next: Add Medicines →</button><span className="text-[10px] text-[#6C7D76]">◷ Step 2 of 4</span></div>
                  </>}
                  {aiStep === "medicines" && <>
                    <h2 className="text-[15px] font-bold text-[#123B2C]">💊 Current medicines</h2><p className="text-[11px] text-[#6C7D76] mt-1">Add anything you&apos;re currently taking, including over-the-counter items.</p>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1.6fr_1fr_1fr_auto] gap-2"><input value={aiMedicineDraft.name} onChange={(event) => setAiMedicineDraft({ ...aiMedicineDraft, name: event.target.value })} placeholder="Medicine name" className="rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none" /><input value={aiMedicineDraft.dose} onChange={(event) => setAiMedicineDraft({ ...aiMedicineDraft, dose: event.target.value })} placeholder="Dosage (e.g. 500mg)" className="rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none" /><select value={aiMedicineDraft.frequency} onChange={(event) => setAiMedicineDraft({ ...aiMedicineDraft, frequency: event.target.value })} className="rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none"><option>Once a day</option><option>Twice a day</option><option>Thrice a day</option><option>As needed</option></select><button onClick={addAiMedicine} className="rounded-xl bg-[#0E7C4A] px-4 py-2 text-xs font-bold text-white">+ Add</button></div>
                    <div className="mt-4 flex flex-wrap gap-2">{aiMedicines.length ? aiMedicines.map((medicine, index) => <span key={`${medicine.name}-${index}`} className="rounded-full border border-[#D7ECE1] bg-[#F3FAF6] px-3 py-2 text-[11px]">💊 {medicine.name} · {medicine.dose} · {medicine.frequency}</span>) : <p className="text-[11px] text-[#6C7D76]">No medicines added yet.</p>}</div>
                    <div className="mt-4 flex items-center justify-between gap-3"><button onClick={() => setAiStep("review")} className="rounded-xl bg-[#0E7C4A] px-5 py-2.5 text-xs font-bold text-white">Next: Review Case →</button><span className="text-[10px] text-[#6C7D76]">◷ Step 3 of 4</span></div>
                  </>}
                  {aiStep === "review" && <><h2 className="text-[15px] font-bold text-[#123B2C]">✅ Review your case</h2><p className="text-[11px] text-[#6C7D76] mt-1">Here&apos;s the structured summary we&apos;ll send to your doctor.</p><div className="grid grid-cols-3 gap-3 mt-5">{[[aiSymptoms.length, 'Symptoms'], [aiReports.length, 'Reports'], [aiMedicines.length, 'Medicines']].map(([value, label]) => <div key={label as string} className="rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-4 text-center"><strong className="block text-2xl text-[#0E7C4A]">{value}</strong><span className="text-[10px] text-[#6C7D76]">{label}</span></div>)}</div><div className="mt-4 flex flex-wrap gap-2">{aiSymptoms.map((symptom) => <span key={symptom} className="rounded-full bg-[#0E7C4A] px-3 py-2 text-[11px] font-bold text-white">{symptom}</span>)}</div><button disabled={isAiSubmitting} onClick={() => { if (!selectedDoctorForCase && doctors.length > 0) { setSelectedDoctorForCase(doctors[0]); } setShowDoctorSelectModal(true); }} className="mt-5 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"><Stethoscope className="w-4 h-4" /><span>Select Doctor &amp; Submit Case →</span></button></>}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5"><h2 className="text-[15px] font-bold text-[#123B2C]">🔗 Case Readiness</h2><div className="relative mx-auto my-6 flex h-28 w-28 items-center justify-center"><svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EAF7EF" strokeWidth="3.5" /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0E7C4A" strokeWidth="3.5" strokeDasharray={`${aiReadiness}, 100`} strokeLinecap="round" /></svg><span className="absolute text-xl font-extrabold text-[#0E7C4A]">{aiReadiness}%</span></div><div className="space-y-2 text-xs"><p className={aiSymptoms.length ? 'text-[#1F8B4C]' : 'text-[#D98A1B]'}>{aiSymptoms.length ? '✅' : '⚠️'} Symptoms selected</p><p className="text-[#1F8B4C]">✅ Severity rated</p><p className={aiReports.length ? 'text-[#1F8B4C]' : 'text-[#D98A1B]'}>{aiReports.length ? '✅' : '⚠️'} Reports uploaded</p><p className={aiMedicines.length ? 'text-[#1F8B4C]' : 'text-[#D98A1B]'}>{aiMedicines.length ? '✅' : '⚠️'} Medicines listed</p></div></div>
                  <div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5"><h2 className="text-[15px] font-bold text-[#123B2C]">📊 Symptom Severity</h2>{aiSymptoms.length ? <div className="mt-4 space-y-3">{aiSymptoms.map((symptom) => <div key={symptom} className="grid grid-cols-[90px_1fr_35px] items-center gap-2 text-[10px]"><span>{symptom}</span><div className="h-2 rounded-full bg-[#EAF7EF]"><div className="h-full rounded-full bg-[#0E7C4A]" style={{ width: `${aiSeverity * 10}%` }} /></div><span>{aiSeverity * 10}%</span></div>)}</div> : <p className="mt-4 text-[11px] text-[#6C7D76]">Select symptoms in Step 1 to see this chart.</p>}</div>
                </div>
              </div>
            </section>
          ) : activeNav === "medications" ? (
            <section className="space-y-[18px]">
              <div className="rounded-[20px] border border-[#D7ECE1] bg-gradient-to-r from-[#EAF7EF] to-[#DFF3E7] p-6 sm:px-[30px] sm:py-[26px] flex items-center justify-between gap-4">
                <div><h1 className="text-xl font-extrabold text-[#123B2C]">💊 Medicines</h1><p className="mt-2 text-xs text-[#6C7D76]">Track today&apos;s doses, keep an eye on refills, and see how consistent you&apos;ve been over the past week.</p></div>
                <div className="shrink-0 rounded-2xl bg-white/75 px-5 py-3 text-center"><strong className="block text-xl text-[#123B2C]">{patientData.medicines.length ? "86%" : "—"}</strong><span className="text-[10px] text-[#6C7D76]">Weekly Adherence</span></div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
                <div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5 sm:p-6">
                  <h2 className="text-[15px] font-bold text-[#123B2C]">🕐 Today&apos;s Schedule</h2>
                  <p className="mt-1 text-[11px] text-[#6C7D76]">Follow your daily doses as prescribed by your physician.</p>
                  <div className="mt-4">
                    {patientData.medicines.length > 0 ? (
                      patientData.medicines.map((medicine, index) => (
                        <div key={`${medicine.id || medicine.name}-${index}`} className="flex items-center gap-3 border-b border-[#D7ECE1] py-3 last:border-0">
                          <span className="w-16 shrink-0 rounded-xl bg-[#EAF7EF] px-1 py-2 text-center text-[10px] font-bold text-[#0E7C4A]">
                            {medicine.timing || "Daily"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <strong className="block text-xs text-[#123B2C]">{medicine.name}</strong>
                            <span className="text-[10px] text-[#6C7D76]">{medicine.dosage} · {medicine.frequency}</span>
                          </div>
                          <button
                            onClick={() => setTakenDoses((current) => current.map((taken, doseIndex) => (doseIndex === index ? !taken : taken)))}
                            className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold ${takenDoses[index] ? 'border-[#0E7C4A] bg-[#0E7C4A] text-white' : 'border-[#D7ECE1] bg-white text-[#0A5E39]'}`}
                          >
                            {takenDoses[index] ? '✓ Taken' : 'Take'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-[#6C7D76]">
                        <p>No medicines scheduled for today.</p>
                        <p className="text-[10px] mt-1 text-[#7A8B84]">Any prescribed medications will be shown here.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5 sm:p-6 text-center">
                  <h2 className="text-left text-[15px] font-bold text-[#123B2C]">📊 Today&apos;s Progress</h2>
                  <div className="relative mx-auto my-6 flex h-28 w-28 items-center justify-center">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EAF7EF" strokeWidth="3.5" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0E7C4A" strokeWidth="3.5" strokeDasharray={`${patientData.medicines.length ? Math.round((takenDoses.filter(Boolean).length / patientData.medicines.length) * 100) : 0}, 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xl font-extrabold text-[#0E7C4A]">
                      {patientData.medicines.length ? `${takenDoses.filter(Boolean).length}/${patientData.medicines.length}` : "0"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6C7D76]">doses taken today</p>
                  <button onClick={() => triggerToast(patientData.medicines.length ? 'Refill request sent to pharmacy' : 'No active prescriptions to refill')} className="mt-4 w-full rounded-xl bg-[#0E7C4A] py-2.5 text-[11px] font-bold text-white">
                    Request Refill
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold text-[#0E7C4A]">💊 Active Medicines</p>
                {patientData.medicines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {patientData.medicines.map((med, index) => (
                      <div key={med.id || index} className="rounded-2xl border border-[#D7ECE1] bg-white p-4">
                        <div className="flex items-start gap-3">
                          <span className="rounded-xl bg-[#EAF7EF] p-2 text-sm">🌿</span>
                          <div>
                            <strong className="block text-xs text-[#123B2C]">{med.name}</strong>
                            <span className="text-[10px] text-[#6C7D76]">{med.frequency} · {med.duration}</span>
                          </div>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-[#EAF7EF]">
                          <div className="h-full rounded-full bg-[#0E7C4A]" style={{ width: "75%" }} />
                        </div>
                        <span className="mt-1 block text-[10px] text-[#6C7D76]">Prescribed by: {med.prescribedBy || "Physician"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[18px] border border-[#D7ECE1] bg-white p-6 text-center text-xs text-[#6C7D76]">
                    No active medications recorded yet.
                  </div>
                )}
              </div>

              <div><p className="mb-2 text-xs font-bold text-[#0E7C4A]">🥗 Diet &amp; Nutrition <span className="font-normal text-[#6C7D76]">· personalized for your plan</span></p><div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5 sm:p-6"><h2 className="text-[15px] font-bold text-[#123B2C]">Food Guidance</h2><p className="mt-1 text-[11px] text-[#6C7D76]">Tap an item to mark it as followed / avoided today.</p><div className="mt-4 flex gap-2"><button onClick={() => setDietTab('recommended')} className={`rounded-full px-3 py-2 text-[10px] font-bold ${dietTab === 'recommended' ? 'bg-[#0E7C4A] text-white' : 'border border-[#D7ECE1] text-[#6C7D76]'}`}>✅ Recommended</button><button onClick={() => setDietTab('restricted')} className={`rounded-full px-3 py-2 text-[10px] font-bold ${dietTab === 'restricted' ? 'bg-[#D9503A] text-white' : 'border border-[#D7ECE1] text-[#6C7D76]'}`}>🚫 Restricted</button></div><div className="mt-4 flex flex-wrap gap-2">{(dietTab === 'recommended' ? ['🥣 Warm soups & stews', '🥥 Coconut water', '🥦 Steamed vegetables', '🥛 Buttermilk (chaas)', '🍌 Ripe bananas', '🌾 Oats & whole grains', '🍚 Warm freshly cooked meals', '💧 8–10 glasses of water'] : ['🌶️ Spicy food', '🍟 Fried & oily food', '☕ Caffeine after 4 PM', '🥤 Carbonated drinks', '🥩 Red / heavy meat', '🌙 Late-night meals', '🍰 Refined sugar & sweets', '🚬 Alcohol & smoking']).map((item) => <button key={item} onClick={() => triggerToast(`${item} updated`)} className={`rounded-full border px-3 py-2 text-[10px] font-bold ${dietTab === 'restricted' ? 'border-[#F3D3CC] bg-[#FDECE8] text-[#B7402A]' : 'border-[#D7ECE1] bg-[#F3FAF6] text-[#123B2C]'}`}>{item}</button>)}</div><p className="mt-3 text-[10px] text-[#6C7D76]">Tap items you {dietTab === 'recommended' ? 'followed' : 'avoided'} today to track your plan.</p></div></div>
            </section>
          ) : activeNav === "messages" ? (
            <section className="space-y-[18px]">
              <div className="rounded-[20px] border border-[#D7ECE1] bg-gradient-to-r from-[#EAF7EF] to-[#DFF3E7] p-6 sm:px-[30px] sm:py-[26px]"><h1 className="text-xl font-extrabold text-[#123B2C]">💬 Messages</h1><p className="mt-2 text-xs text-[#6C7D76]">Secure messages with your care team. Add a person to start a conversation.</p></div>

              <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-4 min-h-[560px]">
                <aside className="rounded-[18px] border border-[#D7ECE1] bg-white p-3">
                  <div className="flex items-center justify-between gap-2 px-2 pb-3"><h2 className="text-[13px] font-bold text-[#123B2C]">Conversations</h2><span className="rounded-full bg-[#EAF7EF] px-2 py-1 text-[10px] font-bold text-[#0E7C4A]">{conversations.length}</span></div>
                  <div className="space-y-1">{conversations.map((conversation) => <button key={conversation.id} onClick={() => setActiveConversationId(conversation.id)} className={`flex w-full items-center gap-2 rounded-xl p-2.5 text-left ${conversation.id === activeConversationId ? 'bg-[#EAF7EF]' : 'hover:bg-[#F3FAF6]'}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0E7C4A] text-[10px] font-bold text-white">{conversation.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span className="min-w-0 flex-1"><strong className="block truncate text-[11px] text-[#123B2C]">{conversation.name}</strong><span className="block truncate text-[10px] text-[#6C7D76]">{conversation.messages.at(-1)?.text || conversation.role}</span></span><span className="text-[9px] text-[#6C7D76]">{conversation.messages.at(-1)?.time || "New"}</span></button>)}</div>
                  {!conversations.length && <p className="px-2 py-8 text-center text-[11px] text-[#6C7D76]">No conversations yet.</p>}
                  <div className="mt-4 border-t border-[#D7ECE1] pt-3"><p className="px-2 text-[10px] font-bold text-[#0E7C4A]">Add a person</p><input value={newPerson.name} onChange={(event) => setNewPerson({ ...newPerson, name: event.target.value })} placeholder="Person name" className="mt-2 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-[11px] outline-none focus:border-[#0E7C4A]" /><select value={newPerson.role} onChange={(event) => setNewPerson({ ...newPerson, role: event.target.value })} className="mt-2 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-[11px] outline-none"><option>Doctor</option><option>Care Coordinator</option><option>Family Member</option><option>Support</option></select><button onClick={addConversation} className="mt-2 w-full rounded-xl bg-[#0E7C4A] py-2.5 text-[11px] font-bold text-white">+ Add Person</button></div>
                </aside>

                <div className="flex min-h-[560px] flex-col overflow-hidden rounded-[18px] border border-[#D7ECE1] bg-white">
                  {activeConversationId && conversations.find((conversation) => conversation.id === activeConversationId) ? (() => { const conversation = conversations.find((item) => item.id === activeConversationId)!; return <><header className="flex items-center gap-3 border-b border-[#D7ECE1] p-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E7C4A] text-[10px] font-bold text-white">{conversation.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong className="block text-xs text-[#123B2C]">{conversation.name}</strong><span className="text-[10px] font-semibold text-[#0E7C4A]">{conversation.role}</span></div></header><div className="flex-1 space-y-3 overflow-y-auto bg-[#F8FCFA] p-5">{conversation.messages.map((message, index) => <div key={`${message.time}-${index}`} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${message.from === 'me' ? 'rounded-br-sm bg-[#0E7C4A] text-white' : 'rounded-bl-sm border border-[#D7ECE1] bg-white text-[#123B2C]'}`}><p>{message.text}</p><span className={`mt-1 block text-[9px] ${message.from === 'me' ? 'text-white/70' : 'text-[#6C7D76]'}`}>{message.time}</span></div></div>)}</div><form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2 border-t border-[#D7ECE1] p-3"><input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 rounded-full border border-[#D7ECE1] bg-[#F3FAF6] px-4 py-2.5 text-xs outline-none focus:border-[#0E7C4A]" /><button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E7C4A] text-white">➤</button></form></>; })() : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageSquare className="h-10 w-10 text-[#B7DEC9]" /><h2 className="mt-3 text-sm font-bold text-[#123B2C]">Select or add a person</h2><p className="mt-1 text-xs text-[#6C7D76]">Your secure conversation will appear here.</p></div>}
                </div>
              </div>
            </section>
          ) : activeNav === "settings" ? (
            <section className="space-y-[18px]">
              <div className="rounded-[20px] border border-[#D7ECE1] bg-gradient-to-r from-[#EAF7EF] to-[#DFF3E7] p-6 sm:px-[30px] sm:py-[26px]"><h1 className="text-xl font-extrabold text-[#123B2C]">⚙️ Settings</h1><p className="mt-2 text-xs text-[#6C7D76]">Manage your profile, notifications, privacy and linked health accounts.</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-4 items-start">
                <nav className="rounded-2xl border border-[#D7ECE1] bg-white p-2 lg:sticky lg:top-24"><div className="flex gap-1 overflow-x-auto lg:flex-col">{([['profile', '👤 Profile'], ['notifications', '🔔 Notifications'], ['privacy', '🔒 Privacy & Data'], ['language', '🌐 Language & Region'], ['linked', '🔗 Linked Accounts']] as const).map(([key, label]) => <button key={key} onClick={() => setSettingsTab(key)} className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-[11px] font-bold ${settingsTab === key ? 'bg-[#0E7C4A] text-white' : 'text-[#123B2C] hover:bg-[#F3FAF6]'}`}>{label}</button>)}</div></nav>
                <div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5 sm:p-6">
                  {settingsTab === 'profile' && <div><h2 className="text-[15px] font-bold text-[#123B2C]">Profile Details</h2><div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"><label className="text-[10px] font-bold text-[#0A5E39]">Full Name<input defaultValue={patientData.profile.name} placeholder="Your full name" className="mt-1 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none focus:border-[#0E7C4A]" /></label><label className="text-[10px] font-bold text-[#0A5E39]">Age<input type="number" defaultValue={patientData.profile.age || ''} placeholder="Age" className="mt-1 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none focus:border-[#0E7C4A]" /></label><label className="text-[10px] font-bold text-[#0A5E39]">Phone<input defaultValue={patientData.profile.phone} placeholder="Phone number" className="mt-1 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none focus:border-[#0E7C4A]" /></label><label className="text-[10px] font-bold text-[#0A5E39]">Email<input type="email" placeholder="Email address" className="mt-1 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none focus:border-[#0E7C4A]" /></label><label className="text-[10px] font-bold text-[#0A5E39]">Blood Group<select defaultValue={patientData.profile.bloodGroup || ''} className="mt-1 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none"><option value="">Select blood group</option><option>O+</option><option>A+</option><option>B+</option><option>AB+</option></select></label><label className="text-[10px] font-bold text-[#0A5E39]">Preferred Health Center<select className="mt-1 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none"><option>AYUSH Community Health Center</option><option>City Ayurveda &amp; Wellness Clinic</option><option>District Homoeopathy Dispensary</option><option>Yoga &amp; Naturopathy Center</option></select></label></div><button onClick={() => triggerToast('Profile saved')} className="mt-4 rounded-xl bg-[#0E7C4A] px-5 py-2.5 text-[11px] font-bold text-white">Save Changes</button></div>}
                  {settingsTab === 'notifications' && <div><h2 className="text-[15px] font-bold text-[#123B2C]">Notification Preferences</h2><div className="mt-3">{([['appointments', 'Appointment reminders', 'Get notified before upcoming visits'], ['medicines', 'Medicine reminders', 'Daily dose reminders on schedule'], ['reports', 'Report updates', 'Alert me when a new report is analyzed'], ['messages', 'Doctor messages', 'Notify me of new messages from your care team'], ['wellness', 'Wellness tips', 'Weekly AYUSH lifestyle suggestions'], ['offers', 'Promotional offers', 'Occasional offers from partner pharmacies']] as const).map(([key, title, desc]) => <div key={key} className="flex items-center justify-between gap-4 border-b border-[#D7ECE1] py-3 last:border-0"><div><strong className="block text-xs text-[#123B2C]">{title}</strong><span className="text-[10px] text-[#6C7D76]">{desc}</span></div><button aria-label={`Toggle ${title}`} onClick={() => setSettingsToggles((current) => ({ ...current, [key]: !current[key] }))} className={`relative h-6 w-11 shrink-0 rounded-full ${settingsToggles[key] ? 'bg-[#0E7C4A]' : 'bg-[#D8E4DD]'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${settingsToggles[key] ? 'left-6' : 'left-1'}`} /></button></div>)}</div></div>}
                  {settingsTab === 'privacy' && <div><h2 className="text-[15px] font-bold text-[#123B2C]">Privacy &amp; Data</h2><div className="mt-3">{([['shareData', 'Share data with my doctors', 'Lets assigned doctors view your full case history'], ['research', 'Anonymous research contribution', 'Help improve AYUSH care models with no personal data'], ['twoFactor', 'Two-factor authentication', 'Extra security step when signing in']] as const).map(([key, title, desc]) => <div key={key} className="flex items-center justify-between gap-4 border-b border-[#D7ECE1] py-3"><div><strong className="block text-xs text-[#123B2C]">{title}</strong><span className="text-[10px] text-[#6C7D76]">{desc}</span></div><button aria-label={`Toggle ${title}`} onClick={() => setSettingsToggles((current) => ({ ...current, [key]: !current[key] }))} className={`relative h-6 w-11 shrink-0 rounded-full ${settingsToggles[key] ? 'bg-[#0E7C4A]' : 'bg-[#D8E4DD]'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${settingsToggles[key] ? 'left-6' : 'left-1'}`} /></button></div>)}</div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => triggerToast('Preparing your data export…')} className="rounded-xl border border-[#D7ECE1] px-4 py-2 text-[11px] font-bold text-[#0E7C4A]">⬇ Download My Data</button><button onClick={() => triggerToast('Please contact support to delete your account')} className="rounded-xl border border-[#F3D3CC] px-4 py-2 text-[11px] font-bold text-[#C0432E]">Delete Account</button></div></div>}
                  {settingsTab === 'language' && <div><h2 className="text-[15px] font-bold text-[#123B2C]">Language &amp; Region</h2><label className="mt-4 block max-w-xs text-[10px] font-bold text-[#0A5E39]">Region<select className="mt-1 w-full rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-2.5 text-xs outline-none"><option>India</option><option>Other</option></select></label><p className="mt-5 text-[10px] font-bold text-[#0A5E39]">App Language</p><div className="mt-2 flex flex-wrap gap-2">{['English', 'हिंदी', 'मराठी', 'தமிழ்', 'తెలుగు', 'বাংলা'].map((language) => <button key={language} onClick={() => { setSettingsLanguage(language); triggerToast(`Language set to ${language}`); }} className={`rounded-xl border px-3.5 py-2 text-[11px] font-bold ${settingsLanguage === language ? 'border-[#0E7C4A] bg-[#0E7C4A] text-white' : 'border-[#D7ECE1] bg-[#F3FAF6] text-[#123B2C]'}`}>{language}</button>)}</div></div>}
                  {settingsTab === 'linked' && <div><h2 className="text-[15px] font-bold text-[#123B2C]">Linked Accounts</h2><div className="mt-4">{[['🪪', 'ABHA Health ID', 'Linked · ABHA health identity'], ['🛡️', 'Health Insurance', 'Insurance policy status active'], ['👨‍👩‍👧', 'Family Members', 'Manage members linked to this account'], ['⌚', 'Fitness Tracker', 'Not connected']].map(([icon, title, desc], index) => <div key={title} className="mb-3 flex items-center gap-3 rounded-xl border border-[#D7ECE1] bg-[#F3FAF6] p-3"><span className="rounded-xl bg-[#EAF7EF] p-2 text-sm">{icon}</span><div className="min-w-0 flex-1"><strong className="block text-xs text-[#123B2C]">{title}</strong><span className="text-[10px] text-[#6C7D76]">{desc}</span></div><button onClick={() => triggerToast(index < 2 ? `${title} already connected` : `Opening ${title.toLowerCase()}`)} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${index < 2 ? 'border-[#D7ECE1] bg-[#EAF7EF] text-[#0E7C4A]' : 'border-[#D7ECE1] bg-white text-[#0A5E39]'}`}>{index < 2 ? 'Connected' : index === 2 ? '+ Add Member' : 'Connect'}</button></div>)}</div></div>}
                </div>
              </div>
            </section>
          ) : activeNav === "reports" ? (
            <section className="space-y-[18px]">
              <div className="rounded-[20px] p-6 sm:px-[30px] sm:py-[26px] bg-gradient-to-r from-[#EAF3FB] to-[#DCEBF8] border border-[#D7E7F5] flex items-center justify-between gap-4"><div><h1 className="text-xl font-extrabold text-[#1F5580]">📁 Reports &amp; Documents</h1><p className="text-xs text-[#3E6480] mt-2">Every lab report, prescription and scan shared with your care team.</p></div><strong className="rounded-2xl bg-white/75 px-5 py-3 text-xl text-[#1F5580]">{patientData.reports.length}<span className="block text-[10px] font-normal text-[#6C7D76]">Total Documents</span></strong></div>
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4"><div className="rounded-[18px] border border-[#D7E7F5] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-[15px] font-bold text-[#1F5580]">Document Library</h2><p className="text-[11px] text-[#6C7D76] mt-1">Your uploaded medical documents</p></div><button onClick={() => setShowUploadModal(true)} className="rounded-xl bg-[#2E6FA3] px-3 py-2 text-[11px] font-bold text-white">⬆ Upload New</button></div><div className="mt-4 space-y-2">{patientData.reports.length ? patientData.reports.map((report) => <div key={report.id} className="flex items-center gap-3 rounded-xl border border-[#D7E7F5] bg-[#F5F9FD] p-3"><FileText className="h-5 w-5 text-[#2E6FA3]" /><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#123B2C]">{report.name}</strong><span className="text-[10px] text-[#6C7D76]">{report.date} · {report.type} {report.size ? `· ${report.size}` : ""}</span></div><span className="rounded-full bg-[#EAF3FB] px-2 py-1 text-[10px] font-bold text-[#1F5580]">Analyzed</span><button onClick={() => handleDeleteReport(report.id, report.name)} className="text-xs text-[#D9503A]">✕</button></div>) : <p className="py-8 text-center text-xs text-[#6C7D76]">No reports uploaded yet.</p>}</div></div><div className="rounded-[18px] border border-[#D7E7F5] bg-white p-5 sm:p-6"><h2 className="text-[15px] font-bold text-[#1F5580]">📊 Documents by Type</h2><div className="mt-5 space-y-4 text-xs"><div className="flex justify-between"><span>PDF / Lab Reports</span><strong>{patientData.reports.filter((report) => report.type === "PDF" || report.type === "Lab").length}</strong></div><div className="h-2 rounded-full bg-[#EAF3FB]"><div className="h-full rounded-full bg-[#2E6FA3]" style={{ width: "70%" }} /></div><div className="flex justify-between"><span>Images</span><strong>{patientData.reports.filter((report) => report.type === "Image").length}</strong></div><div className="h-2 rounded-full bg-[#F4ECFB]"><div className="h-full rounded-full bg-[#6E3F96]" style={{ width: "35%" }} /></div></div></div></div>
            </section>
          ) : activeNav === "medications" ? (
            <section className="space-y-[18px]"><div className="rounded-[20px] p-6 sm:px-[30px] sm:py-[26px] bg-gradient-to-r from-[#EAF7EF] to-[#DFF3E7] border border-[#D7ECE1] flex items-center justify-between gap-4"><div><h1 className="text-xl font-extrabold text-[#123B2C]">💊 Medicines</h1><p className="text-xs text-[#6C7D76] mt-2">Track your active medicines and treatment instructions.</p></div><strong className="rounded-2xl bg-white/75 px-5 py-3 text-xl text-[#0E7C4A]">{patientData.medicines.length}<span className="block text-[10px] font-normal text-[#6C7D76]">Active Medicines</span></strong></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5 sm:p-6"><h2 className="text-[15px] font-bold text-[#123B2C]">🕐 Current Schedule</h2><p className="text-[11px] text-[#6C7D76] mt-1">Follow the dosage and timing prescribed by your doctor.</p><div className="mt-4 space-y-2">{patientData.medicines.length ? patientData.medicines.map((medicine) => <div key={medicine.id} className="flex items-center gap-3 border-b border-[#D7ECE1] py-3"><span className="rounded-xl bg-[#EAF7EF] px-2 py-2 text-sm">💊</span><div className="flex-1"><strong className="block text-xs text-[#123B2C]">{medicine.name}</strong><span className="text-[10px] text-[#6C7D76]">{medicine.dosage} · {medicine.frequency} · {medicine.timing}</span></div><span className="rounded-full bg-[#EAF7EF] px-2 py-1 text-[10px] font-bold text-[#0E7C4A]">Active</span></div>) : <p className="py-8 text-center text-xs text-[#6C7D76]">No medicines listed yet.</p>}</div></div><div className="rounded-[18px] border border-[#D7ECE1] bg-white p-5 sm:p-6"><h2 className="text-[15px] font-bold text-[#123B2C]">📈 Weekly Adherence</h2><div className="mt-5 flex h-36 items-end gap-3">{[100, 100, 60, 100, 80, 100, 40].map((height, index) => <div key={index} className="flex-1 rounded-t-lg bg-[#0E7C4A]" style={{ height: `${height}%`, opacity: height === 60 || height === 40 ? .55 : .85 }} />)}</div><div className="mt-2 flex justify-between text-[10px] text-[#6C7D76]"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div></section>
          ) : activeNav === "my-health" ? (
            <section className="space-y-[22px]">
              <div className="rounded-[20px] p-6 sm:px-[30px] sm:py-[26px] bg-gradient-to-r from-[#EAF3FB] to-[#DCEBF8] border border-[#D7E7F5] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <h1 className="text-xl sm:text-[21px] font-extrabold text-[#1F5580]">Your Health, at a Glance 💙</h1>
                  <p className="text-sm text-[#3E6480] mt-2 max-w-3xl leading-relaxed">
                    {patientData.profile.concerns.length > 0
                      ? `Active health monitoring for: ${patientData.profile.concerns.join(", ")}. Keep logging symptoms and consult your doctor for personalized care.`
                      : "Welcome to your health dashboard. Take an AI Case consultation or upload your medical reports to begin tracking your wellness journey."}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white/70 border border-[#D7E7F5] rounded-2xl px-4 py-3 shrink-0">
                  <div className="relative w-[72px] h-[72px] flex items-center justify-center">
                    <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#DCEBF8" strokeWidth="3.5" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2E6FA3" strokeWidth="3.5" strokeDasharray={`${readinessScore}, 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-base font-extrabold text-[#1F5580]">{readinessScore}%</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#1F5580]">Profile Readiness</span>
                    <span className="text-[11px] font-bold text-[#1F8B4C]">{readinessScore === 100 ? "Ready for consultation" : "Complete your intake"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
                {[
                  ["Weight", "-", "kg", "No measurement", "#2E6FA3"],
                  ["Blood Pressure", "120/80", "mmHg", "Normal", "#0E7C4A"],
                  ["Blood Sugar", "95", "mg/dL", "Fasting", "#B4790E"],
                  ["Heart Rate", "72", "bpm", "Resting", "#C23D74"],
                  ["Sleep Avg", "7.0", "hrs", "Target", "#6E3F96"],
                  ["Steps Avg", "6.5", "k/day", "Daily", "#0E7C4A"],
                ].map(([name, value, unit, delta, color]) => (
                  <div key={name} className="bg-white border border-[#D7E7F5] rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Activity className="w-5 h-5" style={{ color }} />
                      <span className="text-[10px] font-extrabold rounded-full px-2 py-0.5 bg-[#E3F5EA] text-[#1F8B4C]">{delta}</span>
                    </div>
                    <p className="text-[10.5px] text-[#6C7D76] mb-1">{name}</p>
                    <div className="font-extrabold text-lg text-[#1F5580]">{value}<span className="text-[10px] font-semibold text-[#6C7D76] ml-1">{unit}</span></div>
                    <div className="h-1.5 mt-3 rounded-full bg-[#EAF3FB] overflow-hidden"><div className="h-full rounded-full" style={{ width: "60%", backgroundColor: color }} /></div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[#D7E7F5] rounded-[18px] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div><h2 className="text-[15px] font-bold text-[#1F5580]">📊 Health Trends</h2><p className="text-xs text-[#6C7D76] mt-1">Health & vital progression over time.</p></div>
                  <div className="text-right"><strong className="text-[27px] text-[#1F5580]">— <small className="text-xs font-semibold text-[#6C7D76]">kg</small></strong><p className="text-[11px] font-bold text-[#6C7D76]">No measurement recorded</p></div>
                </div>
                <div className="flex gap-1.5 mt-4 flex-wrap">
                  {['Weight', 'Blood Pressure', 'Blood Sugar', 'Heart Rate', 'Sleep', 'Steps'].map((tab, index) => <button key={tab} onClick={() => triggerToast(`${tab} trend selected`)} className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${index === 0 ? 'bg-[#2E6FA3] border-[#2E6FA3] text-white' : 'bg-[#F5F9FD] border-[#D7E7F5] text-[#6C7D76]'}`}>{tab}</button>)}
                </div>
                <div className="mt-5 h-44 sm:h-56 rounded-xl bg-[linear-gradient(to_bottom,#fff_0%,#F5F9FD_100%)] border-b border-[#D7E7F5] p-3 flex items-end">
                  <svg viewBox="0 0 600 210" className="w-full h-full" preserveAspectRatio="none"><path d="M10 44 C90 58 120 74 190 84 S300 112 380 135 S500 158 590 177 L590 205 L10 205 Z" fill="#2E6FA3" fillOpacity=".12" /><path d="M10 44 C90 58 120 74 190 84 S300 112 380 135 S500 158 590 177" fill="none" stroke="#2E6FA3" strokeWidth="4" strokeLinecap="round" /></svg>
                </div>
                <div className="flex justify-between text-[10px] text-[#6C7D76] px-1 mt-1"><span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>This wk</span></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-[#D7E7F5] rounded-[18px] p-5 sm:p-6">
                  <h2 className="text-[15px] font-bold text-[#1F5580]">📏 Body Measurements</h2><p className="text-xs text-[#6C7D76] mt-1 mb-5">Keep these values current for your BMI and doctor&apos;s case sheet.</p>
                  <div className="grid grid-cols-2 gap-3"><label className="text-[11px] font-bold text-[#1F5580]">Height (cm)<input defaultValue="" placeholder="e.g. 170" className="mt-1 w-full rounded-xl border border-[#D7E7F5] bg-[#F5F9FD] p-2.5 text-sm outline-none" /></label><label className="text-[11px] font-bold text-[#1F5580]">Weight (kg)<input defaultValue="" placeholder="e.g. 65" className="mt-1 w-full rounded-xl border border-[#D7E7F5] bg-[#F5F9FD] p-2.5 text-sm outline-none" /></label></div>
                  <div className="mt-4 rounded-xl bg-[#F5F9FD] border border-[#D7E7F5] p-4"><div className="flex items-center gap-2"><strong className="text-2xl text-[#1F5580]">22.0</strong><span className="text-[11px] font-extrabold rounded-full px-2.5 py-1 bg-[#E3F5EA] text-[#1F8B4C]">Normal</span></div><p className="text-[11px] text-[#6C7D76] mt-1">Your BMI calculated from values above.</p><div className="h-2 mt-4 rounded-full bg-gradient-to-r from-[#F3C878] via-[#6FC28C] to-[#E38070]" /></div>
                  <button onClick={() => triggerToast("Measurements saved")} className="mt-4 rounded-xl bg-[#2E6FA3] text-white text-xs font-bold px-5 py-2.5">Save Measurements</button>
                </div>
                <div className="bg-white border border-[#D7E7F5] rounded-[18px] p-5 sm:p-6">
                  <h2 className="text-[15px] font-bold text-[#1F5580]">💊 Current Treatments</h2>
                  <p className="text-xs text-[#6C7D76] mt-1 mb-4">Your active treatment plans and consultations.</p>
                  {patientData.visits.length > 0 ? (
                    patientData.visits.slice(0, 3).map((visit, index) => (
                      <div key={visit.id || index} className="py-3 border-b last:border-0 border-[#D7E7F5]">
                        <div className="flex justify-between gap-3">
                          <span className="text-xs font-bold text-[#123B2C]">{visit.reason || visit.specialty}</span>
                          <span className="text-[10px] font-bold text-[#1F8B4C] bg-[#E3F5EA] rounded-full px-2 py-1">{visit.status}</span>
                        </div>
                        <div className="h-2 mt-3 rounded-full bg-[#E3ECF5]">
                          <div className="h-full rounded-full bg-[#2E6FA3]" style={{ width: "80%" }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-[#6C7D76] mt-1">
                          <span>With {visit.doctorName}</span>
                          <span>{visit.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-[#6C7D76]">
                      <p>No treatments or visits recorded yet.</p>
                      <p className="text-[10px] mt-1 text-[#7A8B84]">Book a consultation to start a treatment plan.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-[#D7E7F5] rounded-[18px] p-5"><h2 className="text-[15px] font-bold text-[#1F5580] mb-3">Weekly Wellness Trend</h2><div className="h-28 flex items-end gap-2">{[42, 55, 50, 68, 72, 78, 82].map((height, index) => <div key={index} className="flex-1 rounded-t-lg bg-[#0E7C4A]" style={{ height: `${height}%`, opacity: 0.45 + index * .07 }} />)}</div><div className="flex justify-between text-[10px] text-[#6C7D76] mt-2"><span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>This week</span></div></div>
                <div className="bg-white border border-[#D7E7F5] rounded-[18px] p-5">
                  <h2 className="text-[15px] font-bold text-[#1F5580] mb-4">What&apos;s New in Your Records</h2>
                  <div className="space-y-2 text-xs text-[#123B2C]">
                    <p className="rounded-xl bg-[#F5F9FD] border border-[#D7E7F5] p-2.5">
                      {patientData.reports.length ? `📄 ${patientData.reports.length} medical document(s) uploaded and available for doctor review.` : "📄 No medical reports uploaded yet."}
                    </p>
                    <p className="rounded-xl bg-[#F5F9FD] border border-[#D7E7F5] p-2.5">
                      {patientData.medicines.length ? `💊 ${patientData.medicines.length} active medicine(s) recorded on schedule.` : "💊 No active medicines currently listed."}
                    </p>
                    <p className="rounded-xl bg-[#F5F9FD] border border-[#D7E7F5] p-2.5">
                      {patientData.visits.length ? `🩺 ${patientData.visits.length} past consultation visit(s) on file.` : "🩺 No previous consultations recorded."}
                    </p>
                    <p className="rounded-xl bg-[#F5F9FD] border border-[#D7E7F5] p-2.5">
                      {patientData.profile.durationOfSymptoms ? `⏱️ Symptom duration specified: ${patientData.profile.durationOfSymptoms}.` : "⚠️ Duration of symptoms not yet specified."}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
          <>
          {/* 1. DYNAMIC WELCOME BANNER */}
          <div className="rounded-[20px] p-6 sm:px-[30px] sm:py-[26px] bg-gradient-to-r from-[#EAF7EF] via-[#E1F6EB] to-[#EAF7EF] dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/30 border border-[#D7ECE1] dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1 z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2C] dark:text-white tracking-tight">
                {language === "en" ? `${getGreeting()}, ${patientData.profile.name || "Patient"}!` : t("patient.greeting", `${getGreeting()}, ${patientData.profile.name || "Patient"}!`)}
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
              <div className="p-6 rounded-[18px] bg-white dark:bg-slate-900 border border-[#D7ECE1] dark:border-slate-800 shadow-xs space-y-5">
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
                    onClick={() => triggerToast(`Prakriti: ${patientData.profile.prakriti || "General AYUSH"} | Diet: ${patientData.profile.dietPreference || "Balanced"}`)}
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
                      {patientData.profile.concerns.length > 0 ? (
                        patientData.profile.concerns.map((c, i) => (
                          <li key={i} className="truncate">• {c}</li>
                        ))
                      ) : (
                        <li className="text-[11px] italic text-[#7A8B84]">No active concerns recorded</li>
                      )}
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
                      {patientData.visits[0]?.specialty || "AYUSH Care"}
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
                <div className="p-6 rounded-[18px] bg-white dark:bg-slate-900 border border-[#D7ECE1] dark:border-slate-800 shadow-xs space-y-4">
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
                <div className="p-6 rounded-[18px] bg-white dark:bg-slate-900 border border-[#D7ECE1] dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
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
              <div className="p-6 rounded-[18px] bg-white dark:bg-slate-900 border border-[#D7ECE1] dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#0E7C4A]" /> AYUSH Wellness & Lifestyle
                  </h3>
                  <p className="text-xs text-[#7A8B84] dark:text-slate-400">
                    Small steps for a healthier you • Based on your Prakriti ({patientData.profile.prakriti || "Holistic"}) and health history
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
                        desc: `Personalized for ${patientData.profile.prakriti || "Holistic"} Constitution`,
                        content: "Focus on fresh, seasonally appropriate, and sattvic meals. Incorporate ginger, cumin, coriander, and warm herbal teas while avoiding processed and excessively spicy or fried food.",
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
                        content: "Wake up early before sunrise (Brahma Muhurta), perform gentle stretching or yoga, practice mindful hydration, and maintain consistent sleeping hours away from digital screens.",
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
                        content: "Adaptogenic herbs such as Ashwagandha, Amla (Amalaki), Brahmi, and Tulsi help maintain balance, bolster immunity (Ojas), and reduce oxidative stress.",
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
                        content: "Daily 10-minute Anulom-Vilom (alternate nostril breathing) or Bhramari pranayama calms the nervous system, decreases stress, and enhances mental clarity.",
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
              <div className="p-6 rounded-[18px] bg-white dark:bg-slate-900 border border-[#D7ECE1] dark:border-slate-800 shadow-xs space-y-5">
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
                      {readinessScore === 100 ? "Your case is 100% Ready!" : `${readinessScore}% Profile Readiness`}
                    </h4>
                    <p className="text-[11px] text-[#7A8B84] dark:text-slate-400">
                      {readinessScore === 100 ? "Verified for doctor inspection." : readinessScore >= 60 ? "Ready for consultation with minor details missing." : "Complete symptoms and details for optimal doctor care."}
                    </p>
                  </div>
                </div>

                {/* Dynamic Readiness Checklist */}
                <div className="space-y-2 text-xs pt-1">
                  <div className={`flex items-center gap-2 ${patientData.profile.concerns.length ? 'text-[#123B2C] dark:text-slate-200' : 'text-[#7A8B84]'}`}>
                    {patientData.profile.concerns.length ? <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    <span>Chief complaint {patientData.profile.concerns.length ? `(${patientData.profile.concerns.length})` : "(Not specified)"}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${patientData.medicines.length ? 'text-[#123B2C] dark:text-slate-200' : 'text-[#7A8B84]'}`}>
                    {patientData.medicines.length ? <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    <span>Current medicines ({patientData.medicines.length})</span>
                  </div>
                  <div className={`flex items-center gap-2 ${patientData.visits.length ? 'text-[#123B2C] dark:text-slate-200' : 'text-[#7A8B84]'}`}>
                    {patientData.visits.length ? <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    <span>Previous treatment ({patientData.visits.length})</span>
                  </div>
                  <div className={`flex items-center gap-2 ${patientData.reports.length ? 'text-[#123B2C] dark:text-slate-200' : 'text-[#7A8B84]'}`}>
                    {patientData.reports.length ? <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    <span>Reports ({patientData.reports.length})</span>
                  </div>
                  <div className={`flex items-center gap-2 ${patientData.profile.prakriti ? 'text-[#123B2C] dark:text-slate-200' : 'text-[#7A8B84]'}`}>
                    {patientData.profile.prakriti ? <CheckCircle2 className="w-4 h-4 text-[#0E7C4A] shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    <span>AYUSH history {patientData.profile.prakriti ? `(${patientData.profile.prakriti})` : "(Pending)"}</span>
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
          </>

          )}
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

      {/* 6. DOCTOR SELECTION OVERLAY (When Patient Completes Step 4 and Clicks Submit Case) */}
      {showDoctorSelectModal && (
        <div className="fixed inset-0 z-50 bg-[#123B2C]/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#CFEBDB] dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 sm:px-6 bg-gradient-to-r from-[#EAF7EF] to-white dark:from-emerald-950/40 dark:to-slate-900 border-b border-[#D7ECE1] dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0E7C4A] text-white flex items-center justify-center shadow-md">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#123B2C] dark:text-white">
                    Select AYUSH Doctor for Case Consultation
                  </h3>
                  <p className="text-xs text-[#6C7D76] dark:text-slate-400">
                    Step 4 Complete! Choose a physician to receive your structured case and reports.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDoctorSelectModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Specialty Filters */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={doctorSearchFilter}
                  onChange={(e) => setDoctorSearchFilter(e.target.value)}
                  placeholder="Search doctor by name, specialty, or clinic..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#0E7C4A] text-slate-800 dark:text-slate-100"
                />
              </div>
              <select
                value={doctorSpecialtyFilter}
                onChange={(e) => setDoctorSpecialtyFilter(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="All">All Specialties</option>
                <option value="Ayurveda">Ayurveda</option>
                <option value="Panchakarma">Panchakarma</option>
                <option value="Homeopathy">Homeopathy</option>
                <option value="Yoga & Naturopathy">Yoga &amp; Naturopathy</option>
              </select>
            </div>

            {/* Doctor List */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              {doctors.filter((doc) => {
                const term = doctorSearchFilter.toLowerCase().trim();
                const matchesSearch =
                  !term ||
                  doc.name.toLowerCase().includes(term) ||
                  doc.specialty.toLowerCase().includes(term) ||
                  doc.hospital.toLowerCase().includes(term);
                const matchesSpecialty =
                  doctorSpecialtyFilter === "All" || doc.specialty === doctorSpecialtyFilter;
                return matchesSearch && matchesSpecialty;
              }).length > 0 ? (
                doctors.filter((doc) => {
                  const term = doctorSearchFilter.toLowerCase().trim();
                  const matchesSearch =
                    !term ||
                    doc.name.toLowerCase().includes(term) ||
                    doc.specialty.toLowerCase().includes(term) ||
                    doc.hospital.toLowerCase().includes(term);
                  const matchesSpecialty =
                    doctorSpecialtyFilter === "All" || doc.specialty === doctorSpecialtyFilter;
                  return matchesSearch && matchesSpecialty;
                }).map((doc) => {
                  const isSelected = selectedDoctorForCase?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorForCase(doc)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? "border-[#0E7C4A] bg-[#F3FAF6] dark:bg-emerald-950/30 shadow-md"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-[#0E7C4A]/50"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0E7C4A] to-[#123B2C] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                          {doc.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2) || "DR"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-[#123B2C] dark:text-white">
                              {doc.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#0E7C4A] dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                              {doc.specialty}
                            </span>
                            {!doc.isSeedDoctor && (
                              <span className="px-2 py-0.5 rounded-full bg-[#0E7C4A] text-white text-[9.5px] font-extrabold shadow-xs">
                                ★ Published Physician
                              </span>
                            )}
                            {doc.isAvailableToday && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 text-[9.5px] font-bold">
                                ● Available Today
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {doc.qualifications || doc.subSpecialty} • {doc.experienceYears} yrs experience
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            📍 {doc.hospital}, {doc.location}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-medium flex-wrap">
                            <span className="text-amber-500 font-bold">⭐ {doc.rating} ({doc.reviewsCount} reviews)</span>
                            <span>•</span>
                            <span className="font-bold text-[#0E7C4A] dark:text-emerald-400">₹{doc.consultationFee} OPD Fee</span>
                            <span>•</span>
                            <span>Slot: {doc.nextAvailableSlot}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-[#0E7C4A] bg-[#0E7C4A] text-white" : "border-slate-300 text-transparent"
                        }`}>
                          ✓
                        </div>
                        <span className="text-[11px] font-bold text-[#0E7C4A]">
                          {isSelected ? "Selected" : "Tap to select"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-xs text-slate-500">
                  {doctorDirectoryError ? (
                    <>
                      <p className="font-semibold text-red-600">Doctor directory unavailable</p>
                      <p className="mt-2 text-[11px] text-red-500">{doctorDirectoryError}</p>
                      <p className="mt-2">Check that the doctor profile was published with a valid Google session.</p>
                    </>
                  ) : (
                    "No published doctors are available yet."
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 dark:text-slate-300 text-center sm:text-left">
                {selectedDoctorForCase ? (
                  <span>
                    Submitting case to: <strong className="text-[#0E7C4A] font-bold">{selectedDoctorForCase.name}</strong> ({selectedDoctorForCase.specialty})
                  </span>
                ) : (
                  <span>Please select a doctor from the list above.</span>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowDoctorSelectModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAiSubmitting}
                  onClick={() => void submitAiCase(selectedDoctorForCase)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] disabled:opacity-60 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAiSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Transmitting Case to Doctor...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm &amp; Submit Case →</span>
                    </>
                  )}
                </button>
              </div>
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
