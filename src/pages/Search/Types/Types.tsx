import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { capitalize, getCustomThemeDataTable, splitAndCapitalize } from '../../../util/Utils';
import './Types.scss';
import CardType from '../../../components/Card/CardType';
import { computeBgType } from '../../../util/Compute';
import { Tabs, Tab } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { calculateStatsByTag } from '../../../util/Calculate';
import { FormControlLabel, Switch, useTheme } from '@mui/material';
import { TypeMove } from '../../../enums/move.enum';
import { StoreState } from '../../../store/models/state.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';
import { DEFAULT_TYPES } from '../../../util/Constants';
import { Combat } from '../../../core/models/combat.model';

const nameSort = (rowA: PokemonDataModel | Combat | undefined, rowB: PokemonDataModel | Combat | undefined) => {
  const a = rowA?.name.toLowerCase();
  const b = rowB?.name.toLowerCase();
  return a === b ? 0 : (a ?? 0) > (b ?? 0) ? 1 : -1;
};

const columnPokemon: any = [
  {
    name: 'ID',
    selector: (row: PokemonDataModel | undefined) => row?.num,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Pokémon Name',
    selector: (row: PokemonDataModel | undefined) => (
      <Link
        to={`/pokemon/${row?.num}${row?.forme ? `?form=${row.forme.toLowerCase().replaceAll('_', '-')}` : ''}`}
        title={`#${row?.num} ${splitAndCapitalize(row?.name, '-', ' ')}`}
      >
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row?.sprite ?? '', true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row?.baseSpecies ?? '');
          }}
        />
        {splitAndCapitalize(row?.name, '-', ' ')}
      </Link>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    name: 'Type(s)',
    selector: (row: PokemonDataModel | undefined) =>
      row?.types.map((value, index) => (
        <img
          key={index}
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          title={capitalize(value)}
          src={APIService.getTypeSprite(capitalize(value))}
        />
      )),
    width: '150px',
  },
  {
    name: 'ATK',
    selector: (row: PokemonDataModel | undefined) => calculateStatsByTag(row, row?.baseStats, row?.slug).atk,
    sortable: true,
    width: '100px',
  },
  {
    name: 'DEF',
    selector: (row: PokemonDataModel | undefined) => calculateStatsByTag(row, row?.baseStats, row?.slug).def,
    sortable: true,
    width: '100px',
  },
  {
    name: 'STA',
    selector: (row: PokemonDataModel | undefined) => calculateStatsByTag(row, row?.baseStats, row?.slug).sta,
    sortable: true,
    width: '100px',
  },
];

