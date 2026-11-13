import { useEffect, useState } from 'react';
import type { Avis } from '../types';
import { back, replace } from '../router';
import { addNote, useStore } from '../store';
import { AVIS, MOI, stageLabel } from '../faults';
import { entryText, fmtDate, fmtShort, today } from '../lib';
import { WhoChips } from './Correction';

export function Note({ id }: { id: string }) {
  const s = useStore();
  const corr = s.corrections.find((c) => c.id === id);
  const [who, setWho] = useState(s.senseis[0] ?? MOI);
  const [avis, setAvis] = useState<Avis | null>(null);
  const [text, setText] = useState('');
  useEffect(() => {
    if (!corr) replace('');
  }, [corr]);
  if (!corr) return null;

  const date = today();
  const fil = [...corr.entries].reverse();
  const canSave = avis !== null || text.trim() !== '';

  return (
    <div className="screen">
      <div className="between">
        <div className="col tight">
          <div className="sub">Note · {stageLabel(corr.stage)} · {fmtDate(date)}</div>
          <h1 className="small">{corr.label}</h1>
        </div>
        <button className="link" style={{ fontSize: 15 }} onClick={() => back()}>Fermer</button>
      </div>

      <div className="col" style={{ gap: 6 }}>
        <h2 className="label">Qui parle</h2>
        <WhoChips who={who} setWho={setWho} />
      </div>

      <div className="col" style={{ gap: 6 }}>
        <h2 className="label">Aujourd'hui, c'est · facultatif</h2>
        <div className="three">
          {AVIS.map((a) => (
            <button key={a.id} className="avis" style={{ height: 56 }} aria-pressed={avis === a.id} onClick={() => setAvis(avis === a.id ? null : a.id)}>{a.label}</button>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 6 }}>
        <label className="label" htmlFor="note">Note · facultatif</label>
        <textarea id="note" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ce que le sensei a dit, ce que tu as senti…" />
      </div>

      <div className="col fill" style={{ gap: 6 }}>
        <h2 className="label">Déjà noté sur cette correction</h2>
        <div className="card list">
          {fil.map((e) => (
            <div key={e.id} className="between" style={{ fontSize: 14, alignItems: 'flex-start' }}>
              <span><b>{e.who}</b> · {entryText(e)}</span>
              <span className="sub none">{e.date === date ? "aujourd'hui" : fmtShort(e.date)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sub" style={{ textAlign: 'center' }}>Rangée automatiquement dans la journée du {fmtShort(date)}.</div>
      <button
        className="btn primary"
        disabled={!canSave}
        onClick={() => {
          addNote(id, who, avis, text);
          back();
        }}
      >
        Enregistrer
      </button>
    </div>
  );
}
