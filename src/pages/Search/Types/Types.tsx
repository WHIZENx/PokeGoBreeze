import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../../services/API.service';
import { capitalize, generateParamForm, getCustomThemeDataTable, getItemSpritePath, splitAndCapitalize } from '../../../util/utils';
import './Types.scss';
import CardType from '../../../components/Card/CardType';
import { computeBgType } from '../../../util/compute';
import { Tabs, Tab } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { calculateStatsByTag } from '../../../util/calculate';
import { CircularProgress, FormControlLabel, Switch, useTheme } from '@mui/material';
import { PokemonType, TypeMove } from '../../../enums/type.enum';
import { StoreState } from '../../../store/models/state.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ICombat } from '../../../core/models/combat.model';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';
import {
  combineClasses,
  convertColumnDataType,
  getValueOrDefault,
  isEqual,
  isIncludeList,
  isNotEmpty,
  toNumber,
} from '../../../util/extension';
import { ItemName } from '../../News/enums/item-type.enum';
import { LinkToTop } from '../../../util/hooks/LinkToTop';

const nameSort = (rowA: IPokemonData | ICombat, rowB: IPokemonData | ICombat) => {
  const a = getValueOrDefault(String, rowA.name.toLowerCase());
  const b = getValueOrDefault(String, rowB.name.toLowerCase());
  return a === b ? 0 : a > b ? 1 : -1;
};