const columnMove: any = [
  {
    name: 'ID',
    selector: (row: Combat) => row.id,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Move Name',
    selector: (row: Combat) => (
      <Link
        className="d-flex align-items-center"
        to={'/move/' + row.id}
        title={`${splitAndCapitalize(row.name, '_', ' ').replaceAll(' Plus', '+')}`}
      >
        {splitAndCapitalize(row.name, '_', ' ').replaceAll(' Plus', '+')}
      </Link>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    name: 'Power PVE',
    selector: (row: Combat) => row.pve_power,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Power PVP',
    selector: (row: Combat) => row.pvp_power,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Energy PVE',
    selector: (row: Combat) => `${row.pve_energy > 0 ? '+' : ''}${row.pve_energy}`,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Energy PVP',
    selector: (row: Combat) => `${row.pvp_energy > 0 ? '+' : ''}${row.pvp_energy}`,
    sortable: true,
    width: '120px',
  },
];

const SearchTypes = () => {
  const theme = useTheme();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const [typeList, setTypeList] = useState([] as string[]);

  const [releasedGO, setReleaseGO] = useState(true);

  const [currentType, setCurrentType] = useState('');
  const [result, setResult] = useState({
    pokemonList: [] as PokemonDataModel[],
    fastMove: [] as Combat[],
    chargedMove: [] as Combat[],
  });
  const allData = {
    pokemon: (data?.pokemon?.filter((pokemon) => (releasedGO ? pokemon.releasedGO : true))?.length ?? 1) - 1,
    fastMoves: data?.combat?.filter((type) => type.type_move === TypeMove.FAST)?.length,
    chargedMoves: data?.combat?.filter((type) => type.type_move === TypeMove.CHARGE)?.length,
  };

  const [showType, setShowType] = useState(false);

  useEffect(() => {
    if (currentType) {
      document.title = `${capitalize(currentType)} - Type`;
    }
  }, [currentType]);

  useEffect(() => {
    setTypeList(data?.typeEff ? Object.keys(data?.typeEff) : DEFAULT_TYPES);
  }, [data?.typeEff]);

  useEffect(() => {
    if (typeList.length > 0 && !currentType) {
      setCurrentType(typeList.at(0) ?? '');
    }
  }, [typeList, currentType]);

  useEffect(() => {
    if (data?.pokemon) {
      setResult({
        pokemonList: data?.pokemon
          ?.filter((pokemon) => (releasedGO ? pokemon.releasedGO : true))
          .filter((pokemon) => pokemon.types.includes(currentType)),
        fastMove: data?.combat?.filter((type) => type.type_move === TypeMove.FAST && type.type === currentType),
        chargedMove: data?.combat?.filter((type) => type.type_move === TypeMove.CHARGE && type.type === currentType),
      });
    }
  }, [currentType, releasedGO, data?.pokemon]);

  const changeType = (value: string) => {
    setShowType(false);
    setCurrentType(value);
  };

  return (
    <div className="container element-top" style={{ color: theme.palette.text.primary }}>
      <div className="d-flex justify-content-end">
        <div>
          <h6 className="text-center">
            <b>Select Type</b>
          </h6>
          <div
            className="card-input"
            style={{ marginBottom: 15 }}
            tabIndex={0}
            onClick={() => setShowType(true)}
            onBlur={() => setShowType(false)}
          >
            <div className="card-select">
              <CardType value={capitalize(currentType)} />
            </div>
            {showType && (
              <div className="result-type">
                <ul>
                  {Object.keys(data?.typeEff ?? {})
                    .filter((value) => value !== currentType)
                    .map((value, index) => (
                      <li className="container card-pokemon" key={index} onMouseDown={() => changeType(value)}>
                        <CardType value={capitalize(value)} />
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <FormControlLabel
        control={<Switch checked={releasedGO} onChange={(_, check) => setReleaseGO(check)} />}
        label={
          <span className="d-flex align-items-center">
            Released in GO
            <img
              className={releasedGO ? '' : 'filter-gray'}
              width={28}
              height={28}
              style={{ marginLeft: 5, marginRight: 5 }}
              alt="pokemon-go-icon"
              src={APIService.getPokemonGoIcon(icon ?? 'Standard')}
            />
            <b>{`Filter from ${allData.pokemon} Pokémon`}</b>
          </span>
        }
      />
      <div className="row">
        <div className="col-xl-4 element-top">
          <div
            className={'d-flex flex-column align-items-center type-info-container ' + currentType?.toLowerCase() + '-border'}
            style={{ background: computeBgType(currentType, false, false, 1) }}
          >
            <div className="filter-shadow" style={{ width: 128 }}>
              <img
                style={{ padding: 15, backgroundColor: 'black', borderRadius: '50%' }}
                className="sprite-type-large"
                alt="img-type-pokemon"
                src={APIService.getTypeHqSprite(capitalize(currentType))}
              />
            </div>
            <span
              style={{ width: 'max-content' }}
              className={currentType?.toLowerCase() + ' type-select-bg d-flex align-items-center filter-shadow element-top'}
            >
              <div style={{ display: 'contents', width: 16 }}>
                <img
                  className="pokemon-sprite-small sprite-type-select filter-shadow"
                  alt="img-type-pokemon"
                  src={APIService.getTypeHqSprite(capitalize(currentType))}
                />
              </div>
              <span className="filter-shadow">{capitalize(currentType)}</span>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('pokeball_sprite')} />{' '}
              <b>{`Pokémon: ${result.pokemonList?.length} (${
                result.pokemonList && allData.pokemon && Math.round((result.pokemonList?.length * 100) / allData.pokemon)
              }%)`}</b>
              <ul style={{ listStyleType: 'disc' }}>
                <li>
                  <b>{`Legacy Type: ${result.pokemonList?.filter((pokemon: PokemonDataModel) => pokemon.types.length === 1).length} (${
                    result.pokemonList &&
                    allData.pokemon &&
                    Math.round(
                      (result.pokemonList?.filter((pokemon: PokemonDataModel) => pokemon.types.length === 1).length * 100) / allData.pokemon
                    )
                  }%)`}</b>
                </li>
                <li>
                  <b>{`Include Type: ${result.pokemonList?.filter((pokemon: PokemonDataModel) => pokemon.types.length > 1).length} (${
                    result.pokemonList &&
                    allData.pokemon &&
                    Math.round(
                      (result.pokemonList?.filter((pokemon: PokemonDataModel) => pokemon.types.length > 1).length * 100) / allData.pokemon
                    )
                  }%)`}</b>
                </li>
              </ul>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('Item_1201')} />{' '}
              <b>{`Fast Moves: ${result.fastMove?.length}/${allData.fastMoves ?? 0} (${Math.round(
                (result.fastMove?.length * 100) / (allData.fastMoves ?? 1)
              )}%)`}</b>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('Item_1202')} />{' '}
              <b>{`Charged Moves: ${result.chargedMove?.length}/${allData.chargedMoves ?? 0} (${Math.round(
                (result.chargedMove?.length * 100) / (allData.chargedMoves ?? 1)
              )}%)`}</b>
            </span>
          </div>
        </div>
        <div className="col-xl-8 element-top">
          <Tabs defaultActiveKey="pokemonLegacyList" className="lg-2">
            <Tab eventKey="pokemonLegacyList" title="Pokémon Legacy Type List">
              <DataTable
                columns={columnPokemon}
                data={result ? result.pokemonList?.filter((pokemon: PokemonDataModel) => pokemon.types.length === 1) : []}
                pagination={true}
                defaultSortFieldId={1}
                highlightOnHover={true}
                striped={true}
                customStyles={getCustomThemeDataTable(theme)}
              />
            </Tab>
            <Tab eventKey="pokemonIncludeList" title="Pokémon Include Types List">
              <DataTable
                columns={columnPokemon}
                data={result ? result.pokemonList?.filter((pokemon: PokemonDataModel) => pokemon.types.length > 1) : []}
                pagination={true}
                defaultSortFieldId={1}
                highlightOnHover={true}
                striped={true}
                customStyles={getCustomThemeDataTable(theme)}
              />
            </Tab>
            <Tab eventKey="fastMovesList" title="Fast Move List">
              <DataTable
                columns={columnMove}
                data={result ? result.fastMove : []}
                pagination={true}
                defaultSortFieldId={1}
                highlightOnHover={true}
                striped={true}
                customStyles={getCustomThemeDataTable(theme)}
              />
            </Tab>
            <Tab eventKey="chargesMovesList" title="Charged Move List">
              <DataTable
                columns={columnMove}
                data={result ? result.chargedMove : []}
                pagination={true}
                defaultSortFieldId={1}
                highlightOnHover={true}
                striped={true}
                customStyles={getCustomThemeDataTable(theme)}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SearchTypes;
