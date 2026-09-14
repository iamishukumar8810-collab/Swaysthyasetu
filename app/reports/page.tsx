"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Upload,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus
} from "lucide-react";
import { getStoredPatientData, saveStoredPatientData, MedicalReport, PATIENT_DATA_EVENT } from "@/lib/patient-data";
import { getAIIntakeSummary, AIIntakeSummary } from "@/lib/aiIntakeStore";
import { downloadPDF } from "@/lib/pdfGenerator";

export default function ReportsPage() {
  const [patientData, setPatientData] = useState(() => getStoredPatientData());
  const [aiSummary, setAiSummary] = useState<AIIntakeSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const [newReportType, setNewReportType] = useState<"PDF" | "Image" | "Lab">("PDF");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setPatientData(getStoredPatientData());
    setAiSummary(getAIIntakeSummary());

    const handleUpdate = () => {
      setPatientData(getStoredPatientData());
      setAiSummary(getAIIntakeSummary());
    };

    window.addEventListener(PATIENT_DATA_EVENT, handleUpdate);
    window.addEventListener("swasthya_setu_intake_updated", handleUpdate);
    return () => {
      window.removeEventListener(PATIENT_DATA_EVENT, handleUpdate);
      window.removeEventListener("swasthya_setu_intake_updated", handleUpdate);
    };
  }, []);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newReportName.trim() || selectedFile?.name.replace(/\.[^/.]+$/, "") || "Medical Report";
    const fileSize = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : "1.2 MB";
    const url = selectedFile ? URL.createObjectURL(selectedFile) : undefined;

    const newReport: MedicalReport = {
      id: `rep-${Date.now()}`,
      name: finalName,
      date: "Today • " + new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      type: newReportType,
      size: fileSize,
      url,
    };

    const updated = {
      ...patientData,
      reports: [newReport, ...(patientData.reports || [])],
    };

    saveStoredPatientData(updated);
    setPatientData(updated);
    setShowUploadModal(false);
    setNewReportName("");
    setSelectedFile(null);
    showToast(`Report "${newReport.name}" uploaded successfully!`);
  };

  const allReports: MedicalReport[] = patientData.reports || [];
  const filteredReports = allReports.filter((r: MedicalReport) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const aiReports = filteredReports.filter((r: MedicalReport) =>
    r.name.toLowerCase().includes("ai clinical") ||
    r.name.toLowerCase().includes("triage") ||
    r.name.toLowerCase().includes("summary")
  );

  const labReports = filteredReports.filter((r: MedicalReport) =>
    !r.name.toLowerCase().includes("ai clinical") &&
    !r.name.toLowerCase().includes("triage") &&
    !r.name.toLowerCase().includes("summary")
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0E7C4A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#CFEBDB] dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/patient"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Back to Patient Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0E7C4A] text-white flex items-center justify-center font-black text-sm">
                SS
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-[#123B2C] dark:text-white leading-tight">
                  Swasthya Setu
                </h1>
                <p className="text-[10.5px] text-[#6C7D76] dark:text-slate-400">
                  Medical Records &amp; Clinical Reports
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
            <Link
              href="/patient"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              Patient Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Patient Info Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#EAF7EF] to-[#DDF3E7] dark:from-emerald-950/40 dark:to-slate-900 border border-[#CFEBDB] dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0E7C4A] text-white flex items-center justify-center text-lg font-bold shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#123B2C] dark:text-white">
                  {patientData.profile?.name || "Patient Name"}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 font-mono">
                  {patientData.profile?.prakriti || "Pitta-Kapha"}
                </span>
              </div>
              <p className="text-xs text-[#52796F] dark:text-slate-400 mt-0.5">
                ABHA ID: <span className="font-mono font-semibold">{patientData.profile?.abhaId || "14-2345-6789-0123"}</span> · Age: {patientData.profile?.age || 45} / {patientData.profile?.gender || "Male"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-white/80 dark:bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-[#CFEBDB] dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Total Documents</span>
              <span className="text-sm font-extrabold text-[#0E7C4A] dark:text-emerald-400">
                {allReports.length} Files
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-[#CFEBDB] dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Clinical Doctor</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Attending Physician
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-[#CFEBDB] dark:border-slate-800 shadow-xs">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, date, or type (PDF, Lab, AI)..."
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 1: AI Clinical Triage & Intake Summaries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#123B2C] dark:text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0E7C4A]" />
              <span>AI Pre-Consultation Intake Summaries &amp; Triage Reports</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {aiReports.length} {aiReports.length === 1 ? "report" : "reports"}
            </span>
          </div>

          {aiReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiReports.map((report: MedicalReport) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-900/60 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#0E7C4A] dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {report.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{report.date}</span>
                          <span>· {report.size || "148 KB"}</span>
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                      ✓ Doctor Synced
                    </span>
                  </div>

                  {aiSummary && (
                    <div className="p-2.5 rounded-xl bg-[#F4F9F6] dark:bg-slate-800/60 border border-[#D7ECE1] dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Chief Complaint</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          aiSummary.severity === "High"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                          {aiSummary.severity} Severity
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {aiSummary.chiefComplaint}
                      </p>
                      <p className="text-[11px] text-[#0E7C4A] dark:text-emerald-400">
                        AYUSH: {aiSummary.predictedDosha}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (report.url) {
                          downloadPDF(report.url, `${report.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`);
                          showToast(`Downloading "${report.name}.pdf"...`);
                        } else if (aiSummary?.pdfUrl) {
                          downloadPDF(aiSummary.pdfUrl, "AI_Clinical_Triage_Summary.pdf");
                          showToast("Downloading AI Clinical Triage Summary.pdf...");
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    {report.url && (
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No AI Clinical Triage summaries found yet. Complete a consultation interview via &ldquo;Ask AI&rdquo; on the patient dashboard.
              </p>
              <Link
                href="/patient"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0E7C4A] text-white text-xs font-bold hover:bg-[#0A5E39] transition-all"
              >
                <span>Start AI Triage on Dashboard</span>
              </Link>
            </div>
          )}
        </div>

        {/* Section 2: Uploaded Diagnostic Lab Reports & Records */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#123B2C] dark:text-emerald-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0E7C4A]" />
              <span>Diagnostic Lab Reports, Imaging &amp; Past Prescriptions</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {labReports.length} {labReports.length === 1 ? "document" : "documents"}
            </span>
          </div>

          {labReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {labReports.map((report: MedicalReport) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#CFEBDB] dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base shrink-0">
                      {report.type === "PDF" ? "📄" : report.type === "Image" ? "🖼️" : "🧪"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={report.name}>
                        {report.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {report.date} · {report.type} {report.size ? `· ${report.size}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {report.url ? (
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0E7C4A] dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => showToast(`Opening "${report.name}"...`)}
                        className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#0E7C4A] dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-[#CFEBDB] dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No external diagnostic reports or prescriptions uploaded yet.
              </p>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0E7C4A] text-white text-xs font-bold hover:bg-[#0A5E39] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Report</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-[#CFEBDB] dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-[#123B2C] dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0E7C4A]" />
                <span>Upload Medical Report</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Report / Document Title
                </label>
                <input
                  type="text"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="e.g. Thyroid Profile, Blood Pressure Log..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E7C4A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Type
                </label>
                <select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E7C4A]"
                >
                  <option value="PDF">PDF Document (Lab report / prescription)</option>
                  <option value="Image">Scan / Photograph (Image)</option>
                  <option value="Lab">Lab Test Result</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-[#0E7C4A] hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white font-bold shadow-sm transition-all cursor-pointer"
                >
                  Upload &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
