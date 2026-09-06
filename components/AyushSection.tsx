"use client";

import React from "react";
import { 
  Leaf, 
  Flame, 
  Activity, 
  Sparkles, 
  Check, 
  Compass, 
  ShieldCheck 
} from "lucide-react";

export function AyushSection() {
  const dashavidhaItems = [
    { title: "Prakriti (प्रकृति)", desc: "Tridoshic baseline (Vata, Pitta, Kapha constitutional analysis)" },
    { title: "Vikriti (विकृति)", desc: "Current morbid state and pathological doshic deviation" },
    { title: "Sara (सार)", desc: "Tissue excellence and vital dhatus assessment (Rasa, Rakta, etc.)" },
    { title: "Samhanana (संहनन)", desc: "Physical compactness, skeletal & muscular integrity" },
    { title: "Pramana (प्रमाण)", desc: "Anthropometric body proportions and BMI evaluation" },
    { title: "Satmya (सात्म्य)", desc: "Nutritional habituation and climatic adaptability" },
    { title: "Sattva (सत्त्व)", desc: "Psychological resilience and mental temperament (Pravara/Madhyama/Avara)" },
    { title: "Ahara Shakti (आहार शक्ति)", desc: "Appetite, digestive capacity (Agni: Sama, Vishama, Tikshna, Manda)" },
    { title: "Vyayama Shakti (व्यायाम शक्ति)", desc: "Physical endurance and stamina threshold" },
    { title: "Vaya (वय)", desc: "Biological & chronological stage of life (Balya, Madhyama, Vriddha)" }
  ];

  const ayushPillars = [
    { name: "Ayurveda", desc: "Holistic doshic balancing, Panchakarma readiness & herbology" },
    { name: "Yoga & Naturopathy", desc: "Mind-body lifestyle balance, Asanas & detoxification" },
    { name: "Unani", desc: "Mizaj (Temperament) & Akhlat (Humors) assessment" },
    { name: "Siddha", desc: "Vatha, Pitha, Kabha & Mukkuttram equilibrium" },
    { name: "Homeopathy", desc: "Constitutional totality of symptoms and miasmatic profile" }
  ];

  return (
    <section id="ayush-clinical" className="py-20 md:py-28 bg-emerald-950 text-white relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Traditional Wisdom + Modern AI
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Rooted in <span className="text-emerald-400">Dashavidha Pariksha</span>
          </h2>
          <p className="text-base sm:text-lg text-emerald-100/80">
            Unlike allopathic generic bots, SwasthyaSetu’s conversational model is engineered with classical AYUSH diagnostic methodologies, capturing key clinical parameters before the patient meets the Vaidya.
          </p>
        </div>

        {/* Dashavidha Pariksha 10-Point Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {dashavidhaItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800/60 hover:border-emerald-500/80 transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-400">0{idx + 1}</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-125 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* AYUSH Multidisciplinary Coverage Bar */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-900/80 via-teal-900/70 to-emerald-900/80 border border-emerald-700/50 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Full Spectrum Coverage
              </span>
              <h3 className="text-xl font-bold text-white">
                Supporting All 5 Streams of the Ministry of AYUSH
              </h3>
              <p className="text-sm text-emerald-200/80">
                Customizable clinical inquiry templates according to department requirements.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {ayushPillars.map((stream, idx) => (
                <div 
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-center"
                >
                  <span className="text-xs font-bold text-emerald-200 block">{stream.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
