import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BoltIcon from '@mui/icons-material/Bolt';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ExpandIcon from '@mui/icons-material/Expand';
import FlareIcon from '@mui/icons-material/Flare';
import PublicIcon from '@mui/icons-material/Public';
import StarsIcon from '@mui/icons-material/Stars';
import Chip from '@mui/material/Chip';

import { PokemonClass, PokemonType } from '../../enums/type.enum';

interface PokemonClassification {
  isReady: boolean;
  pokemonClass?: PokemonClass;
  pokemonType?: PokemonType;
  isBaby?: boolean;
  isLegendary?: boolean;
  isMythical?: boolean;
}

export const getPokemonClassificationLabels = ({
  isReady,
  pokemonClass,
  pokemonType,
  isBaby,
  isLegendary,
  isMythical,
}: PokemonClassification) => {
  if (!isReady) {
    return [];
  }
  const labels: string[] = [];
  if (pokemonClass === PokemonClass.Legendary || isLegendary) {
    labels.push('Legendary');
  } else if (pokemonClass === PokemonClass.Mythical || isMythical) {
    labels.push('Mythical');
  } else if (pokemonClass === PokemonClass.UltraBeast) {
    labels.push('Ultra Beast');
  }
  const formLabels: Partial<Record<PokemonType, string>> = {
    [PokemonType.Mega]: 'Mega',
    [PokemonType.Primal]: 'Primal',
    [PokemonType.GMax]: 'Gigantamax',
    [PokemonType.Shadow]: 'Shadow',
    [PokemonType.Purified]: 'Purified',
  };
  const formLabel = formLabels[pokemonType ?? PokemonType.None];
  if (formLabel) {
    labels.push(formLabel);
  }
  if (isBaby) {
    labels.push('Baby');
  }
  return labels;
};

const classifications: Record<string, { icon: typeof StarsIcon; className: string }> = {
  Legendary: {
    icon: StarsIcon,
    className: '!tw-bg-amber-100 !tw-text-amber-900 !tw-border-amber-400',
  },
  Mythical: {
    icon: AutoAwesomeIcon,
    className: '!tw-bg-pink-100 !tw-text-pink-900 !tw-border-pink-400',
  },
  'Ultra Beast': {
    icon: PublicIcon,
    className: '!tw-bg-cyan-100 !tw-text-cyan-900 !tw-border-cyan-400',
  },
  Mega: {
    icon: BoltIcon,
    className: '!tw-bg-violet-100 !tw-text-violet-900 !tw-border-violet-400',
  },
  Primal: {
    icon: FlareIcon,
    className: '!tw-bg-orange-100 !tw-text-orange-900 !tw-border-orange-400',
  },
  Gigantamax: {
    icon: ExpandIcon,
    className: '!tw-bg-red-100 !tw-text-red-900 !tw-border-red-400',
  },
  Shadow: {
    icon: DarkModeIcon,
    className: '!tw-bg-slate-200 !tw-text-slate-900 !tw-border-slate-400',
  },
  Purified: {
    icon: AutoFixHighIcon,
    className: '!tw-bg-sky-100 !tw-text-sky-900 !tw-border-sky-400',
  },
  Baby: {
    icon: ChildCareIcon,
    className: '!tw-bg-emerald-100 !tw-text-emerald-900 !tw-border-emerald-400',
  },
};

const ClassificationBadge = ({ label }: { label: string }) => {
  const classification = classifications[label];
  const Icon = classification?.icon;

  return (
    <Chip
      label={label}
      icon={Icon ? <Icon className="!tw-text-inherit" /> : undefined}
      className={`tw-shrink-0 ${classification?.className ?? ''}`}
      size="small"
      variant="outlined"
    />
  );
};

export default ClassificationBadge;
