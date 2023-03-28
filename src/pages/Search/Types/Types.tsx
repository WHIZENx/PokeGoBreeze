import React, { useRef, useState, useEffect } from 'react';
import { useSelector, RootStateOrAny } from 'react-redux';
import APIService from '../../../services/API.service';
import { capitalize, convertFormName, getCustomThemeDataTable, splitAndCapitalize } from '../../../util/Utils';
import './Types.scss';
import CardType from '../../../components/Card/CardType';
import { computeBgType } from '../../../util/Compute';
import { Tabs, Tab } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { calculateStatsByTag } from '../../../util/Calculate';
import { FormControlLabel, Switch, useTheme } from '@mui/material';

const nameSort = (rowA: { name: string }, rowB: { name: string }) => {
  const a = rowA.name.toLowerCase();
  const b = rowB.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const moveSort = (rowA: { name: string }, rowB: { name: string }) => {
  const a = rowA.name.toLowerCase();
  const b = rowB.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const columnPokemon: any = [
  {
    name: 'ID',
    selector: (row: { num: any }) => row.num,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Pokémon Name',
    selector: (row: { num: any; forme: string; name: string; sprite: string; baseSpecies: string }) => (
      <Link
        to={`/pokemon/${row.num}${row.forme ? `?form=${convertFormName(row.num, row.forme.toLowerCase())}` : ''}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.sprite, true)}
          onError={(e: any) => {
            e.onerror = null;
            e.target.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name, '-', ' ')}
      </Link>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    name: 'Type(s)',
    selector: (row: { types: any[] }) =>
      row.types.map((value: any, index: React.Key) => (
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
    selector: (row: { baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }; slug: string | null }) =>
      calculateStatsByTag(row, row.baseStats, row.slug).atk,
    sortable: true,
    width: '100px',
  },
  {
    name: 'DEF',
    selector: (row: { baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }; slug: string | null }) =>
      calculateStatsByTag(row, row.baseStats, row.slug).def,
    sortable: true,
    width: '100px',
  },
  {
    name: 'STA',
    selector: (row: { baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }; slug: string | null }) =>
      calculateStatsByTag(row, row.baseStats, row.slug).sta,
    sortable: true,
    width: '100px',
  },
];

const columnMove: any = [
  {
    name: 'ID',
    selector: (row: { id: any }) => row.id,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Move Name',
    selector: (row: { id: string; name: string }) => (
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
    sortFunction: moveSort,
  },
  {
    name: 'Power PVE',
    selector: (row: { pve_power: any }) => row.pve_power,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Power PVP',
    selector: (row: { pvp_power: any }) => row.pvp_power,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Energy PVE',
    selector: (row: { pve_energy: any }) => `${row.pve_energy > 0 ? '+' : ''}${row.pve_energy}`,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Energy PVP',
    selector: (row: { pvp_energy: any }) => `${row.pvp_energy > 0 ? '+' : ''}${row.pvp_energy}`,
    sortable: true,
    width: '120px',
  },
];

const SearchTypes = () => {
  const theme = useTheme();
  const icon = useSelector((state: RootStateOrAny) => state.store.icon);
  const data = useSelector((state: RootStateOrAny) => state.store.data);
  const typeList = useRef(Object.keys(data.typeEff));

  const [releasedGO, setReleaseGO] = useState(true);

  const [currentType, setCurrentType]: any = useState(typeList.current[0]);
  const [result, setResult]: any = useState({
    pokemonList: [],
    fastMove: [],
    chargedMove: [],
  });
  const allData = {
    pokemon: data.released.filter((pokemon: { releasedGO: boolean }) => (releasedGO ? pokemon.releasedGO : true)).length - 1,
    fastMoves: data.combat.filter((type: { type_move: string; type: string }) => type.type_move === 'FAST').length,
    chargedMoves: data.combat.filter((type: { type_move: string; type: string }) => type.type_move === 'CHARGE').length,
  };

  const [showType, setShowType] = useState(false);

  useEffect(() => {
    document.title = `${capitalize(currentType)} - Type`;
  }, [currentType]);

  useEffect(() => {
    setResult({
      pokemonList: data.released
        .filter((pokemon: { releasedGO: boolean }) => (releasedGO ? pokemon.releasedGO : true))
        .filter((pokemon: any) => pokemon.types.includes(capitalize(currentType))),
      fastMove: data.combat.filter((type: { type_move: string; type: string }) => type.type_move === 'FAST' && type.type === currentType),
      chargedMove: data.combat.filter(
        (type: { type_move: string; type: string }) => type.type_move === 'CHARGE' && type.type === currentType
      ),
    });
  }, [currentType, releasedGO]);

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
                  {Object.keys(data.typeEff)
                    .filter((value) => value !== currentType)
                    .map((value: any, index: React.Key) => (
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
        control={<Switch checked={releasedGO} onChange={(event, check) => setReleaseGO(check)} />}
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
            className={'d-flex flex-column align-items-center type-info-container ' + currentType.toLowerCase() + '-border'}
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
              className={currentType.toLowerCase() + ' type-select-bg d-flex align-items-center filter-shadow element-top'}
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
              <b>{`Pokémon: ${result.pokemonList.length} (${Math.round((result.pokemonList.length * 100) / allData.pokemon)}%)`}</b>
              <ul style={{ listStyleType: 'disc' }}>
                <li>
                  <b>{`Legacy Type: ${result.pokemonList.filter((pokemon: any) => pokemon.types.length === 1).length} (${Math.round(
                    (result.pokemonList.filter((pokemon: any) => pokemon.types.length === 1).length * 100) / allData.pokemon
                  )}%)`}</b>
                </li>
                <li>
                  <b>{`Include Type: ${result.pokemonList.filter((pokemon: any) => pokemon.types.length > 1).length} (${Math.round(
                    (result.pokemonList.filter((pokemon: any) => pokemon.types.length > 1).length * 100) / allData.pokemon
                  )}%)`}</b>
                </li>
              </ul>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('Item_1201')} />{' '}
              <b>{`Fast Moves: ${result.fastMove.length}/${allData.fastMoves} (${Math.round(
                (result.fastMove.length * 100) / allData.fastMoves
              )}%)`}</b>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('Item_1202')} />{' '}
              <b>{`Charge Moves: ${result.chargedMove.length}/${allData.chargedMoves} (${Math.round(
                (result.chargedMove.length * 100) / allData.chargedMoves
              )}%)`}</b>
            </span>
          </div>
        </div>
        <div className="col-xl-8 element-top">
          <Tabs defaultActiveKey="pokemonLegacyList" className="lg-2">
            <Tab eventKey="pokemonLegacyList" title="Pokémon Legacy Type List">
              <DataTable
                columns={columnPokemon}
                data={result ? result.pokemonList.filter((pokemon: any) => pokemon.types.length === 1) : []}
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
                data={result ? result.pokemonList.filter((pokemon: any) => pokemon.types.length > 1) : []}
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
