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
    id: "P-963646",
    name: "Ramesh Kumar",
    phone: "+91 9636462356",
    age: 45,
    gender: "Male",
    abhaId: "14-2345-6789-0123",
    prakriti: "Pitta-Kapha",
    concerns: ["Acidity (mild)", "Poor sleep", "General fatigue"],
    durationOfSymptoms: "", // Empty so readiness is 78% initially!
    dietPreference: "Vegetarian",
    nextAppointment: {
      scheduled: false,
    },
  },
  medicines: [
    {
      id: "med-1",
      name: "Avipattikar Churna",
      dosage: "3g",
      frequency: "Once daily at bedtime",
      timing: "After food with lukewarm water",
      prescribedBy: "Dr. Meera Sharma",
      duration: "14 days",
    },
    {
      id: "med-2",
      name: "Sutashekhara Rasa",
      dosage: "1 tablet (250mg)",
      frequency: "Twice daily (BD)",
      timing: "Before meals with honey",
      prescribedBy: "Dr. Meera Sharma",
      duration: "10 days",
    },
  ],
  visits: [
    {
      id: "vis-1",
      doctorName: "Dr. Meera Sharma",
      specialty: "Ayurveda Kayachikitsa",
      date: "12 Jun 2025",
      time: "10:30 AM",
      reason: "Acidity & Sleep Issues",
      status: "Completed",
      prescriptionNotes: "Prescribed Pitta-pacifying diet. Advised Avipattikar Churna and Sutashekhara Rasa. Follow-up after 2 weeks.",
    },
    {
      id: "vis-2",
      doctorName: "Dr. Rohan Patel",
      specialty: "Ayurveda General OPD",
      date: "28 Mar 2025",
      time: "11:15 AM",
      reason: "General Checkup & Fatigue",
      status: "Completed",
      prescriptionNotes: "Vital parameters normal. Mild Agni impairment noted. Advised Triphala and warm water intake.",
    },
  ],
  reports: [
    {
      id: "rep-1",
      name: "Blood Test Report",
      date: "12 Jun 2025",
      type: "PDF",
      size: "1.4 MB",
    },
    {
      id: "rep-2",
      name: "Vitamin D & B12 Report",
      date: "28 Mar 2025",
      type: "PDF",
      size: "820 KB",
    },
    {
      id: "rep-3",
      name: "Prescription_DrMeera",
      date: "28 Mar 2025",
      type: "Image",
      size: "2.1 MB",
    },
  ],
  wellness: {
    diet: {
      title: "Diet Suggestion",
      desc: "Light and warm meals, avoid spicy and oily food.",
      content: "Focus on sweet, bitter, and astringent tastes. Favor ghee, coriander water, coconut water, and soaked almonds. Avoid deep-fried foods, fermented dough, and excessive chilies.",
    },
    routine: {
      title: "Daily Routine (Dinacharya)",
      desc: "Improve sleep, reduce screen time before bed.",
      content: "Wake up before sunrise (Brahma Muhurta). Practice 10 minutes of gentle yoga. Stop smartphone usage 1 hour prior to sleep. Apply warm sesame oil to soles of feet.",
    },
    herbs: {
      title: "Herbal Guidance",
      desc: "Ashwagandha & Brahmi for stress and fatigue.",
      content: "Take 1/2 tsp of Ashwagandha powder with warm milk at night. Brahmi tea helps pacify mental fatigue and stabilizes Pitta-Vata balance.",
    },
    mind: {
      title: "Mind & Stress (Pranayama)",
      desc: "Try 5 minutes of deep breathing every day.",
      content: "Practice Nadi Shodhana (Alternate Nostril Breathing) for 5 minutes and Sheetali Pranayama for cooling the internal body heat.",
    },
  },
};
