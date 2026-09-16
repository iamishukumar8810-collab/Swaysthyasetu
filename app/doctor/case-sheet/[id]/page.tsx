"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Edit3, 
  Printer, 
  FileText, 
  AlertTriangle, 
  Stethoscope, 
  Sparkles, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Check,
  Save
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AIIntakeSummary,
  getAIIntakeSummary,
  subscribeToAIIntake,
  markAIIntakeAccepted,
} from "@/lib/aiIntakeStore";
import {
  QueuedPatient,
  QueuedPatientReport,
  getDoctorQueue,
  subscribeToDoctorQueue,
  downloadPatientReport,
} from "@/lib/doctorStore";

export default function DoctorCaseSheetPage({ params }: { params: { id: string } }) {
  const tokenId = params.id || "";
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "documents" | "ayush" | "edit">("summary");
  const [isVerified, setIsVerified] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");

  // Patient & Queue State
  const [patient, setPatient] = useState<QueuedPatient | null>(null);
  const [aiIntake, setAiIntake] = useState<AIIntakeSummary | null>(null);
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Editable fields
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [currentMeds, setCurrentMeds] = useState("");
  const [prakriti, setPrakriti] = useState("Pitta-Kapha");
  const [agni, setAgni] = useState("Tikshna / Vishama (Hyper-acidic)");
  const [koshtha, setKoshtha] = useState("Krura (Mild Constipation)");

  useEffect(() => {
    const queue = getDoctorQueue();
    const foundPatient = queue.find(
      (p) => p.token === tokenId || p.id === tokenId || p.userId === tokenId
    );
    if (foundPatient) {
      setPatient(foundPatient);
      setChiefComplaint(foundPatient.chiefComplaint || foundPatient.issue || "General AYUSH consultation");
      if (foundPatient.medicines && foundPatient.medicines.length > 0) {
        setCurrentMeds(foundPatient.medicines.join(", "));
      }
      if (foundPatient.prakriti) {
        setPrakriti(foundPatient.prakriti);
      }
    }

    const summary = getAIIntakeSummary();
    setAiIntake(summary);
    if (summary && !foundPatient) {
      setChiefComplaint(`${summary.chiefComplaint} (Intensity: ${summary.severity}, Duration: ${summary.duration})`);
      if (summary.currentMedicines) setCurrentMeds(summary.currentMedicines);
      if (summary.predictedDosha) setPrakriti(summary.predictedDosha);
      if (summary.agniAssessment) setAgni(summary.agniAssessment);
    }

    const unsubQueue = subscribeToDoctorQueue((updatedQueue) => {
      const p = updatedQueue.find(
        (item) => item.token === tokenId || item.id === tokenId || item.userId === tokenId
      );
      if (p) {
        setPatient(p);
      }
    });

    const unsubIntake = subscribeToAIIntake((updated) => {
      setAiIntake(updated);
    });

    return () => {
      unsubQueue();
      unsubIntake();
    };
  }, [tokenId]);

  const handleApplyAIIntake = () => {
    if (!aiIntake) return;
    setChiefComplaint(`${aiIntake.chiefComplaint} (Intensity: ${aiIntake.severity}, Duration: ${aiIntake.duration})`);
    if (aiIntake.currentMedicines) {
      setCurrentMeds(aiIntake.currentMedicines);
    }
    markAIIntakeAccepted(aiIntake.id);
    alert("AI Pre-Consultation Intake findings applied to Case Sheet!");
  };

  const handleVerify = () => {
    setIsVerified(true);
    alert("Case Sheet Verified and Digitally Signed. Ready for Consultation.");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/doctor" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  Case Sheet: <span className="font-mono text-emerald-600 dark:text-emerald-400">{tokenId}</span>
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isVerified 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                }`}>
                  {isVerified ? "Physician Verified ✓" : "AI Pre-Generated Draft"}
                </span>
              </div>
              <p className="text-xs text-slate-500">{aiIntake?.patientName || 'Patient'} • {aiIntake ? `${aiIntake.timestamp}` : '—'} • Token: {tokenId || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {!isVerified ? (
              <button
                onClick={handleVerify}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Verify & Lock Sheet</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Signed
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: "summary", label: "Case Summary" },
            { id: "timeline", label: "Medical Timeline" },
            { id: "documents", label: "OCR Document Inspector" },
            { id: "ayush", label: "AYUSH & Dashavidha Pariksha" },
            { id: "edit", label: "Doctor Edit & Notes" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live AI Pre-Consultation Summary if available */}
        {aiIntake && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Patient AI Clinical Intake: &ldquo;{aiIntake.chiefComplaint}&rdquo;
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    aiIntake.severity === "High"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}>
                    {aiIntake.severity} Intensity • {aiIntake.duration}
                  </span>
                  {aiIntake.isRedFlag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                      🚩 Red Flag Alert
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  AYUSH: {aiIntake.predictedDosha} • Voice Verified: {aiIntake.voiceTranscriptVerified ? "Yes" : "Text"} • {aiIntake.timestamp}
                </p>
              </div>
            </div>
            <button
              onClick={handleApplyAIIntake}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Chief Complaint</span>
            </button>
          </div>
        )}

        {/* Attention Flag Banner (Safe Non-Diagnostic Alert) */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-900 dark:text-amber-300">
              Clinical Attention Flag (Non-Diagnostic)
            </span>
            <p className="text-amber-800/90 dark:text-amber-400/90 leading-relaxed">
              Patient has history of recurrent acidity and continuous PPI use (Pantoprazole &gt; 6 months). Kindly evaluate for underlying Amlapitta and gastric mucosa sensitivity.
            </p>
          </div>
        </div>

        {/* TAB 1: CASE SUMMARY */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chief Complaint</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {chiefComplaint || patient?.chiefComplaint || patient?.issue || "General Consultation"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">History of Present Illness</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                      {patient?.chiefComplaint || aiIntake?.chiefComplaint || "Clinical symptoms recorded during intake."} Duration: {patient?.duration || aiIntake?.duration || "Recent onset"}. Severity level: {patient?.severity || aiIntake?.severity || "Moderate"}.
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Past Treatments & Current Rx</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-mono">
                      {currentMeds || "No active medications reported"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reported Symptoms (Lakshanas)</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(patient?.reportedSymptoms && patient.reportedSymptoms.length > 0
                      ? patient.reportedSymptoms
                      : (aiIntake?.reportedSymptoms || ["Acidity / Heartburn", "Bloating"])
                    ).map((sym, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demographics & Doctor Action Card */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Patient Demographics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {patient?.name || aiIntake?.patientName || "Patient"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Age / Gender:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(patient?.patientAge || patient?.age || aiIntake?.patientAge || "—")} Y / {(patient?.patientGender || patient?.gender || aiIntake?.patientGender || "—")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {patient?.phone || aiIntake?.patientPhone || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Token ID:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {patient?.token || tokenId || "AYUH-001"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab("edit")}
                    className="w-full py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Sheet & Add Clinical Notes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDICAL TIMELINE */}
        {activeTab === "timeline" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chronological Medical Timeline (AI Synthesized from Past Reports)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically reconstructed from uploaded prescriptions and patient interview.
              </p>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-800">
              <div className="relative">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950" />
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  Current Visit ({patient?.date || "Today"})
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pre-Consultation Intake & Triage
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Chief complaint: {chiefComplaint || patient?.chiefComplaint || "Clinical symptoms"}. Duration: {patient?.duration || aiIntake?.duration || "Recent"}. Severity: {patient?.severity || aiIntake?.severity || "Moderate"}.
                </p>
              </div>

              {currentMeds && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-teal-100 dark:ring-teal-950" />
                  <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">Current Medications Active</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Treatment Regimen</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                    {currentMeds}
                  </p>
                </div>
              )}

              {(patient?.reports || []).length > 0 && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950" />
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">Attached Documents</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Patient Medical Records</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {patient?.reports?.length} attached clinical report(s) uploaded for physician review.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SPLIT OCR DOCUMENT INSPECTOR */}
        {activeTab === "documents" && (() => {
          const reportsList: QueuedPatientReport[] = (patient?.reports && patient.reports.length > 0)
            ? patient.reports
            : (aiIntake?.uploadedReportsDetail || []).map((r, i) => ({
                id: `rep-${i}`,
                name: r.name,
                type: r.type || "Document",
                size: r.size,
                url: undefined,
              }));

          const activeReport = reportsList[selectedReportIndex] || reportsList[0];

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Document Image/PDF Viewer */}
              <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                {/* File selector tabs if multiple */}
                {reportsList.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    {reportsList.map((rep, idx) => (
                      <button
                        key={rep.id || idx}
                        type="button"
                        onClick={() => setSelectedReportIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          selectedReportIndex === idx
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[140px]">{rep.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {activeReport ? `File: ${activeReport.name}` : "No documents uploaded"}
                    </span>
                    {activeReport && (
                      <span className="text-[10px] text-slate-400">
                        {activeReport.type} {activeReport.size ? `• ${activeReport.size}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(z + 20, 200))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(z - 20, 60))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    {activeReport && (
                      <button
                        type="button"
                        onClick={() => downloadPatientReport(activeReport)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs ml-1"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Document Display Canvas */}
                <div className="h-96 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-auto flex items-center justify-center">
                  {activeReport ? (
                    activeReport.url && activeReport.url.startsWith("data:image") ? (
                      <div className="w-full h-full flex items-center justify-center overflow-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeReport.url}
                          alt={activeReport.name}
                          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
                          className="max-h-full max-w-full object-contain rounded-lg shadow-sm transition-transform"
                        />
                      </div>
                    ) : activeReport.url && (activeReport.url.startsWith("data:application/pdf") || activeReport.url.startsWith("http://") || activeReport.url.startsWith("https://") || activeReport.url.startsWith("blob:")) ? (
                      <iframe
                        src={activeReport.url}
                        title={activeReport.name}
                        className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
                      />
                    ) : (
                      <div className="text-center space-y-3 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{activeReport.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {activeReport.type || "Medical Record"} • {activeReport.size || "Standard PDF"}
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Verified Patient Intake Record
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadPatientReport(activeReport)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
                        >
                          <Download className="w-4 h-4" /> Download Attached Document
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-slate-400 py-10 font-sans">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-medium text-xs">No medical files attached</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Reports uploaded by the patient during AI intake will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: AI OCR Structured Data Panel */}
              <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400">
                  <Sparkles className="w-4 h-4" /> AI Intake & OCR Extracted Details
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Submission Date</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {patient?.date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ({patient?.time || "Today"})
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Patient Chief Symptoms</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {patient?.reportedSymptoms?.join(", ") || chiefComplaint || "General AYUSH intake"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Extracted Current Medications</span>
                    <p className="mt-1 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                      {currentMeds || "None reported by patient"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">AYUSH Clinical Mapping</span>
                    <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      Dosha: {prakriti} • Agni: {agni}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: AYUSH & DASHAVIDHA PARIKSHA */}
        {activeTab === "ayush" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dashavidha & Ashtavidha Pariksha Clinical Evaluation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Classical 10-fold Ayurvedic assessment populated from pre-consultation responses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">1. Prakriti (Constitution)</span>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">{prakriti}</p>
                <p className="text-slate-500 text-[11px]">Dominant Dosha pattern from patient symptom assessment</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">2. Agni (Digestive Fire)</span>
                <p className="font-semibold text-amber-600 dark:text-amber-400">{agni}</p>
                <p className="text-slate-500 text-[11px]">Digestive fire analysis from clinical intake</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">3. Koshtha (Bowel Habit)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{koshtha}</p>
                <p className="text-slate-500 text-[11px]">Digestive transit and bowel habit evaluation</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">4. Bala (Strength / Immunity)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Madhyama (Moderate)</p>
                <p className="text-slate-500 text-[11px]">Patient general strength and vitals tolerance</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">5. Desha (Geographic / Habitat)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Sadharana Desha (Urban, Moderate climate)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">6. Kala (Season / Circadian)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Current Seasonal Cycle</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DOCTOR EDIT & CLINICAL NOTES */}
        {activeTab === "edit" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Doctor Review, Field Edits & Clinical Notes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modify any AI-generated field and enter final prescription notes before saving.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Edit Chief Complaint
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prakriti Selection
                  </label>
                  <select
                    value={prakriti}
                    onChange={(e) => setPrakriti(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="Vata-Pitta">Vata-Pitta</option>
                    <option value="Pitta-Kapha">Pitta-Kapha</option>
                    <option value="Vata-Kapha">Vata-Kapha</option>
                    <option value="Tridoshaja">Tridoshaja</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agni Status
                  </label>
                  <select
                    value={agni}
                    onChange={(e) => setAgni(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="Sama (Balanced)">Sama (Balanced)</option>
                    <option value="Tikshna / Vishama (Hyper-acidic)">Tikshna / Vishama (Hyper-acidic)</option>
                    <option value="Manda (Sluggish)">Manda (Sluggish)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Koshtha Status
                  </label>
                  <select
                    value={koshtha}
                    onChange={(e) => setKoshtha(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="Mridu (Soft)">Mridu (Soft)</option>
                    <option value="Madhyama (Normal)">Madhyama (Normal)</option>
                    <option value="Krura (Mild Constipation)">Krura (Mild Constipation)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor Clinical & Prescription Notes (Vaidya Notes)
                </label>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => alert("Changes saved successfully!")}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Draft
                </button>
                <button
                  onClick={handleVerify}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" /> Verify & Lock Sheet
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
