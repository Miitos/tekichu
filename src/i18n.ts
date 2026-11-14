import { useSyncExternalStore } from 'react';

/** Préférences de l'appareil (langue, apparence). Rangées à part des données : une sauvegarde restaurée n'y touche pas. */
export type Lang = 'fr' | 'en' | 'ja';
export type Theme = 'auto' | 'light' | 'dark';
type Prefs = { lang: Lang; theme: Theme };

const KEY = 'tekichu-prefs';
const LANGS: Lang[] = ['fr', 'en', 'ja'];
const THEMES: Theme[] = ['auto', 'light', 'dark'];

function load(): Prefs {
  const nav = (navigator.language || 'fr').slice(0, 2) as Lang;
  const p: Prefs = { lang: LANGS.includes(nav) ? nav : 'en', theme: 'auto' };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw && LANGS.includes(raw.lang)) p.lang = raw.lang;
    if (raw && THEMES.includes(raw.theme)) p.theme = raw.theme;
  } catch {
    // préférences illisibles : valeurs par défaut
  }
  return p;
}

let prefs = load();
const subs = new Set<() => void>();
const sombre = window.matchMedia('(prefers-color-scheme: dark)');

function apply() {
  const dark = prefs.theme === 'dark' || (prefs.theme === 'auto' && sombre.matches);
  const root = document.documentElement;
  root.dataset.theme = dark ? 'dark' : 'light';
  root.lang = prefs.lang;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0f1112' : '#16191A');
}
apply();
sombre.addEventListener('change', apply);

function set(p: Partial<Prefs>) {
  prefs = { ...prefs, ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // stockage indisponible : la préférence vaut pour cette ouverture
  }
  apply();
  subs.forEach((f) => f());
}

export const setLang = (lang: Lang) => set({ lang });
export const setTheme = (theme: Theme) => set({ theme });
export const getLang = () => prefs.lang;
export const locale = () => ({ fr: 'fr-FR', en: 'en-GB', ja: 'ja-JP' })[prefs.lang];

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    },
    () => prefs,
  );
}

/**
 * Traduction. La clé est le texte français ; [anglais, japonais].
 * Les variables s'écrivent {nom} dans les trois langues.
 */
export function t(fr: string, vars?: Record<string, string | number>): string {
  const s = prefs.lang === 'fr' ? fr : (DICT[fr]?.[prefs.lang === 'en' ? 0 : 1] ?? fr);
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '')) : s;
}

/** « 3 jours », « 3 days », « 3日 ». La clé est le nom français au singulier. */
export function plural(n: number, one: string, many: string): string {
  if (prefs.lang === 'fr') return `${n} ${n > 1 ? many : one}`;
  const w = NOUNS[one];
  if (!w) return `${n} ${n > 1 ? many : one}`;
  if (prefs.lang === 'ja') return w[2].replace('{n}', String(n));
  return `${n} ${n === 1 ? w[0] : w[1]}`;
}

const NOUNS: Record<string, [string, string, string]> = {
  jour: ['day', 'days', '{n}日'],
  'jour de tir': ['shooting day', 'shooting days', '稽古{n}日'],
  flèche: ['arrow', 'arrows', '{n}射'],
  tournoi: ['tournament', 'tournaments', '大会{n}回'],
  note: ['note', 'notes', 'メモ{n}件'],
  correction: ['correction', 'corrections', '課題{n}件'],
  tachi: ['tachi', 'tachi', '{n}立'],
};

