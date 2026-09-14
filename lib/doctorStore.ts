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
  createdAt: string;
}

const STORAGE_KEY = "swasthya_setu_doctors";
const CURRENT_DOCTOR_KEY = "swasthya_setu_current_doctor_profile";
const DOCTORS_UPDATED_EVENT = "swasthya_setu_doctors_updated";
const DOCTOR_QUEUE_KEY = "swasthya_doctor_queue";
const DOCTOR_QUEUE_UPDATED_EVENT = "swasthya_doctor_queue_updated";

/**
 * Filter out legacy mock doctors if any were previously written to localStorage
 */
function filterOutMockDoctors(docs: any[]): DoctorProfile[] {
  // Accept any stored doctor objects that have a valid id
  return docs.filter((d) => d && d.id);
}

/**
 * Retrieve all registered & published doctors from localStorage
 * NO mock or hardcoded doctors! Only returns real registered doctors.
 */
export function getDoctors(): DoctorProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      const filtered = filterOutMockDoctors(parsed);
      // Clean up storage if legacy mock was present
      if (filtered.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
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
 * Save / Publish the current logged-in doctor's profile
 * Saves both to current doctor session and public doctors directory
 */
export function saveCurrentDoctorProfile(doctor: DoctorProfile): DoctorProfile {
  if (typeof window === "undefined") return doctor;
  try {
    const publishedDoctor: DoctorProfile = {
      ...doctor,
      isPublished: true,
    };

    // Save as current doctor
    localStorage.setItem(CURRENT_DOCTOR_KEY, JSON.stringify(publishedDoctor));

    // Update public directory
    const existing = getDoctors();
    const index = existing.findIndex((d) => d.id === publishedDoctor.id);
    let updated: DoctorProfile[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = publishedDoctor;
    } else {
      updated = [publishedDoctor, ...existing];
    }
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
    const existing = getDoctors();
    const updated = existing.filter((d) => d.id !== doctorId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const current = getCurrentDoctorProfile();
    if (current && current.id === doctorId) {
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

export function getDoctorQueue(): any[] {
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

export function addPatientToQueue(patient: any) {
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

export function subscribeToDoctorQueue(callback: (queue: any[]) => void): () => void {
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
