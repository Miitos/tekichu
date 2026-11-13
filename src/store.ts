import { useSyncExternalStore } from 'react';
import type { Avis, Correction, Kind, Session, Shot, State } from './types';
import { today } from './lib';
import { MOI, RENAMES } from './faults';

const KEY = 'kyudo-carnet-v1';

const empty = (): State => ({ v: 1, sessions: [], corrections: [], positives: [], senseis: [], activeId: null, nextFocus: [], tatsu: 4 });

/** Met à niveau des données enregistrées par une version précédente de l'app. */
function migrate(st: State): State {
  for (const c of [...st.corrections, ...st.positives]) {
    const r = RENAMES[c.label];
    if (r) {
      c.label = r.label;
      if (r.stage) c.stage = r.stage;
    }
  }
  // Il n'y a plus de « cours » à démarrer ou terminer : chaque jour de tir est une journée, toujours enregistrée.
  for (const s of st.sessions) if (s.kind === 'cours') s.saved = true;
  const a = st.sessions.find((s) => s.id === st.activeId);
  if (!a || a.kind !== 'tournoi' || a.saved) st.activeId = null;
  return st;
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 1) return migrate({ ...empty(), ...s });
    }
  } catch {
    // données illisibles : on repart de zéro sans écraser tant que rien n'est modifié
  }
  return empty();
}

let state: State = load();
const subs = new Set<() => void>();

function mutate(fn: (d: State) => void) {
  const d: State = structuredClone(state);
  fn(d);
  state = d;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // stockage plein ou indisponible : l'état reste en mémoire
  }
  subs.forEach((f) => f());
}

export const getState = () => state;

export function useStore(): State {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    },
    getState,
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** La journée de tir d'une date, si elle existe. */
export const dayOf = (s: State, date: string = today()): Session | undefined => s.sessions.find((x) => x.kind === 'cours' && x.date === date);

/** Le tournoi en cours, s'il y en a un. */
export const activeTournoi = (s: State): Session | undefined => s.sessions.find((x) => x.id === s.activeId && x.kind === 'tournoi');

/** La journée se crée toute seule à la première flèche ou à la première note. */
function ensureDay(d: State, date: string = today()): Session {
  let day = dayOf(d, date);
  if (!day) {
    day = { id: uid(), date, kind: 'cours', shots: [], note: '', name: '', focus: [], saved: true };
    d.sessions.push(day);
  }
  return day;
}

const target = (d: State, mode: Kind): Session | undefined => (mode === 'tournoi' ? activeTournoi(d) : ensureDay(d));

export function addShot(mode: Kind, shot: Shot) {
  mutate((d) => {
    target(d, mode)?.shots.push(shot);
  });
}

export function moveLastShot(mode: Kind, x: number, y: number) {
  mutate((d) => {
    const s = mode === 'tournoi' ? activeTournoi(d) : dayOf(d);
    if (!s || s.shots.length === 0) return;
    s.shots[s.shots.length - 1] = { hit: Math.hypot(x, y) <= 1, x, y };
  });
}

export function undoShot(mode: Kind) {
  mutate((d) => {
    (mode === 'tournoi' ? activeTournoi(d) : dayOf(d))?.shots.pop();
  });
}

export function startTournoi(name: string): string {
  const cur = activeTournoi(state);
  if (cur) return cur.id;
  const id = uid();
  mutate((d) => {
    d.sessions.push({ id, date: today(), kind: 'tournoi', shots: [], note: '', name: name.trim(), focus: [], saved: false });
    d.activeId = id;
  });
  return id;
}

export function finishTournoi() {
  mutate((d) => {
    const s = activeTournoi(d);
    if (s) s.saved = true;
    d.activeId = null;
  });
}

/** Note libre et nom d'une journée ou d'un tournoi. */
export function setSessionText(id: string, note: string, name?: string) {
  mutate((d) => {
    const s = d.sessions.find((x) => x.id === id);
    if (!s) return;
    s.note = note;
    if (name !== undefined) s.name = name;
  });
}

