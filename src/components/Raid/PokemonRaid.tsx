import { Badge } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SelectMove from '../Input/SelectMove';
import SelectPokemon from '../Input/SelectPokemon';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

import update from 'immutability-helper';
import { TypeMove } from '../../enums/type.enum';
import APIService from '../../services/API.service';
import { IPokemonRaidComponent } from '../models/component.model';
import { combineClasses } from '../../util/utils';

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
      <span className="input-group-text justify-content-center position-relative" style={{ height: 38 }}>
        {dataTargetPokemon && (
          <div className="d-flex text-group-small">
            <span>
              LV: {dataTargetPokemon.stats?.level} {dataTargetPokemon.stats?.iv.atk}/{dataTargetPokemon.stats?.iv.def}/
              {dataTargetPokemon.stats?.iv.sta}{' '}
              {dataTargetPokemon.stats?.isShadow && <img height={24} alt="img-shadow" src={APIService.getPokeShadow()} />}
            </span>
          </div>
        )}
        <Badge color="primary" overlap="circular" badgeContent={props.id + 1} />
        {props.controls && (
          <div className="d-flex ic-group-small">
            <span
              className={combineClasses('ic-copy-small text-white', dataTargetPokemon ? 'bg-primary' : 'click-none bg-secondary')}
              title="Copy"
              onClick={() => {
                if (dataTargetPokemon) {
                  props.onOptionsPokemon(props.id, dataTargetPokemon);
                }
              }}
              style={{ marginRight: 5 }}
            >
              <SettingsIcon sx={{ fontSize: 16 }} />
            </span>
            <span
              className={combineClasses('ic-copy-small text-white', dataTargetPokemon ? 'bg-primary' : 'click-none bg-secondary')}
              title="Copy"
              onClick={() => {
                if (dataTargetPokemon) {
                  props.onCopyPokemon(props.id);
                }
              }}
              style={{ marginRight: 5 }}
            >
              <ContentCopyIcon sx={{ fontSize: 16 }} />
            </span>
            <span
              className={combineClasses(
                'ic-remove-small text-white',
                props.id > 0 || (props.data.length > 1 && props.data.at(0)?.dataTargetPokemon) ? 'bg-danger' : 'click-none bg-secondary'
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
              <DeleteIcon sx={{ fontSize: 16 }} />
            </span>
          </div>
        )}
      </span>
      <SelectPokemon
        clearData={props.clearData}
        selected={true}
        pokemon={dataTargetPokemon}
        defaultSetting={props.defaultSetting}
        setCurrentPokemon={setDataTargetPokemon}
        setFMovePokemon={setFMoveTargetPokemon}
        setCMovePokemon={setCMoveTargetPokemon}
        maxHeight={148}
      />
      <span className="input-group-text justify-content-center">
        <b>Fast Move</b>
      </span>
      {dataTargetPokemon ? (
        <SelectMove
          selected={true}
          inputType={'small'}
          clearData={props.clearData}
          pokemon={dataTargetPokemon}
          move={fMoveTargetPokemon}
          setMovePokemon={setFMoveTargetPokemon}
          moveType={TypeMove.FAST}
        />
      ) : (
        <div
          className="d-flex align-items-center w-100 card-select-disabled disable-card-move"
          style={{ height: 36, padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap' }}
        >
          <span style={{ paddingLeft: 8 }}>- Please select Pokémon -</span>
        </div>
      )}
      <span className="input-group-text justify-content-center">
        <b>Charged Move</b>
      </span>
      {dataTargetPokemon ? (
        <SelectMove
          selected={true}
          inputType={'small'}
          clearData={props.clearData}
          pokemon={dataTargetPokemon}
          move={cMoveTargetPokemon}
          setMovePokemon={setCMoveTargetPokemon}
          moveType={TypeMove.CHARGE}
        />
      ) : (
        <div
          className="d-flex align-items-center w-100 card-select-disabled disable-card-move"
          style={{ height: 36, padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap' }}
        >
          <span style={{ paddingLeft: 8 }}>- Please select Pokémon -</span>
        </div>
      )}
    </div>
  );
};

export default PokemonRaid;
