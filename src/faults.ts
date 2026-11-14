import { getLang, t } from './i18n';

export const STAGES: { id: string; label: string }[] = [
  { id: 'ashibumi', label: 'Ashibumi' },
  { id: 'dozukuri', label: 'Dōzukuri' },
  { id: 'yugamae', label: 'Yugamae' },
  { id: 'uchiokoshi', label: 'Uchiokoshi' },
  { id: 'hikiwake', label: 'Hikiwake' },
  { id: 'kai', label: 'Kai' },
  { id: 'hanare', label: 'Hanare' },
  { id: 'zanshin', label: 'Zanshin' },
  { id: 'taihai', label: 'Taihai' },
];

const STAGES_JA: Record<string, string> = { ashibumi: "足踏み", dozukuri: "胴造り", yugamae: "弓構え", uchiokoshi: "打起し", hikiwake: "引分け", kai: "会", hanare: "離れ", zanshin: "残心", taihai: "体配" };

export const stageLabel = (id: string) => (getLang() === "ja" && STAGES_JA[id]) || (STAGES.find((s) => s.id === id)?.label ?? id);

/**
 * Défauts courants par étape, pour noter une remarque sans clavier.
 * Termes japonais vérifiés sur le dictionnaire de la fédération japonaise (ANKF) :
 * https://www.kyudo.jp/howto/terminology.html
 * Non présents dans ce dictionnaire, gardés car d'usage courant : taihai, suriashi, ikiai,
 * yurumi, yurumi-banare, mae-banare.
 * Ordre dans chaque étape : du bas du corps vers le haut, puis dans l'ordre du geste ;
 * les défauts opposés sont côte à côte.
 */
export const FAULTS: Record<string, string[]> = {
  // largeur, angle, ligne, appui
  ashibumi: ['Écart trop étroit', 'Écart trop large', 'Angle des pieds inégal', 'Shoimato (pieds orientés en avant de la cible)', 'Dakimato (pieds orientés en arrière de la cible)', 'Poids mal réparti'],
  // appui, bassin, alignement, puis les quatre inclinaisons du buste (godō)
  dozukuri: ['Centre de gravité trop haut', 'Bassin basculé', 'Dos cambré', 'Sanjū-jūmonji désaligné (pieds, hanches, épaules)', 'Kagamu-dō (buste penché en avant)', 'Sori-dō (buste renversé en arrière)', 'Kakaru-dō (buste penché vers la cible)', 'Noki-dō (buste penché à l\'opposé de la cible)'],
  // torikake, tenouchi, forme des bras, monomi
  yugamae: ['Torikake trop profond', 'Torikake trop léger', 'Poignet droit cassé', 'Tenouchi mal placé', 'Arc trop serré', 'Ensō perdu (coudes tombants)', 'Monomi insuffisant'],
  // rythme, hauteur, épaules et bras, arc et flèche
  uchiokoshi: ['Montée trop rapide', 'Montée trop basse', 'Épaules qui montent', 'Bras raides', 'Arc incliné', 'Flèche pas horizontale'],
  // daisan, main droite, ouverture, épaules, arc et flèche
  hikiwake: ['Daisan trop petit', 'Tire avec la main, pas le coude', 'Poignet droit cassé', 'Ouverture inégale', 'Ouverture saccadée', 'Sashi-gata (épaule gauche qui remonte)', 'Ochi-gata (épaule gauche trop basse)', 'De-kata (épaule gauche en avant)', 'Noki-gata (épaule gauche en retrait)', 'Épaule droite qui recule', 'Teru (arc qui penche en arrière)', 'Flèche loin du visage'],
  // points de contact, main gauche, main droite, tension, moment du lâcher, visée et souffle
  kai: ['Kuchiwari trop haut', 'Kuchiwari trop bas', 'Hōzuke absent', 'Munazuru absent', 'Uwa-oshi (poignet relevé, le poing pousse vers le bas)', 'Shita-oshi (poignet abaissé, le poing pousse vers le haut)', 'Beta-oshi (arc poussé avec la paume)', 'Hirazuke (dos de la main droite vers l\'avant)', 'Tsumeai insuffisant', 'Nobiai insuffisant', 'Chijimi / yurumi (relâchement au kai)', "Biku (la traction revient d'un coup)", 'Hayake (lâcher avant ou dès le kai)', 'Motare (le lâcher ne vient plus)', 'Visée instable', 'Souffle bloqué'],
  // main droite, les deux mains, main gauche et arc, conséquence
  hanare: ['Katte-banare (la main droite domine)', 'Okuri-banare (main droite qui revient vers la cible)', "Mae-banare (main droite qui part vers l'avant)", 'Yurumi-banare (lâcher relâché)', 'Kobanare (petit lâcher)', 'Awase-hanare (mains ajustées, sans nobiai)', 'Uwa-banare (lâcher vers le haut)', 'Kirisage (mains qui tombent)', "Tenouchi qui s'ouvre", 'Uchikiri (arc serré, pas de yugaeri)', "Corde sur l'avant-bras"],
  // durée, corps, bras, regard, retour
  zanshin: ['Zanshin trop court', 'Corps qui bouge après le lâcher', 'Bras qui retombent', 'Regard qui quitte la cible', 'Yudaoshi précipité'],
  // dans l'ordre d'une entrée au shajō
  taihai: ['Tenue (dōgi, hakama)', 'Toriyumi no shisei (posture arc en main)', 'Démarche (suriashi)', 'Maai (rythme et distances)', 'Salut (rei, yū)', 'Kiza instable', 'Yatsugae hésitant', 'Mezukai (regard)', 'Ikiai (respiration)'],
};

