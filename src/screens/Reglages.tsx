import { useRef, useState } from 'react';
import { addSensei, getState, importState, removeSensei, setTatsu, useStore } from '../store';
import { plural, today } from '../lib';

export function Reglages() {
  const s = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const jours = s.sessions.filter((x) => x.kind === 'cours').length;
  const tournois = s.sessions.filter((x) => x.kind === 'tournoi').length;

  function exporter() {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tekichu-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Sauvegarde téléchargée.');
  }

  async function importer(f: File) {
    try {
      const data = JSON.parse(await f.text());
      if (!window.confirm('Remplacer toutes les données de cet appareil par celles du fichier ?')) return;
      setMsg(importState(data) ? 'Données restaurées.' : "Ce fichier n'est pas une sauvegarde de Tekichū.");
    } catch {
      setMsg('Fichier illisible.');
    }
  }

  return (
    <div className="screen tabbed">
      <h1>Réglages</h1>

      <div className="col">
        <h2 className="label">Flèches par tachi</h2>
        <div className="seg">
          <button aria-pressed={s.tatsu === 2} onClick={() => setTatsu(2)}>2 flèches</button>
          <button aria-pressed={s.tatsu === 4} onClick={() => setTatsu(4)}>4 flèches</button>
        </div>
      </div>

      <div className="col">
        <h2 className="label">Sensei</h2>
        <div className="card list">
          {s.senseis.map((n) => (
            <div key={n} className="between">
              <span className="strong">{n}</span>
              <button className="link danger" onClick={() => removeSensei(n)}>Retirer</button>
            </div>
          ))}
          <button
            className="link"
            onClick={() => {
              const n = window.prompt('Nom du sensei');
              if (n) addSensei(n);
            }}
          >
            + Ajouter un sensei
          </button>
        </div>
        <div className="sub">Retirer un nom de la liste ne modifie pas les notes déjà prises.</div>
      </div>

      <div className="col">
        <h2 className="label">Sauvegarde</h2>
        <div className="sub" style={{ fontSize: 14, lineHeight: 1.5 }}>
          Tes données restent sur cet appareil : {plural(jours, 'jour de tir', 'jours de tir')}, {plural(tournois, 'tournoi', 'tournois')}, {plural(s.corrections.length, 'correction', 'corrections')}. Télécharge une sauvegarde de temps en temps, surtout avant de changer de téléphone ou de vider le navigateur.
        </div>
        <button className="btn primary" onClick={exporter}>Télécharger une sauvegarde</button>
        <button className="btn outline" onClick={() => file.current?.click()}>Restaurer depuis un fichier</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void importer(f); e.target.value = ''; }} />
        {msg && <div className="strong" role="status">{msg}</div>}
      </div>
    </div>
  );
}
