import { t } from '../i18n';
import { useEffect } from 'react';
import type { Kind, Shot } from '../types';
import { nav, replace } from '../router';
import { activeTournoi, addShot, dayOf, finishTournoi, moveLastShot, setSessionText, undoShot, useStore } from '../store';
import { fmtDate, hits, lastAvis, tatsuGroups, today } from '../lib';
import { faultLabel, stageLabel } from '../faults';
import { Mato } from '../components/Mato';

/** Écran de tir. « cours » = la journée (rien à démarrer ni à terminer), « tournoi » = le tournoi en cours. */
export function Tir({ mode }: { mode: Kind }) {
  const s = useStore();
  const tournoi = mode === 'tournoi';
  const ses = tournoi ? activeTournoi(s) : dayOf(s);
  useEffect(() => {
    if (tournoi && !ses) replace('tournois');
  }, [tournoi, ses]);
  if (tournoi && !ses) return null;

  const shots = ses?.shots ?? [];
  const size = s.tatsu;
  const n = shots.length;
  // On reste sur le tachi de la dernière flèche tant que la suivante n'est pas tirée, pour pouvoir l'ajuster.
  const tIdx = n === 0 ? 0 : Math.floor((n - 1) / size);
  const cur = shots.slice(tIdx * size, tIdx * size + size);
  const full = cur.length === size;
  const prev = tatsuGroups(shots, size).slice(0, tIdx);
  const last = cur[cur.length - 1];
  const enCours = tournoi ? [] : s.corrections.filter((c) => c.status === 'encours');
  // Kaichū (皆中) : toutes les flèches du tachi dans la cible.
  const kaichu = full && cur.every((x) => x.hit);
  const date = today();

  function shoot(shot: Shot) {
    addShot(mode, shot);
    // Petit retour haptique là où le téléphone le permet.
    navigator.vibrate?.(shot.hit ? 14 : [8, 50, 8]);
  }

  const hint = last
    ? last.x !== undefined
      ? t('Flèche {n} notée {m} · glisse pour ajuster', { n: cur.length, m: last.hit ? '○' : '×' })
      : t('Flèche {n} notée {m} sans position', { n: cur.length, m: last.hit ? '○' : '×' })
    : t("Touche l'impact : dans la cible ○, dans l'azuchi ×");

  return (
    <div className="screen" style={{ gap: 10, overflow: 'hidden' }}>
      <div className="between">
        <div className="col tight">
          {tournoi ? (
            <div className="sub" style={{ color: 'var(--red-d)', fontWeight: 600 }}>{t('Tournoi')}{ses?.name ? ` · ${ses.name}` : ''}</div>
          ) : (
            <div className="sub">{t("Aujourd'hui")} · {fmtDate(date)}</div>
          )}
          <h1 className="small">{t('Tachi {n}', { n: tIdx + 1 })}{full ? t(' · complet') : ''}</h1>
        </div>
        {tournoi ? (
          <button
            className="pill inv"
            onClick={() => {
              finishTournoi();
              nav('tournois');
            }}
          >
            {t('Terminer')}
          </button>
        ) : (
          <button className="pill" onClick={() => nav('')}>{t('Fermer')}</button>
        )}
      </div>

      {enCours.length > 0 && (
        <div className="col" style={{ gap: 6 }}>
          <div className="label red">{t('Mes corrections · touche pour noter')}</div>
          <div className="chips scroll">
            {enCours.map((c) => {
              const noted = c.entries.some((e) => e.date === date);
              return (
                <button key={c.id} className="chip two-lines" onClick={() => nav(`note/${c.id}`)}>
                  <span>{faultLabel(c.label)}</span>
                  <small>{stageLabel(c.stage)}{noted && lastAvis(c) ? ` · ${lastAvis(c)}` : ''}</small>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="card row" style={{ padding: '10px 14px', gap: 10 }}>
        <div className="col tight">
          <div className="row" style={{ gap: 4, alignItems: 'baseline' }}>
            <span key={hits(shots)} className="big bump" style={{ fontSize: 34 }}>{hits(shots)}</span>
            <span className="sub" style={{ fontSize: 16 }}>/ {n}</span>
          </div>
          {prev.length > 0 && (
            <div className="sub" style={{ fontSize: 12 }}>
              {prev.slice(-2).map((g, i) => `T${tIdx - Math.min(prev.length, 2) + i + 1} ${hits(g)}/${g.length}`).join(' · ')}
            </div>
          )}
        </div>
        <div className="row" style={{ gap: 6, marginLeft: 'auto' }}>
          {Array.from({ length: size }, (_, i) => {
            const shot = cur[i];
            const cls = shot ? (shot.hit ? 'hit' : 'miss') : i === cur.length ? 'next' : 'empty';
            return (
              <div key={i} className="slot">
                <span className={`mark ${cls}`}>{shot ? (shot.hit ? '○' : '×') : ''}</span>
                <span>{t(i % 2 === 0 ? 'haya' : 'otoya')}</span>
              </div>
            );
          })}
        </div>
        <button className="check ghost" aria-label={t('Annuler la dernière flèche')} disabled={n === 0} onClick={() => undoShot(mode)}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 7L4 12l5 5" />
            <path d="M4 12h10a5 5 0 0 1 0 10h-3" />
          </svg>
        </button>
      </div>

      <div className="azuchi" style={tournoi ? { minHeight: 200 } : undefined}>
        <Mato
          shots={cur}
          numbered
          label={t("Mato dans l'azuchi. Touche l'endroit de l'impact.")}
          onTap={(x, y) => shoot({ hit: Math.hypot(x, y) <= 1, x, y })}
          onMove={(x, y) => moveLastShot(mode, x, y)}
        />
        <div className="hint">{hint}</div>
        {kaichu && (
          <div className="kaichu" role="status" aria-label={t('Kaichū : toutes les flèches du tachi ont touché')}>
            皆中<small>KAICHŪ</small>
          </div>
        )}
      </div>

      <div className="two">
        <button className="btn outline tall" style={{ fontSize: 18 }} onClick={() => shoot({ hit: false })}>
          {t('× Manqué')}<small>{t('sans position')}</small>
        </button>
        <button className="btn primary tall" onClick={() => shoot({ hit: true })}>
          {t('○ Touché')}<small>{t('sans position')}</small>
        </button>
      </div>

      {tournoi && ses ? (
        <div className="col" style={{ gap: 6 }}>
          <label className="label" htmlFor="notes-tournoi">{t('Notes du tournoi')}</label>
          <textarea id="notes-tournoi" style={{ minHeight: 84, height: 84 }} value={ses.note} onChange={(e) => setSessionText(ses.id, e.target.value)} placeholder={t('Ce que tu retiens, à compléter quand tu veux…')} />
        </div>
      ) : (
        <div className="sub" style={{ textAlign: 'center' }}>{t('Chaque flèche est enregistrée dans la journée. Rien à terminer.')}</div>
      )}
    </div>
  );
}
