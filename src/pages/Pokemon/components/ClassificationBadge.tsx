import React from 'react';
import Chip from '@mui/material/Chip';
import StarsIcon from '@mui/icons-material/Stars';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';
import BoltIcon from '@mui/icons-material/Bolt';
import FlareIcon from '@mui/icons-material/Flare';
import ExpandIcon from '@mui/icons-material/Expand';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ChildCareIcon from '@mui/icons-material/ChildCare';

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