/** Anciens libellés (première version de la liste) et leur équivalent actuel. */
export const RENAMES: Record<string, { label: string; stage?: string }> = {
  'Buste penché en avant': { label: 'Kagamu-dō (buste penché en avant)' },
  'Buste penché en arrière': { label: 'Sori-dō (buste renversé en arrière)' },
  'Épaules pas au-dessus des hanches': { label: 'Sanjū-jūmonji désaligné (pieds, hanches, épaules)' },
  'Coudes tombants': { label: 'Ensō perdu (coudes tombants)' },
  'Épaule gauche qui remonte': { label: 'Sashi-gata (épaule gauche qui remonte)' },
  'Hayake (lâcher précipité)': { label: 'Hayake (lâcher avant ou dès le kai)' },
  'Motare (lâcher retenu)': { label: 'Motare (le lâcher ne vient plus)' },
  'Yurumi (relâchement)': { label: 'Chijimi / yurumi (relâchement au kai)' },
  'Hozuke absent': { label: 'Hōzuke absent' },
  'Mae-banare (main droite en avant)': { label: "Mae-banare (main droite qui part vers l'avant)" },
  'Lâcher forcé': { label: 'Katte-banare (la main droite domine)' },
  'Lâcher relâché': { label: 'Yurumi-banare (lâcher relâché)' },
  'Bras gauche qui tombe': { label: 'Kirisage (mains qui tombent)' },
  'Biku (sursaut)': { label: "Biku (la traction revient d'un coup)", stage: 'kai' },
  'Pas de yugaeri': { label: 'Uchikiri (arc serré, pas de yugaeri)' },
  'Rythme avec le groupe': { label: 'Maai (rythme et distances)' },
  'Regard (mezukai)': { label: 'Mezukai (regard)' },
  'Respiration (ikiai)': { label: 'Ikiai (respiration)' },
  'Encochage hésitant': { label: 'Yatsugae hésitant' },
  Tenue: { label: 'Tenue (dōgi, hakama)' },
};

export const GOOD = ['Bien exécuté', 'En progrès', 'Plus stable', 'Plus détendu', 'Meilleur rythme', 'Plus ample'];

export const AVIS: { id: 'mieux' | 'pareil' | 'difficile'; label: string }[] = [
  { id: 'mieux', label: 'Mieux' },
  { id: 'pareil', label: 'Pareil' },
  { id: 'difficile', label: 'Difficile' },
];

export const avisLabel = (id?: string) => t(AVIS.find((a) => a.id === id)?.label ?? '');

export const MOI = 'Moi';

/** Celui qui parle : « Moi » est enregistré tel quel, et traduit à l'affichage. */
export const whoLabel = (w: string) => (w === MOI ? t(MOI) : w);

/**
 * Traductions des défauts, dans le même ordre que FAULTS. Les données gardent le libellé français :
 * changer de langue ne touche à rien de ce qui est enregistré. Un mot libre s'affiche tel qu'il a été écrit.
 */
