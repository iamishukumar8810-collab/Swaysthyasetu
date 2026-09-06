"use client";

import React from "react";
import { Clock, Users, ShieldAlert, Languages, Award, CheckCircle2 } from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      value: "70%",
      label: "Reduction in Pre-Consultation Time",
      detail: "OPD case-taking cut down from 15 minutes to under 3 minutes per patient.",
      icon: Clock,
      color: "text-emerald-600 dark:text-emerald-400"
    },
    {
      value: "6+",
      label: "Major Indian Languages",
      detail: "Native speech recognition for Hindi, English, Telugu, Tamil, Bengali & Marathi.",
      icon: Languages,
      color: "text-teal-600 dark:text-teal-400"
    },
    {
      value: "100%",
      label: "Physician in Full Control",
      detail: "Strictly non-diagnostic decision support. Doctor reviews, edits and verifies every case sheet.",
      icon: ShieldAlert,
      color: "text-amber-600 dark:text-amber-400"
    },
    {
      value: "94%+",
      label: "Handwritten Rx Parsing",
      detail: "Multimodal Vision AI extracts medicines, dosages, and timelines from paper prescriptions.",
      icon: Award,
      color: "text-indigo-600 dark:text-indigo-400"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className={`text-3xl sm:text-4xl font-black tracking-tight ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {stat.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
