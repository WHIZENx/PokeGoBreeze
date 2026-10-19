import type { IPokemonFormChange } from '../core/models/pokemon.model';

export interface PokemonFormChangeTarget {
  target: string;
  changes: IPokemonFormChange[];
}

export const groupPokemonFormChangesByTarget = (changes: IPokemonFormChange[] = []): PokemonFormChangeTarget[] => {
  const targets = new Map<string, IPokemonFormChange[]>();

  changes.forEach((change) => {
    change.availableForm.forEach((target) => {
      const targetChanges = targets.get(target) ?? [];
      targetChanges.push(change);
      targets.set(target, targetChanges);
    });
  });

  return Array.from(targets, ([target, targetChanges]) => ({ target, changes: targetChanges }));
};