const FAULTS_EN: Record<string, string[]> = {
  ashibumi: ['Stance too narrow', 'Stance too wide', 'Uneven foot angle', 'Shoimato (feet aligned in front of the target)', 'Dakimato (feet aligned behind the target)', 'Weight unevenly spread'],
  dozukuri: ['Centre of gravity too high', 'Pelvis tilted', 'Arched back', 'Sanjū-jūmonji misaligned (feet, hips, shoulders)', 'Kagamu-dō (torso leaning forward)', 'Sori-dō (torso leaning back)', 'Kakaru-dō (torso leaning toward the target)', 'Noki-dō (torso leaning away from the target)'],
  yugamae: ['Torikake too deep', 'Torikake too shallow', 'Right wrist bent', 'Tenouchi misplaced', 'Bow gripped too tightly', 'Ensō lost (dropped elbows)', 'Monomi insufficient'],
  uchiokoshi: ['Raised too fast', 'Raised too low', 'Shoulders rising', 'Stiff arms', 'Bow tilted', 'Arrow not level'],
  hikiwake: ['Daisan too small', 'Drawing with the hand, not the elbow', 'Right wrist bent', 'Uneven draw', 'Jerky draw', 'Sashi-gata (left shoulder rising)', 'Ochi-gata (left shoulder too low)', 'De-kata (left shoulder forward)', 'Noki-gata (left shoulder pulled back)', 'Right shoulder pulling back', 'Teru (bow tilting backward)', 'Arrow far from the face'],
  kai: ['Kuchiwari too high', 'Kuchiwari too low', 'No hōzuke', 'No munazuru', 'Uwa-oshi (wrist raised, fist pushing down)', 'Shita-oshi (wrist lowered, fist pushing up)', 'Beta-oshi (bow pushed with the palm)', 'Hirazuke (back of the right hand facing forward)', 'Tsumeai insufficient', 'Nobiai insufficient', 'Chijimi / yurumi (slackening in kai)', 'Biku (the draw suddenly slips back)', 'Hayake (release before or right at kai)', 'Motare (the release no longer comes)', 'Unsteady aim', 'Breath held'],
  hanare: ['Katte-banare (right hand dominates)', 'Okuri-banare (right hand moving back toward the target)', 'Mae-banare (right hand going forward)', 'Yurumi-banare (slack release)', 'Kobanare (small release)', 'Awase-hanare (hands adjusted, no nobiai)', 'Uwa-banare (upward release)', 'Kirisage (hands dropping)', 'Tenouchi opening', 'Uchikiri (bow gripped, no yugaeri)', 'String hitting the forearm'],
  zanshin: ['Zanshin too short', 'Body moving after the release', 'Arms dropping', 'Eyes leaving the target', 'Rushed yudaoshi'],
  taihai: ['Attire (dōgi, hakama)', 'Toriyumi no shisei (posture with bow in hand)', 'Walking (suriashi)', 'Maai (timing and spacing)', 'Bows (rei, yū)', 'Unsteady kiza', 'Hesitant yatsugae', 'Mezukai (gaze)', 'Ikiai (breathing)'],
};

const FAULTS_JA: Record<string, string[]> = {
  ashibumi: ['足幅が狭い', '足幅が広い', '足の角度が不揃い', 'しょい的(足が的の前を向く)', 'だき的(足が的の後ろを向く)', '体重の配分が悪い'],
  dozukuri: ['重心が高い', '骨盤が傾く', '腰が反る', '三重十文字の崩れ', '屈む胴', '反る胴', '懸かる胴', '退く胴'],
  yugamae: ['取懸けが深い', '取懸けが浅い', '右手首が折れる', '手の内の位置が悪い', '弓を握りすぎ', '円相が崩れる(肘が落ちる)', '物見が浅い'],
  uchiokoshi: ['打起しが速い', '打起しが低い', '肩が上がる', '腕が硬い', '弓が傾く', '矢が水平でない'],
  hikiwake: ['大三が小さい', '肘でなく手で引く', '右手首が折れる', '引分けが不均等', '引分けがぎこちない', 'さし肩(左肩が上がる)', '落ち肩(左肩が下がりすぎ)', '出肩(左肩が前に出る)', '退き肩(左肩が引ける)', '右肩が逃げる', '弓が照る', '矢が顔から離れる'],
  kai: ['口割りが高い', '口割りが低い', '頬付けがない', '胸弦がない', '上押し', '下押し', 'べた押し', '平付け', '詰合いが足りない', '伸合いが足りない', '縮み・緩み', 'びく', '早気', 'もたれ', '狙いが定まらない', '息が詰まる'],
  hanare: ['勝手離れ', '送り離れ', '前離れ', '緩み離れ', '小離れ', '合わせ離れ', '上離れ', '切り下げ', '手の内が開く', '打ち切り(弓返りしない)', '弦が腕を払う'],
  zanshin: ['残心が短い', '離れの後に体が動く', '腕が落ちる', '目が的から離れる', '弓倒しが早い'],
  taihai: ['着装(道着・袴)', '執り弓の姿勢', 'すり足', '間合い', '礼・揖', '跪坐が不安定', '矢番えがもたつく', '目遣い', '息合い'],
};

const TR: Record<string, [string, string]> = {};
for (const stage of Object.keys(FAULTS)) FAULTS[stage].forEach((fr, i) => (TR[fr] = [FAULTS_EN[stage][i] ?? fr, FAULTS_JA[stage][i] ?? fr]));

export function faultLabel(label: string): string {
  const lang = getLang();
  return lang === 'fr' ? label : (TR[label]?.[lang === 'en' ? 0 : 1] ?? label);
}
