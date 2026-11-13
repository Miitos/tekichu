import { useState } from 'react';
import { nav } from '../router';
import { dayOf, quickAvis, setStatus, setTodayAvis, useStore } from '../store';
import { fmtDate, fmtShort, hits, lastAvis, pctText, plural, today, workCount } from '../lib';
import { AVIS, stageLabel } from '../faults';

export function Dots({ n }: { n: number }) {
  return (
    <div className="dots" role="img" aria-label={`Notée ${plural(n, 'jour', 'jours')}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className={i < n ? 'on' : ''} />
      ))}
    </div>
  );
}

export function Corrections() {
  const s = useStore();
  const [tab, setTab] = useState<'encours' | 'veille'>('encours');
  const [open, setOpen] = useState<string | null>(null);
  const date = today();
  const day = dayOf(s);
  const enCours = s.corrections.filter((c) => c.status === 'encours');
  const veille = s.corrections.filter((c) => c.status === 'veille').sort((a, b) => ((a.veilleAt ?? '') < (b.veilleAt ?? '') ? 1 : -1));
  const notes = s.corrections.reduce((n, c) => n + c.entries.filter((e) => e.date === date).length, 0);
  const shots = day?.shots ?? [];

  return (
    <div className="screen tabbed">
      <div className="between" style={{ alignItems: 'flex-end' }}>
        <div className="col tight">
          <div className="sub">{fmtDate(date, true)}</div>
          <h1>Corrections</h1>
        </div>
        <button className="pill inv" onClick={() => nav('correction')}>+ Correction</button>
      </div>

      <button className="dark between" style={{ border: 'none', textAlign: 'left', padding: '14px 18px' }} onClick={() => nav('tir')}>
        <span className="col" style={{ gap: 3 }}>
          <span className="label">Aujourd'hui</span>
          <span className="strong">
            {shots.length === 0 && notes === 0
              ? 'Rien encore · touche pour tirer'
              : [shots.length > 0 ? `${hits(shots)} ${hits(shots) > 1 ? 'touchées' : 'touchée'} sur ${shots.length}` : 'Pas encore de flèche', notes > 0 ? plural(notes, 'note', 'notes') : ''].filter(Boolean).join(' · ')}
          </span>
        </span>
        {shots.length > 0 && <span key={hits(shots)} className="big bump" style={{ fontSize: 30 }}>{pctText(hits(shots), shots.length)}</span>}
      </button>

      <div className="seg">
        <button aria-pressed={tab === 'encours'} onClick={() => setTab('encours')}>En cours · {enCours.length}</button>
        <button aria-pressed={tab === 'veille'} onClick={() => setTab('veille')}>En veille · {veille.length}</button>
      </div>

      {tab === 'encours' &&
        (enCours.length === 0 ? (
          <div className="card empty">Aucune correction en cours. Le bouton « + Correction » en ajoute une, sans clavier : qui l'a donnée, à quelle étape, quel défaut.</div>
        ) : (
          <div className="card list" style={{ padding: '0 14px' }}>
            {enCours.map((c) => {
              const mine = quickAvis(c);
              const noted = c.entries.some((e) => e.date === date);
              const avis = lastAvis(c);
              return (
                <div key={c.id} className="col" style={{ gap: 10, padding: '14px 0' }}>
                  <button className="rowbtn between" style={{ padding: 0 }} aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)}>
                    <span className="col tight">
                      <span className="strong">{c.label}</span>
                      <span className="sub">{stageLabel(c.stage)} · {noted ? "noté aujourd'hui" : avis ? `dernier avis : ${avis}` : "pas encore d'avis"}</span>
                    </span>
                    <Dots n={workCount(c)} />
                  </button>
                  {open === c.id && (
                    <>
                      <div className="label">Aujourd'hui, c'est</div>
                      <div className="three" style={{ gap: 6 }}>
                        {AVIS.map((a) => (
                          <button key={a.id} className="avis" style={{ height: 48, fontSize: 15 }} aria-pressed={mine === a.id} onClick={() => setTodayAvis(c.id, a.id)}>{a.label}</button>
                        ))}
                      </div>
                      <div className="three" style={{ gap: 6 }}>
                        <button className="btn sm outline" onClick={() => nav(`note/${c.id}`)}>+ Note</button>
                        <button className="btn sm outline" onClick={() => nav(`historique/${c.id}`)}>Historique</button>
                        <button className="btn sm outline" onClick={() => { setStatus(c.id, 'veille'); setOpen(null); }}>En veille</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}

      {tab === 'veille' &&
        (veille.length === 0 ? (
          <div className="card empty">Rien en veille. Une correction mise en veille reste ici, prête à être reprise.</div>
        ) : (
          <div className="card list">
            {veille.map((c) => (
              <div key={c.id} className="between">
                <button className="rowbtn grow" style={{ padding: 0 }} onClick={() => nav(`historique/${c.id}`)}>
                  <span className="col tight">
                    <span className="strong">{c.label}</span>
                    <span className="sub">{stageLabel(c.stage)} · {plural(workCount(c), 'jour', 'jours')}{c.veilleAt ? ` · en veille le ${fmtShort(c.veilleAt)}` : ''}</span>
                  </span>
                </button>
                <button className="btn sm outline none" onClick={() => setStatus(c.id, 'encours')}>Reprendre</button>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
