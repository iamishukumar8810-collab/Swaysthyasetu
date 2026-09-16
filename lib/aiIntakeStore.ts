"use client";

export interface AIIntakeSummary {
  id: string;
  patientId: string;
  patientName: string;
  chiefComplaint: string;
  severity: "Mild" | "Medium" | "High";
  duration: string;
  associatedSymptoms?: string;
  currentMedicines?: string;
  reportedSymptoms?: string[];
  uploadedReports?: string[];
  medicines?: string[];
  predictedDosha: string;
  agniAssessment: string;
  isRedFlag: boolean;
  redFlagReasons: string[];
  aiProvider: string;
  voiceTranscriptVerified: boolean;
  timestamp: string;
  conversationHistory: { from: "user" | "bot"; text: string; time: string }[];
  status: "Pending Doctor Review" | "Accepted into Case Sheet" | "Reviewed";
  pdfUrl?: string;
  pdfFileName?: string;
  assignedDoctor?: string;
  assignedDoctorId?: string;
  assignedDoctorSpecialty?: string;
  assignedDoctorQualifications?: string;
  assignedDoctorHospital?: string;
  assignedDoctorFee?: number;
  patientGender?: string;
  patientAge?: number;
  patientPhone?: string;
  patientDescription?: string;
  severityScore?: number;
  readinessScore?: number;
  tokenNumber?: string;
  queuePosition?: number;
  uploadedReportsDetail?: Array<{ name: string; type?: string; size?: string }>;
  medicinesDetail?: Array<{ name: string; dose?: string; frequency?: string }>;
}

const STORAGE_KEY = "swasthya_setu_ai_intake_summary";
const INTAKE_UPDATED_EVENT = "swasthya_setu_intake_updated";

/**
 * Save an AI Intake Summary and broadcast to all listening tabs & components
 */
export function saveAIIntakeSummary(summary: AIIntakeSummary): AIIntakeSummary {
  if (typeof window === "undefined") return summary;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
    dispatchIntakeEvent();
    return summary;
  } catch (err) {
    console.error("Error saving AI intake summary", err);
    return summary;
  }
}

/**
 * Get the latest AI Intake Summary for the active patient
 */
export function getAIIntakeSummary(patientId?: string): AIIntakeSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed: AIIntakeSummary = JSON.parse(saved);
    return parsed;
  } catch (err) {
    console.error("Error reading AI intake summary", err);
    return null;
  }
}

/**
 * Mark an intake summary as accepted into doctor case sheet
 */
export function markAIIntakeAccepted(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getAIIntakeSummary();
    if (current && current.id === id) {
      const updated: AIIntakeSummary = {
        ...current,
        status: "Accepted into Case Sheet"
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      dispatchIntakeEvent();
    }
  } catch (err) {
    console.error("Error updating intake summary status", err);
  }
}

/**
 * Dispatch real-time custom event
 */
function dispatchIntakeEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(INTAKE_UPDATED_EVENT));
  }
}

/**
 * Subscribe to AI Intake Summary changes (in-page & cross-tab reactive)
 */
export function subscribeToAIIntake(callback: (summary: AIIntakeSummary | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    callback(getAIIntakeSummary());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback(getAIIntakeSummary());
    }
  };

  window.addEventListener(INTAKE_UPDATED_EVENT, handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(INTAKE_UPDATED_EVENT, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}