export const DICT: Record<string, [string, string]> = {
  // Navigation
  'Navigation principale': ['Main navigation', 'メインナビゲーション'],
  Corrections: ['Corrections', '課題'],
  Tournois: ['Tournaments', '大会'],
  Tirer: ['Shoot', '行射'],
  Progrès: ['Progress', '上達'],
  Réglages: ['Settings', '設定'],
  ' · en cours': ['', ''],
  ', ': [', ', '、'],

  // Communs
  Fermer: ['Close', '閉じる'],
  Retour: ['Back', '戻る'],
  Enregistrer: ['Save', '保存'],
  Reprendre: ['Resume', '再開'],
  'En cours': ['Active', '取組中'],
  'En veille': ['On hold', '休止中'],
  "Aujourd'hui": ['Today', '今日'],
  "aujourd'hui": ['today', '今日'],
  Moi: ['Me', '自分'],
  Mieux: ['Better', '良くなった'],
  Pareil: ['Same', '変わらず'],
  Difficile: ['Hard', '難しい'],
  Tournoi: ['Tournament', '大会'],
  'Jour de tir': ['Shooting day', '稽古日'],
  Historique: ['History', '履歴'],
  '+ Note': ['+ Note', '+ メモ'],
  '{h} touchée sur {n}': ['{h} hit out of {n}', '{n}射{h}中'],
  '{h} touchées sur {n}': ['{h} hits out of {n}', '{n}射{h}中'],
  '{h} sur {n}': ['{h} of {n}', '{n}射{h}中'],
  "pas encore d'avis": ['no rating yet', '評価なし'],
  haya: ['haya', '甲矢'],
  otoya: ['otoya', '乙矢'],
  Haya: ['Haya', '甲矢'],
  'correction donnée': ['correction given', '指摘'],
  note: ['note', 'メモ'],

  // Corrections
  'Notée {d}': ['Noted on {d}', '{d}記録'],
  '+ Correction': ['+ Correction', '+ 課題'],
  'Rien encore · touche pour tirer': ['Nothing yet · tap to shoot', '記録なし · タップして行射'],
  'Pas encore de flèche': ['No arrows yet', '矢の記録なし'],
  "Aucune correction en cours. Le bouton « + Correction » en ajoute une, sans clavier : qui l'a donnée, à quelle étape, quel défaut.": [
    'No active corrections. The “+ Correction” button adds one without typing: who gave it, at which stage, which fault.',
    '取組中の課題はありません。「+ 課題」から、誰の指摘か・どの節か・どの癖かを選ぶだけで追加できます。',
  ],
  "noté aujourd'hui": ['noted today', '今日記録済み'],
  'dernier avis : {a}': ['last rating: {a}', '前回：{a}'],
  "Aujourd'hui, c'est": ['Today it feels', '今日の手応え'],
  'Rien en veille. Une correction mise en veille reste ici, prête à être reprise.': [
    'Nothing on hold. A correction put on hold stays here, ready to be resumed.',
    '休止中の課題はありません。休止した課題はここに残り、いつでも再開できます。',
  ],
  ' · en veille le {d}': [' · on hold since {d}', ' · {d}から休止'],

  // Nouvelle correction
  'Nom du sensei': ["Sensei's name", '先生の名前'],
  '+ Sensei': ['+ Sensei', '+ 先生'],
  "Qui l'a donnée, à quelle étape, quel défaut": ['Who gave it, at which stage, which fault', '誰の指摘か・どの節か・どの癖か'],
  'Nouvelle correction': ['New correction', '新しい課題'],
  Étape: ['Stage', '射法八節'],
  'Défauts connus': ['Known faults', 'よくある癖'],
  ' · déjà suivi': [' · already tracked', ' · 登録済み'],
  'Mot libre': ['Free text', '自由入力'],
  'Mot libre : {t}': ['Free text: {t}', '自由入力：{t}'],
  'Précision (facultatif)': ['Detail (optional)', '補足(任意)'],
  'Correction libre': ['Free correction', '自由な課題'],
  'Enregistrer · {n} corrections': ['Save · {n} corrections', '保存 · {n}件'],

  // Note
  Note: ['Note', 'メモ'],
  'Qui parle': ['Who is speaking', '誰の言葉か'],
  "Aujourd'hui, c'est · facultatif": ['Today it feels · optional', '今日の手応え · 任意'],
  'Note · facultatif': ['Note · optional', 'メモ · 任意'],
  'Ce que le sensei a dit, ce que tu as senti…': ['What the sensei said, what you felt…', '先生の言葉、自分の感覚など…'],
  'Déjà noté sur cette correction': ['Already noted on this correction', 'これまでの記録'],
  'Rangée automatiquement dans la journée du {d}.': ['Filed automatically under {d}.', '{d}の稽古に自動で記録されます。'],

  // Historique
  'en cours depuis le {d}': ['active since {d}', '{d}から取組中'],
  'en veille depuis le {d}': ['on hold since {d}', '{d}から休止中'],
  'en veille': ['on hold', '休止中'],
  'Avis au fil des jours': ['Ratings over time', '手応えの推移'],
  'notée {d}': ['noted on {d}', '{d}記録'],
  "Pas encore d'avis. Ouvre la correction dans la liste et touche Mieux, Pareil ou Difficile.": [
    'No rating yet. Open the correction in the list and tap Better, Same or Hard.',
    'まだ評価がありません。一覧で課題を開き、「良くなった」「変わらず」「難しい」をタップしてください。',
  ],
  'Avis successifs': ['Successive ratings', '評価の推移'],
  'Tout ce qui a été noté': ['Everything noted', 'すべての記録'],
  'Mettre en veille': ['Put on hold', '休止する'],

  // Tournois
  'Tournoi en cours': ['Tournament in progress', '大会進行中'],
  'Reprendre le tournoi': ['Back to the tournament', '大会に戻る'],
  'Nouveau tournoi · nom facultatif': ['New tournament · name optional', '新しい大会 · 名前は任意'],
  'Démarrer un tournoi': ['Start a tournament', '大会を始める'],
  'Tournois passés': ['Past tournaments', '過去の大会'],
  "Aucun tournoi pour l'instant.": ['No tournaments yet.', 'まだ大会の記録はありません。'],
  'Tournoi du {d}': ['Tournament of {d}', '{d}の大会'],
  'avec notes': ['with notes', 'メモあり'],
  'sans note': ['no notes', 'メモなし'],
  'En tournoi : les résultats et des notes. Pas de corrections, et rien ne se mélange avec tes jours de tir.': [
    'In a tournament: results and notes. No corrections, and nothing mixes with your shooting days.',
    '大会では結果とメモだけを記録します。課題は扱わず、普段の稽古の記録とは混ざりません。',
  ],

  // Tir
  'Flèche {n} notée {m} · glisse pour ajuster': ['Arrow {n} marked {m} · drag to adjust', '{n}本目 {m} · ドラッグで調整'],
  'Flèche {n} notée {m} sans position': ['Arrow {n} marked {m}, no position', '{n}本目 {m} · 位置なし'],
  "Touche l'impact : dans la cible ○, dans l'azuchi ×": ['Tap the impact: in the target ○, in the azuchi ×', '矢所をタップ：的中 ○、安土 ×'],
  'Tachi {n}': ['Tachi {n}', '{n}立目'],
  ' · complet': [' · complete', ' · 完了'],
  Terminer: ['Finish', '終了'],
  'Mes corrections · touche pour noter': ['My corrections · tap to note', '自分の課題 · タップで記録'],
  'Annuler la dernière flèche': ['Undo the last arrow', '最後の矢を取り消す'],
  "Mato dans l'azuchi. Touche l'endroit de l'impact.": ['Mato in the azuchi. Tap where the arrow landed.', '安土の的。矢所をタップしてください。'],
  'Kaichū : toutes les flèches du tachi ont touché': ['Kaichū: every arrow of the tachi hit', '皆中：この立の矢がすべて的中'],
  '× Manqué': ['× Miss', '× 外れ'],
  '○ Touché': ['○ Hit', '○ 的中'],
  'sans position': ['no position', '位置なし'],
  'Notes du tournoi': ['Tournament notes', '大会のメモ'],
  'Ce que tu retiens, à compléter quand tu veux…': ['What you take away, add to it any time…', '気づいたことを、いつでも書き足せます…'],
  'Chaque flèche est enregistrée dans la journée. Rien à terminer.': ['Every arrow is saved to the day. Nothing to finish.', '矢は一本ずつ今日の稽古に保存されます。終了の操作は不要です。'],

  // Journée
  'Nom du tournoi · facultatif': ['Tournament name · optional', '大会名 · 任意'],
  Résultat: ['Result', '結果'],
  'Notes de la journée': ['Notes of the day', 'この日のメモ'],
  'Aucune note sur tes corrections ce jour-là.': ['No notes on your corrections that day.', 'この日の課題メモはありません。'],
  'Note libre de la journée · facultatif': ['Free note for the day · optional', 'この日の自由メモ · 任意'],
  'Supprimer ce tournoi, ses flèches et ses notes ? Cette action est définitive.': [
    'Delete this tournament, its arrows and its notes? This cannot be undone.',
    'この大会と、その矢・メモを削除しますか？この操作は取り消せません。',
  ],
  'Supprimer cette journée, ses flèches et ses notes ? Cette action est définitive.': [
    'Delete this day, its arrows and its notes? This cannot be undone.',
    'この日と、その矢・メモを削除しますか？この操作は取り消せません。',
  ],
  'Supprimer ce tournoi': ['Delete this tournament', 'この大会を削除'],
  'Supprimer cette journée': ['Delete this day', 'この日を削除'],

  // Progrès
  '30 j': ['30 d', '30日'],
  '3 mois': ['3 mo', '3か月'],
  '1 an': ['1 yr', '1年'],
  'Pas encore assez de positions notées': ['Not enough positions recorded yet', '矢所の記録がまだ足りません'],
  'Groupement centré': ['Centred grouping', '矢所は中心にまとまっています'],
  'Groupement vers {h} h': ['Grouping toward {h} o’clock', '矢所は{h}時方向'],
  'Groupement vers {h} h, plutôt haut': ['Grouping toward {h} o’clock, rather high', '矢所は{h}時方向、やや上'],
  'Groupement vers {h} h, plutôt bas': ['Grouping toward {h} o’clock, rather low', '矢所は{h}時方向、やや下'],
  'Aucune flèche notée sur cette période. Le bouton cible, en bas, ouvre le tir à tout moment.': [
    'No arrows recorded over this period. The target button at the bottom opens shooting at any time.',
    'この期間の矢の記録はありません。下の的のボタンから、いつでも行射を記録できます。',
  ],
  'Jours de tir': ['Shooting days', '稽古'],
  '{d} point': ['{d} point', '{d}ポイント'],
  '{d} points': ['{d} points', '{d}ポイント'],
  'touche une barre': ['tap a bar', 'バーをタップ'],
  'Mes corrections, avis au fil des jours': ['My corrections, ratings over time', '課題ごとの手応えの推移'],
  'Aucune correction en cours.': ['No active corrections.', '取組中の課題はありません。'],
  'Dernier avis : {a}': ['Last rating: {a}', '前回：{a}'],
  'Carte cumulée des impacts': ['Cumulative impact map', '矢所の累積図'],
  Impacts: ['Impacts', '矢所'],
  'Aucun tournoi sur cette période. Le menu Tournois, en bas, permet d\'en démarrer un.': [
    'No tournaments over this period. The Tournaments menu at the bottom lets you start one.',
    'この期間の大会はありません。下の「大会」メニューから始められます。',
  ],
  'En tournoi': ['In tournaments', '大会'],
  'jours de tir : {p}': ['shooting days: {p}', '稽古：{p}'],
  'Résultats et notes': ['Results and notes', '結果とメモ'],
  'Première flèche du tournoi': ['First arrow of the tournament', '大会の初矢'],

  // Réglages
  Apparence: ['Appearance', '外観'],
  Auto: ['Auto', '自動'],
  Clair: ['Light', 'ライト'],
  Sombre: ['Dark', 'ダーク'],
  Langue: ['Language', '言語'],
  'Sauvegarde téléchargée.': ['Backup downloaded.', 'バックアップを保存しました。'],
  'Remplacer toutes les données de cet appareil par celles du fichier ?': ['Replace all the data on this device with the data from the file?', 'この端末のデータをすべて、ファイルの内容で置き換えますか？'],
  'Données restaurées.': ['Data restored.', 'データを復元しました。'],
  "Ce fichier n'est pas une sauvegarde de Tekichū.": ['This file is not a Tekichū backup.', 'このファイルは Tekichū のバックアップではありません。'],
  'Fichier illisible.': ['Unreadable file.', 'ファイルを読み込めません。'],
  'Flèches par tachi': ['Arrows per tachi', '一立の矢数'],
  '2 flèches': ['2 arrows', '2射'],
  '4 flèches': ['4 arrows', '4射'],
  Sensei: ['Sensei', '先生'],
  Retirer: ['Remove', '削除'],
  '+ Ajouter un sensei': ['+ Add a sensei', '+ 先生を追加'],
  'Retirer un nom de la liste ne modifie pas les notes déjà prises.': ['Removing a name from the list does not change notes already taken.', '名前を一覧から削除しても、これまでのメモは変わりません。'],
  Sauvegarde: ['Backup', 'バックアップ'],
  'Tes données restent sur cet appareil : {a}, {b}, {c}. Télécharge une sauvegarde de temps en temps, surtout avant de changer de téléphone ou de vider le navigateur.': [
    'Your data stays on this device: {a}, {b}, {c}. Download a backup from time to time, especially before changing phones or clearing the browser.',
    'データはこの端末だけに保存されます：{a}、{b}、{c}。機種変更やブラウザのデータ消去の前など、ときどきバックアップを保存してください。',
  ],
  'Télécharger une sauvegarde': ['Download a backup', 'バックアップを保存'],
  'Restaurer depuis un fichier': ['Restore from a file', 'ファイルから復元'],
};
