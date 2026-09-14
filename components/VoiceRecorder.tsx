"use client";
import React from 'react';

export default function VoiceRecorder({ onTranscript }: { onTranscript: (t: string) => void }) {
  const [listening, setListening] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';
    r.onresult = (ev: any) => {
      const text = ev.results[0][0].transcript;
      onTranscript(text);
    };
    recognitionRef.current = r;
    return () => {
      try { r.stop(); } catch (e) {}
    };
  }, [onTranscript]);

  function start() {
    const r = recognitionRef.current;
    if (!r) return alert('SpeechRecognition not supported in this browser');
    r.start();
    setListening(true);
    r.onend = () => setListening(false);
  }

  function stop() {
    const r = recognitionRef.current;
    if (!r) return;
    r.stop();
    setListening(false);
  }

  return (
    <div>
      <button onClick={() => (listening ? stop() : start())} style={{ padding: '8px 12px' }}>
        {listening ? 'Stop' : 'Record'}
      </button>
    </div>
  );
}
