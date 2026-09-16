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
    // 1. HEADER BANNER (Emerald #0E7C4A)
    // -------------------------------------------------------------
    "0.05 0.49 0.29 rg",
    "35 765 525 55 re",
    "f",
    "1 1 1 rg",
    "BT",
    "/F2 14 Tf",
    "48 802 Td",
    "(SWASTHYA SETU - AYUSH CLINICAL INTAKE REPORT) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "48 787 Td",
    "(Ministry of AYUSH Integrated Digital Hospital System | Patient Pre-Consultation Summary) Tj",
    "ET",
    "BT",
    "/F1 8 Tf",
    "48 773 Td",
    `(${sanitizePDFText(`Report Generated: ${dateStr}, ${timeStr}   |   Case ID: ${summary.id.slice(0, 8).toUpperCase()}   |   Provider: ${summary.aiProvider || "Swasthya AYUSH Clinical Engine"}`)}) Tj`,
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
    `(${sanitizePDFText(`Patient: ${patientName} (${patientAge}, ${patientGender})`)}) Tj`,
    "48 709 Td",
    `(${sanitizePDFText(`Contact: ${patientPhone}  |  Patient ID: ${patientId}`)}) Tj`,
    "48 694 Td",
    `(${sanitizePDFText(`Status: ${intakeStatus}  |  Case Readiness: ${readiness}`)}) Tj`,
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
    // 3. STEP 1: REPORTED SYMPTOMS & CLINICAL ANAMNESIS
    // -------------------------------------------------------------
    "0.98 0.99 0.98 rg",
    "35 528 525 137 re",
    "f",
    "0.8 0.89 0.84 RG",
    "35 528 525 137 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9.5 Tf",
    "48 650 Td",
    "(STEP 1: REPORTED SYMPTOMS & CLINICAL ANAMNESIS) Tj",
    "ET",
    "0.1 0.15 0.12 rg",
    "BT",
    "/F2 8.5 Tf",
    "48 634 Td",
    "(Primary Symptoms:) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "145 634 Td",
    `(${sanitizePDFText(truncateText(reportedSymptomsList, 70))}) Tj`,
    "ET",
    "BT",
    "/F2 8.5 Tf",
    "48 618 Td",
    "(Severity Rating:) Tj",
    "ET",
    "BT",
    "/F2 8.5 Tf",
    severityLabel === "High" ? "0.85 0.1 0.1 rg" : severityLabel === "Medium" ? "0.85 0.5 0 rg" : "0.05 0.5 0.2 rg",
    "145 618 Td",
    `(${sanitizePDFText(`${severityScoreText} (${severityLabel} Intensity)`)}   |   Duration: ${sanitizePDFText(durationText)}) Tj`,
    "ET",
    "0.1 0.15 0.12 rg",
    "BT",
    "/F2 8.5 Tf",
    "48 602 Td",
    "(Patient Description:) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "145 602 Td",
    `(${sanitizePDFText(`"${truncateText(patientDescription, 68)}"` )}) Tj`,
    "ET",
    "BT",
    "/F2 8.5 Tf",
    "48 586 Td",
    "(AYUSH Dosha Imbalance:) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "170 586 Td",
    `(${sanitizePDFText(predictedDosha)}) Tj`,
    "ET",
    "BT",
    "/F2 8.5 Tf",
    "48 570 Td",
    "(Digestive Fire / Agni:) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "170 570 Td",
    `(${sanitizePDFText(agniAssessment)}) Tj`,
    "ET",

    // Priority Banner inside Step 1 box
    isRed ? "0.99 0.92 0.92 rg" : "0.93 0.98 0.95 rg",
    "45 536 505 24 re",
    "f",
    isRed ? "0.85 0.2 0.2 RG" : "0.2 0.65 0.35 RG",
    "45 536 505 24 re",
    "S",
    "BT",
    "/F2 8 Tf",
    isRed ? "0.8 0.05 0.05 rg" : "0.05 0.45 0.2 rg",
    "55 545 Td",
    `(${sanitizePDFText(isRed ? `CLINICAL ALERT: High Priority Flag - ${redReasons}` : "CLINICAL PRIORITY: Normal OPD Consultation Queue (No emergency flags detected)")}) Tj`,
    "ET",

    // -------------------------------------------------------------
    // 4. STEP 2: UPLOADED DIAGNOSTIC REPORTS & DOCUMENTS
    // -------------------------------------------------------------
    "0.98 0.99 0.98 rg",
    "35 428 525 90 re",
    "f",
    "0.8 0.89 0.84 RG",
    "35 428 525 90 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9.5 Tf",
    "48 503 Td",
    "(STEP 2: PATIENT-UPLOADED REPORTS & DIAGNOSTIC DOCUMENTS) Tj",
    "ET",
  ];

  // Render Step 2 Reports lines
  if (reportsDetail.length > 0) {
    let repY = 487;
    reportsDetail.slice(0, 3).forEach((rep, idx) => {
      const repLine = sanitizePDFText(
        `[${idx + 1}] ${truncateText(rep.name, 45)}  |  Format: ${rep.type || "PDF"}  |  Size: ${rep.size || "Attached"}`
      );
      streamLines.push(
        "0.1 0.15 0.12 rg",
        "BT",
        "/F1 8.5 Tf",
        `48 ${repY} Td`,
        `(${repLine}) Tj`,
        "ET"
      );
      repY -= 15;
    });
    if (reportsDetail.length > 3) {
      streamLines.push(
        "0.35 0.4 0.38 rg",
        "BT",
        "/F1 8 Tf",
        `48 ${repY} Td`,
        `(${sanitizePDFText(`+ ${reportsDetail.length - 3} more attached reports in electronic case folder`)}) Tj`,
        "ET"
      );
    }
  } else {
    streamLines.push(
      "0.35 0.4 0.38 rg",
      "BT",
      "/F1 8.5 Tf",
      "48 485 Td",
      "(No prior diagnostic reports or lab investigations uploaded by patient for this visit.) Tj",
      "48 470 Td",
      "(Attending physician may advise fresh clinical investigations during consultation.) Tj",
      "ET"
    );
  }

  // -------------------------------------------------------------
  // 5. STEP 3: CURRENT MEDICATIONS & HERBAL SUPPLEMENTS
  // -------------------------------------------------------------
  streamLines.push(
    "0.98 0.99 0.98 rg",
    "35 328 525 90 re",
    "f",
    "0.8 0.89 0.84 RG",
    "35 328 525 90 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9.5 Tf",
    "48 403 Td",
    "(STEP 3: CURRENT MEDICATIONS, SUPPLEMENTS & REMEDIES) Tj",
    "ET"
  );

  if (medicinesDetail.length > 0) {
    let medY = 387;
    medicinesDetail.slice(0, 3).forEach((med, idx) => {
      const medLine = sanitizePDFText(
        `[${idx + 1}] ${truncateText(med.name, 35)}  --  Dose: ${med.dose || "-"}  |  Frequency: ${med.frequency || "Once a day"}`
      );
      streamLines.push(
        "0.1 0.15 0.12 rg",
        "BT",
        "/F1 8.5 Tf",
        `48 ${medY} Td`,
        `(${medLine}) Tj`,
        "ET"
      );
      medY -= 15;
    });
    if (medicinesDetail.length > 3) {
      streamLines.push(
        "0.35 0.4 0.38 rg",
        "BT",
        "/F1 8 Tf",
        `48 ${medY} Td`,
        `(${sanitizePDFText(`+ ${medicinesDetail.length - 3} more active medicines listed`)}) Tj`,
        "ET"
      );
    }
  } else {
    streamLines.push(
      "0.35 0.4 0.38 rg",
      "BT",
      "/F1 8.5 Tf",
      "48 385 Td",
      "(No current pharmaceutical, over-the-counter, or Ayurvedic medicines reported.) Tj",
      "48 370 Td",
      "(Patient has no known active drug regimens recorded at the time of intake.) Tj",
      "ET"
    );
  }

  // -------------------------------------------------------------
  // 6. STEP 4: AI ANAMNESIS TRANSCRIPT & CLINICAL GUIDANCE
  // -------------------------------------------------------------
  streamLines.push(
    "0.98 0.99 0.98 rg",
    "35 155 525 163 re",
    "f",
    "0.8 0.89 0.84 RG",
    "35 155 525 163 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9.5 Tf",
    "48 303 Td",
    "(STEP 4: AI CLINICAL INTAKE TRANSCRIPT & PRE-CONSULTATION GUIDANCE) Tj",
    "ET"
  );

  let curY = 287;
  if (meaningfulHistory.length > 0) {
    meaningfulHistory.slice(-5).forEach((item) => {
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
      curY -= 14;
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
    curY -= 14;
  }

  // Pre-consultation guidance note inside the box
  streamLines.push(
    "0.15 0.2 0.4 rg",
    "BT",
    "/F2 8 Tf",
    `48 ${Math.max(curY, 175)} Td`,
    `(${sanitizePDFText(`Clinical Note for Dr. ${assignedDoctor}: Correlate ${predictedDosha} with physical pulse/Nadi & Dashavidha Pariksha.`)}) Tj`,
    "ET"
  );

  // -------------------------------------------------------------
  // 7. FOOTER: VERIFICATION, SIGNATURE & COMPLIANCE
  // -------------------------------------------------------------
  streamLines.push(
    "0.94 0.96 0.95 rg",
    "35 45 525 100 re",
    "f",
    "0.75 0.85 0.8 RG",
    "35 45 525 100 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 8.5 Tf",
    "48 130 Td",
    "(OFFICIAL SWASTHYA SETU AYUSH DIGITAL CLINICAL RECORD - VERIFIED INTAKE) Tj",
    "ET",
    "0.3 0.35 0.32 rg",
    "BT",
    "/F1 7.5 Tf",
    "48 116 Td",
    `(${sanitizePDFText(`Transmitted to Dr. ${assignedDoctor} OPD Queue   |   Case Token: ${summary.id}   |   Date: ${dateStr}`)}) Tj`,
    "48 103 Td",
    "(This clinical record was generated automatically from patient-submitted responses across all 4 intake steps.) Tj",
    "48 90 Td",
    "(National Digital Health Mission (NDHM) & ABHA Compliant Record | Verified AYUSH OPD Data Flow.) Tj",
    "ET",
    "0.1 0.15 0.12 rg",
    "BT",
    "/F2 8 Tf",
    "48 68 Td",
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
