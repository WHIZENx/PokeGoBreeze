import { Badge } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SelectMove from '../Input/SelectMove';
import SelectPokemon from '../Input/SelectPokemon';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

import update from 'immutability-helper';
import { TypeMove } from '../../enums/move.enum';
import APIService from '../../services/API.service';
import { IPokemonData, IPokemonDataStats, PokemonRaidModel } from '../../core/models/pokemon.model';

const PokemonRaid = (props: {
  id: number;
  pokemon: PokemonRaidModel;
  data: PokemonRaidModel[];
  setData: React.Dispatch<React.SetStateAction<PokemonRaidModel[]>>;
  defaultSetting: IPokemonDataStats;
  controls: boolean;
  // eslint-disable-next-line no-unused-vars
  onCopyPokemon: (index: number) => void;
  // eslint-disable-next-line no-unused-vars
  onRemovePokemon: (index: number) => void;
  // eslint-disable-next-line no-unused-vars
  onOptionsPokemon: (index: number, pokemon: IPokemonData) => void;
  clearData?: () => void;
}) => {
  const [dataTargetPokemon, setDataTargetPokemon] = useState(props.pokemon.dataTargetPokemon);
  const [fmoveTargetPokemon, setFmoveTargetPokemon] = useState(props.pokemon.fmoveTargetPokemon);
  const [cmoveTargetPokemon, setCmoveTargetPokemon] = useState(props.pokemon.cmoveTargetPokemon);

  useEffect(() => {
    props.setData(
      update(props.data, {
        [props.id]: {
          $merge: {
            dataTargetPokemon,
            fmoveTargetPokemon,
            cmoveTargetPokemon,
          },
        },
      })
    );
  }, [props.data, dataTargetPokemon, fmoveTargetPokemon, cmoveTargetPokemon, props.id, props.setData]);

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
              className={'ic-copy-small text-white ' + (dataTargetPokemon ? 'bg-primary' : 'click-none bg-secondary')}
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
              className={'ic-copy-small text-white ' + (dataTargetPokemon ? 'bg-primary' : 'click-none bg-secondary')}
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
              className={
                'ic-remove-small text-white ' +
                (props.id > 0 || (props.data.length > 1 && props.data.at(0)?.dataTargetPokemon) ? 'bg-danger' : 'click-none bg-secondary')
              }
              title="Remove"
              onClick={() => {
                if (props.id > 0 || (props.data.length > 1 && props.data.at(0)?.dataTargetPokemon)) {
                  setDataTargetPokemon(props.data[props.id + 1]?.dataTargetPokemon);
                  setFmoveTargetPokemon(props.data[props.id + 1]?.fmoveTargetPokemon);
                  setCmoveTargetPokemon(props.data[props.id + 1]?.cmoveTargetPokemon);
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
        setFMovePokemon={setFmoveTargetPokemon}
        setCMovePokemon={setCmoveTargetPokemon}
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
          move={fmoveTargetPokemon}
          setMovePokemon={setFmoveTargetPokemon}
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
          move={cmoveTargetPokemon}
          setMovePokemon={setCmoveTargetPokemon}
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