/** Nouvelles corrections. Un défaut déjà suivi reçoit une note au lieu de créer un doublon. */
export function saveCorrections(p: { who: string; items: { stage: string; label: string }[]; text: string }) {
  mutate((d) => {
    const day = ensureDay(d);
    const text = p.text.trim() || undefined;
    for (const it of p.items) {
      const existing = d.corrections.find((c) => c.stage === it.stage && c.label === it.label);
      if (existing) {
        existing.entries.push({ id: uid(), sessionId: day.id, date: day.date, who: p.who, type: 'remarque', text });
        existing.status = 'encours';
        delete existing.veilleAt;
      } else {
        d.corrections.push({ id: uid(), stage: it.stage, label: it.label, status: 'encours', createdAt: day.date, entries: [{ id: uid(), sessionId: day.id, date: day.date, who: p.who, type: 'origine', text }] });
      }
    }
  });
}

/** Note sur une correction, avec ou sans avis. Elle se range dans la journée. */
export function addNote(corrId: string, who: string, avis: Avis | null, text: string) {
  mutate((d) => {
    const c = d.corrections.find((x) => x.id === corrId);
    if (!c) return;
    const day = ensureDay(d);
    const t = text.trim() || undefined;
    if (avis) c.entries.push({ id: uid(), sessionId: day.id, date: day.date, who, type: 'avis', avis, text: t });
    else if (t) c.entries.push({ id: uid(), sessionId: day.id, date: day.date, who, type: 'remarque', text: t });
  });
}

const isQuick = (e: Correction['entries'][number], date: string) => e.type === 'avis' && e.who === MOI && e.date === date && !e.text;

/** Avis du jour donné d'un toucher depuis la liste : le même avis touché deux fois s'efface. */
export function setTodayAvis(corrId: string, avis: Avis) {
  mutate((d) => {
    const c = d.corrections.find((x) => x.id === corrId);
    if (!c) return;
    const date = today();
    const cur = c.entries.find((e) => isQuick(e, date));
    if (cur && cur.avis === avis) c.entries = c.entries.filter((e) => e !== cur);
    else if (cur) cur.avis = avis;
    else c.entries.push({ id: uid(), sessionId: ensureDay(d).id, date, who: MOI, type: 'avis', avis });
  });
}

export function quickAvis(c: Correction): Avis | null {
  const date = today();
  return c.entries.find((e) => isQuick(e, date))?.avis ?? null;
}

export function deleteSession(id: string) {
  mutate((d) => {
    d.sessions = d.sessions.filter((s) => s.id !== id);
    if (d.activeId === id) d.activeId = null;
    d.positives = d.positives.filter((p) => p.sessionId !== id);
    for (const c of d.corrections) c.entries = c.entries.filter((e) => e.sessionId !== id);
    d.corrections = d.corrections.filter((c) => c.entries.length > 0);
  });
}

export function setStatus(corrId: string, status: Correction['status']) {
  mutate((d) => {
    const c = d.corrections.find((x) => x.id === corrId);
    if (!c) return;
    c.status = status;
    if (status === 'veille') c.veilleAt = today();
    else delete c.veilleAt;
  });
}

export function addSensei(name: string) {
  const n = name.trim();
  if (!n) return;
  mutate((d) => {
    if (!d.senseis.includes(n)) d.senseis.push(n);
  });
}

export function removeSensei(name: string) {
  mutate((d) => {
    d.senseis = d.senseis.filter((s) => s !== name);
  });
}

export function setTatsu(n: 2 | 4) {
  mutate((d) => {
    d.tatsu = n;
  });
}

export function importState(raw: unknown): boolean {
  const s = raw as Partial<State> | null;
  if (!s || s.v !== 1 || !Array.isArray(s.sessions) || !Array.isArray(s.corrections)) return false;
  mutate((d) => {
    Object.assign(d, migrate({ ...empty(), ...(s as State) }));
  });
  return true;
}
