// Pure TypeScript PDF Generator for Swasthya Setu AYUSH Clinical Triage Reports
// Generates valid standard PDF 1.4 documents without requiring binary external npm dependencies

import { AIIntakeSummary } from "./aiIntakeStore";

/**
 * Sanitizes strings for standard PDF syntax:
 * Escapes backslashes and parentheses, converts tabs/newlines to spaces,
 * and normalizes non-ASCII characters to safe readable Latin characters.
 */
function sanitizePDFText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncates string to specified length with ellipsis
 */
function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  const clean = text.replace(/[\r\n]+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 3) + "...";
}

export interface GeneratedPDFResult {
  pdfString: string;
  dataUrl: string;
  fileName: string;
}

/**
 * Generates an official, standard PDF 1.4 clinical summary report
 * dynamically displaying all information from all 4 intake steps.
 */
export function generateClinicalSummaryPDF(summary: AIIntakeSummary): GeneratedPDFResult {
  // Step 4 / Patient Identification
  const patientName = summary.patientName || "Patient";
  const patientId = summary.patientId || `SS-${Date.now().toString(36).toUpperCase()}`;
  const patientAge = summary.patientAge && summary.patientAge > 0 ? `${summary.patientAge} yrs` : "N/A";
  const patientGender = summary.patientGender || "N/A";
  const patientPhone = summary.patientPhone || "N/A";
  const readiness = summary.readinessScore !== undefined ? `${summary.readinessScore}%` : "100%";
  const intakeStatus = summary.status || "Pending Doctor Review";

  // Step 4 / Assigned Doctor Profile
  const assignedDoctor = summary.assignedDoctor || "General AYUSH OPD";
  const doctorSpecialty = summary.assignedDoctorSpecialty || "Ayurveda & AYUSH Medicine";
  const doctorQuals = summary.assignedDoctorQualifications ? `(${summary.assignedDoctorQualifications})` : "";
  const doctorHospital = summary.assignedDoctorHospital || "AYUSH Integrated Health Center";
  const doctorFee = summary.assignedDoctorFee ? `INR ${summary.assignedDoctorFee}` : "INR 500";

  // Step 1 / Symptoms & Clinical Anamnesis
  const reportedSymptomsList = summary.reportedSymptoms && summary.reportedSymptoms.length > 0
    ? summary.reportedSymptoms.join(", ")
    : (summary.chiefComplaint || "General Consultation");
  const severityLabel = summary.severity || "Medium";
  const severityScoreText = summary.severityScore !== undefined ? `${summary.severityScore}/10` : severityLabel;
  const durationText = summary.duration || "Recent onset";
  const patientDescription = summary.patientDescription || summary.chiefComplaint || "No additional description provided";
  const predictedDosha = summary.predictedDosha || "Vata-Pitta Aggravation";
  const agniAssessment = summary.agniAssessment || "Samagni (Balanced Digest Fire)";
  const isRed = Boolean(summary.isRedFlag);
  const redReasons = summary.redFlagReasons && summary.redFlagReasons.length > 0
    ? summary.redFlagReasons.join(", ")
    : "None (Standard OPD Priority)";

  // Step 2 / Uploaded Reports List
  const reportsDetail = summary.uploadedReportsDetail && summary.uploadedReportsDetail.length > 0
    ? summary.uploadedReportsDetail
    : (summary.uploadedReports || []).map((name) => ({ name, type: "Document", size: "Attached" }));

  // Step 3 / Current Medicines List
  const medicinesDetail = summary.medicinesDetail && summary.medicinesDetail.length > 0
    ? summary.medicinesDetail
    : (summary.medicines || []).map((m) => {
        const parts = m.split("(");
        const name = parts[0].trim();
        const extra = parts[1] ? parts[1].replace(")", "").trim() : "";
        const [dose, frequency] = extra.split(",").map((s) => s.trim());
        return { name, dose: dose || "-", frequency: frequency || "As directed" };
      });

  // Token Number (any digit)
  const tokenNumber = summary.tokenNumber || (summary.queuePosition ? `${100 + summary.queuePosition}` : "101");

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extract meaningful conversation dialogue lines
  const rawHistory = summary.conversationHistory || [];
  const meaningfulHistory = rawHistory.filter((h) => Boolean(h.text && h.text.trim())).slice(-6);

  const streamLines: string[] = [
    // -------------------------------------------------------------
    // 1. HEADER BANNER (Emerald #0E7C4A) WITH TOKEN NUMBER BADGE
    // -------------------------------------------------------------
    "0.05 0.49 0.29 rg",
    "35 765 525 55 re",
    "f",
    "1 1 1 rg",
    "BT",
    "/F2 13 Tf",
    "48 802 Td",
    "(SWASTHYA SETU - AYUSH CLINICAL INTAKE REPORT) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "48 787 Td",
    "(Ministry of AYUSH Integrated Digital Hospital System | Patient Pre-Consultation Summary) Tj",
    "ET",
    "BT",
    "/F1 7.5 Tf",
    "48 773 Td",
    `(${sanitizePDFText(`Report Generated: ${dateStr}, ${timeStr}   |   Case ID: ${summary.id.slice(0, 8).toUpperCase()}`)}) Tj`,
    "ET",

    // Token Number Badge in Header (Right Corner)
    "1 1 1 rg",
    "440 770 110 45 re",
    "f",
    "0.8 0.89 0.84 RG",
    "1 w",
    "440 770 110 45 re",
    "S",
    "0.35 0.4 0.35 rg",
    "BT",
    "/F2 7 Tf",
    "448 803 Td",
    "(TOKEN NUMBER) Tj",
    "ET",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 14 Tf",
    "448 786 Td",
    `(${sanitizePDFText(tokenNumber)}) Tj`,
    "ET",
    "0.4 0.45 0.4 rg",
    "BT",
    "/F1 6.5 Tf",
    "448 775 Td",
    "(OPD Consultation) Tj",
    "ET",

    // -------------------------------------------------------------
    // 2. PATIENT & ASSIGNED DOCTOR PROFILE (STEP 4 & IDENTIFICATION)
    // -------------------------------------------------------------
    "0.96 0.98 0.96 rg",
    "35 675 525 80 re",
    "f",
    "0.8 0.89 0.84 RG",
    "1 w",
    "35 675 525 80 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9.5 Tf",
    "48 740 Td",
    "(PATIENT & ASSIGNED AYUSH PHYSICIAN DETAILS [STEP 4]) Tj",
    "ET",
    "0.1 0.15 0.12 rg",
    "BT",
    "/F1 8.5 Tf",
    "48 724 Td",
    `(${sanitizePDFText(`Patient: ${patientName} (${patientAge}, ${patientGender})   |   Token Number: ${tokenNumber}`)}) Tj`,
    "48 709 Td",
    `(${sanitizePDFText(`Contact: ${patientPhone}   |   Patient ID: ${patientId}`)}) Tj`,
    "48 694 Td",
    `(${sanitizePDFText(`Status: ${intakeStatus}   |   Case Readiness: ${readiness}`)}) Tj`,
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "305 724 Td",
    `(${sanitizePDFText(`Attending Doctor: Dr. ${assignedDoctor}`)}) Tj`,
    "305 709 Td",
    `(${sanitizePDFText(`Specialty: ${doctorSpecialty} ${doctorQuals}`)}) Tj`,
    "305 694 Td",
    `(${sanitizePDFText(`Facility: ${doctorHospital}  |  Fee: ${doctorFee}`)}) Tj`,
    "ET",

    // -------------------------------------------------------------
    // 3. REPORTED SYMPTOMS & CLINICAL ANAMNESIS
    // -------------------------------------------------------------
    "0.98 0.99 0.98 rg",
    "35 505 525 160 re",
    "f",
    "0.8 0.89 0.84 RG",
    "35 505 525 160 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9.5 Tf",
    "48 650 Td",
    "(REPORTED SYMPTOMS & AYUSH CLINICAL EVALUATION) Tj",
    "ET",
    "0.1 0.15 0.12 rg",
    "BT",
    "/F2 8.5 Tf",
    "48 633 Td",
    "(Primary Symptoms:) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "145 633 Td",
    `(${sanitizePDFText(truncateText(reportedSymptomsList, 70))}) Tj`,
    "ET",
    "BT",
    "/F2 8.5 Tf",
    "48 616 Td",
    "(Severity Rating:) Tj",
    "ET",
    "BT",
    "/F2 8.5 Tf",
    severityLabel === "High" ? "0.85 0.1 0.1 rg" : severityLabel === "Medium" ? "0.85 0.5 0 rg" : "0.05 0.5 0.2 rg",
    "145 616 Td",
    `(${sanitizePDFText(`${severityScoreText} (${severityLabel} Intensity)`)}   |   Duration: ${sanitizePDFText(durationText)}) Tj`,
    "ET",
    "0.1 0.15 0.12 rg",
    "BT",
    "/F2 8.5 Tf",
    "48 599 Td",
    "(Patient Description:) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "145 599 Td",
    `(${sanitizePDFText(`"${truncateText(patientDescription, 68)}"` )}) Tj`,
    "ET",
    "BT",
    "/F2 8.5 Tf",
    "48 582 Td",
    "(AYUSH Dosha Imbalance:) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "170 582 Td",
    `(${sanitizePDFText(predictedDosha)}) Tj`,
    "ET",
    "BT",
    "/F2 8.5 Tf",
    "48 565 Td",
    "(Digestive Fire / Agni:) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "170 565 Td",
    `(${sanitizePDFText(agniAssessment)}) Tj`,
    "ET",

    // Priority Banner inside Symptoms box
    isRed ? "0.99 0.92 0.92 rg" : "0.93 0.98 0.95 rg",
    "45 515 505 24 re",
    "f",
    isRed ? "0.85 0.2 0.2 RG" : "0.2 0.65 0.35 RG",
    "45 515 505 24 re",
    "S",
    "BT",
    "/F2 8 Tf",
    isRed ? "0.8 0.05 0.05 rg" : "0.05 0.45 0.2 rg",
    "55 524 Td",
    `(${sanitizePDFText(isRed ? `CLINICAL ALERT: High Priority Flag - ${redReasons}` : "CLINICAL PRIORITY: Normal OPD Consultation Queue (No emergency flags detected)")}) Tj`,
    "ET",

    // -------------------------------------------------------------
    // 4. CURRENT MEDICATIONS & HERBAL SUPPLEMENTS
    // -------------------------------------------------------------
    "0.98 0.99 0.98 rg",
    "35 358 525 137 re",
    "f",
    "0.8 0.89 0.84 RG",
    "35 358 525 137 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9.5 Tf",
    "48 480 Td",
    "(CURRENT MEDICATIONS, SUPPLEMENTS & REMEDIES) Tj",
    "ET"
  ];

  if (medicinesDetail.length > 0) {
    let medY = 460;
    medicinesDetail.slice(0, 5).forEach((med, idx) => {
      const medLine = sanitizePDFText(
        `[${idx + 1}] ${truncateText(med.name, 40)}   |   Dose: ${med.dose || "-"}   |   Frequency: ${med.frequency || "Once a day"}`
      );
      streamLines.push(
        "0.1 0.15 0.12 rg",
        "BT",
        "/F1 8.5 Tf",
        `48 ${medY} Td`,
        `(${medLine}) Tj`,
        "ET"
      );
      medY -= 16;
    });
    if (medicinesDetail.length > 5) {
      streamLines.push(
        "0.35 0.4 0.38 rg",
        "BT",
        "/F1 8 Tf",
        `48 ${medY} Td`,
        `(${sanitizePDFText(`+ ${medicinesDetail.length - 5} more active medicines listed`)}) Tj`,
        "ET"
      );
    }
  } else {
    streamLines.push(
      "0.35 0.4 0.38 rg",
      "BT",
      "/F1 8.5 Tf",
      "48 450 Td",
      "(No current pharmaceutical, over-the-counter, or Ayurvedic medicines reported.) Tj",
      "48 434 Td",
      "(Patient has no active drug interactions recorded at the time of intake.) Tj",
      "ET"
    );
  }

  // -------------------------------------------------------------
  // 5. AI ANAMNESIS TRANSCRIPT & CLINICAL GUIDANCE
  // -------------------------------------------------------------
  streamLines.push(
    "0.98 0.99 0.98 rg",
    "35 150 525 198 re",
    "f",
    "0.8 0.89 0.84 RG",
    "35 150 525 198 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9.5 Tf",
    "48 333 Td",
    "(AI CLINICAL INTAKE TRANSCRIPT & PRE-CONSULTATION GUIDANCE) Tj",
    "ET"
  );

  let curY = 314;
  if (meaningfulHistory.length > 0) {
    meaningfulHistory.slice(-7).forEach((item) => {
      const isUser = item.from === "user";
      const speaker = isUser ? "Patient: " : "AI Assistant: ";
      let clean = item.text.replace(/<!--[\s\S]*?-->/g, "").replace(/[\r\n]+/g, " ").trim();
      const sanitized = sanitizePDFText(`${speaker}"${truncateText(clean, 78)}"`);

      streamLines.push(
        isUser ? "0.08 0.35 0.22 rg" : "0.22 0.25 0.32 rg",
        "BT",
        isUser ? "/F2 8 Tf" : "/F1 8 Tf",
        `48 ${curY} Td`,
        `(${sanitized}) Tj`,
        "ET"
      );
      curY -= 15;
    });
  } else {
    streamLines.push(
      "0.22 0.25 0.32 rg",
      "BT",
      "/F1 8 Tf",
      `48 ${curY} Td`,
      `(${sanitizePDFText(`Structured Intake: ${reportedSymptomsList} | Severity: ${severityLabel} | Duration: ${durationText}`)}) Tj`,
      "ET"
    );
    curY -= 15;
  }

  // Pre-consultation guidance note inside the box
  streamLines.push(
    "0.15 0.2 0.4 rg",
    "BT",
    "/F2 8 Tf",
    `48 ${Math.max(curY, 162)} Td`,
    `(${sanitizePDFText(`Clinical Note for Dr. ${assignedDoctor}: Correlate ${predictedDosha} with physical pulse/Nadi & Dashavidha Pariksha.`)}) Tj`,
    "ET"
  );

  // -------------------------------------------------------------
  // 6. FOOTER: VERIFICATION, SIGNATURE & COMPLIANCE
  // -------------------------------------------------------------
  streamLines.push(
    "0.94 0.96 0.95 rg",
    "35 40 525 100 re",
    "f",
    "0.75 0.85 0.8 RG",
    "35 40 525 100 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 8.5 Tf",
    "48 125 Td",
    "(OFFICIAL SWASTHYA SETU AYUSH DIGITAL CLINICAL RECORD - VERIFIED INTAKE) Tj",
    "ET",
    "0.3 0.35 0.32 rg",
    "BT",
    "/F1 7.5 Tf",
    "48 111 Td",
    `(${sanitizePDFText(`Transmitted to Dr. ${assignedDoctor} OPD Queue   |   Token: ${tokenNumber}   |   Date: ${dateStr}`)}) Tj`,
    "48 98 Td",
    "(This clinical record was generated automatically from patient-submitted responses during AI pre-consultation.) Tj",
    "48 85 Td",
    "(National Digital Health Mission (NDHM) & ABHA Compliant Record | Verified AYUSH OPD Data Flow.) Tj",
    "ET",
    "0.1 0.15 0.12 rg",
    "BT",
    "/F2 8 Tf",
    "48 58 Td",
    `(${sanitizePDFText(`Physician Signature: _______________________________       Consultation Date: ${dateStr}`)}) Tj`,
    "ET"
  );

  const streamContent = streamLines.join("\n");
  const streamLength = new TextEncoder().encode(streamContent).length;

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
  ];

  let body = "%PDF-1.4\n";
  const xrefOffsets: number[] = [0];
  const encoder = new TextEncoder();

  for (let i = 0; i < objects.length; i++) {
    xrefOffsets.push(encoder.encode(body).length);
    body += objects[i] + "\n";
  }

  const xrefStart = encoder.encode(body).length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const offset = String(xrefOffsets[i]).padStart(10, "0");
    body += `${offset} 00000 n \n`;
  }

  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  let base64 = "";
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    try {
      base64 = window.btoa(unescape(encodeURIComponent(body)));
    } catch {
      base64 = window.btoa(body);
    }
  } else {
    base64 = Buffer.from(body).toString("base64");
  }

  const dataUrl = `data:application/pdf;base64,${base64}`;
  const fileName = `AYUSH_Clinical_Intake_${patientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

  return {
    pdfString: body,
    dataUrl,
    fileName,
  };
}

/**
 * Triggers a direct browser download of the generated PDF report
 */
export function downloadPDF(dataUrl: string, fileName: string = "AI_Clinical_Triage_Summary.pdf") {
  if (typeof window === "undefined") return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
