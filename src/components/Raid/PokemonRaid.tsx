import { Badge } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SelectMove from '../Select/SelectMove';
import SelectPokemon from '../Select/SelectPokemon';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

import update from 'immutability-helper';
import { PokemonType, TypeMove } from '../../enums/type.enum';
import APIService from '../../services/api.service';
import { IPokemonRaidComponent } from '../models/component.model';
import { combineClasses } from '../../utils/extension';
import { InputType } from '../Input/enums/input-type.enum';
import { SelectMovePokemonModel } from '../Input/models/select-move.model';
import { SelectPosition } from '../Select/enums/select-type.enum';

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
    <div className="position-relative">
      <span className="input-group-text justify-content-center position-relative h-6">
        {dataTargetPokemon && (
          <div className="d-flex text-group-small">
            <span>
              LV: {dataTargetPokemon.stats?.level} {dataTargetPokemon.stats?.iv.atkIV}/
              {dataTargetPokemon.stats?.iv.defIV}/{`${dataTargetPokemon.stats?.iv.staIV} `}
              {dataTargetPokemon.stats?.pokemonType === PokemonType.Shadow && (
                <img height={24} alt="Image Shadow" src={APIService.getPokeShadow()} />
              )}
            </span>
          </div>
        )}
        <Badge color="primary" overlap="circular" badgeContent={props.id + 1} />
        {props.isControls && (
          <div className="d-flex ic-group-small">
            <span
              className={combineClasses(
                'ic-copy-small text-white me-1',
                dataTargetPokemon ? 'bg-primary' : 'click-none bg-secondary'
              )}
              title="Options"
              onClick={() => {
                if (dataTargetPokemon) {
                  props.onOptionsPokemon(props.id, dataTargetPokemon);
                }
              }}
            >
              <SettingsIcon className="u-fs-3" />
            </span>
            <span
              className={combineClasses(
                'ic-copy-small text-white me-1',
                dataTargetPokemon ? 'bg-primary' : 'click-none bg-secondary'
              )}
              title="Copy"
              onClick={() => {
                if (dataTargetPokemon && props.id >= 0) {
                  props.onCopyPokemon(props.id);
                }
              }}
            >
              <ContentCopyIcon className="u-fs-3" />
            </span>
            <span
              className={combineClasses(
                'ic-remove-small text-white',
                props.id > 0 || (props.data.length > 1 && props.data.at(0)?.dataTargetPokemon)
                  ? 'bg-danger'
                  : 'click-none bg-secondary'
              )}
              title="Remove"
              onClick={() => {
                if (props.id > 0 || (props.data.length > 1 && props.data.at(0)?.dataTargetPokemon)) {
                  setDataTargetPokemon(props.data[props.id + 1]?.dataTargetPokemon);
                  setFMoveTargetPokemon(props.data[props.id + 1]?.fMoveTargetPokemon);
                  setCMoveTargetPokemon(props.data[props.id + 1]?.cMoveTargetPokemon);
                  props.onRemovePokemon(props.id);
                }
              }}
            >
              <DeleteIcon className="u-fs-3" />
            </span>
          </div>
        )}
      </span>
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
      <span className="input-group-text justify-content-center">
        <b>Fast Move</b>
      </span>
      {dataTargetPokemon ? (
        <SelectMove
          isSelected
          inputType={InputType.Small}
          clearData={props.clearData}
          pokemon={
            new SelectMovePokemonModel(dataTargetPokemon.num, dataTargetPokemon.form, dataTargetPokemon.pokemonType)
          }
          move={fMoveTargetPokemon}
          setMovePokemon={setFMoveTargetPokemon}
          moveType={TypeMove.Fast}
          position={SelectPosition.Up}
          maxHeight={90}
        />
      ) : (
        <div
          className="d-flex align-items-center w-100 card-select-disabled disable-card-move p-1 overflow-x-hidden text-nowrap"
          style={{ height: 36 }}
        >
          <span className="ps-2">- Please select Pokémon -</span>
        </div>
      )}
      <span className="input-group-text justify-content-center">
        <b>Charged Move</b>
      </span>
      {dataTargetPokemon ? (
        <SelectMove
          isSelected
          inputType={InputType.Small}
          clearData={props.clearData}
          pokemon={
            new SelectMovePokemonModel(dataTargetPokemon.num, dataTargetPokemon.form, dataTargetPokemon.pokemonType)
          }
          move={cMoveTargetPokemon}
          setMovePokemon={setCMoveTargetPokemon}
          moveType={TypeMove.Charge}
          position={SelectPosition.Up}
        />
      ) : (
        <div
          className="d-flex align-items-center w-100 card-select-disabled disable-card-move p-1 overflow-x-hidden text-nowrap"
          style={{ height: 36 }}
        >
          <span className="ps-2">- Please select Pokémon -</span>
        </div>
      )}
    </div>
  );
};

export default PokemonRaid;
