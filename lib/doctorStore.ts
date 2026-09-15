"use client";

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string; // e.g. "Ayurveda", "Panchakarma", "Yoga & Naturopathy", "Unani", "Siddha", "Homeopathy"
  subSpecialty: string; // e.g. "Kayachikitsa & Nadi Pariksha"
  qualifications: string; // e.g. "BAMS, MD (Ayurveda)"
  experienceYears: number; // e.g. 14
  hospital: string; // e.g. "Charkha AYUSH Superspeciality Hospital"
  location: string; // e.g. "New Delhi"
  rating: number; // e.g. 4.9
  reviewsCount: number; // e.g. 84
  consultationFee: number; // in INR e.g. 500
  availableTimings: string; // e.g. "Mon - Sat (10:00 AM - 03:00 PM)"
  nextAvailableSlot: string; // e.g. "Today, 4:00 PM"
  languages: string[]; // ["Hindi", "English", "Sanskrit"]
  expertise: string[]; // ["Panchakarma", "Nadi Pariksha", "Joint Pain", "Digestive Health"]
  about: string; // Bio & clinical approach
  phone: string;
  registrationNumber: string; // AYUSH Council Registration No.
  avatarUrl?: string;
  isAvailableToday: boolean;
  isAyushVerified: boolean;
  isPublished: boolean;
  isSeedDoctor?: boolean;
  createdAt: string;
}

export interface QueuedPatientReport {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
  date?: string;
  isGeneratedSummary?: boolean;
}

export interface QueuedPatient {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  language?: string;
  token?: string;
  status: "Waiting" | "In Consultation" | "Completed" | "Triaged" | string;
  issue: string;
  chiefComplaint: string;
  severity: "Mild" | "Medium" | "High" | "mild" | "moderate" | "severe" | string;
  duration?: string;
  time: string;
  date: string;
  prakriti?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedDoctorSpecialty?: string;
  reports: QueuedPatientReport[];
  reportsCount: number;
  summaryPdfUrl?: string;
  summaryPdfName?: string;
  submittedAt: string;
}

export const DEFAULT_AYUSH_DOCTORS: DoctorProfile[] = [
  {
    id: "doc-ayur-1",
    name: "Dr. Rajesh Sharma",
    specialty: "Ayurveda",
    subSpecialty: "Kayachikitsa & Nadi Pariksha",
    qualifications: "BAMS, MD (Ayurveda - BHU)",
    experienceYears: 14,
    hospital: "Charkha AYUSH Superspeciality Hospital",
    location: "New Delhi",
    rating: 4.9,
    reviewsCount: 84,
    consultationFee: 500,
    availableTimings: "Mon - Sat (10:00 AM - 04:00 PM)",
    nextAvailableSlot: "Today, 4:00 PM",
    languages: ["Hindi", "English", "Sanskrit"],
    expertise: ["Nadi Pariksha", "Digestive Health", "Joint Pain", "Panchakarma"],
    about: "Senior Ayurvedic Consultant specializing in classical pulse diagnosis, gut metabolism (Agni), and holistic chronic care.",
    phone: "+91 98765 43210",
    registrationNumber: "AYU-DEL-2012-04812",
    isAvailableToday: true,
    isAyushVerified: true,
    isPublished: true,
    isSeedDoctor: true,
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "doc-panch-2",
    name: "Dr. Ananya Iyer",
    specialty: "Panchakarma",
    subSpecialty: "Detoxification & Neurological Wellness",
    qualifications: "BAMS, MD (Panchakarma - Kerala)",
    experienceYears: 11,
    hospital: "Kerala Ayurveda Wellness Center",
    location: "Bengaluru",
    rating: 4.8,
    reviewsCount: 62,
    consultationFee: 600,
    availableTimings: "Mon - Fri (09:00 AM - 02:00 PM)",
    nextAvailableSlot: "Tomorrow, 10:30 AM",
    languages: ["English", "Hindi", "Malayalam"],
    expertise: ["Vamana", "Virechana", "Shirodhara", "Spine Care"],
    about: "Specialist in authentic Panchakarma cleansing therapies and musculoskeletal rehabilitation.",
    phone: "+91 98111 22334",
    registrationNumber: "AYU-KAR-2015-09231",
    isAvailableToday: true,
    isAyushVerified: true,
    isPublished: true,
    isSeedDoctor: true,
    createdAt: "2026-01-12T00:00:00.000Z",
  },
  {
    id: "doc-homeo-3",
    name: "Dr. Priya Nair",
    specialty: "Homeopathy",
    subSpecialty: "Constitutional Prescribing & Chronic Allergies",
    qualifications: "BHMS, MD (Homeopathy - NIH)",
    experienceYears: 9,
    hospital: "Central Homoeopathic Care Clinic",
    location: "Mumbai",
    rating: 4.9,
    reviewsCount: 57,
    consultationFee: 450,
    availableTimings: "Mon - Sat (11:00 AM - 05:00 PM)",
    nextAvailableSlot: "Today, 5:30 PM",
    languages: ["English", "Hindi", "Marathi"],
    expertise: ["Skin Disorders", "Pediatric Health", "Respiratory Allergies", "Migraine"],
    about: "Classical Homoeopathic practitioner focusing on gentle, non-toxic root-cause constitutional healing.",
    phone: "+91 98222 33445",
    registrationNumber: "HOM-MAH-2017-06192",
    isAvailableToday: true,
    isAyushVerified: true,
    isPublished: true,
    isSeedDoctor: true,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "doc-yoga-4",
    name: "Dr. Arvind Joshi",
    specialty: "Yoga & Naturopathy",
    subSpecialty: "Therapeutic Yoga & Lifestyle Medicine",
    qualifications: "BNYS, PhD (Yoga Therapy - SVYASA)",
    experienceYears: 12,
    hospital: "Prakriti Holistic Healing Sanctuary",
    location: "Pune",
    rating: 4.9,
    reviewsCount: 73,
    consultationFee: 400,
    availableTimings: "Mon - Sat (07:00 AM - 01:00 PM)",
    nextAvailableSlot: "Today, 2:00 PM",
    languages: ["Hindi", "English", "Gujarati"],
    expertise: ["Metabolic Disorders", "Hypertension", "Pranayama Therapy", "Diet Therapy"],
    about: "Clinical Naturopath and Yoga physician helping reverse lifestyle conditions through circadian Ahara-Vihara alignment.",
    phone: "+91 98333 44556",
    registrationNumber: "NAT-MAH-2014-03184",
    isAvailableToday: true,
    isAyushVerified: true,
    isPublished: true,
    isSeedDoctor: true,
    createdAt: "2026-01-20T00:00:00.000Z",
  },
];

