export function checkRedFlags(text: string, metadata?: { severity?: string; durationHours?: number; durationText?: string }) {
  const reasons: string[] = [];
  const lower = (text || '').toLowerCase();

  // Critical keywords in English and Hindi/Hinglish
  const criticalKeywords = [
    'chest pain', 'सीने में दर्द', 'sine me dard',
    'shortness of breath', 'difficulty breathing', 'सांस लेने में तकलीफ', 'saans lene me takleef',
    'severe bleeding', 'faint', 'unresponsive', 'sudden weakness', 'slurred speech', 'confusion',
    'heart attack', 'paralysis', 'chhati me dard',
    'bht jyda dard', 'bohot dard', 'bahut dard', 'unbearable pain', 'extreme pain', 'acute pain'
  ];

  for (const k of criticalKeywords) {
    if (lower.includes(k)) reasons.push(`Critical symptom detected: "${k}"`);
  }

  // Check severity
  if (metadata?.severity) {
    const sev = metadata.severity.toLowerCase();
    if (sev === 'high' || sev === 'severe' || sev === 'तीव्र' || sev === 'jyada') {
      reasons.push('High/Severe pain reported by patient');
    }
  }

  // Check duration in text or hours
  if (typeof metadata?.durationHours === 'number' && metadata.durationHours >= 72) {
    reasons.push(`Prolonged duration (${metadata.durationHours} hours)`);
  }

  const durationStr = (metadata?.durationText || lower).toLowerCase();
  if (
    durationStr.includes('bohot time') ||
    durationStr.includes('bahut time') ||
    durationStr.includes('3 months') ||
    durationStr.includes('6 months') ||
    durationStr.includes('1 year') ||
    durationStr.includes('several months') ||
    durationStr.includes('kayi mahine')
  ) {
    reasons.push('Chronic symptom duration (> 30 days)');
  }

  const red = reasons.length > 0;
  return { red, reasons };
}
