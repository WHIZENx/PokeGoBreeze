import React, { useEffect, useState } from 'react';
import APIService from '../../../services/api.service';
import {
  splitAndCapitalize,
  capitalize,
  convertPokemonImageName,
  generateParamForm,
  getValidPokemonImgPath,
  getDmgMultiplyBonus,
  getPokemonType,
  isSpecialFormType,
  getKeyWithData,
  getCustomThemeDataTable,
  createDataRows,
} from '../../../utils/utils';
import { ConditionalStyles, TableStyles } from 'react-data-table-component';
import Stats from '../../../components/Info/Stats/Stats';
import TableMove from '../../../components/Commons/Table/Move/MoveTable';

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import './StatsRanking.scss';
import { Checkbox } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSearchParams } from 'react-router-dom';
import { IPokemonData, PokemonProgress } from '../../../core/models/pokemon.model';
import {
  IPokemonStatsRanking,
  PokemonStatsRanking,
  StatsAtk,
  StatsDef,
  StatsProd,
  StatsSta,
} from '../../../core/models/stats.model';
import PokemonTable from '../../../components/Commons/Table/Pokemon/PokemonTable';
import { useTitle } from '../../../utils/hooks/useTitle';
import { Params } from '../../../utils/constants';
import { ColumnType, PokemonType, TypeAction } from '../../../enums/type.enum';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import {
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isEmpty,
  isEqual,
  isInclude,
  isNotEmpty,
  isNullOrUndefined,
  isNumber,
  toNumber,
} from '../../../utils/extension';
import { EqualMode, IncludeMode } from '../../../utils/enums/string.enum';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { IPokemonDetail, PokemonDetail } from '../../../core/models/API/info.model';
import { Action } from 'history';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import { debounce } from 'lodash';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../../components/Commons/Table/CustomDataTable/CustomDataTable';
import { IMenuItem } from '../../../components/models/component.model';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import useStats from '../../../composables/useStats';
import useRouter from '../../../composables/useRouter';
import usePokemon from '../../../composables/usePokemon';
import InputReleased from '../../../components/Commons/Input/InputReleased';
import FormControlMui from '../../../components/Commons/Form/FormControlMui';

const columnPokemon = createDataRows<TableColumnModify<IPokemonStatsRanking>>(
  {
    id: ColumnType.None,
    name: '',
    selector: (row) => (
      <LinkToTop
        to={`/pokemon/${row.num}${generateParamForm(row.form, row.pokemonType)}`}
        title={`#${row.num} ${splitAndCapitalize(row.name, '-', ' ')}`}
      >
        <VisibilityIcon className="view-pokemon theme-text-primary" fontSize="small" />
      </LinkToTop>
    ),
    width: '55px',
  },
  {
    id: ColumnType.Ranking,
    name: 'Ranking',
    selector: (row) => toNumber(row.rank),
    width: '80px',
  },
  {
    id: ColumnType.Id,
    name: 'ID',
    selector: (row) => row.num,
    width: '80px',
  },
  {
    id: ColumnType.Released,
    name: 'Released',
    selector: (row) => (row.releasedGO ? <DoneIcon color="success" /> : <CloseIcon color="error" />),
    width: '80px',
  },
  {
    id: ColumnType.Name,
    name: 'Pokémon Name',
    selector: (row) => (
      <PokemonIconType pokemonType={row.pokemonType} size={24}>
        <img
          height={48}
          alt="Pokémon Image"
          className="me-2"
          src={APIService.getPokeIconSprite(row.sprite, false)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = APIService.getPokeIconSprite(row.baseSpecies);
          }}
        />
        {splitAndCapitalize(row.name.replaceAll('_', '-'), '-', ' ')}
      </PokemonIconType>
    ),
    minWidth: '200px',
  },
  {
    id: ColumnType.Type,
    name: 'Type(s)',
    selector: (row) =>
      getValueOrDefault(Array, row.types).map((value, index) => (
        <IconType
          key={index}
          width={25}
          height={25}
          className="me-2"
          alt="Pokémon GO Type Logo"
          title={capitalize(value)}
          type={value}
        />
      )),
    width: '150px',
  },
  {
    id: ColumnType.Atk,
    name: 'ATK',
    selector: (row) => toNumber(row.atk.attack),
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Def,
    name: 'DEF',
    selector: (row) => toNumber(row.def.defense),
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Sta,
    name: 'STA',
    selector: (row) => toNumber(row.sta.stamina),
    sortable: true,
    width: '100px',
  },
  {
    id: ColumnType.Prod,
    name: 'Stat Prod',
    selector: (row) => toNumber(row.prod.product),
    sortable: true,
    width: '150px',
  }
);

