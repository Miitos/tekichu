import { t } from '../i18n';
import { useEffect, useState } from 'react';
import type { Avis } from '../types';
import { back, replace } from '../router';
import { addNote, useStore } from '../store';
import { AVIS, MOI, avisLabel, faultLabel, stageLabel, whoLabel } from '../faults';
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
          <div className="sub">{t('Note')} · {stageLabel(corr.stage)} · {fmtDate(date)}</div>
          <h1 className="small">{faultLabel(corr.label)}</h1>
        </div>
        <button className="link" style={{ fontSize: 15 }} onClick={() => back()}>{t('Fermer')}</button>
      </div>

      <div className="col" style={{ gap: 6 }}>
        <h2 className="label">{t('Qui parle')}</h2>
        <WhoChips who={who} setWho={setWho} />
      </div>

      <div className="col" style={{ gap: 6 }}>
        <h2 className="label">{t("Aujourd'hui, c'est · facultatif")}</h2>
        <div className="three">
          {AVIS.map((a) => (
            <button key={a.id} className="avis" style={{ height: 56 }} aria-pressed={avis === a.id} onClick={() => setAvis(avis === a.id ? null : a.id)}>{avisLabel(a.id)}</button>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 6 }}>
        <label className="label" htmlFor="note">{t('Note · facultatif')}</label>
        <textarea id="note" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Ce que le sensei a dit, ce que tu as senti…')} />
      </div>

      <div className="col fill" style={{ gap: 6 }}>
        <h2 className="label">{t('Déjà noté sur cette correction')}</h2>
        <div className="card list">
          {fil.map((e) => (
            <div key={e.id} className="between" style={{ fontSize: 14, alignItems: 'flex-start' }}>
              <span><b>{whoLabel(e.who)}</b> · {entryText(e)}</span>
              <span className="sub none">{e.date === date ? t("aujourd'hui") : fmtShort(e.date)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sub" style={{ textAlign: 'center' }}>{t('Rangée automatiquement dans la journée du {d}.', { d: fmtShort(date) })}</div>
      <button
        className="btn primary"
        disabled={!canSave}
        onClick={() => {
          addNote(id, who, avis, text);
          back();
        }}
      >
        {t('Enregistrer')}
      </button>
    </div>
  );
}
