// Presentation only: keep API names/slugs unchanged for selection and routing.
const speciesNames: Record<string, string> = {
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'wo-chien': 'Wo-Chien',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'chi-yu': 'Chi-Yu',
  'mr-mime': 'Mr. Mime',
  'mr-rime': 'Mr. Rime',
  'mime-jr': 'Mime Jr.',
  'type-null': 'Type: Null',
  farfetchd: 'Farfetch’d',
  sirfetchd: 'Sirfetch’d',
  'nidoran-female': 'Nidoran Female',
  'nidoran-male': 'Nidoran Male',
  'nidoran-f': 'Nidoran Female',
  'nidoran-m': 'Nidoran Male',
};
const words: Record<string, string> = { gmax: 'Gigantamax', phd: 'PhD', x: 'X', y: 'Y' };
const titleCase = (value: string) =>
  value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => words[word] ?? word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const formatPokemonDisplayName = (name?: string | null): string => {
  if (!name) {
    return '';
  }
  const normalized = name.trim().toLowerCase().replaceAll('_', '-');
  for (const [key, display] of Object.entries(speciesNames)) {
    if (normalized === key) {
      return display;
    }
    if (normalized.startsWith(`${key}-`)) {
      return `${display} ${titleCase(normalized.slice(key.length + 1))}`;
    }
  }
  return titleCase(normalized);
};
