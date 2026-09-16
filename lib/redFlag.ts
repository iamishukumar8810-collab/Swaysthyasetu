export function checkRedFlags(text: string, metadata?: { severity?: string; durationHours?: number; durationText?: string }) {
  const reasons: string[] = [];
  const lower = (text || '').toLowerCase();

  // Critical keywords in English and Hindi/Hinglish
  const criticalKeywords = [
    'chest pain', 'सीने में दर्द', 'sine me dard',
    'shortness of breath', 'difficulty breathing', 'सांस लेने में तकलीफ', 'saans lene me takleef',
    'severe bleeding', 'faint', 'unresponsive', 'sudden weakness', 'slurred speech', 'confusion',
    'heart attack', 'paralysis', 'chhati me dard',
    'bht jyda dard', 'bohot dard', 'bahut dard', 'unbearable pain', 'extreme pain', 'acute pain'
  ];

  for (const k of criticalKeywords) {
    if (lower.includes(k)) reasons.push(`Critical symptom detected: "${k}"`);
  }

  // Check severity
  if (metadata?.severity) {
    const sev = metadata.severity.toLowerCase();
    if (sev === 'high' || sev === 'severe' || sev === 'तीव्र' || sev === 'jyada') {
      reasons.push('High/Severe pain reported by patient');
    }
  }

  // Check duration in text or hours
  if (typeof metadata?.durationHours === 'number' && metadata.durationHours >= 72) {
    reasons.push(`Prolonged duration (${metadata.durationHours} hours)`);
  }

  const durationStr = (metadata?.durationText || lower).toLowerCase();
  if (
    durationStr.includes('bohot time') ||
    durationStr.includes('bahut time') ||
    durationStr.includes('3 months') ||
    durationStr.includes('6 months') ||
    durationStr.includes('1 year') ||
    durationStr.includes('several months') ||
    durationStr.includes('kayi mahine')
  ) {
    reasons.push('Chronic symptom duration (> 30 days)');
  }

  const red = reasons.length > 0;
  return { red, reasons };
}

export interface AyushClinicalAssessment {
  dosha: string;
  agni: string;
  dhatu: string;
  srotas: string;
  treatmentFocus: string;
}