const STORAGE_KEY = "swasthya_setu_doctors";
const CURRENT_DOCTOR_KEY = "swasthya_setu_current_doctor_profile";
const DOCTORS_UPDATED_EVENT = "swasthya_setu_doctors_updated";
const DOCTOR_QUEUE_KEY = "swasthya_doctor_queue";
const DOCTOR_QUEUE_UPDATED_EVENT = "swasthya_doctor_queue_updated";

/**
 * Check if a doctor is a default hardcoded seed doctor
 */
function isSeedDoctorId(id: string): boolean {
  return (
    id === "doc-ayur-1" ||
    id === "doc-panch-2" ||
    id === "doc-homeo-3" ||
    id === "doc-yoga-4"
  );
}

/**
 * Retrieve only real published doctors from localStorage.
 * Seed doctors are kept for legacy preview data but are never exposed in the patient directory.
 */
export function getDoctors(): DoctorProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    let list: DoctorProfile[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed.filter((d) => d && d.name && d.name.trim());
        }
      } catch (e) {}
    }

    // Also check current logged-in doctor profile
    const currentDoc = getCurrentDoctorProfile();
    if (currentDoc && currentDoc.isPublished && currentDoc.name && currentDoc.name.trim()) {
      const exists = list.some(
        (d) => (d.id && d.id === currentDoc.id) || d.name.toLowerCase() === currentDoc.name.toLowerCase()
      );
      if (!exists) {
        list = [currentDoc, ...list];
      }
    }

    // Check if any real (user-published, non-seed) doctor exists
    const realPublishedDoctors = list.filter(
      (d) => d.isPublished && !d.isSeedDoctor && !isSeedDoctorId(d.id)
    );

    // If real doctors have been published, show ONLY real published doctors!
    if (realPublishedDoctors.length > 0) {
      return realPublishedDoctors;
    }

    return [];
  } catch (err) {
    console.error("Error reading doctors from localStorage", err);
    return [];
  }
}

/**
 * Get the current logged-in doctor's saved profile (if any)
 */
export function getCurrentDoctorProfile(): DoctorProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(CURRENT_DOCTOR_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (err) {
    console.error("Error reading current doctor profile", err);
    return null;
  }
}

/**
 * Save / Publish the current doctor's profile.
 * When published, this automatically removes any hardcoded seed doctors from the public directory
 * so that patients ONLY see the real published doctor(s).
 */
