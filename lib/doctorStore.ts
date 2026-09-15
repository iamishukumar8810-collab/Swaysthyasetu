"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface DoctorProfile {
  id: string;
  userId?: string;
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

export const DEFAULT_AYUSH_DOCTORS: DoctorProfile[] = [];

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

function mapSupabaseDoctor(row: any): DoctorProfile {
  return {
    id: row.user_id,
    userId: row.user_id,
    name: row.display_name || row.full_name || row.name || "AYUSH Doctor",
    specialty: row.specialty || "Ayurveda",
    subSpecialty: row.sub_specialty || "AYUSH Specialist",
    qualifications: row.qualifications || "BAMS, MD (Ayurveda)",
    experienceYears: Number(row.experience_years) || 0,
    hospital: row.hospital || "AYUSH Clinic",
    location: row.location || "India",
    rating: Number(row.rating) || 4.9,
    reviewsCount: Number(row.reviews_count) || 0,
    consultationFee: Number(row.consultation_fee) || 500,
    availableTimings: row.available_timings || "Mon - Sat (10:00 AM - 04:00 PM)",
    nextAvailableSlot: row.next_available_slot || "Today, 4:00 PM",
    languages: row.languages || [],
    expertise: row.expertise || [],
    about: row.about || "Registered AYUSH Medical Practitioner.",
    phone: row.phone || "",
    registrationNumber: row.registration_number || "",
    avatarUrl: row.avatar_url,
    isAvailableToday: row.is_available_today ?? true,
    isAyushVerified: row.is_ayush_verified ?? true,
    isPublished: Boolean(row.is_published),
    isSeedDoctor: false,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function getPublishedDoctorsFromSupabase(): Promise<DoctorProfile[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("doctor_profiles")
    .select("*, profiles!inner(full_name, phone, avatar_url)")
    .eq("is_published", true);
  if (error) {
    console.error("Failed to load published doctors from Supabase", error);
    return [];
  }
  return (data || []).map((row: any) => mapSupabaseDoctor({
    ...row,
    full_name: row.profiles?.full_name,
    phone: row.profiles?.phone,
    avatar_url: row.profiles?.avatar_url,
  }));
}

export async function publishDoctorProfileToSupabase(doctor: DoctorProfile): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Please sign in before publishing your doctor profile.");

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authData.user.id,
    role: "doctor",
    full_name: doctor.name,
    email: authData.user.email || "",
    phone: doctor.phone || null,
    avatar_url: authData.user.user_metadata?.avatar_url || null,
  }, { onConflict: "id" });
  if (profileError) throw new Error(profileError.message || "Could not save doctor account profile.");

  const { error } = await supabase.from("doctor_profiles").upsert({
    user_id: authData.user.id,
    specialty: doctor.specialty,
    sub_specialty: doctor.subSpecialty,
    qualifications: doctor.qualifications,
    experience_years: doctor.experienceYears,
    hospital: doctor.hospital,
    location: doctor.location,
    consultation_fee: doctor.consultationFee,
    available_timings: doctor.availableTimings,
    languages: doctor.languages,
    expertise: doctor.expertise,
    about: doctor.about,
    registration_number: doctor.registrationNumber,
    is_published: true,
  }, { onConflict: "user_id" });
  if (error) throw new Error(error.message || "Could not publish doctor profile.");
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