export function evaluateAyushDoshaAndAgni(symptoms: string[] = [], description: string = ""): AyushClinicalAssessment {
  const combined = (symptoms.join(" ") + " " + description).toLowerCase();

  // 1. Acidity / Heartburn / Gastric burning
  if (combined.includes("acid") || combined.includes("jalan") || combined.includes("heartburn") || combined.includes("sour eructation") || combined.includes("pet me jalan")) {
    return {
      dosha: "Pitta Aggravation (Amlapitta & Ushna Guna)",
      agni: "Tikshnagni (Hyperactive / Acidic Digestive Fire)",
      dhatu: "Rasa & Rakta Dhatu",
      srotas: "Annavaha & Purishavaha Srotas",
      treatmentFocus: "Pitta Shamana & Deepana-Pachana",
    };
  }

  // 2. Fatigue / Weakness
  if (combined.includes("fatigue") || combined.includes("weak") || combined.includes("kamzori") || combined.includes("exhaust") || combined.includes("thakan")) {
    return {
      dosha: "Vata-Kapha Imbalance (Dhatukshaya & Rasavaha Dushti)",
      agni: "Manda Agni (Sluggish Digestive Fire)",
      dhatu: "Rasa, Mamsa & Ojas",
      srotas: "Rasavaha & Manovaha Srotas",
      treatmentFocus: "Rasayana & Balya Chikitsa",
    };
  }

  // 3. Headache / Migraine
  if (combined.includes("headache") || combined.includes("sir dard") || combined.includes("migraine") || combined.includes("head")) {
    return {
      dosha: "Vata-Pitta Aggravation (Shirashoola / Ardhavabhedaka)",
      agni: "Vishamagni (Irregular Digestive Fire)",
      dhatu: "Majja & Rakta Dhatu",
      srotas: "Manovaha & Majjavaha Srotas",
      treatmentFocus: "Shirodhara & Vata-Pitta Shamana",
    };
  }

  // 4. Joint Pain / Arthritis / Knee / Back pain
  if (combined.includes("joint") || combined.includes("knee") || combined.includes("back") || combined.includes("kamar") || combined.includes("dard") || combined.includes("pain") || combined.includes("stiff") || combined.includes("arthritis")) {
    return {
      dosha: "Vata-Kapha Aggravation (Sandhigata Vata & Asthivaha Dushti)",
      agni: "Manda Agni (Associated with Ama)",
      dhatu: "Asthi & Majja Dhatu",
      srotas: "Asthivaha & Sandhivaha Srotas",
      treatmentFocus: "Snehana, Swedana & Janu Basti",
    };
  }

  // 5. Poor Sleep / Insomnia
  if (combined.includes("sleep") || combined.includes("insomnia") || combined.includes("neend") || combined.includes("poor sleep")) {
    return {
      dosha: "Vata-Prana Vata Aggravation (Anidra)",
      agni: "Vishamagni (Variable Digestive Fire)",
      dhatu: "Majja & Rasa Dhatu",
      srotas: "Manovaha Srotas",
      treatmentFocus: "Medhya Rasayana & Nidana Parivarjana",
    };
  }

  // 6. Cough / Cold / Throat / Phlegm
  if (combined.includes("cough") || combined.includes("cold") || combined.includes("kasa") || combined.includes("gala") || combined.includes("throat") || combined.includes("kaph")) {
    return {
      dosha: "Kapha-Vata Aggravation (Kasa & Pranavaha Srotorodha)",
      agni: "Manda Agni (Low Digestive Fire)",
      dhatu: "Rasa Dhatu",
      srotas: "Pranavaha Srotas",
      treatmentFocus: "Kapha-Vatahara & Kasahara Oushadhi",
    };
  }

  // 7. Fever / High body heat
  if (combined.includes("fever") || combined.includes("bukhar") || combined.includes("tap") || combined.includes("body heat")) {
    return {
      dosha: "Pitta-Kapha Aggravation (Jwara & Swedavaha Dushti)",
      agni: "Agnimandya (Suppressed Digestive Fire)",
      dhatu: "Rasa & Rakta Dhatu",
      srotas: "Swedavaha & Rasavaha Srotas",
      treatmentFocus: "Langhana, Pachana & Jwaraghna Chikitsa",
    };
  }

  // 8. Nausea / Vomiting
  if (combined.includes("nausea") || combined.includes("vomit") || combined.includes("ulti") || combined.includes("ji michlana")) {
    return {
      dosha: "Kapha-Pitta Aggravation (Hrillasa / Chhardi)",
      agni: "Manda Agni (Sluggish Digestive Fire)",
      dhatu: "Rasa Dhatu",
      srotas: "Annavaha & Amashaya Srotas",
      treatmentFocus: "Chhardighna & Pachana Chikitsa",
    };
  }

  // 9. Anxiety / Stress / Tension
  if (combined.includes("anxiety") || combined.includes("stress") || combined.includes("tension") || combined.includes("ghabrahat") || combined.includes("chinta")) {
    return {
      dosha: "Vata-Rajas Aggravation (Chittodvega / Manovaha Dushti)",
      agni: "Vishamagni (Irregular Digestive Fire)",
      dhatu: "Manas & Majja Dhatu",
      srotas: "Manovaha Srotas",
      treatmentFocus: "Satvavajaya & Medhya Chikitsa",
    };
  }

  // General evaluation
  return {
    dosha: "Vata-Pitta Balance (Under Active Anamnesis)",
    agni: "Samagni (Balanced Digestive Fire)",
    dhatu: "Rasa Dhatu",
    srotas: "General Srotas",
    treatmentFocus: "AYUSH Clinical Examination",
  };
}
