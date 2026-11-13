import { useEffect } from 'react';
import type { Entry } from '../types';
import { back, nav, replace } from '../router';
import { setStatus, useStore } from '../store';
import { avisByDay, entryText, fmtDate, fmtShort, hits, plural, workCount } from '../lib';
import { avisLabel, stageLabel } from '../faults';

const LEVEL: Record<string, number> = { difficile: 30, pareil: 60, mieux: 100 };

export function Historique({ id }: { id: string }) {
  const s = useStore();
  const c = s.corrections.find((x) => x.id === id);
  useEffect(() => {
    if (!c) replace('');
  }, [c]);
  if (!c) return null;

  const steps = avisByDay(c).slice(-5);
  const groups = new Map<string, Entry[]>();
  for (const e of c.entries) groups.set(e.date, [...(groups.get(e.date) ?? []), e]);
  const fil = [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  return (
    <div className="screen">
      <button className="link" style={{ alignSelf: 'flex-start', fontSize: 15 }} onClick={() => back()}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        Retour
      </button>
      <div className="col" style={{ gap: 4 }}>
        <div className="accent">
          {stageLabel(c.stage)} · {c.status === 'encours' ? `en cours depuis le ${fmtShort(c.createdAt)}` : `en veille${c.veilleAt ? ` depuis le ${fmtShort(c.veilleAt)}` : ''}`}
        </div>
        <h1 style={{ fontSize: 26 }}>{c.label}</h1>
      </div>

      <div className="dark col" style={{ gap: 12 }}>
        <div className="between baseline">
          <div className="label">Avis au fil des jours</div>
          <div className="sub">notée {plural(workCount(c), 'jour', 'jours')}</div>
        </div>
        {steps.length === 0 ? (
          <div className="sub" style={{ fontSize: 14 }}>Pas encore d'avis. Ouvre la correction dans la liste et touche Mieux, Pareil ou Difficile.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 6 }} role="img" aria-label={`Avis successifs : ${steps.map((e) => `${avisLabel(e.avis)} le ${fmtShort(e.date)}`).join(', ')}`}>
            {steps.map((e, i) => (
              <div key={e.id} className="col" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <div style={{ height: 76, display: 'flex', alignItems: 'flex-end' }}>
                  <div className={`step${i === steps.length - 1 ? ' last' : ''}`} style={{ height: `${LEVEL[e.avis ?? 'pareil']}%`, animationDelay: `${i * 0.06}s` }} />
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.35, textAlign: 'center', color: i === steps.length - 1 ? 'var(--dark-ink)' : 'var(--dark-muted)' }}>
                  {fmtShort(e.date)}
                  <br />
                  {avisLabel(e.avis)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col fill" style={{ gap: 6 }}>
        <h2 className="label">Tout ce qui a été noté</h2>
        <div className="card list">
          {fil.map(([date, entries]) => {
            const day = s.sessions.find((x) => x.kind === 'cours' && x.date === date);
            return (
              <div key={date} className="col" style={{ gap: 4 }}>
                <div className="between sub">
                  <b style={{ color: 'var(--ink)' }}>{fmtDate(date)}</b>
                  {day && day.shots.length > 0 && <span>{hits(day.shots)} sur {day.shots.length}</span>}
                </div>
                {entries.map((e) => (
                  <div key={e.id} style={{ fontSize: 14 }}>
                    <b>{e.who}</b> · {entryText(e)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="two">
        {c.status === 'encours' ? (
          <button className="btn outline" onClick={() => { setStatus(id, 'veille'); back(); }}>Mettre en veille</button>
        ) : (
          <button className="btn outline" onClick={() => setStatus(id, 'encours')}>Reprendre</button>
        )}
        <button className="btn primary" onClick={() => nav(`note/${id}`)}>+ Note</button>
      </div>
    </div>
  );
}
