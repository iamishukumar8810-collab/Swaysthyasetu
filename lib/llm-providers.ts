// Server-side provider wrapper with simple fallback logic
import { evaluateAyushDoshaAndAgni } from './redFlag';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

// External callers (API routes) may pass a plain `{ role: string; content: string }` type.
export type ExternalMessage = { role: string; content: string };

async function fetchWithTimeout(url: string, opts: any, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function callOpenAI(messages: Message[]) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error('no-openai-key');

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: 0.2,
  };

  const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  }, 10000);

  if (res.status === 401 || res.status === 403) {
    const txt = await res.text().catch(() => 'auth-error');
    const e: any = new Error('openai-auth');
    e.code = res.status;
    e.detail = txt;
    throw e;
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => 'error');
    const e: any = new Error('openai-error');
    e.code = res.status;
    e.detail = txt;
    throw e;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
  return { provider: 'OpenAI (GPT-4o-mini)', text: content, raw: data };
}

// Intelligent clinical fallback if external API keys are unavailable or fail
async function callFallbackMock(providerName: string, messages: Message[]) {
  await new Promise(r => setTimeout(r, 200));
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  const lastUserMsg = userMessages[userMessages.length - 1] || '';
  const allUserText = userMessages.join(' ').toLowerCase();
  const lowerLast = lastUserMsg.toLowerCase();
  const turnCount = userMessages.length;

  const isFinalize =
    lowerLast.includes('report') ||
    lowerLast.includes('finalize') ||
    lowerLast.includes('done') ||
    lowerLast.includes('theek hai') ||
    lowerLast.includes('bana do') ||
    lowerLast.includes('समाप्त') ||
    lowerLast.includes('तैयार');

  let reply = "";
  let severity: "Mild" | "Medium" | "High" = "Medium";
  if (allUserText.includes('high') || allUserText.includes('severe') || allUserText.includes('तीव्र') || allUserText.includes('ज़्यादा') || allUserText.includes('bahut')) {
    severity = "High";
  } else if (allUserText.includes('mild') || allUserText.includes('हल्का') || allUserText.includes('low') || allUserText.includes('kam')) {
    severity = "Mild";
  }

  let duration = "1-2 weeks";
  if (allUserText.includes('month') || allUserText.includes('महीने') || allUserText.includes('mahine')) {
    duration = "1-3 months (Chronic)";
  } else if (allUserText.includes('day') || allUserText.includes('दिन') || allUserText.includes('din')) {
    duration = "2-4 days (Acute)";
  } else if (allUserText.includes('week') || allUserText.includes('हफ़्ते') || allUserText.includes('hafte')) {
    duration = "1-2 weeks (Sub-acute)";
  }

  const ayushEval = evaluateAyushDoshaAndAgni(userMessages, allUserText);
  const dosha = ayushEval.dosha;
  const agni = ayushEval.agni;

  if (allUserText.includes('joint') || allUserText.includes('knee') || allUserText.includes('back') || allUserText.includes('kamar') || allUserText.includes('dard') || allUserText.includes('pain') || allUserText.includes('stiff')) {
    if (isFinalize || turnCount >= 4) {
      reply = `आपके जोड़ों/दर्द से संबंधित सभी मुख्य लक्षण (अवधि: ${duration}, तीव्रता: ${severity}) दर्ज कर लिए गए हैं।\n\nआपकी AI Clinical Consultation Report तैयार है। "📋 Generate Clinical Report" बटन पर क्लिक करके PDF प्राप्त करें।`;
    } else if (turnCount === 1) {
      reply = `आपकी समस्या "${lastUserMsg}" नोट कर ली गई है।\n\nयह जानने के लिए कि वात या कफ का क्या प्रभाव है: क्या यह दर्द चलने, झुकने या सीढ़ियां चढ़ने पर बढ़ जाता है? और क्या सुबह उठने पर जोड़ों में अकड़न (morning stiffness) महसूस होती है?`;
    } else if (turnCount === 2) {
      reply = `लक्षण समझ में आ रहे हैं। कृपया बताएं कि यह दर्द आपको कितने समय से परेशान कर रहा है? (जैसे कुछ दिन, हफ़्ते या महीनों से?)\n\nसाथ ही बताएं कि दर्द की तीव्रता कैसी है — Mild (हल्का), Medium (मध्यम), या High/Severe (काफ़ी तीव्र)?`;
    } else {
      reply = `अवधि व स्थिति नोट कर ली गई है। क्या इसके साथ कमर या पैरों में खिंचाव (radiation) या भारीपन भी रहता है? और क्या इसके लिए आपने हाल ही में कोई पेनकिलर, मालिश का तेल या आयुर्वेदिक दवा ली है?`;
    }
  } else if (allUserText.includes('acid') || allUserText.includes('jalan') || allUserText.includes('pet') || allUserText.includes('stomach') || allUserText.includes('gas') || allUserText.includes('kabj') || allUserText.includes('digest')) {
    if (isFinalize || turnCount >= 4) {
      reply = `पेट और पाचन संबंधी लक्षण (अवधि: ${duration}, तीव्रता: ${severity}) दर्ज किए गए हैं।\n\nAI Clinical Report तैयार है — "📋 Generate Clinical Report" बटन दबाकर PDF प्राप्त करें।`;
    } else if (turnCount === 1) {
      reply = `पेट में तकलीफ़ व जलन की बात समझी।\n\nक्या यह जलन भोजन करने के तुरंत बाद होती है या खाली पेट ज़्यादा महसूस होती है? क्या इसके साथ खट्टी डकारें, जी मिचलाना या सीने में भारीपन भी है?`;
    } else if (turnCount === 2) {
      reply = `यह तकलीफ़ आपको लगभग कितने समय से बनी हुई है? (Duration: जैसे 2-3 दिन, 1-2 हफ़्ते, या महीनों से?)\n\nऔर तकलीफ़ का स्तर कैसा है — Mild (हल्का), Medium (मध्यम), या High (बहुत असहज)?`;
    } else {
      reply = `समझ गया। क्या चाय, मिर्च-मसालेदार या तला-भुना खाने से यह समस्या और बढ़ जाती है? और क्या आपका पेट रोज़ सुबह सही तरह से साफ हो रहा है या कब्ज (constipation) की समस्या है?`;
    }
  } else if (allUserText.includes('cough') || allUserText.includes('cold') || allUserText.includes('kaph') || allUserText.includes('gala') || allUserText.includes('throat') || allUserText.includes('fever') || allUserText.includes('bukhar')) {
    if (isFinalize || turnCount >= 4) {
      reply = `गले/श्वसन सम्बन्धी लक्षण दर्ज हो चुके हैं।\n\nAI Clinical Triage Summary तैयार है — "📋 Generate Clinical Report" बटन दबाकर रिपोर्ट डाउनलोड करें।`;
    } else if (turnCount === 1) {
      reply = `गले व कफ की समस्या नोट कर ली गई है।\n\nक्या खांसी सूखी है या बलगम (phlegm) आ रहा है? क्या इसके साथ गले में खराश, सिरदर्द या हल्का बुखार भी महसूस हो रहा है?`;
    } else if (turnCount === 2) {
      reply = `यह तकलीफ़ कितने दिनों से है? और क्या रात में या ठंडी हवा में सांस लेने या खांसने में परेशानी बढ़ती है? तीव्रता (Mild/Medium/High) बताएं।`;
    } else {
      reply = `लक्षण दर्ज हो गए हैं। क्या आपने इसके लिए कोई काढ़ा, गर्म पानी या कोई दवा ली है? क्या छाती में भारीपन महसूस होता है?`;
    }
  } else if (allUserText.includes('fatigue') || allUserText.includes('weak') || allUserText.includes('kamzori') || allUserText.includes('thakan')) {
    if (isFinalize || turnCount >= 4) {
      reply = `थकान व कमज़ोरी सम्बन्धी सभी लक्षण दर्ज किए गए हैं।\n\nAYUSH Clinical Triage Report तैयार है।`;
    } else {
      reply = `थकान और कमज़ोरी के लक्षण नोट कर लिए गए हैं। क्या इसके साथ नींद में कमी या भूख न लगना भी महसूस होता है?`;
    }
  } else if (allUserText.includes('headache') || allUserText.includes('sir dard') || allUserText.includes('head')) {
    if (isFinalize || turnCount >= 4) {
      reply = `सिरदर्द सम्बन्धी सभी लक्षण दर्ज किए गए हैं।\n\nAYUSH Clinical Triage Report तैयार है।`;
    } else {
      reply = `सिरदर्द का लक्षण नोट किया गया है। क्या यह दर्द सिर के एक तरफ है या दोनों तरफ? क्या धूप या तनाव से यह बढ़ता है?`;
    }
  } else {
    // General symptoms
    if (isFinalize || turnCount >= 4) {
      reply = `आपके द्वारा साझा किए गए सभी विवरण संकलित कर लिए गए हैं।\n\nAYUSH Clinical Report तैयार है — कृपया "📋 Generate Clinical Report" बटन पर क्लिक करें।`;
    } else if (turnCount === 1) {
      reply = `आपकी समस्या "${lastUserMsg}" नोट कर ली गई है।\n\nकृपया थोड़ा विस्तार से बताएं — यह तकलीफ़ मुख्य रूप से शरीर के किस हिस्से में है, और क्या यह किसी ख़ास समय (जैसे सुबह, शाम या काम के बाद) ज़्यादा होती है?`;
    } else if (turnCount === 2) {
      reply = `यह समस्या आपको कितने दिनों या हफ़्तों से है? और तकलीफ़ का स्तर कैसा है — Mild (हल्का), Medium (मध्यम), या High/Severe (तीव्र)?`;
    } else {
      reply = `विवरण नोट हो गया। क्या इसके साथ नींद में परेशानी, भूख में कमी या कमज़ोरी जैसे कोई अन्य लक्षण भी हैं?`;
    }
  }

  const evalJson = JSON.stringify({
    complaint: userMessages[0] || "General discomfort",
    severity,
    duration,
    associated: userMessages.slice(1).join(", ").slice(0, 80) || "None reported",
    dosha,
    agni,
    readyForReport: isFinalize || turnCount >= 3
  });

  const fullText = `${reply}\n<!--CLINICAL_EVAL:${evalJson}-->`;

  return { provider: `Swasthya AI Engine (Clinical Triage)`, text: fullText, raw: null };
}

