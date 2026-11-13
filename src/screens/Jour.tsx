import { useEffect, useState } from 'react';
import { back, replace } from '../router';
import { deleteSession, setSessionText, useStore } from '../store';
import { entryText, fmtDate, hits, pctText, plural, tatsuGroups } from '../lib';
import { stageLabel } from '../faults';

/** Fiche d'une journée de tir ou d'un tournoi passé. */
export function Jour({ id }: { id: string }) {
  const s = useStore();
  const ses = s.sessions.find((x) => x.id === id);
  const [note, setNote] = useState(ses?.note ?? '');
  const [name, setName] = useState(ses?.name ?? '');
  useEffect(() => {
    if (!ses) replace('progres');
  }, [ses]);
  if (!ses) return null;

  const tournoi = ses.kind === 'tournoi';
  const groups = tatsuGroups(ses.shots, s.tatsu);
  const h = hits(ses.shots);
  const notes = tournoi
    ? []
    : s.corrections.flatMap((c) => c.entries.filter((e) => e.sessionId === id || (!e.sessionId && e.date === ses.date)).map((e) => ({ id: e.id, label: c.label, meta: `${stageLabel(c.stage)} · ${e.who} · ${entryText(e)}` })));
  const mot = tournoi ? 'ce tournoi' : 'cette journée';

  return (
    <div className="screen" style={{ gap: 12 }}>
      <div className="between">
        <div className="col tight">
          <div className="sub">{tournoi ? 'Tournoi' : 'Jour de tir'}</div>
          <h1 className="small">{fmtDate(ses.date, true)}</h1>
        </div>
        <button className="link" style={{ fontSize: 15 }} onClick={() => back('progres')}>Fermer</button>
      </div>

      {tournoi && (
        <div className="col" style={{ gap: 6 }}>
          <label className="label" htmlFor="nom">Nom du tournoi · facultatif</label>
          <input id="nom" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}

      <div className="dark between">
        <div className="col" style={{ gap: 4 }}>
          <div className="label">Résultat</div>
          <div className="row" style={{ gap: 6, alignItems: 'baseline' }}>
            <span className="big" style={{ fontSize: 52 }}>{h}</span>
            <span className="sub" style={{ fontSize: 20 }}>/ {ses.shots.length}</span>
          </div>
          <div className="sub" style={{ fontSize: 14 }}>{pctText(h, ses.shots.length)} · {plural(groups.length, 'tachi', 'tachi')}</div>
        </div>
        <div className="col" style={{ gap: 6, maxHeight: 140, overflowY: 'auto' }} role="img" aria-label={`${h} flèches touchées sur ${ses.shots.length}`}>
          {groups.map((g, i) => (
            <div key={i} className="row" style={{ gap: 4 }}>
              {g.map((shot, j) => (
                <span key={j} className={`mark sm ${shot.hit ? 'hit' : 'miss'}`}>{shot.hit ? '○' : '×'}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {!tournoi && (
        <div className="col" style={{ gap: 6 }}>
          <h2 className="label">Notes de la journée</h2>
          {notes.length === 0 ? (
            <div className="card empty">Aucune note sur tes corrections ce jour-là.</div>
          ) : (
            <div className="card list">
              {notes.map((r) => (
                <div key={r.id} className="col tight">
                  <span className="strong">{r.label}</span>
                  <span className="sub">{r.meta}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="col fill" style={{ gap: 6 }}>
        <label className="label" htmlFor="note-jour">{tournoi ? 'Notes du tournoi' : 'Note libre de la journée · facultatif'}</label>
        <textarea id="note-jour" className="fill" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button
        className="btn primary"
        onClick={() => {
          setSessionText(id, note.trim(), tournoi ? name.trim() : undefined);
          back('progres');
        }}
      >
        Enregistrer
      </button>
      <button
        className="link danger"
        style={{ alignSelf: 'center' }}
        onClick={() => {
          if (window.confirm(`Supprimer ${mot}, ses flèches et ses notes ? Cette action est définitive.`)) {
            deleteSession(id);
            back('progres');
          }
        }}
      >
        Supprimer {mot}
      </button>
    </div>
  );
}
