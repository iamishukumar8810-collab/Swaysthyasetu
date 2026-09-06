"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Stethoscope, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  Filter,
  FileText,
  Activity,
  Calendar
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DoctorDashboardPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const queue = [
    {
      id: "AYUH-2024-08725",
      name: "Ramesh Kumar",
      age: 45,
      gender: "Male",
      complaint: "Stomach pain since 2 days, severe acidity & post-meal burning",
      docs: 2,
      time: "10:30 AM",
      status: "Ready for Review",
      flag: "Chronic PPI / Recurrent Acidity",
      dept: "Ayurveda Kayachikitsa"
    },
    {
      id: "AYUH-2024-08726",
      name: "Sita Devi",
      age: 58,
      gender: "Female",
      complaint: "Bilateral knee joint pain and morning stiffness (Sandhigata Vata)",
      docs: 1,
      time: "10:45 AM",
      status: "Waiting",
      flag: null,
      dept: "Ayurveda Shalya/Panchakarma"
    },
    {
      id: "AYUH-2024-08727",
      name: "Mohd. Ali",
      age: 33,
      gender: "Male",
      complaint: "Lower back pain radiating to left leg (Gridhrasi), weakness",
      docs: 3,
      time: "11:00 AM",
      status: "Waiting",
      flag: "Lumbar MRI report attached",
      dept: "Ayurveda Kayachikitsa"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Doctor Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  AYUSH Hospital OPD Portal
                </h1>
                <p className="text-[11px] text-slate-500">Dr. Sharma (Physician, MD Ayurveda)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live OPD Active
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Today's Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">128</div>
            <p className="text-[11px] text-slate-400">Scheduled for Today</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
            <div className="text-3xl font-black text-emerald-600">96</div>
            <p className="text-[11px] text-slate-400">Verified & Prescribed</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending in Queue</span>
            <div className="text-3xl font-black text-amber-600">32</div>
            <p className="text-[11px] text-slate-400">Pre-consultation ready</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Avg. Consult Time</span>
            <div className="text-3xl font-black text-teal-600">3 min</div>
            <p className="text-[11px] text-emerald-600 font-medium">&darr; Reduced from 15 min</p>
          </div>
        </div>

        {/* Live Patient Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Next in OPD Queue</span>
                <span className="text-xs font-normal text-slate-400 font-mono">Live Realtime Sync</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI structured pre-consultation sheets ready for physician inspection
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                All (32)
              </button>
              <button
                onClick={() => setActiveFilter("flagged")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === "flagged"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Attention Flags (1)
              </button>
            </div>
          </div>

          {/* Queue List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {queue.map((patient) => (
              <div
                key={patient.id}
                className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {patient.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {patient.age} Y / {patient.gender}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      {patient.id}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-medium">
                      {patient.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-500 font-medium">Chief Complaint: </strong>
                    {patient.complaint}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Dept: <strong>{patient.dept}</strong></span>
                    <span>Docs: <strong>{patient.docs} Attached</strong></span>
                    <span>Time: <strong>{patient.time}</strong></span>
                    {patient.flag && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {patient.flag}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/doctor/case-sheet/${patient.id}`}
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Start Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
