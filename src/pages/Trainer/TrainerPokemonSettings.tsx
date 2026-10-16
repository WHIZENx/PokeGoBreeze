import React from 'react';
import { Box, Typography } from '@mui/material';
import InputMui from '../../components/Commons/Inputs/InputMui';
import SelectMui from '../../components/Commons/Selects/SelectMui';

export interface TrainerPokemonBuild {
  level?: number;
  iv: { atk: number; def: number; sta: number };
}

interface TrainerPokemonSettingsProps {
  levels: number[];
  build: TrainerPokemonBuild;
  onChange: (build: TrainerPokemonBuild) => void;
}

export const createDefaultTrainerPokemonBuild = (): TrainerPokemonBuild => ({
  iv: { atk: 15, def: 15, sta: 15 },
});

const TrainerPokemonSettings = ({ levels, build, onChange }: TrainerPokemonSettingsProps) => {
  const setIv = (stat: keyof TrainerPokemonBuild['iv'], value: string) => {
    onChange({ ...build, iv: { ...build.iv, [stat]: Number(value) } });
  };

  return (
    <Box className="trainer-slot-build">
      <Typography variant="caption" fontWeight={700}>
        Level &amp; IV
      </Typography>
      <Box className="trainer-slot-stats">
        <SelectMui<string>
          fullWidth
          inputLabel="Level"
          value={build.level?.toString() ?? 'auto'}
          onChangeSelect={(value) => onChange({ ...build, level: value === 'auto' ? undefined : Number(value) })}
          menuItems={[
            { value: 'auto', label: 'Auto (highest eligible)' },
            ...levels.map((level) => ({ value: level.toString(), label: level })),
          ]}
        />
        {(['atk', 'def', 'sta'] as const).map((stat) => (
          <InputMui
            key={stat}
            labelPrepend={stat.toUpperCase()}
            value={build.iv[stat]}
            inputProps={{
              'aria-label': `${stat.toUpperCase()} IV`,
              type: 'number',
              min: 0,
              max: 15,
              step: 1,
              required: true,
            }}
            onChange={(value) => setIv(stat, value)}
            fullWidth
          />
        ))}
      </Box>
    </Box>
  );
};

export default TrainerPokemonSettings;
