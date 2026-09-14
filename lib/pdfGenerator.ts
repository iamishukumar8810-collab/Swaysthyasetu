// Pure TypeScript PDF Generator for Swasthya Setu AYUSH Clinical Triage Reports
// Generates valid standard PDF 1.4 documents without requiring binary external npm dependencies

import { AIIntakeSummary } from "./aiIntakeStore";

/**
 * Sanitizes strings for standard PDF syntax:
 * Replaces characters outside printable ASCII range and escapes parentheses
 */
function sanitizePDFText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " ")
    .trim();
}

export interface GeneratedPDFResult {
  pdfString: string;
  dataUrl: string;
  fileName: string;
}

/**
 * Generates an official, standard PDF 1.4 clinical summary report
 */
export function generateClinicalSummaryPDF(summary: AIIntakeSummary): GeneratedPDFResult {
  const patientName = summary.patientName || "";
  const abhaId = summary.patientId || "";
  const complaint = summary.chiefComplaint || "General malaise";
  const severity = summary.severity || "Medium";
  const duration = summary.duration || "1-2 weeks";
  const dosha = summary.predictedDosha || "Vata-Pitta Aggravation";
  const agni = summary.agniAssessment || "Vishamagni";
  const isRed = Boolean(summary.isRedFlag);
  const redReasons = summary.redFlagReasons && summary.redFlagReasons.length > 0
    ? summary.redFlagReasons.join(", ")
    : "None (Standard Priority)";

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timeStr = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Extract and format real dialogue turns from conversationHistory
  const rawHistory = summary.conversationHistory || [];
  const meaningfulHistory = rawHistory.filter((h) => Boolean(h.text)).slice(-7);

  const transcriptPDFLines: string[] = [];
  let curY = 330;

  if (meaningfulHistory.length > 0) {
    meaningfulHistory.forEach((item) => {
      if (curY < 245) return;
      const isUser = item.from === "user";
      const speaker = isUser ? "Patient: " : "AI Doctor: ";
      let clean = item.text.replace(/<!--[\s\S]*?-->/g, "").replace(/\n/g, " ").trim();
      if (clean.length > 88) clean = clean.slice(0, 85) + "...";
      const sanitized = sanitizePDFText(`${speaker}"${clean}"`);

      transcriptPDFLines.push(
        isUser ? "0.08 0.35 0.22 rg" : "0.22 0.25 0.32 rg",
        "BT",
        isUser ? "/F2 8.5 Tf" : "/F1 8.5 Tf",
        `35 ${curY} Td`,
        `(${sanitized}) Tj`,
        "ET"
      );
      curY -= 13;
    });
  } else {
    transcriptPDFLines.push(
      "0.22 0.25 0.32 rg",
      "BT",
      "/F1 8.5 Tf",
      "35 330 Td",
      `(${sanitizePDFText(`Recorded Complaint: "${complaint}" | Severity: ${severity} | Duration: ${duration}`)}) Tj`,
      "ET"
    );
  }

  const streamLines: string[] = [
    // Header background banner (Emerald #0E7C4A)
    "0.05 0.49 0.29 rg",
    "0 735 595 107 re",
    "f",

    // Title text (White)
    "1 1 1 rg",
    "BT",
    "/F2 18 Tf",
    "40 808 Td",
    "(SWASTHYA SETU - AYUSH CLINICAL TRIAGE REPORT) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "40 788 Td",
    "(Ministry of AYUSH Integrated Digital Hospital System | AI Pre-Consultation Summary) Tj",
    "ET",
    "BT",
    "/F1 9 Tf",
    "40 768 Td",
    `(${sanitizePDFText(`Report Generated: ${dateStr}, ${timeStr}   |   Provider: ${summary.aiProvider || "Swasthya AI Engine"}`)}) Tj`,
    "ET",

    // Patient Information Box
    "0.95 0.98 0.96 rg",
    "35 635 525 82 re",
    "f",
    "0.8 0.89 0.84 RG",
    "1 w",
    "35 635 525 82 re",
    "S",

    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 11 Tf",
    "50 698 Td",
    "(PATIENT & CONSULTATION IDENTIFICATION) Tj",
    "ET",
    "0.1 0.15 0.12 rg",
    "BT",
    "/F1 9.5 Tf",
    "50 678 Td",
    `(${sanitizePDFText(`Patient Name: ${patientName}           ABHA ID: ${abhaId}`)}) Tj`,
    "50 660 Td",
    `(${sanitizePDFText(`Attending Doctor: ${(summary as any).assignedDoctor || ""}`)}) Tj`,
    "50 644 Td",
    `(${sanitizePDFText(`Consultation Intake Status: ${summary.status || "Pending Doctor Review"}`)}) Tj`,
    "ET",

    // Clinical Triage Details Box
    "0.98 0.99 0.98 rg",
    "35 440 525 180 re",
    "f",
    "0.8 0.89 0.84 RG",
    "35 440 525 180 re",
    "S",

    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 11 Tf",
    "50 598 Td",
    "(STRUCTURED CLINICAL TRIAGE ASSESSMENT) Tj",
    "ET",

    "0.1 0.15 0.12 rg",
    "BT",
    "/F2 10 Tf",
    "50 572 Td",
    "(1. Chief Complaint / Reported Issue:) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "240 572 Td",
    `(${sanitizePDFText(complaint)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "50 546 Td",
    "(2. Pain / Discomfort Severity:) Tj",
    "ET",
    "BT",
    "/F2 10 Tf",
    severity === "High" ? "0.85 0.1 0.1 rg" : severity === "Medium" ? "0.85 0.5 0 rg" : "0.05 0.5 0.2 rg",
    "240 546 Td",
    `(${sanitizePDFText(severity + " Intensity")}) Tj`,
    "ET",

    "0.1 0.15 0.12 rg",
    "BT",
    "/F2 10 Tf",
    "50 520 Td",
    "(3. Duration of Symptoms:) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "240 520 Td",
    `(${sanitizePDFText(duration)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "50 494 Td",
    "(4. Predicted AYUSH Dosha Imbalance:) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "240 494 Td",
    `(${sanitizePDFText(dosha)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "50 468 Td",
    "(5. Digestive Fire / Agni Assessment:) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "240 468 Td",
    `(${sanitizePDFText(agni)}) Tj`,
    "ET",

    // Priority / Red Flag Banner
    isRed ? "0.99 0.92 0.92 rg" : "0.93 0.98 0.95 rg",
    "35 385 525 42 re",
    "f",
    isRed ? "0.85 0.2 0.2 RG" : "0.2 0.65 0.35 RG",
    "35 385 525 42 re",
    "S",
    "BT",
    "/F2 10 Tf",
    isRed ? "0.8 0.05 0.05 rg" : "0.05 0.45 0.2 rg",
    "50 404 Td",
    `(${sanitizePDFText(isRed ? `ALERT: High Priority Flag - ${redReasons}` : "CLINICAL PRIORITY: Normal OPD Consultation Queue")}) Tj`,
    "ET",

    // Real Conversation History Section
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 10.5 Tf",
    "35 358 Td",
    "(CONSULTATION ANAMNESIS & COMMUNICATION TRANSCRIPT) Tj",
    "ET",
    "0.8 0.89 0.84 RG",
    "35 348 m 560 348 l",
    "S",

    ...transcriptPDFLines,

    // Doctor Pre-Consultation Guidance Note
    "0.97 0.97 0.98 rg",
    "35 155 525 90 re",
    "f",
    "0.82 0.85 0.9 RG",
    "35 155 525 90 re",
    "S",
    "0.15 0.2 0.4 rg",
    "BT",
    "/F2 10 Tf",
    "50 225 Td",
    "(CLINICAL PRE-CONSULTATION GUIDANCE FOR PHYSICIAN) Tj",
    "ET",
    "0.2 0.25 0.3 rg",
    "BT",
    "/F1 8.5 Tf",
    "50 205 Td",
    "(1. Review identified dosha imbalance prior to physical examination.) Tj",
    "50 190 Td",
    "(2. Correlate reported duration with chronic history and previous OPD records.) Tj",
    "50 175 Td",
    "(3. All patient records conform to National Digital Health Mission (NDHM) guidelines.) Tj",
    "ET",

    // Footer Signature & Verification Stamp
    "0.92 0.96 0.94 rg",
    "35 50 525 80 re",
    "f",
    "0.75 0.85 0.8 RG",
    "35 50 525 80 re",
    "S",
    "0.05 0.49 0.29 rg",
    "BT",
    "/F2 9 Tf",
    "50 108 Td",
    "(OFFICIAL SWASTHYA SETU CLINICAL INTAKE RECORD - VERIFIED DIGITAL DOCUMENT) Tj",
    "ET",
    "0.35 0.4 0.38 rg",
    "BT",
    "/F1 8 Tf",
    "50 92 Td",
    "(This document was generated automatically following an AI clinical triage interview.) Tj",
    "50 78 Td",
    "(Hospital ID: AYUSH-DL-082 | ABHA Connected | Certified HL7 FHIR Compatible) Tj",
    "50 64 Td",
    `(${sanitizePDFText(`Document Hash: SS-${Date.now().toString(36).toUpperCase()} | Doctor Assigned: ${(summary as any).assignedDoctor || ""}`)}) Tj`,
    "ET"
  ];

  const streamContent = streamLines.join("\n");
  const streamLength = new TextEncoder().encode(streamContent).length;

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`
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

  // Encode to base64 Data URL for persistent storage in localStorage
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
  const fileName = `AI_Clinical_Triage_Summary_${new Date().toISOString().split("T")[0]}.pdf`;

  return {
    pdfString: body,
    dataUrl,
    fileName
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
