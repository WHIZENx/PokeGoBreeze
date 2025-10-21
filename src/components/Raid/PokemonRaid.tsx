import { Badge } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SelectPokemon from '../Commons/Selects/SelectPokemon';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

import update from 'immutability-helper';
import { PokemonType, TypeMove } from '../../enums/type.enum';
import APIService from '../../services/api.service';
import { IPokemonRaidComponent } from '../models/component.model';
import { SelectMovePokemonModel } from '../Commons/Inputs/models/select-move.model';
import SelectCardMove from '../Commons/Selects/SelectCardMove';
import ButtonMui from '../Commons/Buttons/ButtonMui';

const PokemonRaid = (props: IPokemonRaidComponent) => {
  const [dataTargetPokemon, setDataTargetPokemon] = useState(props.pokemon.dataTargetPokemon);
  const [fMoveTargetPokemon, setFMoveTargetPokemon] = useState(props.pokemon.fMoveTargetPokemon);
  const [cMoveTargetPokemon, setCMoveTargetPokemon] = useState(props.pokemon.cMoveTargetPokemon);

  useEffect(() => {
    props.setData(
      update(props.data, {
        [props.id]: {
          $merge: {
            dataTargetPokemon,
            fMoveTargetPokemon,
            cMoveTargetPokemon,
          },
        },
      })
    );
  }, [props.data, dataTargetPokemon, fMoveTargetPokemon, cMoveTargetPokemon, props.id, props.setData]);

  return (
    <div className="tw-relative tw-w-full">
      <div className="input-group-text tw-items-center tw-justify-center">
        <div className="tw-w-1/3 tw-float-left">
          {dataTargetPokemon && (
            <div className="tw-flex tw-items-center tw-font-bold">
              <span>
                LV: {dataTargetPokemon.stats?.level} {dataTargetPokemon.stats?.iv.atkIV}/
                {dataTargetPokemon.stats?.iv.defIV}/{`${dataTargetPokemon.stats?.iv.staIV} `}
                {dataTargetPokemon.stats?.pokemonType === PokemonType.Shadow && (
                  <img height={24} alt="Image Shadow" src={APIService.getPokeShadow()} />
                )}
              </span>
            </div>
          )}
        </div>
        <div className="tw-w-1/3">
          <Badge color="primary" overlap="circular" badgeContent={props.id + 1} />
        </div>
        <div className="tw-w-1/3 tw-float-right">
          {props.isControls && (
            <div className="tw-flex tw-items-center tw-justify-end tw-gap-2">
              <ButtonMui
                isRound
                className="ic-copy-small !tw-p-0 !tw-min-w-8 !tw-h-8"
                disabled={!dataTargetPokemon}
                title="Options"
                label={<SettingsIcon color="inherit" className="!tw-title-medium" />}
                onClick={() => props.onOptionsPokemon(props.id, dataTargetPokemon)}
              />
              <ButtonMui
                isRound
                className="ic-copy-small !tw-p-0 !tw-min-w-8 !tw-h-8"
                disabled={!dataTargetPokemon || props.id < 0}
                title="Copy"
                label={<ContentCopyIcon color="inherit" className="!tw-title-medium" />}
                onClick={() => props.onCopyPokemon(props.id)}
              />
              <ButtonMui
                isRound
                className="ic-remove-small !tw-p-0 !tw-min-w-8 !tw-h-8"
                disabled={props.id <= 0 && (props.data.length <= 1 || !props.data.at(0)?.dataTargetPokemon)}
                color="error"
                title="Remove"
                label={<DeleteIcon color="inherit" className="!tw-title-medium" />}
                onClick={() => {
                  setDataTargetPokemon(props.data[props.id + 1]?.dataTargetPokemon);
                  setFMoveTargetPokemon(props.data[props.id + 1]?.fMoveTargetPokemon);
                  setCMoveTargetPokemon(props.data[props.id + 1]?.cMoveTargetPokemon);
                  props.onRemovePokemon(props.id);
                }}
              />
            </div>
          )}
        </div>
      </div>
      <SelectPokemon
        clearData={props.clearData}
        isSelected
        pokemon={dataTargetPokemon}
        defaultSetting={props.defaultSetting}
        setCurrentPokemon={setDataTargetPokemon}
        setFMovePokemon={setFMoveTargetPokemon}
        setCMovePokemon={setCMoveTargetPokemon}
        maxHeight={120}
      />
      <span className="input-group-text tw-justify-center">
        <b>Fast Move</b>
      </span>
      <SelectCardMove
        pokemon={
          new SelectMovePokemonModel(dataTargetPokemon?.num, dataTargetPokemon?.form, dataTargetPokemon?.pokemonType)
        }
        move={fMoveTargetPokemon}
        setMovePokemon={setFMoveTargetPokemon}
        moveType={TypeMove.Fast}
        emptyText="- Please select Pokémon -"
      />
      <span className="input-group-text tw-justify-center">
        <b>Charged Move</b>
      </span>
      <SelectCardMove
        pokemon={
          new SelectMovePokemonModel(dataTargetPokemon?.num, dataTargetPokemon?.form, dataTargetPokemon?.pokemonType)
        }
        move={cMoveTargetPokemon}
        setMovePokemon={setCMoveTargetPokemon}
        moveType={TypeMove.Charge}
        emptyText="- Please select Pokémon -"
      />
    </div>
  );
};

export default PokemonRaid;
