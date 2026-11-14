import { useRef, useState } from 'react';
import { addSensei, getState, importState, removeSensei, setTatsu, useStore } from '../store';
import { plural, today } from '../lib';
import { setLang, setTheme, t, usePrefs } from '../i18n';
import type { Lang, Theme } from '../i18n';

const THEMES: { id: Theme; label: string }[] = [{ id: 'auto', label: 'Auto' }, { id: 'light', label: 'Clair' }, { id: 'dark', label: 'Sombre' }];
// Chaque langue est écrite dans sa propre langue, pour être retrouvée quelle que soit celle affichée.
const LANGS: { id: Lang; label: string }[] = [{ id: 'fr', label: 'Français' }, { id: 'en', label: 'English' }, { id: 'ja', label: '日本語' }];

export function Reglages() {
  const s = useStore();
  const prefs = usePrefs();
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
    setMsg(t('Sauvegarde téléchargée.'));
  }

  async function importer(f: File) {
    try {
      const data = JSON.parse(await f.text());
      if (!window.confirm(t('Remplacer toutes les données de cet appareil par celles du fichier ?'))) return;
      setMsg(t(importState(data) ? 'Données restaurées.' : "Ce fichier n'est pas une sauvegarde de Tekichū."));
    } catch {
      setMsg(t('Fichier illisible.'));
    }
  }

  return (
    <div className="screen tabbed">
      <h1>{t('Réglages')}</h1>

      <div className="col">
        <h2 className="label">{t('Apparence')}</h2>
        <div className="seg">
          {THEMES.map((x) => (
            <button key={x.id} aria-pressed={prefs.theme === x.id} onClick={() => setTheme(x.id)}>{t(x.label)}</button>
          ))}
        </div>
      </div>

      <div className="col">
        <h2 className="label">{t('Langue')}</h2>
        <div className="seg">
          {LANGS.map((x) => (
            <button key={x.id} lang={x.id} aria-pressed={prefs.lang === x.id} onClick={() => setLang(x.id)}>{x.label}</button>
          ))}
        </div>
      </div>

      <div className="col">
        <h2 className="label">{t('Flèches par tachi')}</h2>
        <div className="seg">
          <button aria-pressed={s.tatsu === 2} onClick={() => setTatsu(2)}>{t('2 flèches')}</button>
          <button aria-pressed={s.tatsu === 4} onClick={() => setTatsu(4)}>{t('4 flèches')}</button>
        </div>
      </div>

      <div className="col">
        <h2 className="label">{t('Sensei')}</h2>
        <div className="card list">
          {s.senseis.map((n) => (
            <div key={n} className="between">
              <span className="strong">{n}</span>
              <button className="link danger" onClick={() => removeSensei(n)}>{t('Retirer')}</button>
            </div>
          ))}
          <button
            className="link"
            onClick={() => {
              const n = window.prompt(t('Nom du sensei'));
              if (n) addSensei(n);
            }}
          >
            {t('+ Ajouter un sensei')}
          </button>
        </div>
        <div className="sub">{t('Retirer un nom de la liste ne modifie pas les notes déjà prises.')}</div>
      </div>

      <div className="col">
        <h2 className="label">{t('Sauvegarde')}</h2>
        <div className="sub" style={{ fontSize: 14, lineHeight: 1.5 }}>
          {t('Tes données restent sur cet appareil : {a}, {b}, {c}. Télécharge une sauvegarde de temps en temps, surtout avant de changer de téléphone ou de vider le navigateur.', { a: plural(jours, 'jour de tir', 'jours de tir'), b: plural(tournois, 'tournoi', 'tournois'), c: plural(s.corrections.length, 'correction', 'corrections') })}
        </div>
        <button className="btn primary" onClick={exporter}>{t('Télécharger une sauvegarde')}</button>
        <button className="btn outline" onClick={() => file.current?.click()}>{t('Restaurer depuis un fichier')}</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void importer(f); e.target.value = ''; }} />
        {msg && <div className="strong" role="status">{msg}</div>}
      </div>
    </div>
  );
}
