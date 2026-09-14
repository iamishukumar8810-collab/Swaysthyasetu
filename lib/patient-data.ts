export interface MedicalReport {
  id: string;
  name: string;
  date: string;
  type: "PDF" | "Image" | "Lab";
  size?: string;
  url?: string;
}

export interface ConsultationVisit {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time?: string;
  reason: string;
  status: "Completed" | "Upcoming" | "In Progress";
  prescriptionNotes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string; // e.g. "Before food" | "After food"
  prescribedBy: string;
  duration: string;
  instructions?: string;
}

export interface WellnessGuidance {
  diet: { title: string; desc: string; content: string };
  routine: { title: string; desc: string; content: string };
  herbs: { title: string; desc: string; content: string };
  mind: { title: string; desc: string; content: string };
}

export interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  abhaId: string;
  prakriti: string;
  concerns: string[];
  durationOfSymptoms: string; // missing in initial 78% readiness
  dietPreference: string;
  bloodGroup?: string;
  nextAppointment: {
    scheduled: boolean;
    date?: string;
    time?: string;
    doctor?: string;
    specialty?: string;
  };
}

export const initialPatientData: {
  profile: PatientProfile;
  medicines: Medication[];
  visits: ConsultationVisit[];
  reports: MedicalReport[];
  wellness: WellnessGuidance;
} = {
  profile: {
    id: "",
    name: "",
    phone: "",
    age: 0,
    gender: "",
    abhaId: "",
    prakriti: "",
    concerns: [],
    durationOfSymptoms: "",
    dietPreference: "",
    nextAppointment: {
      scheduled: false,
    },
  },
  medicines: [],
  visits: [],
  reports: [],
  wellness: {
    diet: { title: "", desc: "", content: "" },
    routine: { title: "", desc: "", content: "" },
    herbs: { title: "", desc: "", content: "" },
    mind: { title: "", desc: "", content: "" },
  },
};

export const PATIENT_DATA_EVENT = "swasthya_patient_data_updated";

export function getStoredPatientData() {
  if (typeof window === "undefined") return initialPatientData;
  try {
    const saved = localStorage.getItem("swasthya_setu_patient_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean and remove any legacy mock reports (rep-1, rep-2, rep-3)
      const cleanedReports = (parsed.reports || []).filter(
        (r: MedicalReport) => !["rep-1", "rep-2", "rep-3"].includes(r.id)
      );
      return {
        ...initialPatientData,
        ...parsed,
        profile: { ...initialPatientData.profile, ...(parsed.profile || {}) },
        reports: cleanedReports,
        visits: parsed.visits || initialPatientData.visits,
        medicines: parsed.medicines || initialPatientData.medicines,
      };
    }
  } catch (e) {
    console.error("Failed to load patient data from localStorage", e);
  }
  return initialPatientData;
}

export function saveStoredPatientData(data: typeof initialPatientData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("swasthya_setu_patient_data", JSON.stringify(data));
    window.dispatchEvent(new Event(PATIENT_DATA_EVENT));
  } catch (e) {
    console.error("Failed to save patient data to localStorage", e);
  }
}

export function addReportToPatientData(newReport: MedicalReport) {
  const current = getStoredPatientData();
  const updated = {
    ...current,
    reports: [newReport, ...(current.reports || []).filter((r: MedicalReport) => r.id !== newReport.id)],
  };
  saveStoredPatientData(updated);
  return updated;
}
