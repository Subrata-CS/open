/**
 * One palette, used by the homepage cards, the globe and the background wash.
 *
 * Track colours come from `tools/syllabus.txt` (the `>> name | tone | blurb`
 * marker). Adding a new track with a tone that is not listed here simply falls
 * back to indigo, so nothing can break.
 */

export type ToneSpec = {
  /** Solid fill — dots, glows. */
  base: string;
  /** Lighter line colour — borders, labels, badges. */
  line: string;
  /** rgb triplet, so opacity can be varied in canvas and CSS. */
  rgb: string;
};

export const TONES: Record<string, ToneSpec> = {
  indigo: { base: '#6366f1', line: '#a5b4fc', rgb: '99, 102, 241' },
  cyan: { base: '#22c9e8', line: '#7dd3fc', rgb: '34, 201, 232' },
  violet: { base: '#a855f7', line: '#d8b4fe', rgb: '168, 85, 247' },
  green: { base: '#22c58b', line: '#6ee7b7', rgb: '34, 197, 139' },
  amber: { base: '#f7a93b', line: '#fcd34d', rgb: '247, 169, 59' },
  pink: { base: '#f65c8e', line: '#f9a8d4', rgb: '246, 92, 142' },
  teal: { base: '#2dd4bf', line: '#99f6e4', rgb: '45, 212, 191' },
  rose: { base: '#fb7185', line: '#fda4af', rgb: '251, 113, 133' },
};

export function toneOf(id: string | undefined): ToneSpec {
  return (id && TONES[id]) || TONES.indigo;
}