async function callGemini(messages: Message[]) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.0';
  if (!key) throw new Error('no-gemini-key');

  const url = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate`;
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  const body = { prompt: { text: prompt }, temperature: 0.2 };

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  }, 12000);

  if (!res.ok) {
    const txt = await res.text().catch(() => 'error');
    const e: any = new Error('gemini-error');
    e.code = res.status;
    e.detail = txt;
    throw e;
  }

  const data = await res.json();
  // Try common response shapes
  const text = data?.candidates?.[0]?.output || data?.output?.[0]?.content || data?.response || JSON.stringify(data);
  return { provider: 'gemini', text, raw: data };
}

async function callClaude(messages: Message[]) {
  const key = process.env.CLAUDE_API_KEY;
  const model = process.env.CLAUDE_MODEL || 'claude-2.1';
  if (!key) throw new Error('no-claude-key');

  const url = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/complete';
  const prompt = messages.map(m => `${m.role === 'system' ? '[SYSTEM]' : m.role.toUpperCase()}: ${m.content}`).join('\n');
  const body = { model, prompt, max_tokens: 800, temperature: 0.2 };

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  }, 12000);

  if (!res.ok) {
    const txt = await res.text().catch(() => 'error');
    const e: any = new Error('claude-error');
    e.code = res.status;
    e.detail = txt;
    throw e;
  }

  const data = await res.json();
  const text = data?.completion || data?.output || data?.response || JSON.stringify(data);
  return { provider: 'claude', text, raw: data };
}

export async function callLLM(opts: { messages: ExternalMessage[] }) {
  const providers = [
    callOpenAI,
    callGemini,
    callClaude,
    async (m: Message[]) => callFallbackMock('deepseek', m),
  ];

  const attempts: Array<any> = [];

  for (const fn of providers) {
    const providerName = fn === callOpenAI ? 'openai' : fn.name || 'fallback';
    const start = Date.now();
    try {
      // Ensure messages passed to internal adapters conform to `Message` type
      const normalized = opts.messages.map(m => ({ role: (m.role as any) as Message['role'], content: String(m.content) })) as Message[];
      const res = await fn(normalized);
      attempts.push({ provider: res.provider || providerName, ok: true, latencyMs: Date.now() - start });
      return { provider: res.provider || providerName, text: res.text, raw: res.raw, attempts };
    } catch (err: any) {
      const latency = Date.now() - start;
      attempts.push({ provider: providerName, ok: false, latencyMs: latency, error: err?.message || String(err) });
      // If auth error, continue to next provider immediately
      if (err?.message === 'no-openai-key' || err?.message?.includes('auth') || err?.code === 401 || err?.code === 403) {
        continue;
      }
      // For transient network errors also continue to next
      continue;
    }
  }

  throw new Error('all-providers-failed');
}

export type LLMResponse = { provider: string; text: string; raw?: any; attempts: any[] };
