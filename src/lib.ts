import type { Correction, Entry, Session, Shot } from './types';
import { avisLabel } from './faults';

export function today(): string {
  const d = new Date();
  return iso(d);
}

export function iso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
}

const parse = (s: string) => new Date(s + 'T12:00:00');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function fmtDate(s: string, long = false): string {
  const f = new Intl.DateTimeFormat('fr-FR', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: 'numeric', month: 'short' });
  return cap(f.format(parse(s)));
}

export function fmtShort(s: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(parse(s));
}

export function fmtMonth(s: string): string {
  return cap(new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(parse(s)));
}

export const hits = (shots: Shot[]) => shots.filter((s) => s.hit).length;
export const pct = (h: number, n: number) => (n === 0 ? null : Math.round((h / n) * 100));
export const pctText = (h: number, n: number) => (n === 0 ? '–' : `${pct(h, n)} %`);

export function total(sessions: Session[]) {
  let h = 0;
  let n = 0;
  for (const s of sessions) {
    h += hits(s.shots);
    n += s.shots.length;
  }
  return { h, n };
}

export const kindLabel = (k: Session['kind']) => (k === 'cours' ? 'Jour de tir' : 'Tournoi');

export const byDateDesc = (a: Session, b: Session) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export function tatsuGroups(shots: Shot[], size: number): Shot[][] {
  const out: Shot[][] = [];
  for (let i = 0; i < shots.length; i += size) out.push(shots.slice(i, i + size));
  return out;
}

export function entryText(e: Entry): string {
  const base = e.type === 'avis' ? avisLabel(e.avis) : e.type === 'origine' ? 'correction donnée' : 'note';
  return e.text ? `${base} · ${e.text}` : base;
}

export function lastAvis(c: Correction): string | null {
  for (let i = c.entries.length - 1; i >= 0; i--) if (c.entries[i].type === 'avis') return avisLabel(c.entries[i].avis);
  return null;
}

/** Nombre de jours où la correction a été notée. */
export function workCount(c: Correction): number {
  return new Set(c.entries.map((e) => e.date)).size;
}

/** Un avis par jour (le dernier donné ce jour-là), du plus ancien au plus récent. */
export function avisByDay(c: Correction): Entry[] {
  const byDate = new Map<string, Entry>();
  for (const e of c.entries) if (e.type === 'avis') byDate.set(e.date, e);
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n > 1 ? many : one}`;
}
