import { NextResponse } from 'next/server';
import { callLLM } from '../../../lib/llm-providers';
import { checkRedFlags, evaluateAyushDoshaAndAgni } from '../../../lib/redFlag';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message || '';
    const metadata = body?.metadata || {};
    const chatHistory = body?.history || [];

    if (!message) {
      return NextResponse.json({ error: 'message-required' }, { status: 400 });
    }

    const userMessage = message;
    const historyCount = chatHistory.filter((h: any) => h.from === 'user').length;
    const isFinalizeRequested =
      Boolean(metadata?.finalize) ||
      userMessage.toLowerCase().includes('generate report') ||
      userMessage.toLowerCase().includes('report bana') ||
      userMessage.toLowerCase().includes('finalize') ||
      userMessage.toLowerCase().includes('report banayein') ||
      userMessage.toLowerCase().includes('summary report');

    const systemPrompt = `You are Dr. Swasthya, an expert AYUSH Clinical Triage Specialist at Swasthya Setu (an integrated AYUSH Hospital System).
  Your mission is to conduct a thorough, compassionate, and realistic clinical anamnesis with the patient to prepare a complete clinical pre-consultation report for the attending physician.

Clinical Communication Guidelines:
1. Warmth, Compassion & Natural Language:
   - Respond in empathetic, natural conversational language matching the patient's language (Hindi, Hinglish, or English).
   - Acknowledge and empathize with their symptoms warmly and professionally.

2. Symptom-Specific Clinical Cross-Examination:
   - Do NOT rush the consultation in just 2 or 3 robotic questions.
   - Dynamically ask 1 to 2 clinically focused cross-questions based on the specific symptom reported:
     * Sensation & Exact Site: (e.g. sharp, burning, dull ache, throbbing, stiffness, radiation to legs/arms).
     * Modulating Factors & Triggers: (e.g. worse after oily/spicy food, worse in morning, aggravated by cold/wind/movement, stress-related).
     * Associated AYUSH Dosha Indicators: (e.g. appetite/Agni, digestion, acidity, gas, constipation, body heat/sweat, sleep quality, fatigue).
     * Pain Intensity: Ask if Mild (हल्का), Medium (मध्यम), or High/Severe (तीव्र) if not yet known.
     * Duration: Ask for how long this has persisted (days, weeks, months) if not yet known.
     * Current Medicines / Home Remedies: Ask if any painkiller, antacid, or Ayurvedic remedies were taken.

3. Flow Progression:
   - Keep each response concise (2-4 sentences max), clear, and conversational.
   - Do not overwhelm the patient; ask 1 or 2 relevant follow-ups per turn.
   - If the patient has answered several questions (around 3 to 5 turns) or if they explicitly ask to generate the report:
     * Acknowledge that sufficient clinical details have been recorded.
    * Confirm that their official AYUSH Clinical Intake Report is ready to be synthesized for the attending physician.
     * Let them know they can click the "Generate Clinical Report" button to finalize now, or share any additional details.

4. Hidden Clinical Assessment Tag:
   At the very end of your response, ALWAYS append a hidden clinical JSON tag with your progressive clinical diagnosis:
   <!--CLINICAL_EVAL:{"complaint":"<primary issue>","severity":"Mild|Medium|High","duration":"<duration if known, else Unknown>","associated":"<associated symptoms>","dosha":"<predicted AYUSH dosha, e.g. Pitta-Kapha / Vata-Kapha / Vata-Pitta>","agni":"<Agni status, e.g. Manda Agni / Tikshnagni / Vishamagni>","readyForReport":true|false}-->`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((h: any) => ({
        role: h.from === 'user' ? 'user' : 'assistant',
        content: h.text
      })),
      { role: 'user', content: userMessage },
    ];

    const llm = await callLLM({ messages });

    let rawText = llm.text || '';
    let clinicalEval: any = null;

    // Parse hidden clinical assessment tag if present
    const tagMatch = rawText.match(/<!--CLINICAL_EVAL:([\s\S]*?)-->/);
    if (tagMatch && tagMatch[1]) {
      try {
        clinicalEval = JSON.parse(tagMatch[1].trim());
      } catch (e) {
        console.warn("Failed to parse clinical eval JSON tag:", e);
      }
      rawText = rawText.replace(/<!--CLINICAL_EVAL:[\s\S]*?-->/, '').trim();
    }

    // Default fallback clinical metrics if tag was absent
    if (!clinicalEval) {
      const lower = (userMessage + ' ' + (metadata?.complaint || '')).toLowerCase();
      let sev: "Mild" | "Medium" | "High" = metadata?.severity || "Medium";
      if (lower.includes('high') || lower.includes('severe') || lower.includes('तीव्र') || lower.includes('ज़्यादा')) {
        sev = "High";
      } else if (lower.includes('mild') || lower.includes('हल्का') || lower.includes('kam') || lower.includes('low')) {
        sev = "Mild";
      }

      let dur = metadata?.durationText || "1-2 weeks";
      if (lower.includes('month') || lower.includes('महीने')) dur = "1-3 months";
      else if (lower.includes('day') || lower.includes('दिन')) dur = "2-4 days";

      const ayushEval = evaluateAyushDoshaAndAgni([metadata?.complaint || userMessage], lower);

      clinicalEval = {
        complaint: metadata?.complaint || userMessage,
        severity: sev,
        duration: dur,
        associated: metadata?.associated || "Reported during consultation",
        dosha: ayushEval.dosha,
        agni: ayushEval.agni,
        readyForReport: historyCount >= 3 || isFinalizeRequested
      };
    }

    const combinedText = `${userMessage} ${clinicalEval.severity || ''} ${clinicalEval.duration || ''}`;
    const redFlags = checkRedFlags(combinedText, metadata);

    return NextResponse.json({
      provider: llm.provider,
      text: rawText,
      clinicalEval,
      redFlags,
      attempts: llm.attempts
    });
  } catch (err: any) {
    console.error('chat route error', err);
    return NextResponse.json({ error: err?.message || 'server-error' }, { status: 500 });
  }
}