const customStyles: TableStyles = {
  rows: {
    style: {
      cursor: 'pointer',
    },
  },
};

interface IFilter {
  isMatch: boolean;
  releasedGO: boolean;
}

class Filter implements IFilter {
  isMatch = false;
  releasedGO = false;

  static create(value: IFilter) {
    const obj = new Filter();
    Object.assign(obj, value);
    return obj;
  }
}

const defaultPerPages = 25;

const StatsRanking = () => {
  const { routerAction } = useRouter();
  const { getPokemonDetails } = usePokemon();
  useTitle({
    title: 'PokéGO Breeze - Stats Ranking',
    description:
      'View comprehensive Pokémon GO stat rankings to identify the strongest Pokémon for battles and raids. Compare attack, defense, stamina, and overall performance.',
    keywords: [
      'Pokémon stats ranking',
      'strongest Pokémon',
      'best attackers',
      'best defenders',
      'Pokémon GO ranking',
      'stat comparison',
    ],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [select, setSelect] = useState<IPokemonStatsRanking>();
  const conditionalRowStyles = createDataRows<ConditionalStyles<IPokemonStatsRanking>>(
    {
      when: () => true,
      style: { backgroundColor: 'var(--background-table-primary)' },
    },
    {
      when: (row) =>
        !isNullOrUndefined(select) && row.fullName === select.fullName && row.pokemonType === select.pokemonType,
      style: { backgroundColor: 'var(--table-highlight-row)', fontWeight: 'bold' },
    }
  );

  const { statsData } = useStats();
  const { getFilteredPokemons, getFindPokemon } = usePokemon();
  const [pokemon, setPokemon] = useState<IPokemonDetail>();

  const addShadowPurificationForms = (result: IPokemonStatsRanking[], value: IPokemonData, details: IPokemonData) => {
    const atkShadow = Math.round(value.statsGO.atk * getDmgMultiplyBonus(PokemonType.Shadow, TypeAction.Atk));
    const defShadow = Math.round(value.statsGO.def * getDmgMultiplyBonus(PokemonType.Shadow, TypeAction.Def));
    const sta = Math.round(value.statsGO.sta);
    const prodShadow = atkShadow * defShadow * sta;
    result.push(
      PokemonStatsRanking.create({
        ...value,
        releasedGO: details.releasedGO,
        pokemonType: PokemonType.Shadow,
        fullName: details.fullName,
        atk: StatsAtk.create({
          attack: atkShadow,
          rank: statsData?.attack?.ranking?.find((stat) => stat.attack === atkShadow)?.rank,
        }),
        def: StatsDef.create({
          defense: defShadow,
          rank: statsData?.defense?.ranking?.find((stat) => stat.defense === defShadow)?.rank,
        }),
        sta: StatsSta.create({
          stamina: sta,
          rank: statsData?.stamina?.ranking?.find((stat) => stat.stamina === sta)?.rank,
        }),
        prod: StatsProd.create({
          product: prodShadow,
          rank: statsData?.statProd?.ranking?.find((stat) => stat.product === prodShadow)?.rank,
        }),
      })
    );
    const atkPurification = Math.round(value.statsGO.atk * getDmgMultiplyBonus(PokemonType.Purified, TypeAction.Atk));
    const defPurification = Math.round(value.statsGO.def * getDmgMultiplyBonus(PokemonType.Purified, TypeAction.Def));
    const prodPurification = atkPurification * defPurification * sta;
    result.push(
      PokemonStatsRanking.create({
        ...value,
        releasedGO: details.releasedGO,
        pokemonType: PokemonType.Purified,
        atk: StatsAtk.create({
          attack: atkPurification,
          rank: statsData?.attack?.ranking?.find((stat) => stat.attack === atkPurification)?.rank,
        }),
        def: StatsDef.create({
          defense: defPurification,
          rank: statsData?.defense?.ranking?.find((stat) => stat.defense === defPurification)?.rank,
        }),
        sta: StatsSta.create({
          stamina: sta,
          rank: statsData?.stamina?.ranking?.find((stat) => stat.stamina === sta)?.rank,
        }),
        prod: StatsProd.create({
          product: prodPurification,
          rank: statsData?.statProd?.ranking?.find((stat) => stat.product === prodPurification)?.rank,
        }),
      })
    );
  };

  const mappingData = () => {
    const result: IPokemonStatsRanking[] = [];
    getFilteredPokemons().forEach((data) => {
      const details = getPokemonDetails(data.num, data.fullName, data.pokemonType, true);
      if (isSpecialFormType(data.pokemonType)) {
        details.pokemonType = PokemonType.Normal;
      }
      result.push(
        PokemonStatsRanking.create({
          ...data,
          releasedGO: details.releasedGO,
          pokemonType: details.pokemonType,
          fullName: details.fullName,
          atk: StatsAtk.create({
            attack: details.statsGO.atk,
            rank: statsData?.attack?.ranking?.find((stat) => stat.attack === details.statsGO.atk)?.rank,
          }),
          def: StatsDef.create({
            defense: details.statsGO.def,
            rank: statsData?.defense?.ranking?.find((stat) => stat.defense === details.statsGO.def)?.rank,
          }),
          sta: StatsSta.create({
            stamina: details.statsGO.sta,
            rank: statsData?.stamina?.ranking?.find((stat) => stat.stamina === details.statsGO.sta)?.rank,
          }),
          prod: StatsProd.create({
            product: details.statsGO.prod,
            rank: statsData?.statProd?.ranking?.find((stat) => stat.product === details.statsGO.prod)?.rank,
          }),
        })
      );

      if (data.hasShadowForm) {
        addShadowPurificationForms(result, data, details);
      }
    });
    return result;
  };

  const setSortBy = (id: ColumnType) => {
    const stats = new PokemonStatsRanking();
    switch (id) {
      case ColumnType.Atk:
        return [getPropertyName(stats, (o) => o.atk), getPropertyName(stats.atk, (o) => o.attack)];
      case ColumnType.Def:
        return [getPropertyName(stats, (o) => o.def), getPropertyName(stats.def, (o) => o.defense)];
      case ColumnType.Sta:
        return [getPropertyName(stats, (o) => o.sta), getPropertyName(stats.sta, (o) => o.stamina)];
      case ColumnType.Prod:
      default:
        return [getPropertyName(stats, (o) => o.prod), getPropertyName(stats.prod, (o) => o.product)];
    }
  };

  const setSortedPokemonRanking = (
    primary: IPokemonStatsRanking,
    secondary: IPokemonStatsRanking,
    sortBy: string[]
  ) => {
    const a = primary as unknown as DynamicObj<DynamicObj<number>>;
    const b = secondary as unknown as DynamicObj<DynamicObj<number>>;
    return b[sortBy[0]][sortBy[1]] - a[sortBy[0]][sortBy[1]];
  };

  const sortRanking = (pokemon: IPokemonStatsRanking[], id: ColumnType) => {
    const sortBy = setSortBy(id);
    const statsType = getStatsType(id);
    searchParams.set(Params.StatsType, statsType.toString());
    setSearchParams(searchParams);
    return pokemon
      .sort((a, b) => setSortedPokemonRanking(a, b, sortBy))
      .map((data, id) => {
        const result = data as unknown as DynamicObj<IPokemonStatsRanking>;
        return PokemonStatsRanking.create({
          ...data,
          id,
          rank: result[sortBy[0]]?.rank,
        });
      });
  };

  const getSortId = () => {
    const statsBy = toNumber(searchParams.get(Params.StatsType));
    switch (statsBy) {
      case TypeAction.Atk:
        return ColumnType.Atk;
      case TypeAction.Def:
        return ColumnType.Def;
      case TypeAction.Sta:
        return ColumnType.Sta;
      default:
        return ColumnType.Prod;
    }
  };

  const getStatsType = (id: ColumnType) => {
    switch (id) {
      case ColumnType.Atk:
        return TypeAction.Atk;
      case ColumnType.Def:
        return TypeAction.Def;
      case ColumnType.Sta:
        return TypeAction.Sta;
      case ColumnType.Prod:
      default:
        return TypeAction.Prod;
    }
  };

  const [page, setPage] = useState(1);
  const [sortId, setSortId] = useState(getSortId());
  const [pokemonList, setPokemonList] = useState<IPokemonStatsRanking[]>([]);
  const [pokemonFilter, setPokemonFilter] = useState<IPokemonStatsRanking[]>([]);

  const [filters, setFilters] = useState(new Filter());
  const { isMatch, releasedGO } = filters;

  const [progress, setProgress] = useState(new PokemonProgress());

  const menuItems = createDataRows<IMenuItem>(
    {
      label: (
        <FormControlMui
          control={
            <Checkbox
              checked={isMatch}
              onChange={(_, check) => setFilters(Filter.create({ ...filters, isMatch: check }))}
            />
          }
          label="Match Pokémon"
        />
      ),
    },
    {
      label: (
        <InputReleased
          releasedGO={releasedGO}
          setReleaseGO={(check) => setFilters(Filter.create({ ...filters, releasedGO: check }))}
          isAvailable={releasedGO}
          inputMode={'checkbox'}
        />
      ),
    }
  );

  useEffect(() => {
    if (
      isNotEmpty(getFilteredPokemons()) &&
      !isNotEmpty(pokemonList) &&
      statsData?.attack?.ranking &&
      statsData?.defense?.ranking &&
      statsData?.stamina?.ranking &&
      statsData?.statProd?.ranking
    ) {
      const mapping = mappingData();
      const pokemonList = sortRanking(mapping, sortId);
      setPokemonList(pokemonList);
      setPokemonFilter(pokemonList);
      setProgress((p) => PokemonProgress.create({ ...p, isLoadedForms: true }));
    }
  }, [pokemonList, getFilteredPokemons, statsData]);

  useEffect(() => {
    if (!select && isNotEmpty(pokemonList)) {
      const result = pokemonFilter[0];

      const details = getPokemonDetails(result.num, result.fullName, result.pokemonType, true);
      const pokemonDetails = PokemonDetail.setData(details);
      setPokemon(pokemonDetails);

      setSelect(result);
    }
  }, [select, pokemonList]);

  useEffect(() => {
    const paramId = searchParams.get(Params.Id);
    if (!select && isNumber(paramId) && isNotEmpty(pokemonFilter)) {
      const id = toNumber(paramId);
      const form = getValueOrDefault(String, searchParams.get(Params.Form), formNormal()).replaceAll('-', '_');
      const formType = searchParams.get(Params.FormType);
      const pokemonType = getPokemonType(formType);
      const index = pokemonFilter.findIndex(
        (row) =>
          row.num === id &&
          isEqual(row.form, form, EqualMode.IgnoreCaseSensitive) &&
          ((!formType && !isSpecialFormType(row.pokemonType)) || row.pokemonType === pokemonType)
      );
      if (index > -1) {
        const result = pokemonFilter[index];

        const details = getPokemonDetails(id, result.fullName, result.pokemonType, true);
        details.pokemonType = formType ? pokemonType : result.pokemonType ?? PokemonType.Normal;
        const pokemonDetails = PokemonDetail.setData(details);
        setPokemon(pokemonDetails);

        setPage(Math.ceil((index + 1) / defaultPerPages));
        setSelect(result);
        setSortId(getSortId());
        searchParams.delete(Params.Id);
        searchParams.delete(Params.Form);
        searchParams.delete(Params.FormType);
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, pokemonFilter, select]);

  const setFilterParams = (select: IPokemonStatsRanking) => {
    setSelect(select);
    searchParams.set(Params.Id, select.num.toString());
    const form = select.form?.replace(formNormal(), '').toLowerCase().replaceAll('_', '-');
    if (form) {
      searchParams.set(Params.Form, form);
    } else {
      searchParams.delete(Params.Form);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    if (isNotEmpty(pokemonList)) {
      const debounced = debounce(() => {
        setPokemonFilter(pokemonList.filter((pokemon) => (releasedGO ? pokemon.releasedGO : true)));
      });
      debounced();
      return () => {
        debounced.cancel();
      };
    }
  }, [isMatch, releasedGO, pokemonList]);

  useEffect(() => {
    const paramId = toNumber(searchParams.get(Params.Id));
    if (paramId > 0 && routerAction === Action.Pop && isNotEmpty(pokemonList)) {
      const form = getValueOrDefault(String, searchParams.get(Params.Form), formNormal()).replaceAll('-', '_');
      const formType = searchParams.get(Params.FormType);
      const pokemonType = getPokemonType(formType);
      const result = pokemonFilter.find(
        (row) =>
          row.num === paramId &&
          isEqual(row.form, form, EqualMode.IgnoreCaseSensitive) &&
          ((!formType && !isSpecialFormType(row.pokemonType)) || row.pokemonType === pokemonType)
      );
      if (result) {
        const details = getPokemonDetails(paramId, result.fullName, result.pokemonType, true);
        details.pokemonType = formType ? pokemonType : result.pokemonType ?? PokemonType.Normal;
        const pokemonDetails = PokemonDetail.setData(details);
        setPokemon(pokemonDetails);
        setSelect(result);
      }
    }
  }, [routerAction, pokemonList, searchParams]);

  return (
    <div className="pb-3 position-relative poke-container container">
      <div className="w-100 d-inline-block align-middle my-3">
        <div className="d-flex justify-content-center w-100">
          <div className="d-inline-block img-desc">
            <img
              className="pokemon-main-sprite v-align-baseline"
              alt="Image Pokemon"
              src={APIService.getPokeFullSprite(
                select?.num,
                convertPokemonImageName(select && isEqual(select.baseForme, select.form) ? '' : select?.form)
              )}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, select?.num);
              }}
            />
          </div>
        </div>
        <div className="row w-100 mt-2 m-0">
          <div className="col-xl-5 p-0">
            <PokemonTable
              id={select?.num}
              gen={select?.gen}
              formName={`${select?.name}${
                isSpecialFormType(select?.pokemonType) ? '-' + getKeyWithData(PokemonType, select.pokemonType) : ''
              }`}
              region={select?.region}
              version={select?.version}
              weight={select?.weightKg}
              height={select?.heightM}
              className="table-stats-ranking"
              isLoadedForms={progress.isLoadedForms}
            />
          </div>
          {select && (
            <div className="col-xl-7 p-0">
              <TableMove pokemonData={pokemon} maxHeight={400} />
            </div>
          )}
        </div>
      </div>
      <Stats
        statATK={select?.atk}
        statDEF={select?.def}
        statSTA={select?.sta}
        statProd={select?.prod}
        id={select?.num}
        form={select?.form}
        isDisabled
      />
      <CustomDataTable
        customColumns={columnPokemon}
        data={pokemonFilter}
        pagination
        defaultSortFieldId={getSortId()}
        defaultSortAsc={false}
        highlightOnHover
        onRowClicked={(row) => {
          if (select?.id !== row.id) {
            setFilterParams(row);
            const pokemon = getFindPokemon((pokemon) => pokemon.num === row.num && isEqual(row.form, pokemon.form));
            if (pokemon) {
              pokemon.pokemonType = row.pokemonType || PokemonType.Normal;
              const pokemonDetails = PokemonDetail.setData(pokemon);
              setPokemon(pokemonDetails);
            }
          }
        }}
        onSort={(rows) => {
          const rowsId = toNumber(rows.id);
          if (sortId !== rowsId) {
            setPokemonFilter(sortRanking(pokemonFilter, rowsId));
            setSortId(rowsId);
          }
        }}
        conditionalRowStyles={conditionalRowStyles}
        customDataStyles={getCustomThemeDataTable(customStyles)}
        paginationDefaultPage={page}
        paginationPerPage={defaultPerPages}
        paginationRowsPerPageOptions={Array.from(
          { length: 3 },
          (_, i) => defaultPerPages * Math.max(0, i - 1) + defaultPerPages * (i + 1)
        )}
        progressPending={!isNotEmpty(pokemonList)}
        progressComponent={<CircularProgressTable />}
        isShowSearch
        isAutoSearch
        inputPlaceholder="Search Pokémon Name or ID"
        menuItems={menuItems}
        searchFunction={(pokemon, search) =>
          isEmpty(search) ||
          (isMatch
            ? isEqual(pokemon.num, search) ||
              isEqual(splitAndCapitalize(pokemon.name, '-', ' '), search, EqualMode.IgnoreCaseSensitive)
            : isInclude(pokemon.num, search) ||
              isInclude(splitAndCapitalize(pokemon.name, '-', ' '), search, IncludeMode.IncludeIgnoreCaseSensitive))
        }
      />
    </div>
  );
};

export default StatsRanking;
