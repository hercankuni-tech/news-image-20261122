// The day's news, 22 November 2026, as reported that day by wire services and public news feeds.
// Its own module so the layout self-check imports the very table the image draws.

export const DATE_LINE = 'SUNDAY 22 NOVEMBER 2026';
export const DECK = 'ONE DAY OF WORLD NEWS';

export const STORIES = [
  {
    tag: 'UKRAINE - RUSSIA',
    head: 'RUSSIA HITS ZELENSKYY HOME TOWN',
    body:
      'Missiles and drones on Kryvyi Rih kill 2 and wound 73, nine children. A ship to Russia hit by drones in the Gulf of Finland.',
    art: 'uk',
  },
  {
    tag: 'CLIMATE - COP31',
    head: 'CLIMATE TALKS IN OVERTIME',
    body: 'COP31 in Turkiye runs a second extra day over fossil fuels. A draft that dropped them drew anger.',
    art: 'leaf',
  },
  {
    tag: 'MIDDLE EAST',
    head: 'IRAN STRIKES US BASES IN BAHRAIN',
    body: 'Missiles and drones hit two US bases. Iran says Hormuz stays shut until its terms are met. Gaza strikes go on.',
    art: 'missile',
  },
  {
    tag: 'AMERICAS',
    head: 'PERU QUAKE, MEXICO BOSS HELD',
    body: 'A magnitude 6.7 quake shakes the Andes near Junin. In Mexico, forces capture cartel boss El Chapo Isidro.',
    art: 'quake',
  },
  {
    tag: 'MARKETS - AI',
    head: 'AI SLIDE WIPES OUT A YEAR',
    body: 'The Nasdaq erases its 2026 gains as Anthropic shares sink after their debut. Trump threatens datacentre curbs.',
    art: 'chart',
  },
  {
    tag: 'ASIA',
    head: 'AI CHEATING SCANDAL TOPPLES MINISTER',
    body:
      'South Korea education minister resigns as an AI exam-cheating scandal engulfs university tests. Taiwan weighs the Trump-Xi summit.',
    art: 'brain',
  },
];

// Tiny pixel-art pictograms, one per panel, drawn from the same rect() as the text.
export const ART = {
  uk: [
    '...####...',
    '..##..##..',
    '.##.##.##.',
    '##...#..##',
    '##..###.##',
    '.##.....##',
    '..##...##.',
    '...#####..',
  ],
  leaf: [
    '....##....',
    '...####...',
    '..##..##..',
    '..##..##..',
    '.##.##.##.',
    '.########.',
    '..##..##..',
    '....##....',
  ],
  missile: [
    '....##....',
    '...###....',
    '..####....',
    '.##.##....',
    '##..##....',
    '#...##....',
    '....##....',
    '....##....',
  ],
  quake: [
    '..........',
    '...####...',
    '..##..##..',
    '.##..#..##',
    '##..###..#',
    '..##...##.',
    '.##.....##',
    '##.......#',
  ],
  chart: [
    '##.......#',
    '##......##',
    '##.....###',
    '##....####',
    '##...#####',
    '##..######',
    '##.#######',
    '##########',
  ],
  brain: [
    '.####.####.',
    '##..###..##',
    '##.#####.##',
    '.#########.',
    '##.#####.##',
    '##..###..##',
    '.####.####.',
    '...........',
  ],
};

export const FOOTER = [
  'ALSO: NIGERIA BOAT SINKS, 24 DEAD   US FBI PROBES HACK OF CRIME DATABASE',
  'GAZA PALESTINIANS PROTEST STRIKES   UK REJOINING EU ON THE TABLE, MINISTER SAYS',
  'SOURCES: WIRE REPORTS AND PUBLIC NEWS FEEDS OF 22 NOVEMBER 2026',
];
