# Chatbot for Patient Side — Plan

## Overview
This document summarizes research, technical architecture, and UI/feature requirements to implement an intelligent patient-side chatbot that:
- Conversationally collects symptoms.
- Asks follow-ups about pain severity (mild/medium/high) and duration.
- Flags "red flag" situations (very high pain, long duration, alarming symptoms).
- Accepts voice input, shows transcribed text to patient for confirmation before submitting to the LLM.
- Uses multiple LLM providers with automatic fallback when tokens expire or errors occur (primary -> Gemini -> Claude -> Deepseek / others).

---

## Goals
- Reliable symptom triage UX with clear red-flag escalation.
- Resilient provider routing with transparent fallbacks.
- Privacy-preserving handling of PHI.
- Simple developer experience: a provider wrapper, backend route, and composable UI components.

---

## Research summary (provider choices & behaviour)
- Primary provider: OpenAI (ChatGPT API) — good general conversational + system prompt control.
- Secondary: Google Gemini — good alternative for generative fallback.
- Tertiary: Anthropic Claude — safety-focused responses.
- Additional: Deepseek (or other legal/regulatory-compliant LLMs) as last resort.

Fallback strategy:
- Attempt primary provider call.
- On HTTP 401/403 (expired/invalid token) or provider outage (5xx, timeouts), immediately retry with next provider.
- Maintain short circuit: if provider returns a meaningful response, use it.
- Add exponential backoff for transient errors and record attempt telemetry.
- Notify client of provider switch (UI indicator) when fallback occurs.

Cost/latency considerations:
- Failover increases latency; use quick, cheap partial response first (e.g., light prompt to check provider health) when feasible.

---

## Technical design

Files/components (suggested):
- `lib/llm-providers.ts` — provider-agnostic wrapper handling requests, retries, and fallback logic.
- `app/api/chat/route.ts` (or `pages/api/chat.ts`) — backend route that the frontend calls; performs authentication, rate limit, and provider routing.
- `components/Chatbot.tsx` — main chat UI component.
- `components/VoiceRecorder.tsx` — records audio and sends to transcription service.
- `components/VoiceConfirm.tsx` — shows transcribed text to user for confirm/edit before submission.
- `lib/transcribe.ts` — wrapper for speech-to-text provider (use browser Web Speech API or server-side STT like Whisper/Whisper API).
- `lib/redFlag.ts` — encapsulates red-flag detection rules.

Provider wrapper behavior (`lib/llm-providers.ts`):
1. Accepts normalized request: { userId?, prompt, systemPrompt, metadata }
2. Iterates providers list in order.
3. For each provider:
   - Attach provider-specific headers/token from secure store (server-side env or vault).
   - Send request with a shared timeout (e.g., 10s).
   - On success: return response and provider-id.
   - On auth error (401/403): mark provider token invalid and move to next.
   - On transient error (5xx, timeout): optionally retry once then fallback.
4. Emit telemetry for attempts, latencies, errors.

Token rotation and expiry handling:
- Store tokens securely server-side (env or secrets manager).
- If a token is expired, attempt refresh if refresh flow exists; else mark and fall back.
- Provide admin UI / dev endpoint to update tokens.

Security & privacy:
- Do not persist unconsented PII/PHI; minimize logs (hash IDs, redact PHI in logs).
- Use TLS for all client-server and server-provider traffic.
- Add an explicit patient consent step in UI before recording or sending PHI.

Data flow:
- Client collects symptoms/voice -> POST to `/api/chat` -> `lib/llm-providers` routes to provider -> response -> `lib/redFlag` checks for escalation -> client shows result and suggested actions.

Error handling:
- Client shows friendly messages for transient failures and an explicit "Try again" or "Report issue" button.
- When fallback happens, show a subtle banner: "Using backup LLM for this request." If all providers fail, present offline guidance and contact options.

---

## Symptom dialog flow (detailed)
1. Patient enters initial symptom text or voice.
2. Bot asks clarifying questions automatically, one at a time.
   - Always include a direct question: "Is your pain mild, moderate, or severe?"
   - Ask duration: "How long have you had this pain?" (structured choices: <24h, 24-72h, >72h)
3. After each answer, update the conversation state.
4. Red-flag detection triggers when:
   - Severity is "high/severe" AND duration > 72 hours, OR
   - Patient reports alarming symptoms (chest pain, fainting, severe bleeding, difficulty breathing, sudden weakness, confusion), OR
   - LLM classification output includes recommended immediate care.
5. If red-flag: show a prominent red alert card with recommended actions (call emergency, contact provider, go to ER) and an option to contact a real clinician via phone/teleconsult.

UX note: use short, clear prompts and avoid medical jargon. Provide fallback UI suggestions (e.g., "See nearest ER").

---

## Voice flow & confirmation
- Record audio in `components/VoiceRecorder.tsx` (use MediaRecorder API).
- Transcribe client-side or server-side via `lib/transcribe.ts` (Whisper or cloud STT).
- Show `components/VoiceConfirm.tsx` overlay with the transcribed text and two actions: "Confirm" or "Edit".
- If user confirms, send the confirmed text as the message to `/api/chat`.
- If user edits, send edited text.
- Keep original audio only for debugging with explicit consent; otherwise discard after transcription.

Accessibility: provide captions and keyboard controls.

---

## UI / Feature Additions (brief)
- Chat window with message bubbles, timestamp, and provider status indicator.
- Quick-reply buttons for severity and duration (reduces friction).
- Red-flag alert card with CTA buttons (Call ambulance, Contact clinic, See urgent-care options).
- Voice-mic button with recording animation and live waveform.
- Confirmation modal showing transcript before sending.
- Provider status badge showing current provider and fallback notices.
- Settings page to manage consent and view privacy info.

---

## Implementation roadmap (approx. order)
1. Implement `lib/llm-providers.ts` with a mock provider adapter locally.
2. Add `/api/chat` route that uses provider wrapper.
3. Implement `components/Chatbot.tsx` basic UI and connect to `/api/chat`.
4. Add `lib/redFlag.ts` rules and integrate with chat responses.
5. Implement `components/VoiceRecorder.tsx` + `lib/transcribe.ts` + `components/VoiceConfirm.tsx`.
6. Add provider fallback telemetry and UI indicator.
7. Add tests and QA for red-flag edge cases.
8. Add docs and `README.md` usage and token management notes.

---

## Example red-flag pseudo rules (start point)
- If severity === 'high' && durationHours > 72 => redFlag = true
- If text includes keywords: ['chest pain','shortness of breath','faint','severe bleeding','sudden weakness','slurred speech','unresponsiveness'] => redFlag = true

Use a lightweight keyword matcher plus LLM classification to reduce false negatives.

---

## Next steps I can take now (pick one)
- Implement `lib/llm-providers.ts` skeleton and a backend route (`/api/chat`).
- Scaffold `components/Chatbot.tsx` and `components/VoiceRecorder.tsx` with basic UI.
- Write unit tests for `lib/redFlag.ts` rules.

If you want, I can start implementing the provider wrapper and `/api/chat` route immediately.

---

Created by GitHub Copilot assistant. 