const columnPokemon: TableColumnModify<IPokemonData>[] = [
  {
    name: 'ID',
    selector: (row) => row.num,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Pokémon Name',
    selector: (row) => (
      <LinkToTop to={`/pokemon/${row.num}${generateParamForm(row.forme)}`} title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}>
        <img
          height={48}
          alt="img-pokemon"
          style={{ marginRight: 10 }}
          src={APIService.getPokeIconSprite(row.sprite, false)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name, '-', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    name: 'Type(s)',
    selector: (row) =>
      row.types.map((value, index) => (
        <img
          key={index}
          style={{ marginRight: 10 }}
          width={25}
          height={25}
          alt="img-pokemon"
          title={capitalize(value)}
          src={APIService.getTypeSprite(value)}
        />
      )),
    width: '150px',
  },
  {
    name: 'ATK',
    selector: (row) => calculateStatsByTag(row, row.baseStats, row.slug).atk,
    sortable: true,
    width: '100px',
  },
  {
    name: 'DEF',
    selector: (row) => calculateStatsByTag(row, row.baseStats, row.slug).def,
    sortable: true,
    width: '100px',
  },
  {
    name: 'STA',
    selector: (row) => calculateStatsByTag(row, row.baseStats, row.slug).sta,
    sortable: true,
    width: '100px',
  },
];

const columnMove: TableColumnModify<ICombat>[] = [
  {
    name: 'ID',
    selector: (row) => row.id,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Move Name',
    selector: (row) => (
      <LinkToTop className="d-flex align-items-center" to={`/move/${row.id}`} title={`${splitAndCapitalize(row.name, '_', ' ')}`}>
        {splitAndCapitalize(row.name, '_', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    minWidth: '300px',
    sortFunction: nameSort,
  },
  {
    name: 'Power PVE',
    selector: (row) => row.pvePower,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Power PVP',
    selector: (row) => row.pvpPower,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Energy PVE',
    selector: (row) => `${row.pveEnergy > 0 ? '+' : ''}${row.pveEnergy}`,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Energy PVP',
    selector: (row) => `${row.pvpEnergy > 0 ? '+' : ''}${row.pvpEnergy}`,
    sortable: true,
    width: '120px',
  },
];

interface IPokemonTypeMove {
  pokemonList: IPokemonData[];
  fastMove: ICombat[];
  chargedMove: ICombat[];
}

class PokemonTypeMove implements IPokemonTypeMove {
  pokemonList: IPokemonData[] = [];
  fastMove: ICombat[] = [];
  chargedMove: ICombat[] = [];

  static create(value: IPokemonTypeMove) {
    const obj = new PokemonTypeMove();
    Object.assign(obj, value);
    return obj;
  }
}

interface IPokemonTypeData {
  pokemon: number;
  fastMoves: number | undefined;
  chargedMoves: number | undefined;
}

class PokemonTypeData implements IPokemonTypeData {
  pokemon = 0;
  fastMoves: number | undefined;
  chargedMoves: number | undefined;

  static create(value: IPokemonTypeData) {
    const obj = new PokemonTypeData();
    Object.assign(obj, value);
    return obj;
  }
}

const SearchTypes = () => {
  const theme = useTheme<ThemeModify>();
  const icon = useSelector((state: StoreState) => state.store.icon);
  const data = useSelector((state: StoreState) => state.store.data);
  const [typeList, setTypeList] = useState<string[]>([]);

  const [releasedGO, setReleaseGO] = useState(true);

  const [currentType, setCurrentType] = useState('');
  const [result, setResult] = useState(new PokemonTypeMove());
  const [allData, setAllData] = useState<IPokemonTypeData>();

  const [showType, setShowType] = useState(false);

  useEffect(() => {
    if (currentType) {
      document.title = `Type - ${capitalize(currentType)}`;
    }
  }, [currentType]);

  useEffect(() => {
    if (isNotEmpty(data.combat) && isNotEmpty(data.pokemon)) {
      setAllData(
        PokemonTypeData.create({
          pokemon: data.pokemon.filter((pokemon) => (releasedGO ? pokemon.releasedGO : true)).length - 1,
          fastMoves: data.combat.filter((type) => type.typeMove === TypeMove.Fast).length,
          chargedMoves: data.combat.filter((type) => type.typeMove === TypeMove.Charge).length,
        })
      );
    }
  }, [releasedGO, data.combat, data.pokemon]);

  useEffect(() => {
    setTypeList(Object.keys(data.typeEff));
  }, [data.typeEff]);

  useEffect(() => {
    if (isNotEmpty(typeList) && !currentType) {
      setCurrentType(typeList[0]);
    }
  }, [typeList, currentType]);

  useEffect(() => {
    if (isNotEmpty(data.pokemon) && isNotEmpty(data.combat)) {
      setResult(
        PokemonTypeMove.create({
          pokemonList: data.pokemon
            .filter((pokemon) => (releasedGO ? pokemon.releasedGO : true))
            .filter((pokemon) => isIncludeList(pokemon.types, currentType)),
          fastMove: data.combat.filter((type) => type.typeMove === TypeMove.Fast && isEqual(type.type, currentType)),
          chargedMove: data.combat.filter((type) => type.typeMove === TypeMove.Charge && isEqual(type.type, currentType)),
        })
      );
    }
  }, [currentType, releasedGO, data.pokemon, data.combat]);

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
                    .filter((value) => !isEqual(value, currentType))
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
              src={APIService.getPokemonGoIcon(icon)}
            />
            <b>{`Filter from ${allData?.pokemon} Pokémon`}</b>
          </span>
        }
      />
      <div className="row">
        <div className="col-xl-4 element-top">
          <div
            className={combineClasses('d-flex flex-column align-items-center type-info-container', `${currentType.toLowerCase()}-border`)}
            style={{ background: computeBgType(currentType, PokemonType.Normal, 1) }}
          >
            <div className="filter-shadow" style={{ width: 128 }}>
              <img
                style={{ padding: 15, backgroundColor: 'black', borderRadius: '50%' }}
                className="sprite-type-large"
                alt="img-type-pokemon"
                src={APIService.getTypeHqSprite(currentType)}
              />
            </div>
            <span
              style={{ width: 'max-content' }}
              className={combineClasses(currentType.toLowerCase(), 'type-select-bg d-flex align-items-center filter-shadow element-top')}
            >
              <div style={{ display: 'contents', width: 16 }}>
                <img
                  className="pokemon-sprite-small sprite-type-select filter-shadow"
                  alt="img-type-pokemon"
                  src={APIService.getTypeHqSprite(currentType)}
                />
              </div>
              <span className="filter-shadow">{capitalize(currentType)}</span>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={getItemSpritePath(ItemName.PokeBall)} />
              <b>{` Pokémon: ${result.pokemonList.length} (${
                isNotEmpty(result.pokemonList) &&
                toNumber(allData?.pokemon) > 0 &&
                Math.round((result.pokemonList.length * 100) / toNumber(allData?.pokemon, 1))
              }%)`}</b>
              <ul style={{ listStyleType: 'disc' }}>
                <li>
                  <b>{`Legacy Type: ${result.pokemonList.filter((pokemon) => pokemon.types.length === 1).length} (${
                    isNotEmpty(result.pokemonList) &&
                    toNumber(allData?.pokemon) > 0 &&
                    Math.round(
                      (result.pokemonList.filter((pokemon) => pokemon.types.length === 1).length * 100) / toNumber(allData?.pokemon, 1)
                    )
                  }%)`}</b>
                </li>
                <li>
                  <b>{`Include Type: ${result.pokemonList.filter((pokemon) => pokemon.types.length > 1).length} (${
                    isNotEmpty(result.pokemonList) &&
                    toNumber(allData?.pokemon) > 0 &&
                    Math.round(
                      (result.pokemonList.filter((pokemon) => pokemon.types.length > 1).length * 100) / toNumber(allData?.pokemon, 1)
                    )
                  }%)`}</b>
                </li>
              </ul>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('Item_1201')} />
              <b>{` Fast Moves: ${result.fastMove.length}/${toNumber(allData?.fastMoves)} (${Math.round(
                (result.fastMove.length * 100) / toNumber(allData?.fastMoves, 1)
              )}%)`}</b>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('Item_1202')} />
              <b>{` Charged Moves: ${result.chargedMove.length}/${toNumber(allData?.chargedMoves)} (${Math.round(
                (result.chargedMove.length * 100) / toNumber(allData?.chargedMoves, 1)
              )}%)`}</b>
            </span>
          </div>
        </div>
        <div className="col-xl-8 element-top">
          <Tabs defaultActiveKey="pokemonLegacyList" className="lg-2">
            <Tab eventKey="pokemonLegacyList" title="Pokémon Legacy Type List">
              <DataTable
                columns={convertColumnDataType(columnPokemon)}
                data={result.pokemonList.filter((pokemon) => pokemon.types.length === 1)}
                pagination={true}
                defaultSortFieldId={1}
                highlightOnHover={true}
                striped={true}
                customStyles={getCustomThemeDataTable(theme)}
                progressPending={!isNotEmpty(result.pokemonList)}
                progressComponent={
                  <div style={{ margin: 10 }}>
                    <CircularProgress />
                  </div>
                }
              />
            </Tab>
            <Tab eventKey="pokemonIncludeList" title="Pokémon Include Types List">
              <DataTable
                columns={convertColumnDataType(columnPokemon)}
                data={result.pokemonList.filter((pokemon) => pokemon.types.length > 1)}
                pagination={true}
                defaultSortFieldId={1}
                highlightOnHover={true}
                striped={true}
                customStyles={getCustomThemeDataTable(theme)}
                progressPending={!isNotEmpty(result.pokemonList)}
                progressComponent={
                  <div style={{ margin: 10 }}>
                    <CircularProgress />
                  </div>
                }
              />
            </Tab>
            <Tab eventKey="fastMovesList" title="Fast Move List">
              <DataTable
                columns={convertColumnDataType(columnMove)}
                data={result.fastMove}
                pagination={true}
                defaultSortFieldId={1}
                highlightOnHover={true}
                striped={true}
                customStyles={getCustomThemeDataTable(theme)}
                progressPending={!isNotEmpty(result.pokemonList)}
                progressComponent={
                  <div style={{ margin: 10 }}>
                    <CircularProgress />
                  </div>
                }
              />
            </Tab>
            <Tab eventKey="chargesMovesList" title="Charged Move List">
              <DataTable
                columns={convertColumnDataType(columnMove)}
                data={result.chargedMove}
                pagination={true}
                defaultSortFieldId={1}
                highlightOnHover={true}
                striped={true}
                customStyles={getCustomThemeDataTable(theme)}
                progressPending={!isNotEmpty(result.pokemonList)}
                progressComponent={
                  <div style={{ margin: 10 }}>
                    <CircularProgress />
                  </div>
                }
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SearchTypes;
