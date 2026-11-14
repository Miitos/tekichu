import { t } from '../i18n';
import { useState } from 'react';
import { back } from '../router';
import { addSensei, saveCorrections, useStore } from '../store';
import { FAULTS, MOI, STAGES, faultLabel, stageLabel, whoLabel } from '../faults';

type Pick = { stage: string; label: string };

export function WhoChips({ who, setWho }: { who: string; setWho: (w: string) => void }) {
  const s = useStore();
  return (
    <div className="chips">
      {[...s.senseis, MOI].map((w) => (
        <button key={w} className="chip who" aria-pressed={who === w} onClick={() => setWho(w)}>{whoLabel(w)}</button>
      ))}
      <button
        className="chip dashed"
        onClick={() => {
          const name = window.prompt(t('Nom du sensei'));
          if (name && name.trim()) {
            addSensei(name);
            setWho(name.trim());
          }
        }}
      >
        {t('+ Sensei')}
      </button>
    </div>
  );
}

/** Nouvelle correction : qui l'a donnée, à quelle étape, quel défaut. Sans clavier. */
export function Correction() {
  const s = useStore();
  const [who, setWho] = useState(s.senseis[0] ?? MOI);
  const [stage, setStage] = useState('hikiwake');
  const [picked, setPicked] = useState<Record<string, Pick>>({});
  const [text, setText] = useState('');

  const key = (p: Pick) => `${p.stage}|${p.label}`;
  const toggle = (p: Pick) =>
    setPicked((cur) => {
      const next = { ...cur };
      if (next[key(p)]) delete next[key(p)];
      else next[key(p)] = p;
      return next;
    });
  const items = Object.values(picked);
  const count = items.length;
  const canSave = count > 0 || text.trim() !== '';
  const suivies = new Set(s.corrections.filter((c) => c.status === 'encours').map((c) => key(c)));

  function save() {
    if (count > 0) saveCorrections({ who, items, text });
    else saveCorrections({ who, items: [{ stage, label: text.trim() }], text: '' });
    back();
  }

  return (
    <div className="screen" style={{ gap: 12 }}>
      <div className="between">
        <div className="col tight">
          <div className="sub">{t("Qui l'a donnée, à quelle étape, quel défaut")}</div>
          <h1 className="small">{t('Nouvelle correction')}</h1>
        </div>
        <button className="link" style={{ fontSize: 15 }} onClick={() => back()}>{t('Fermer')}</button>
      </div>

      <WhoChips who={who} setWho={setWho} />

      <div className="col" style={{ gap: 6 }}>
        <h2 className="label">{t('Étape')}</h2>
        <div className="stages">
          {STAGES.map((st) => (
            <button key={st.id} className="stage" aria-pressed={stage === st.id} onClick={() => setStage(st.id)}>{stageLabel(st.id)}</button>
          ))}
        </div>
      </div>

      <div className="col fill" style={{ gap: 6 }}>
        <h2 className="label">{t('Défauts connus')} · {stageLabel(stage)}</h2>
        <div className="chips">
          {FAULTS[stage].map((label) => {
            const p = { stage, label };
            return (
              <button key={label} className="chip" aria-pressed={!!picked[key(p)]} onClick={() => toggle(p)}>
                {faultLabel(label)}
                {suivies.has(key(p)) ? t(' · déjà suivi') : ''}
              </button>
            );
          })}
        </div>
        {text && <div className="sub" style={{ fontSize: 14 }}>{t('Mot libre : {t}', { t: text })}</div>}
      </div>

      <div className="row" style={{ gap: 10 }}>
        <button
          className="btn outline"
          onClick={() => {
            const v = window.prompt(count > 0 ? t('Précision (facultatif)') : `${t('Correction libre')} · ${stageLabel(stage)}`, text);
            if (v !== null) setText(v);
          }}
        >
          {t('Mot libre')}
        </button>
        <button className="btn primary grow" disabled={!canSave} onClick={save}>
          {count > 1 ? t('Enregistrer · {n} corrections', { n: count }) : t('Enregistrer')}
        </button>
      </div>
    </div>
  );
}