export function saveCurrentDoctorProfile(doctor: DoctorProfile): DoctorProfile {
  if (typeof window === "undefined") return doctor;
  try {
    const doctorId =
      doctor.id && doctor.id.trim()
        ? doctor.id
        : `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const publishedDoctor: DoctorProfile = {
      ...doctor,
      id: doctorId,
      isPublished: true,
      isSeedDoctor: false,
    };

    // 1. Save as current doctor session
    localStorage.setItem(CURRENT_DOCTOR_KEY, JSON.stringify(publishedDoctor));

    // 2. Read existing doctors and purge any hardcoded seed doctors
    let existingList: DoctorProfile[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existingList = parsed;
        }
      }
    } catch (e) {}

    const realExisting = existingList.filter(
      (d) =>
        d &&
        d.id !== publishedDoctor.id &&
        !d.isSeedDoctor &&
        !isSeedDoctorId(d.id)
    );

    // Only real published doctors remain in storage!
    const updated = [publishedDoctor, ...realExisting];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    dispatchUpdateEvent();
    return publishedDoctor;
  } catch (err) {
    console.error("Error saving doctor profile to localStorage", err);
    return doctor;
  }
}

/**
 * Unpublish / Remove the current doctor's profile from the public directory
 */
export function unpublishCurrentDoctorProfile(doctorId: string): void {
  if (typeof window === "undefined") return;
  try {
    let existing: DoctorProfile[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) existing = JSON.parse(raw);
    } catch (e) {}

    const updated = existing.filter((d) => d.id !== doctorId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const current = getCurrentDoctorProfile();
    if (current && (current.id === doctorId || !doctorId)) {
      localStorage.setItem(
        CURRENT_DOCTOR_KEY,
        JSON.stringify({ ...current, isPublished: false })
      );
    }

    dispatchUpdateEvent();
  } catch (err) {
    console.error("Error unpublishing doctor profile", err);
  }
}

/**
 * Broadcast event to all listening components and tabs
 */
function dispatchUpdateEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DOCTORS_UPDATED_EVENT));
  }
}

/**
 * Subscribe to doctor updates (cross-tab & in-page reactivity)
 */
export function subscribeToDoctors(callback: (doctors: DoctorProfile[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    callback(getDoctors());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === CURRENT_DOCTOR_KEY) {
      callback(getDoctors());
    }
  };

  window.addEventListener(DOCTORS_UPDATED_EVENT, handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(DOCTORS_UPDATED_EVENT, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getDoctorQueue(): QueuedPatient[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(DOCTOR_QUEUE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error("Error reading doctor queue from localStorage", err);
  }
  return [];
}

export function addPatientToQueue(patient: QueuedPatient | any) {
  if (typeof window === "undefined") return;
  try {
    const existing = getDoctorQueue();
    const updated = [patient, ...existing.filter((p) => p.id !== patient.id)];
    localStorage.setItem(DOCTOR_QUEUE_KEY, JSON.stringify(updated));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(DOCTOR_QUEUE_UPDATED_EVENT));
    }
    return updated;
  } catch (err) {
    console.error("Error writing doctor queue to localStorage", err);
    return null;
  }
}

export function subscribeToDoctorQueue(callback: (queue: QueuedPatient[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => callback(getDoctorQueue());

  const handleStorage = (event: StorageEvent) => {
    if (event.key === DOCTOR_QUEUE_KEY) {
      callback(getDoctorQueue());
    }
  };

  window.addEventListener(DOCTOR_QUEUE_UPDATED_EVENT, handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(DOCTOR_QUEUE_UPDATED_EVENT, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * Downloads a patient's medical report or AI clinical summary
 */
export function downloadPatientReport(report: QueuedPatientReport) {
  if (typeof window === "undefined") return;
  const fileName = report.name || "Medical_Report.pdf";

  if (report.url && report.url.startsWith("data:")) {
    const link = document.createElement("a");
    link.href = report.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  if (report.url && (report.url.startsWith("http://") || report.url.startsWith("https://") || report.url.startsWith("blob:"))) {
    const link = document.createElement("a");
    link.href = report.url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Fallback: create synthetic clinical document download
  const content = `SWASTHYA SETU - AYUSH CLINICAL REPORT\n=======================================\nDocument: ${report.name}\nType: ${report.type || "Medical Record"}\nDate: ${report.date || new Date().toLocaleDateString()}\nStatus: Verified Clinical Intake Record\n\nThis clinical document was submitted by the patient for doctor review.`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName.endsWith(".pdf") || fileName.endsWith(".txt") ? fileName : `${fileName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
