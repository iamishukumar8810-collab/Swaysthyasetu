"use client";
import React from 'react';

export default function VoiceConfirm({ transcript, onConfirm, onEdit, onCancel }: { transcript: string; onConfirm: () => void; onEdit: (s: string) => void; onCancel: () => void }) {
  const [edit, setEdit] = React.useState(transcript);

  React.useEffect(() => setEdit(transcript), [transcript]);

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, background: '#fff' }}>
      <div style={{ marginBottom: 8 }}>Transcription (please confirm):</div>
      <textarea value={edit} onChange={e => setEdit(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={() => onEdit(edit)}>Save & Send</button>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
