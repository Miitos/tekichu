import { useState } from 'react';
import type { Session, Shot } from '../types';
import { nav } from '../router';
import { useStore } from '../store';
import { avisByDay, byDateDesc, daysAgo, fmtShort, hits, pct, pctText, plural, tatsuGroups, total } from '../lib';
import { avisLabel, stageLabel } from '../faults';
import { Mato } from '../components/Mato';

const PERIODS = [
  { days: 30, label: '30 j' },
  { days: 90, label: '3 mois' },
  { days: 365, label: '1 an' },
];
const LEVEL: Record<string, number> = { difficile: 9, pareil: 18, mieux: 30 };

function insight(shots: Shot[]): string {
  const placed = shots.filter((s) => s.x !== undefined && s.y !== undefined);
  if (placed.length < 5) return 'Pas encore assez de positions notées';
  const cx = placed.reduce((a, s) => a + (s.x ?? 0), 0) / placed.length;
  const cy = placed.reduce((a, s) => a + (s.y ?? 0), 0) / placed.length;
  if (Math.hypot(cx, cy) < 0.15) return 'Groupement centré';
  const angle = (Math.atan2(cx, -cy) + 2 * Math.PI) % (2 * Math.PI);
  const hour = Math.round((angle / (2 * Math.PI)) * 12) % 12 || 12;
  const haut = cy < -0.15 ? ', plutôt haut' : cy > 0.15 ? ', plutôt bas' : '';
  return `Groupement vers ${hour} h${haut}`;
}

/** Barres cliquables : une par journée ou par tournoi. */
function Bars({ items }: { items: Session[] }) {
  return (
    <div className="bars">
      {items.map((x, i) => {
        const p = pct(hits(x.shots), x.shots.length) ?? 0;
        return (
          <button key={x.id} className="bar" aria-label={`${fmtShort(x.date)} : ${p} %`} onClick={() => nav(`jour/${x.id}`)}>
            {(i === items.length - 1 || items.length <= 4) && <span>{p} %</span>}
            <i style={{ height: `${p}%` }} />
          </button>
        );
      })}
    </div>
  );
}

