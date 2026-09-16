"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Activity, 
  X, 
  Edit2, 
  Check, 
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  FileText,
  UserCheck,
  Download,
  ExternalLink,
  Languages
} from "lucide-react";
import { AIIntakeSummary, saveAIIntakeSummary, getAIIntakeSummary } from "@/lib/aiIntakeStore";
import { generateClinicalSummaryPDF, downloadPDF } from "@/lib/pdfGenerator";
import { addReportToPatientData, MedicalReport } from "@/lib/patient-data";
import { evaluateAyushDoshaAndAgni } from "@/lib/redFlag";

type Message = {
  id: string;
  from: "user" | "bot";
  text: string;
  time: string;
  isRedFlag?: boolean;
  redReasons?: string[];
  provider?: string;
  isSummary?: boolean;
};

export default function Chatbot({
  initialSymptom = "",
  onClose,
  onUpdatePatientReadiness,
}: {
  initialSymptom?: string;
  onClose?: () => void;
  onUpdatePatientReadiness?: (data: { complaint?: string; severity?: string; duration?: string }) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      from: "bot",
      text: "नमस्ते! Welcome to Swasthya Setu. I am your AYUSH AI Clinical Triage Assistant.\n\nWhat symptoms, pain, or health discomfort are you experiencing today? (आप बोलकर या लिखकर अपनी समस्या बता सकते हैं)",
      time: "Just now",
      provider: "System"
    }
  ]);

  const [input, setInput] = useState(initialSymptom);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>("OpenAI / Multi-Model AI");
  
  // Triage state
  const [complaint, setComplaint] = useState<string>(initialSymptom || "");
  const [selectedSeverity, setSelectedSeverity] = useState<"Mild" | "Medium" | "High" | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string>("");
  const [triageStep, setTriageStep] = useState<"COMPLAINT" | "SEVERITY" | "DURATION" | "ASSOCIATED" | "COMPLETE">("COMPLAINT");
  const [hasRedFlag, setHasRedFlag] = useState(false);
  const [redFlagReasons, setRedFlagReasons] = useState<string[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState<AIIntakeSummary | null>(null);
  const [showSummaryCard, setShowSummaryCard] = useState<boolean>(false);

  // Voice recording & confirmation card state
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState("");
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [interimSpokenText, setInterimSpokenText] = useState<string>("");
  const [speechLang, setSpeechLang] = useState<"hi-IN" | "en-IN">("hi-IN");
  const accumulatedTranscriptRef = useRef<string>("");

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showVoiceConfirm, showSummaryCard, isRecording, micErrorMessage]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Load existing summary if any
  useEffect(() => {
    const existing = getAIIntakeSummary();
    if (existing) {
      setGeneratedSummary(existing);
    }
  }, []);

  // If initialSymptom passed on mount, send it
  useEffect(() => {
    if (initialSymptom && initialSymptom.trim().length > 0) {
      handleSendMessage(initialSymptom);
    }
  }, []);

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const startRecording = async () => {
    setMicErrorMessage(null);
    setInterimSpokenText("");
    accumulatedTranscriptRef.current = "";

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setMicErrorMessage(
        "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your symptoms."
      );
      return;
    }

    // Explicitly request microphone stream permission to trigger native browser prompt
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release tracks so speech recognition has exclusive device access
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      console.warn("Microphone access prompt check:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicErrorMessage(
          "Microphone permission was denied. Please click the lock or settings icon in your browser address bar to allow microphone access."
        );
        return;
      }
    }

    // Abort previous instance if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isRecordingRef.current = true;
        setIsRecording(true);
        setMicErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcriptPiece = item[0]?.transcript || "";
          if (item.isFinal) {
            accumulatedTranscriptRef.current = (
              accumulatedTranscriptRef.current +
              (accumulatedTranscriptRef.current ? " " : "") +
              transcriptPiece
            ).trim();
          } else {
            currentInterim += transcriptPiece;
          }
        }

        const livePreview = [accumulatedTranscriptRef.current, currentInterim]
          .filter(Boolean)
          .join(" ");

        setInterimSpokenText(livePreview);

        if (accumulatedTranscriptRef.current) {
          setVoiceTranscript(accumulatedTranscriptRef.current);
          setEditableTranscript(accumulatedTranscriptRef.current);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicErrorMessage(
            "Microphone permission blocked. Please enable microphone permissions in your browser URL bar."
          );
          stopRecording();
        } else if (event.error === "no-speech") {
          // Ignore no-speech in continuous mode (don't stop on small pause)
          return;
        } else if (event.error === "audio-capture") {
          setMicErrorMessage("No working microphone detected. Please check your mic connection.");
          stopRecording();
        } else if (event.error === "network") {
          setMicErrorMessage("Speech recognition network error. Please check your internet connection.");
          stopRecording();
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        isRecordingRef.current = false;
        const finalText = (accumulatedTranscriptRef.current || interimSpokenText).trim();
        if (finalText) {
          setVoiceTranscript(finalText);
          setEditableTranscript(finalText);
          setShowVoiceConfirm(true);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      setShowVoiceConfirm(false);
    } catch (err: any) {
      console.error("Failed to start SpeechRecognition:", err);
      setMicErrorMessage("Could not start microphone: " + (err.message || "Unknown error"));
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const toggleRecording = () => {
    if (isRecordingRef.current || isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  /**
   * Generates the structured AI Clinical Intake Summary,
   * saves to the cross-role store, and alerts the doctor portal.
   */
  const handleFinalizeSummary = (
    finalComplaint: string,
    finalSeverity: "Mild" | "Medium" | "High",
    finalDuration: string,
    finalAssociated: string,
    historyList: Message[]
  ) => {
    const lower = (finalComplaint + " " + finalAssociated).toLowerCase();
    
    // Dynamic AYUSH Dosha Imbalance Clinical Assessment
    const ayushEval = evaluateAyushDoshaAndAgni([finalComplaint, finalAssociated], lower);
    const dosha = ayushEval.dosha;
    const agni = ayushEval.agni;

    // Red flag evaluation
    const isRed = 
      finalSeverity === "High" || 
      finalDuration.includes("month") || 
      finalDuration.includes("3 months") || 
      lower.includes("chest") || 
      lower.includes("severe") || 
      lower.includes("unbearable");

    const reasons: string[] = [];
    if (finalSeverity === "High") reasons.push("High / Severe Pain intensity (तीव्र दर्द)");
    if (finalDuration.includes("month") || finalDuration.includes("3 months")) reasons.push("Chronic symptom duration (> 30 days)");
    if (lower.includes("chest") || lower.includes("severe")) reasons.push("Clinical red flag keyword reported");

    if (isRed) {
      setHasRedFlag(true);
      setRedFlagReasons(reasons);
    }

    const summaryObj: AIIntakeSummary = {
      id: `intake-${Date.now()}`,
      patientId: "",
      patientName: "",
      chiefComplaint: finalComplaint,
      severity: finalSeverity,
      duration: finalDuration,
      associatedSymptoms: finalAssociated || "None reported",
      currentMedicines: "Tab. PCM 500mg, Ayurvedic Taila",
      predictedDosha: dosha,
      agniAssessment: agni,
      isRedFlag: isRed,
      redFlagReasons: reasons,
      aiProvider: activeProvider,
      voiceTranscriptVerified: Boolean(voiceTranscript),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", Today",
      conversationHistory: historyList.map(m => ({ from: m.from, text: m.text, time: m.time })),
      status: "Pending Doctor Review"
    };

    // Auto-generate official clinical triage PDF document
    const pdfRes = generateClinicalSummaryPDF(summaryObj);
    summaryObj.pdfUrl = pdfRes.dataUrl;
    summaryObj.pdfFileName = pdfRes.fileName;

    saveAIIntakeSummary(summaryObj);
    setGeneratedSummary(summaryObj);
    setShowSummaryCard(true);
    setTriageStep("COMPLETE");

    // Automatically save into patient's reports collection (/reports)
    const newMedicalReport: MedicalReport = {
      id: `rep-ai-${Date.now()}`,
      name: `AI Clinical Triage Summary (${finalComplaint.length > 22 ? finalComplaint.slice(0, 22) + "…" : finalComplaint})`,
      date: "Today • " + new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      type: "PDF",
      size: "148 KB",
      url: pdfRes.dataUrl,
    };
    addReportToPatientData(newMedicalReport);

    if (onUpdatePatientReadiness) {
      onUpdatePatientReadiness({
        complaint: finalComplaint,
        severity: finalSeverity,
        duration: finalDuration
      });
    }

    // Append AI completion message
    const completionMsg: Message = {
      id: `bot-complete-${Date.now()}`,
      from: "bot",
      text: `✅ आपका AI Clinical Intake Summary व आधिकारिक PDF रिपोर्ट तैयार है।\n\n📄 यह रिपोर्ट आपके /reports में सुरक्षित हो गई है और OPD Queue में लाइव सिंक कर दी गई है। आप नीचे दिए गए बटन से PDF रिपोर्ट डाउनलोड कर सकते हैं।`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRedFlag: isRed,
      redReasons: reasons,
      provider: activeProvider,
      isSummary: true
    };

    setMessages(prev => [...prev, completionMsg]);
  };

  const handleSendMessage = async (textToSend: string, metadataOverride?: any) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      from: "user",
      text: userText,
      time: timeStr
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    // Dynamic clinical parameter tracking
    let currentComplaint = complaint || userText;
    let currentSeverity = selectedSeverity;
    let currentDuration = selectedDuration;
    let currentAssociated = associatedSymptoms;

    if (!complaint) {
      currentComplaint = userText;
      setComplaint(userText);
    }

    const lowerUser = userText.toLowerCase();
    const isFinalizeCmd =
      lowerUser.includes("report") ||
      lowerUser.includes("finalize") ||
      lowerUser.includes("bana do") ||
      lowerUser.includes("theek hai") ||
      lowerUser.includes("तैयार") ||
      lowerUser.includes("समाप्त");

    if (lowerUser.includes("high") || lowerUser.includes("severe") || lowerUser.includes("तीव्र") || lowerUser.includes("ज़्यादा")) {
      currentSeverity = "High";
      setSelectedSeverity("High");
    } else if (lowerUser.includes("mild") || lowerUser.includes("हल्का") || lowerUser.includes("kam") || lowerUser.includes("low")) {
      currentSeverity = "Mild";
      setSelectedSeverity("Mild");
    } else if (lowerUser.includes("medium") || lowerUser.includes("मध्यम")) {
      currentSeverity = "Medium";
      setSelectedSeverity("Medium");
    }

    if (lowerUser.includes("day") || lowerUser.includes("दिन")) {
      currentDuration = userText;
      setSelectedDuration(userText);
    } else if (lowerUser.includes("week") || lowerUser.includes("हफ़्ते")) {
      currentDuration = userText;
      setSelectedDuration(userText);
    } else if (lowerUser.includes("month") || lowerUser.includes("महीने")) {
      currentDuration = userText;
      setSelectedDuration(userText);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          metadata: {
            complaint: currentComplaint,
            severity: metadataOverride?.severity || currentSeverity,
            durationText: metadataOverride?.durationText || currentDuration,
            finalize: isFinalizeCmd,
            ...metadataOverride
          },
          history: newHistory.slice(-8)
        })
      });

      const data = await res.json();
      let botText = data.text || "Thank you for sharing your symptoms.";
      const isRed = Boolean(data.redFlags?.red);
      const reasons = data.redFlags?.reasons || [];

      if (isRed) {
        setHasRedFlag(true);
        setRedFlagReasons(reasons);
      }

      if (data.provider) {
        setActiveProvider(data.provider);
      }

      // Update clinical parameters from AI evaluation
      if (data.clinicalEval) {
        if (data.clinicalEval.complaint && (!currentComplaint || currentComplaint === "General Consultation")) {
          currentComplaint = data.clinicalEval.complaint;
          setComplaint(data.clinicalEval.complaint);
        }
        if (data.clinicalEval.severity && !selectedSeverity) {
          currentSeverity = data.clinicalEval.severity;
          setSelectedSeverity(data.clinicalEval.severity);
        }
        if (data.clinicalEval.duration && data.clinicalEval.duration !== "Unknown" && !selectedDuration) {
          currentDuration = data.clinicalEval.duration;
          setSelectedDuration(data.clinicalEval.duration);
        }
        if (data.clinicalEval.associated) {
          currentAssociated = data.clinicalEval.associated;
          setAssociatedSymptoms(data.clinicalEval.associated);
        }
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        from: "bot",
        text: botText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRedFlag: isRed,
        redReasons: reasons,
        provider: data.provider
      };

      setMessages(prev => [...prev, botMsg]);

      // If patient asked to finalize or AI confirms readiness after thorough interview
      if (isFinalizeCmd && currentComplaint) {
        handleFinalizeSummary(
          currentComplaint,
          currentSeverity || "Medium",
          currentDuration || "1-2 weeks",
          currentAssociated,
          [...newHistory, botMsg]
        );
      } else if (onUpdatePatientReadiness) {
        onUpdatePatientReadiness({
          complaint: currentComplaint,
          severity: currentSeverity || undefined,
          duration: currentDuration || undefined
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackText = "लक्षण समझ में आ रहे हैं। क्या इसके साथ कोई अन्य परेशानी भी है? आप जब चाहें नीचे '📋 Generate Clinical Report' बटन दबाकर अपनी आधिकारिक रिपोर्ट तैयार कर सकते हैं।";

      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        from: "bot",
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: "Swasthya AI Fallback"
      };

      setMessages(prev => [...prev, fallbackMsg]);

      if (isFinalizeCmd && currentComplaint) {
        handleFinalizeSummary(
          currentComplaint,
          currentSeverity || "Medium",
          currentDuration || "1-2 weeks",
          currentAssociated,
          [...newHistory, fallbackMsg]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[540px] sm:h-[580px] bg-white dark:bg-slate-900 rounded-3xl border border-[#CFEBDB] dark:border-slate-800 shadow-2xl overflow-hidden font-sans">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#EAF7EF] to-[#DFF3E7] dark:from-emerald-950/80 dark:to-slate-900 border-b border-[#CFEBDB] dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0E7C4A] text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#123B2C] dark:text-white">
                Swasthya Setu AI Clinical Triage
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono">
                OpenAI + AYUSH
              </span>
            </div>
            <p className="text-[11px] text-[#6C7D76] dark:text-slate-400">
              Active: <span className="font-semibold text-[#0E7C4A] dark:text-emerald-400">{activeProvider}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {triageStep !== "COMPLETE" && messages.length >= 2 && (
            <button
              type="button"
              onClick={() => {
                handleFinalizeSummary(
                  complaint || "Health Consultation",
                  selectedSeverity || "Medium",
                  selectedDuration || "1-2 weeks",
                  associatedSymptoms,
                  messages
                );
              }}
              className="px-3 py-1 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all animate-in fade-in"
              title="Finish consultation and generate official PDF report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Report</span>
            </button>
          )}

          {generatedSummary && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Synced with Doctor</span>
            </span>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Red Flag Alert Notice if triggered */}
      {hasRedFlag && (
        <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/70 border-b border-red-200 dark:border-red-900/80 flex items-start gap-2.5 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 shrink-0 animate-bounce" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-red-800 dark:text-red-300">
              🚩 Red Flag Priority Detected: High Severity or Chronic Duration
            </p>
            <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
              {redFlagReasons.join(" • ") || "Flagged for immediate physician attention. Physician alerted in OPD queue."}
            </p>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((msg) => {
          const isUser = msg.from === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                  isUser
                    ? "bg-[#0E7C4A] text-white rounded-br-xs"
                    : msg.isRedFlag
                    ? "bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-950 dark:text-red-200 rounded-bl-xs"
                    : "bg-white dark:bg-slate-800 border border-[#CFEBDB]/80 dark:border-slate-700 text-[#123B2C] dark:text-slate-100 rounded-bl-xs"
                }`}
              >
                {msg.isRedFlag && (
                  <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 mb-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>High Priority Clinical Flag</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] opacity-70">
                  <span>{msg.time}</span>
                  {!isUser && msg.provider && (
                    <span className="font-mono">{msg.provider}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Structured AI Clinical Summary Card (Rendered when complete) */}
        {showSummaryCard && generatedSummary && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EAF7EF] via-white to-[#F3FAF6] dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-900 border-2 border-[#0E7C4A] dark:border-emerald-500 shadow-lg animate-in zoom-in-95 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D7ECE1] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0E7C4A] dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Clinical Intake Summary (Prepared for Doctor)</span>
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                ✓ Live Synced
              </span>
            </div>

            {generatedSummary.isRedFlag && (
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-[11px] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Red Flag: {generatedSummary.redFlagReasons.join(", ")}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Chief Complaint</span>
                <p className="font-bold text-slate-900 dark:text-white truncate" title={generatedSummary.chiefComplaint}>
                  {generatedSummary.chiefComplaint}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Pain Severity</span>
                <span className={`inline-block px-2 py-0.5 rounded-md font-extrabold text-[11px] mt-0.5 ${
                  generatedSummary.severity === "High"
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : generatedSummary.severity === "Medium"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}>
                  {generatedSummary.severity} Intensity
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Duration</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {generatedSummary.duration}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F3FAF6] dark:bg-slate-800/60 border border-[#D7ECE1] dark:border-slate-700 text-xs">
              <span className="text-[10.5px] font-bold text-[#0E7C4A] dark:text-emerald-400 block uppercase">
                Predicted AYUSH Dosha Assessment
              </span>
              <p className="font-bold text-[#123B2C] dark:text-slate-100 mt-0.5">
                {generatedSummary.predictedDosha} • {generatedSummary.agniAssessment}
              </p>
            </div>

            {/* Action Bar: Download PDF & View /reports */}
            <div className="pt-2 border-t border-[#D7ECE1] dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (generatedSummary.pdfUrl) {
                      downloadPDF(generatedSummary.pdfUrl, generatedSummary.pdfFileName || "AI_Clinical_Triage_Summary.pdf");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Summary Report</span>
                </button>

                <a
                  href="/reports"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#CFEBDB] dark:border-slate-700 text-[#0E7C4A] dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View All in /reports</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                </a>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Close &amp; View Dashboard
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7C4A]" />
                <span>Auto-saved to patient reports</span>
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#0E7C4A]" />
                <span>Physician notified in OPD queue</span>
              </span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#0E7C4A] dark:text-emerald-400 bg-white dark:bg-slate-800 p-3 rounded-2xl w-fit border border-[#CFEBDB] dark:border-slate-700">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>AI analyzing symptoms across provider models…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Microphone Error / Permission Alert Banner */}
      {micErrorMessage && (
        <div className="mx-4 my-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-start justify-between gap-2 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300">Microphone Issue / माइक्रोफ़ोन सूचना</p>
              <p className="text-[11px] mt-0.5 leading-relaxed">{micErrorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMicErrorMessage(null)}
            className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-100 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Live Voice Recording Banner */}
      {isRecording && (
        <div className="mx-4 my-2 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-400 dark:border-red-600 shadow-sm animate-in slide-in-from-bottom-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-xs font-bold text-red-700 dark:text-red-300">
                Listening... Speak now (बोलिए...)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextLang = speechLang === "hi-IN" ? "en-IN" : "hi-IN";
                  setSpeechLang(nextLang);
                  if (recognitionRef.current) {
                    recognitionRef.current.lang = nextLang;
                  }
                }}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-red-200 dark:border-red-800 flex items-center gap-1 cursor-pointer hover:bg-red-100 transition-colors"
                title="Toggle Hindi / English voice recognition"
              >
                <Languages className="w-3 h-3 text-red-600" />
                <span>{speechLang === "hi-IN" ? "🇮🇳 Hindi/Hinglish" : "🌐 English"}</span>
              </button>

              <button
                type="button"
                onClick={stopRecording}
                className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done (समाप्त)</span>
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-red-100 dark:border-red-900/50 min-h-[38px] flex items-center">
            {interimSpokenText ? (
              <p className="text-xs text-slate-900 dark:text-slate-100 font-medium">
                &ldquo;{interimSpokenText}&rdquo;
              </p>
            ) : (
              <p className="text-xs italic text-slate-400">
                Listening to your voice... (e.g. &ldquo;mujhe pet dard aur gas ki samasya hai&rdquo;)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Voice Confirmation Card (Shows spoken text to patient for verification before sending) */}
      {showVoiceConfirm && voiceTranscript && (
        <div className="mx-4 my-2 p-3.5 rounded-2xl bg-[#EAF7EF] dark:bg-slate-800 border-2 border-[#0E7C4A] dark:border-emerald-500 shadow-md animate-in slide-in-from-bottom-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#123B2C] dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0E7C4A]" />
              Did you say this? Please confirm:
            </span>
            <button
              onClick={() => setIsEditingTranscript(!isEditingTranscript)}
              className="text-[11px] font-semibold text-[#0E7C4A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              {isEditingTranscript ? "Done Editing" : "Edit Text"}
            </button>
          </div>

          {isEditingTranscript ? (
            <textarea
              value={editableTranscript}
              onChange={(e) => setEditableTranscript(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#CFEBDB] dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A]"
              rows={2}
            />
          ) : (
            <p className="text-xs italic bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-[#CFEBDB]/60 dark:border-slate-700 text-slate-800 dark:text-slate-200">
              &ldquo;{editableTranscript}&rdquo;
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => {
                setShowVoiceConfirm(false);
                setVoiceTranscript(null);
              }}
              className="px-3 py-1 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleSendMessage(editableTranscript);
                setShowVoiceConfirm(false);
                setVoiceTranscript(null);
              }}
              className="px-4 py-1.5 rounded-xl bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Yes, Send to AI</span>
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Context-Aware Quick Selection & Finalize Pills */}
      <div className="px-4 pt-2.5 pb-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px]">
        {triageStep === "COMPLETE" ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Clinical Intake Completed. Report saved to /reports.</span>
            </div>
            {generatedSummary?.pdfUrl && (
              <button
                type="button"
                onClick={() => downloadPDF(generatedSummary.pdfUrl!, generatedSummary.pdfFileName || "AI_Clinical_Triage_Summary.pdf")}
                className="px-3 py-1 rounded-full bg-[#0E7C4A] hover:bg-[#0A5E39] text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download PDF Report</span>
              </button>
            )}
          </div>
        ) : messages.length >= 2 ? (
          <>
            <button
              type="button"
              onClick={() => {
                handleFinalizeSummary(
                  complaint || "Health Consultation",
                  selectedSeverity || "Medium",
                  selectedDuration || "1-2 weeks",
                  associatedSymptoms,
                  messages
                );
              }}
              className="px-3 py-1 rounded-full bg-[#0E7C4A] hover:bg-[#0A5E39] text-white font-bold text-[11px] shadow-xs flex items-center gap-1.5 cursor-pointer transition-all animate-pulse"
            >
              <span>📋</span>
              <span>Generate Final Clinical Report</span>
            </button>

            <span className="text-slate-300 dark:text-slate-600">|</span>

            {!selectedSeverity && (
              <>
                <span className="text-slate-400 font-semibold">Severity:</span>
                {[
                  { label: "Mild (हल्का)", val: "Mild" },
                  { label: "Medium (मध्यम)", val: "Medium" },
                  { label: "High (तीव्र)", val: "High" }
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => handleSendMessage(`Severity is ${s.val}`, { severity: s.val })}
                    className="px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px] font-medium hover:border-[#0E7C4A] cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </>
            )}

            {[
              "Worse in morning",
              "Worse after eating",
              "No other medicines taken",
              "Difficulty sleeping"
            ].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:border-[#0E7C4A] text-[10.5px] cursor-pointer transition-colors"
              >
                {p}
              </button>
            ))}
          </>
        ) : (
          <>
            <span className="text-slate-400 font-semibold mr-1">Common Concerns:</span>
            {[
              "Joint pain & stiffness in knees",
              "Severe acidity & stomach burning",
              "Chronic lower backache",
              "General fatigue & sleep issue"
            ].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:border-[#0E7C4A] text-[10.5px] cursor-pointer transition-colors"
              >
                {p}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 bg-white dark:bg-slate-900 border-t border-[#CFEBDB]/80 dark:border-slate-800 flex items-center gap-2"
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleRecording}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              isRecording
                ? "bg-red-600 text-white ring-4 ring-red-200 dark:ring-red-900/50 animate-pulse"
                : "bg-[#EAF7EF] dark:bg-slate-800 text-[#0E7C4A] dark:text-emerald-400 hover:bg-[#DFF3E7] hover:scale-105"
            }`}
            title={isRecording ? "Stop Recording (सुनना बंद करें)" : "Click to Speak in Hindi or English (बोलकर बताएं)"}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              const next = speechLang === "hi-IN" ? "en-IN" : "hi-IN";
              setSpeechLang(next);
              if (recognitionRef.current) {
                recognitionRef.current.lang = next;
              }
            }}
            className="px-1.5 py-1 rounded-md text-[10px] font-bold text-slate-500 hover:text-[#0E7C4A] dark:text-slate-400 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 transition-colors"
            title={`Speech language: ${speechLang === "hi-IN" ? "Hindi/Hinglish" : "English"}. Click to change.`}
          >
            {speechLang === "hi-IN" ? "HI" : "EN"}
          </button>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isRecording
              ? "Listening to your voice..."
              : triageStep === "SEVERITY"
              ? "Type or click severity: Mild, Medium, or High..."
              : triageStep === "DURATION"
              ? "Type or click duration: e.g. 2 days, 1 month..."
              : triageStep === "ASSOCIATED"
              ? "Any other symptoms or current medicines taken..."
              : "Describe your symptoms or click mic to speak..."
          }
          className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#123B2C] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A]"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-full bg-[#0E7C4A] hover:bg-[#0A5E39] disabled:opacity-50 text-white flex items-center justify-center shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
