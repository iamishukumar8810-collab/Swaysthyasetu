"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Languages, 
  Mic, 
  MicOff, 
  Touchpad, 
  Sparkles, 
  FileUp, 
  CheckCircle2, 
  Ticket, 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  Upload, 
  FileText, 
  RefreshCw,
  AlertTriangle,
  Stethoscope
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PatientIntakePage() {
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState("hi");
  const [interactionMode, setInteractionMode] = useState<"voice" | "touch">("voice");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("Mujhe 2 din se pet me tez jalan aur dard ho raha hai.");
  const [painLevel, setPainLevel] = useState("Moderate");
  const [foodRelation, setFoodRelation] = useState("Yes");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Acidity", "Bloating"]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(["Prescription_DrVerma_Jan2024.jpg"]);
  const [isProcessingDocs, setIsProcessingDocs] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState("AYUH-2024-08725");

  const languages = [
    { id: "hi", name: "हिन्दी", sub: "Hindi" },
    { id: "en", name: "English", sub: "English" },
    { id: "te", name: "తెలుగు", sub: "Telugu" },
    { id: "ta", name: "தமிழ்", sub: "Tamil" },
    { id: "bn", name: "বাংলা", sub: "Bengali" },
    { id: "mr", name: "मराठी", sub: "Marathi" }
  ];

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSimulateDocs = () => {
    setIsProcessingDocs(true);
    setTimeout(() => {
      setIsProcessingDocs(false);
      setStep(7);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3.5 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600">
            <ArrowLeft className="w-4 h-4" /> Exit to Home
          </Link>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Patient Pre-Consultation Kiosk
            </span>
            <span className="text-[11px] text-slate-500">Step {step} of 8</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Stepper Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          
          {/* STEP 1: WELCOME & LANGUAGE */}
          {step === 1 && (
            <div className="space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20 text-2xl">
                🙏
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Namaste • Welcome
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  AYUSH Hospital Pre-Consultation Assistant
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  कृपया अपनी पसंदीदा भाषा चुनें (Select your language)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      selectedLang === lang.id
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="text-base block">{lang.name}</span>
                    <span className="text-[11px] opacity-70 block">{lang.sub}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <span>Continue (आगे बढ़ें)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: VOICE OR TOUCH MODE */}
          {step === 2 && (
            <div className="space-y-6 text-center animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold">Choose How You Want to Interact</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  आप कैसे बात करना पसंद करेंगे?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => { setInteractionMode("voice"); setStep(3); }}
                  className={`p-6 rounded-3xl border text-center transition-all space-y-3 ${
                    interactionMode === "voice"
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Mic className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Speak (Voice Mode)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      बोलकर बताएं (Talk naturally in Hindi/English)
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => { setInteractionMode("touch"); setStep(3); }}
                  className={`p-6 rounded-3xl border text-center transition-all space-y-3 ${
                    interactionMode === "touch"
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Touchpad className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Tap (Touch Mode)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      स्क्रीन पर दबाकर चुनें (Simple buttons)
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  &larr; Back
                </button>
                <span className="text-xs text-slate-400">You can change this mode anytime</span>
              </div>
            </div>
          )}

          {/* STEP 3: AI CONVERSATION */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" /> AI Medical Interview
                </div>
                <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-mono text-emerald-800 dark:text-emerald-300">
                  {interactionMode === "voice" ? "Voice Active" : "Touch Mode"}
                </span>
              </div>

              {/* Chat exchange */}
              <div className="space-y-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none text-sm text-slate-800 dark:text-slate-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    AI Pre-Consultant:
                  </span>
                  <p>"Namaste! Please tell me, what health trouble brings you to the hospital today?"</p>
                  <p className="text-xs text-slate-500 italic">"नमस्ते! आज आपको क्या समस्या है, कृपया विस्तार से बताएं?"</p>
                </div>

                <div className="bg-emerald-600 text-white p-3.5 rounded-2xl rounded-tr-none ml-auto max-w-[90%] text-sm space-y-1 shadow-sm">
                  <span className="text-[11px] opacity-80 block">Your Input:</span>
                  <p>{transcript}</p>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none text-sm text-slate-800 dark:text-slate-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    AI Pre-Consultant:
                  </span>
                  <p>"I understand. How would you describe the severity of this stomach pain?"</p>
                  <div className="flex gap-2 pt-2">
                    {["Mild", "Moderate", "Severe"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setPainLevel(lvl)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          painLevel === lvl
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voice button / input */}
              <div className="pt-2">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isRecording
                        ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </button>
                </div>
                <p className="text-center text-xs text-slate-500 mt-2">
                  {isRecording ? "Listening... (Bolte rahiye)" : "Tap microphone to speak"}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setStep(2)} className="text-xs text-slate-500">&larr; Back</button>
                <button
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Next Questions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ADAPTIVE QUESTIONING */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Adaptive AYUSH Clinical Inquiry
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Follow-Up on Stomach Discomfort
                </h3>
              </div>

              {/* Question 1: Relation to meals */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  1. Do you feel pain or burning immediately after eating? (भोजन के बाद?)
                </label>
                <div className="flex gap-2">
                  {["Yes, after eating", "No, on empty stomach", "Constant"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFoodRelation(opt)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        foodRelation === opt
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Associated symptoms (Lakshanas) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  2. Do you experience any of these associated symptoms?
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Acidity (Amlapitta)", "Nausea (Hrillasa)", "Bloating (Adhmana)", "Loss of Appetite (Aruchi)", "Constipation", "Fever"].map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedSymptoms.includes(s)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Bowel & Sleep (Agni & Nidra) */}
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">AYUSH Clinical Note:</span>
                <p className="text-emerald-900/80 dark:text-emerald-300/80">
                  Patient exhibits symptoms consistent with Pitta-Vata vitiation (Amlapitta / Anaha).
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setStep(3)} className="text-xs text-slate-500">&larr; Back</button>
                <button
                  onClick={() => setStep(5)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Upload Documents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: UPLOAD DOCUMENTS */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Document Intelligence
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Upload Previous Prescriptions & Reports
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  AI will read handwritten notes, medicines, and compile your timeline.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-2xl p-6 text-center hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all cursor-pointer">
                  <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Take Photo with Camera
                  </span>
                  <span className="text-[11px] text-slate-400">Use kiosk/phone camera</span>
                </div>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Upload File / PDF
                  </span>
                  <span className="text-[11px] text-slate-400">JPG, PNG, PDF up to 10MB</span>
                </div>
              </div>

              {/* Already uploaded sample file */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Attached Documents (1)</span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono text-slate-800 dark:text-slate-200">Prescription_DrVerma_Jan2024.jpg</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    Ready for OCR
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setStep(4)} className="text-xs text-slate-500">&larr; Back</button>
                <button
                  onClick={handleSimulateDocs}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Process with AI OCR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: DOCUMENT PROCESSING SPINNER */}
          {step === 6 || isProcessingDocs ? (
            <div className="py-10 text-center space-y-4 animate-in fade-in">
              <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Extracting Clinical Details...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Reading handwritten prescription • Parsing medicine dosages • Building timeline
                </p>
              </div>
            </div>
          ) : null}

          {/* STEP 7: CASE SUMMARY PREVIEW */}
          {step === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Review & Confirm
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Your Case Summary Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Verify your details before the case sheet is handed to the doctor.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Chief Complaint</span>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Stomach pain and burning sensation since 2 days (Severity: {painLevel}). Aggravated post-meals.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Associated Symptoms</span>
                  <p className="text-slate-800 dark:text-slate-200">
                    {selectedSymptoms.join(", ")}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">OCR Extracted Past Rx</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300">
                    Pantoprazole 40mg OD, Antacid Gel 10ml BD (Jan 2024 - Gastritis)
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setStep(5)} className="text-xs text-slate-500">&larr; Edit</button>
                <button
                  onClick={() => setStep(8)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit for Doctor Review</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: SUBMISSION CONFIRMED WITH TOKEN */}
          {step === 8 && (
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Information Submitted Successfully!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Your structured case sheet has been prepared and sent to the physician.
                </p>
              </div>

              {/* Token Ticket Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm max-w-xs mx-auto space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  OPD Token Number
                </span>
                <div className="text-2xl font-black font-mono tracking-wider text-emerald-700 dark:text-emerald-400">
                  {tokenGenerated}
                </div>
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs text-slate-600 dark:text-slate-400">
                  Estimated Wait: <strong>~12 mins</strong> (3 patients ahead)
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  href={`/doctor/case-sheet/${tokenGenerated}`}
                  className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>See Doctor's View for this Token</span>
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer note */}
      <footer className="py-4 text-center text-xs text-slate-400">
        SwasthyaSetu • AI-Powered Pre-Consultation Prototype
      </footer>
    </div>
  );
}
