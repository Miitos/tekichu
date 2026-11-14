import { t } from '../i18n';
import { nav } from '../router';
import { activeTournoi, useStore } from '../store';

const ICONS: Record<string, JSX.Element> = {
  corrections: (<><path d="M9 11l3 3 8-8" /><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" /></>),
  tournois: (<><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5v1a3 3 0 0 0 3 3" /><path d="M16 6h3v1a3 3 0 0 1-3 3" /><path d="M12 13v4" /><path d="M8 20h8" /></>),
  progres: (<><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M22 20H2" /></>),
  reglages: (<><path d="M4 7h9" /><path d="M19 7h1" /><circle cx="16" cy="7" r="2.5" /><path d="M4 17h1" /><path d="M11 17h9" /><circle cx="8" cy="17" r="2.5" /></>),
};

function Tab({ id, label, current, dot }: { id: string; label: string; current: string; dot?: boolean }) {
  return (
    <button className="tab" aria-current={current === id ? 'page' : undefined} onClick={() => nav(id === 'corrections' ? '' : id)}>
      <span style={{ position: 'relative', display: 'flex' }}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {ICONS[id]}
        </svg>
        {dot && <span className="tab-dot" />}
      </span>
      <span>{label}{dot ? t(' · en cours') : ''}</span>
    </button>
  );
}

// Rayons des anneaux de la mato kasumi, pour l'icône du bouton « Tirer ».
const RINGS = [32, 26.1, 20.8, 18.1, 12.8, 6.4];

export function TabBar({ current }: { current: string }) {
  const s = useStore();
  return (
    <nav className="tabbar" aria-label={t('Navigation principale')}>
      <Tab id="corrections" label={t('Corrections')} current={current} />
      <Tab id="tournois" label={t('Tournois')} current={current} dot={!!activeTournoi(s)} />
      <button className="tirer" onClick={() => nav('tir')}>
        <svg aria-hidden="true" width="64" height="64" viewBox="0 0 64 64">
          {RINGS.map((r, i) => (
            <circle key={r} cx="32" cy="32" r={r} className={i % 2 === 0 ? 'ring-a' : 'ring-b'} />
          ))}
        </svg>
        <span>{t('Tirer')}</span>
      </button>
      <Tab id="progres" label={t('Progrès')} current={current} />
      <Tab id="reglages" label={t('Réglages')} current={current} />
    </nav>
  );
}
