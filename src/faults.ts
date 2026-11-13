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

export const stageLabel = (id: string) => STAGES.find((s) => s.id === id)?.label ?? id;

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

export const avisLabel = (id?: string) => AVIS.find((a) => a.id === id)?.label ?? '';

export const MOI = 'Moi';