export function Progres() {
  const s = useStore();
  const [days, setDays] = useState(30);
  const [part, setPart] = useState<'corrections' | 'tournois'>('corrections');
  const from = daysAgo(days);
  const before = daysAgo(days * 2);
  const withShots = s.sessions.filter((x) => x.saved && x.shots.length > 0);
  const jours = withShots.filter((x) => x.kind === 'cours' && x.date > from).sort((a, b) => (a.date < b.date ? -1 : 1));
  const prev = withShots.filter((x) => x.kind === 'cours' && x.date > before && x.date <= from);
  const tournois = withShots.filter((x) => x.kind === 'tournoi' && x.date > from).sort((a, b) => (a.date < b.date ? -1 : 1));
  const t = total(jours);
  const tp = total(prev);
  const tt = total(tournois);
  const rate = pct(t.h, t.n);
  const prevRate = pct(tp.h, tp.n);
  const delta = rate !== null && prevRate !== null ? rate - prevRate : null;
  const bars = jours.slice(-8);
  const shots = jours.flatMap((x) => x.shots);
  const placed = shots.filter((x) => x.x !== undefined);

  let hayaH = 0, hayaN = 0, otoH = 0, otoN = 0;
  for (const x of jours)
    for (const g of tatsuGroups(x.shots, s.tatsu))
      g.forEach((shot, i) => {
        if (i % 2 === 0) { hayaN++; if (shot.hit) hayaH++; } else { otoN++; if (shot.hit) otoH++; }
      });

  const corrections = s.corrections.filter((c) => c.status === 'encours');
  const firstH = tournois.filter((x) => x.shots[0].hit).length;

  return (
    <div className="screen tabbed" style={{ gap: 12 }}>
      <div className="between">
        <h1>Progrès</h1>
        <div className="seg">
          {PERIODS.map((p) => (
            <button key={p.days} aria-pressed={days === p.days} onClick={() => setDays(p.days)} style={{ fontSize: 13 }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="dark" style={{ padding: 4, borderRadius: 14 }}>
        <div className="seg" style={{ background: 'none', padding: 0 }}>
          <button aria-pressed={part === 'corrections'} onClick={() => setPart('corrections')}>Corrections</button>
          <button aria-pressed={part === 'tournois'} onClick={() => setPart('tournois')}>Tournois</button>
        </div>
      </div>

      {part === 'corrections' && (
        <>
          {jours.length === 0 ? (
            <div className="card empty">Aucune flèche notée sur cette période. Le bouton cible, en bas, ouvre le tir à tout moment.</div>
          ) : (
            <div className="dark col" style={{ gap: 12, padding: '18px 20px 14px' }}>
              <div className="between" style={{ alignItems: 'flex-end' }}>
                <div className="col" style={{ gap: 4 }}>
                  <div className="label">Jours de tir</div>
                  <div className="big" style={{ fontSize: 48 }}>{pctText(t.h, t.n)}</div>
                </div>
                <div className="sub" style={{ textAlign: 'right', lineHeight: 1.5 }}>
                  {delta !== null && (
                    <>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-ink)' }}>{delta > 0 ? '+' : ''}{delta} {Math.abs(delta) > 1 ? 'points' : 'point'}</span>
                      <br />
                    </>
                  )}
                  {plural(jours.length, 'jour', 'jours')} · {plural(t.n, 'flèche', 'flèches')}
                </div>
              </div>
              <Bars items={bars} />
              <div className="between sub" style={{ fontSize: 12 }}>
                <span>{fmtShort(bars[0].date)}</span>
                <span>touche une barre pour voir la journée</span>
                <span>{bars.length > 1 ? fmtShort(bars[bars.length - 1].date) : ''}</span>
              </div>
            </div>
          )}

          <div className="col">
            <h2 className="label">Mes corrections, avis au fil des jours</h2>
            {corrections.length === 0 ? (
              <div className="card empty">Aucune correction en cours.</div>
            ) : (
              <div className="card list">
                {corrections.map((c) => {
                  const steps = avisByDay(c).slice(-5);
                  return (
                    <button key={c.id} className="rowbtn between" onClick={() => nav(`historique/${c.id}`)}>
                      <span className="col tight">
                        <span className="strong">{c.label}</span>
                        <span className="sub">{steps.length === 0 ? `${stageLabel(c.stage)} · pas encore d'avis` : steps.map((e) => avisLabel(e.avis)).join(', ')}</span>
                      </span>
                      {steps.length > 0 && (
                        <span className="trend" role="img" aria-label={`Dernier avis : ${avisLabel(steps[steps.length - 1].avis)}`}>
                          {steps.map((e) => (
                            <u key={e.id} style={{ height: LEVEL[e.avis ?? 'pareil'] }} />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {jours.length > 0 && (
            <div className="card row" style={{ gap: 14 }}>
              <div className="mini" style={{ width: 96, height: 96 }}>
                <Mato shots={placed} label="Carte cumulée des impacts" />
              </div>
              <div className="col" style={{ gap: 4 }}>
                <div className="label">Impacts</div>
                <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}>{insight(shots)}</div>
                <div className="sub">Haya {pctText(hayaH, hayaN)} · otoya {pctText(otoH, otoN)}</div>
              </div>
            </div>
          )}
        </>
      )}

      {part === 'tournois' &&
        (tournois.length === 0 ? (
          <div className="card empty">Aucun tournoi sur cette période. Le menu Tournois, en bas, permet d'en démarrer un.</div>
        ) : (
          <>
            <div className="dark col" style={{ gap: 12, padding: '18px 20px 14px' }}>
              <div className="between" style={{ alignItems: 'flex-end' }}>
                <div className="col" style={{ gap: 4 }}>
                  <div className="label">En tournoi</div>
                  <div className="big" style={{ fontSize: 48 }}>{pctText(tt.h, tt.n)}</div>
                </div>
                <div className="sub" style={{ textAlign: 'right', lineHeight: 1.5 }}>
                  {plural(tournois.length, 'tournoi', 'tournois')} · {plural(tt.n, 'flèche', 'flèches')}
                  <br />
                  jours de tir : {pctText(t.h, t.n)}
                </div>
              </div>
              <Bars items={tournois.slice(-8)} />
            </div>
            <div className="col">
              <h2 className="label">Résultats et notes</h2>
              <div className="card list">
                {[...tournois].sort(byDateDesc).map((x) => (
                  <button key={x.id} className="rowbtn col" style={{ alignItems: 'stretch', gap: 4 }} onClick={() => nav(`jour/${x.id}`)}>
                    <span className="between baseline">
                      <span className="strong">{x.name || 'Tournoi'} · {fmtShort(x.date)}</span>
                      <span className="strong none">{hits(x.shots)} sur {x.shots.length}</span>
                    </span>
                    {x.note && <span className="sub" style={{ lineHeight: 1.4 }}>{x.note}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="card between" style={{ fontSize: 14 }}>
              <span>Première flèche du tournoi</span>
              <b>{firstH} {firstH > 1 ? 'touchées' : 'touchée'} sur {tournois.length}</b>
            </div>
          </>
        ))}
    </div>
  );
}
