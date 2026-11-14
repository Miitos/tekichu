import { t } from '../i18n';
import { useState } from 'react';
import { nav } from '../router';
import { activeTournoi, startTournoi, useStore } from '../store';
import { byDateDesc, fmtDate, fmtShort, hits, pctText, plural, total } from '../lib';

export function Tournois() {
  const s = useStore();
  const [name, setName] = useState('');
  const act = activeTournoi(s);
  const past = s.sessions.filter((x) => x.kind === 'tournoi' && x.saved).sort(byDateDesc);
  const tp = total(past);

  return (
    <div className="screen tabbed">
      <h1>{t('Tournois')}</h1>

      {act ? (
        <div className="dark col" style={{ padding: 16, gap: 10 }}>
          <div className="between">
            <span className="label">{t('Tournoi en cours')}{act.name ? ` · ${act.name}` : ''}</span>
            <span className="big" style={{ fontSize: 22 }}>{hits(act.shots)}/{act.shots.length}</span>
          </div>
          <button className="btn white" onClick={() => nav('tournoi')}>{t('Reprendre le tournoi')}</button>
        </div>
      ) : (
        <div className="dark col" style={{ padding: 16, gap: 10 }}>
          <label className="label" htmlFor="nom-tournoi">{t('Nouveau tournoi · nom facultatif')}</label>
          <input id="nom-tournoi" type="text" className="on-dark" value={name} onChange={(e) => setName(e.target.value)} />
          <button
            className="btn white"
            onClick={() => {
              startTournoi(name);
              setName('');
              nav('tournoi');
            }}
          >
            {t('Démarrer un tournoi')}
          </button>
        </div>
      )}

      <div className="col">
        <div className="between baseline">
          <h2 className="label">{t('Tournois passés')}</h2>
          {past.length > 0 && <span className="sub">{plural(past.length, 'tournoi', 'tournois')} · {pctText(tp.h, tp.n)}</span>}
        </div>
        {past.length === 0 ? (
          <div className="card empty">{t("Aucun tournoi pour l'instant.")}</div>
        ) : (
          <div className="card list">
            {past.map((x) => (
              <button key={x.id} className="rowbtn between" style={{ minHeight: 68 }} onClick={() => nav(`jour/${x.id}`)}>
                <span className="col tight">
                  <span className="strong">{x.name || t('Tournoi du {d}', { d: fmtShort(x.date) })}</span>
                  <span className="sub">{fmtDate(x.date)} · {t(x.note ? 'avec notes' : 'sans note')}</span>
                </span>
                <span className="big none" style={{ fontSize: 20 }}>
                  {hits(x.shots)}
                  <span className="sub" style={{ fontSize: 14, fontWeight: 500 }}> / {x.shots.length}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sub" style={{ lineHeight: 1.5 }}>{t('En tournoi : les résultats et des notes. Pas de corrections, et rien ne se mélange avec tes jours de tir.')}</div>
    </div>
  );
}
