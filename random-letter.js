export function randomLetter() {
  const n = Math.random() * 100;
  for (let [letter, freq] of cumulativeLetterFrequencies) {
    if (n < freq) {
      return letter;
    }
  }
  // Assumption: E is the most common letter in `letterFrequencies` -- the
  // letter removed in `cumulativeLetterFrequencies`
  return 'E';
}

// From https://norvig.com/mayzner.html
// These add up to 99.98, not 100 (presumably due to rounding). By placing E
// at the end, it absorbs the extra 0.02, which is not noticeable. (If we
// placed Z at the end instead, it would absorb the extra 0.02 instead, which
// would be a larger increase proportionally.)
const letterFrequencies = [
  ['Z',  0.09],
  ['Q',  0.12],
  ['J',  0.16],
  ['X',  0.23],
  ['K',  0.54],
  ['V',  1.05],
  ['B',  1.48],
  ['Y',  1.66],
  ['W',  1.68],
  ['G',  1.87],
  ['P',  2.14],
  ['F',  2.40],
  ['M',  2.51],
  ['U',  2.73],
  ['C',  3.34],
  ['D',  3.82],
  ['L',  4.07],
  ['H',  5.05],
  ['R',  6.28],
  ['S',  6.51],
  ['N',  7.23],
  ['I',  7.57],
  ['O',  7.64],
  ['A',  8.04],
  ['T',  9.28],
  ['E', 12.49],
];

const cumulativeLetterFrequencies =
  letterFrequencies
    // This .reduce() returns [
    //   [undefined, 0],
    //   ['Z', 0.09],
    //   ['Q', 0.21],
    //   ...
    //   ['T', 78.209999...],
    //   ['E', 99.979999...],
    // ]
    //
    .reduce(
      (acc, curr) => {
        const LETTER = 0;
        const FREQ = 1;
        const last = acc.slice(-1)[0];
        const cumulFreq = last[FREQ] + curr[FREQ]
        const newItem = [curr[LETTER], cumulFreq];
        return acc.concat([newItem]);
      },
      [[undefined, 0]]
    )
    // This .slice() removes the [undefined, 0], which is only needed
    // temporarily to calculate cumulative values.
    //
    // It also removes ['E', 99.79999...], so E can be used as the 'default'
    // (like in a switch block) case.
    .slice(1, -1);

function testRandomLetter() {
  const counts = {};
  for (let i = 0; i < 10000; i++) {
    const letter = randomLetter();
    counts[letter] = (counts[letter] || 0) + 1;
  }
  console.log(
    Object.entries(counts)
      .sort((a, b) => a[1] - b[1])
      .join('\n')
  );
}
