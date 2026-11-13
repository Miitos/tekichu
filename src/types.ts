export type Kind = 'cours' | 'tournoi';

/** x, y : position de l'impact, centre de la mato en (0, 0), bord de la mato à 1. y vers le bas. */
export type Shot = { hit: boolean; x?: number; y?: number };

export type Session = {
  id: string;
  date: string; // AAAA-MM-JJ
  kind: Kind;
  shots: Shot[];
  note: string;
  name: string; // nom du tournoi
  focus: string[]; // ids des corrections travaillées pendant ce cours
  saved: boolean;
};

export type Avis = 'mieux' | 'pareil' | 'difficile';

export type Entry = {
  id: string;
  sessionId: string | null;
  date: string;
  who: string;
  type: 'origine' | 'remarque' | 'avis';
  avis?: Avis;
  text?: string;
};

export type Correction = {
  id: string;
  stage: string;
  label: string;
  status: 'encours' | 'veille';
  createdAt: string;
  veilleAt?: string;
  entries: Entry[];
};

export type Positive = {
  id: string;
  sessionId: string | null;
  date: string;
  who: string;
  stage: string;
  label: string;
  text?: string;
};

export type State = {
  v: 1;
  sessions: Session[];
  corrections: Correction[];
  positives: Positive[];
  senseis: string[];
  activeId: string | null;
  nextFocus: string[];
  tatsu: 2 | 4;
};
