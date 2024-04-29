import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../services/API.service';

import './Pokemon.scss';

import { checkPokemonIncludeShadowForm, convertFormNameImg, convertName, getPokemonById, splitAndCapitalize } from '../../util/Utils';
import { FORM_GMAX, FORM_NORMAL, FORM_PURIFIED, FORM_SHADOW, FORM_STANDARD, KEY_LEFT, KEY_RIGHT, regionList } from '../../util/Constants';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Form from '../../components/Info/Form/Form';

import PokemonModel from '../../components/Info/Assets/PokemonModel';
import Error from '../Error/Error';
import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../store/actions/spinner.action';
import Candy from '../../components/Sprites/Candy/Candy';
import { useTheme } from '@mui/material';
import { Action } from 'history';
import { RouterState, SpinnerState, StatsState, StoreState } from '../../store/models/state.model';
import { SearchingModel } from '../../store/models/searching.model';
import { Species } from '../../core/models/API/species.model';
import { PokemonInfo } from '../../core/models/API/info.model';
import { FormModel, PokemonForm, PokemonFormModify, PokemonFormModifyModel } from '../../core/models/API/form.model';
import { OptionsPokemon, PokemonDataModel, PokemonGenderRatio } from '../../core/models/pokemon.model';
import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import { PokemonTypeCost } from '../../core/models/evolution.model';
import SearchBar from './components/SearchBar';
import SearchBarMain from './components/SearchBarMain';
import AlertReleased from './components/AlertReleased';
import PokemonTable from '../../components/Table/Pokemon/PokemonTable';

interface TypeCost {
  purified: PokemonTypeCost;
  thirdMove: PokemonTypeCost;
}

const Pokemon = (props: {
  prevRouter?: ReduxRouterState;
  searching?: SearchingModel | null;
  id?: string;
  onDecId?: () => void;
  onIncId?: () => void;
  isSearch?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSetIDPoke?: (id: number) => void;
  first?: boolean;
  setFirst?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useSelector((state: RouterState) => state.router);
  const icon = useSelector((state: StoreState) => state.store.icon);
  const stats = useSelector((state: StatsState) => state.stats);
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const pokemonData = useSelector((state: StoreState) => state.store?.data?.pokemon ?? []);

  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pokeData, setPokeData]: [PokemonInfo[], React.Dispatch<React.SetStateAction<PokemonInfo[]>>] = useState([] as PokemonInfo[]);
  const [formList, setFormList]: [
    PokemonFormModify[][] | undefined,
    React.Dispatch<React.SetStateAction<PokemonFormModify[][] | undefined>>
  ] = useState();

  const [reForm, setReForm] = useState(false);

  const [data, setData]: [Species | undefined, React.Dispatch<React.SetStateAction<Species | undefined>>] = useState();
  const [dataStorePokemon, setDataStorePokemon]: [
    OptionsPokemon | undefined,
    React.Dispatch<React.SetStateAction<OptionsPokemon | undefined>>
  ] = useState();
  const [pokeRatio, setPokeRatio]: [PokemonGenderRatio | undefined, React.Dispatch<React.SetStateAction<PokemonGenderRatio | undefined>>] =
    useState();

  const [version, setVersion] = useState('');
  const [region, setRegion] = useState('');
  const [WH, setWH] = useState({ weight: 0, height: 0 });
  const [formName, setFormName]: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>] = useState();
  const [form, setForm]: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>] = useState();
  const [released, setReleased] = useState(true);
  const [isFound, setIsFound] = useState(true);
  const [defaultForm, setDefaultForm]: [
    PokemonFormModify | undefined,
    React.Dispatch<React.SetStateAction<PokemonFormModify | undefined>>
  ] = useState();

  const [costModifier, setCostModifier]: [TypeCost, React.Dispatch<React.SetStateAction<TypeCost>>] = useState({
    purified: {},
    thirdMove: {},
  });

  const [onChangeForm, setOnChangeForm] = useState(false);

  const axios = APIService;
  const cancelToken = axios.getAxios().CancelToken;
  const source = cancelToken.source();
  const { enqueueSnackbar } = useSnackbar();

  const getRatioGender = (id: number) => {
    return pokemonData.find((item) => id === item.num)?.genderRatio;
  };

  const fetchMap = useCallback(
    async (data: Species) => {
      setData(data);
      const dataPokeList: PokemonInfo[] = [];
      const dataFormList: PokemonForm[][] = [];
      await Promise.all(
        data?.varieties.map(async (value) => {
          const pokeInfo = (await axios.getFetchUrl<PokemonInfo>(value.pokemon.url, { cancelToken: source.token })).data;
          const pokeForm = await Promise.all(
            pokeInfo.forms.map(async (item) => (await axios.getFetchUrl<PokemonForm>(item.url, { cancelToken: source.token })).data)
          );
          dataPokeList.push({
            ...pokeInfo,
            is_include_shadow: checkPokemonIncludeShadowForm(pokemonData, pokeInfo.name),
          });
          dataFormList.push(pokeForm);
        })
      );

      setPokeRatio(getRatioGender(data?.id));
      const costModifier = getCostModifier(data?.id);
      setCostModifier({
        purified: {
          candy: costModifier?.purified?.candy,
          stardust: costModifier?.purified?.stardust,
        },
        thirdMove: {
          candy: costModifier?.thirdMove?.candy,
          stardust: costModifier?.thirdMove?.stardust,
        },
      });

      setPokeData(dataPokeList);
      let modify = false;
      let formListModify = dataFormList?.map((value) => {
        if (value.length === 0) {
          modify = true;
          return dataFormList.find((item) => item.length === dataFormList.length);
        }
        return value;
      });

      if (modify) {
        formListModify = formListModify
          .filter((value) => value)
          .map((value, index) => {
            return value ? [value[index]] : [];
          });
      }

      const formListResult = formListModify
        .map(
          (item) =>
            item
              ?.map(
                (item) =>
                  new PokemonFormModify(
                    data?.id,
                    data?.name,
                    data?.varieties.find((v) => item.pokemon.name.includes(v.pokemon.name))?.pokemon.name ?? '',
                    new FormModel(item)
                  )
              )
              .sort((a, b) => (a.form.id ?? 0) - (b.form.id ?? 0)) ?? []
        )
        .sort((a, b) => (a[0]?.form.id ?? 0) - (b[0]?.form.id ?? 0));

      if (formListResult.filter((form) => form.find((pokemon) => pokemon.form.form_name.toUpperCase() === FORM_GMAX)).length > 1) {
        formListResult.forEach((form) => {
          form.forEach((pokemon) => {
            if (pokemon.form.form_name.toUpperCase() === FORM_GMAX) {
              pokemon.form.form_name = pokemon.form.name.replace(`${pokemon.default_name}-`, '');
            }
          });
        });
      }

      let indexPokemonGO = 0;
      const formList: string[] = [];
      formListModify.forEach((form) => form?.forEach((p) => formList.push(convertName(p.form_name || FORM_NORMAL))));
      const pokemonGOForm = pokemonData.filter((pokemon) => pokemon.num === data.id);
      pokemonGOForm.forEach((pokemon) => {
        const isIncludeFormGO = formList.some((form) => form === pokemon.forme);
        if (!isIncludeFormGO) {
          indexPokemonGO--;
          const pokemonGOModify = new PokemonFormModifyModel(
            data?.id,
            data?.name,
            pokemon.pokemonId?.replaceAll('_', '-')?.toLowerCase() ?? '',
            pokemon.forme?.replaceAll('_', '-')?.toLowerCase() ?? '',
            pokemon.fullName?.replaceAll('_', '-')?.toLowerCase() ?? '',
            'Pokémon-GO',
            pokemon.types,
            null,
            indexPokemonGO,
            FORM_NORMAL,
            false,
            false
          );
          formListResult.push([pokemonGOModify]);
        }
      });

      if (costModifier?.purified?.candy && costModifier?.purified.stardust) {
        const pokemonDefault = dataPokeList.filter((p) => p.is_include_shadow);
        pokemonDefault.forEach((p) => {
          let form = '';
          if (!p.is_default) {
            form = p.name.replace(`${data?.name}-`, '') + '-';
          }
          indexPokemonGO--;
          const pokemonShadowModify = new PokemonFormModifyModel(
            data?.id,
            data?.name,
            p.name,
            `${form}shadow`,
            `${p.name}-shadow`,
            'Pokémon-GO',
            p.types.map((item) => item.type.name) ?? [],
            null,
            indexPokemonGO,
            FORM_SHADOW,
            true
          );
          indexPokemonGO--;
          const pokemonPurifiedModify = new PokemonFormModifyModel(
            data?.id,
            data?.name,
            p.name,
            `${form}purified`,
            `${p.name}-purified`,
            'Pokémon-GO',
            p.types.map((item) => item.type.name) ?? [],
            null,
            indexPokemonGO,
            FORM_PURIFIED,
            true
          );
          formListResult.push([pokemonShadowModify, pokemonPurifiedModify]);
        });
      }

      setFormList(formListResult);
      let defaultFrom: (PokemonFormModify | undefined)[] | undefined,
        isDefaultForm: PokemonFormModify | undefined,
        defaultData: PokemonInfo | undefined;
      let formParams = searchParams.get('form');

      if (formParams) {
        if (data?.id === 555 && formParams === 'galar') {
          formParams += `-${FORM_STANDARD.toLowerCase()}`;
        }
        defaultFrom = formListResult.find((value) =>
          value.find(
            (item) =>
              item.form.form_name === formParams?.toLowerCase() || item.form.name === item.default_name + '-' + formParams?.toLowerCase()
          )
        );

        if (defaultFrom) {
          isDefaultForm = defaultFrom.at(0);
          if (
            isDefaultForm?.form.form_name !== formParams.toLowerCase() &&
            isDefaultForm?.form.name !== isDefaultForm?.default_name + '-' + formParams.toLowerCase()
          ) {
            isDefaultForm = defaultFrom.find((value) => value?.form.form_name === formParams?.toLowerCase());
          }
        } else {
          defaultFrom = formListResult.map((value) => value.find((item) => item.form.is_default));
          isDefaultForm = defaultFrom?.find((item) => item?.form.id === data?.id);
          searchParams.delete('form');
          setSearchParams(searchParams);
        }
      } else if (router.action === Action.Pop && props.searching) {
        defaultFrom = formListResult.map((value) => value.find((item) => item.form.is_default));
        isDefaultForm = defaultFrom?.find((item) => item?.form.form_name === props.searching?.form);
      } else {
        defaultFrom = formListResult.map((value) => value.find((item) => item.form.is_default));
        isDefaultForm = defaultFrom?.find((item) => item?.form.id === data?.id);
      }
      defaultData = dataPokeList.find((value) => value.name === isDefaultForm?.form.name);
      if (!defaultData) {
        defaultData = dataPokeList.find((value) => value.name === isDefaultForm?.name);
      }
      setWH((prevWH) => ({ ...prevWH, weight: defaultData?.weight ?? 0, height: defaultData?.height ?? 0 }));
      setVersion(splitAndCapitalize((isDefaultForm ?? defaultFrom.at(0) ?? null)?.form.version_group.name, '-', ' '));
      if (!params.id) {
        setRegion(regionList[parseInt(data?.generation.url.split('/').at(6) ?? '')]);
      }
      const nameInfo =
        router.action === Action.Pop && props.searching
          ? props.searching.fullName
          : isDefaultForm?.form?.is_default
          ? isDefaultForm?.form?.name
          : splitAndCapitalize(formParams ? isDefaultForm?.form.name : data?.name, '-', ' ');
      const formInfo = formParams ? splitAndCapitalize(convertFormNameImg(data?.id, isDefaultForm?.form.form_name ?? ''), '-', '-') : null;
      setFormName(nameInfo);
      setReleased(checkReleased(data?.id, nameInfo ?? '', isDefaultForm?.form?.is_default));
      setForm(router.action === Action.Pop && props.searching ? props.searching.form : formInfo ?? undefined);
      setDefaultForm(isDefaultForm);
      if (params.id) {
        document.title = `#${data?.id} - ${splitAndCapitalize(nameInfo, '-', ' ')}`;
      }
      setOnChangeForm(false);
      const currentId = getPokemonById(pokemonData, data?.id);
      if (currentId) {
        setDataStorePokemon({
          prev: getPokemonById(pokemonData, currentId.id - 1),
          current: getPokemonById(pokemonData, currentId.id),
          next: getPokemonById(pokemonData, currentId.id + 1),
        });
      }
    },
    [searchParams, params.id, pokemonData]
  );

  const queryPokemon = useCallback(
    (id: string) => {
      if (!params.id || (params.id && data && id !== data.id.toString())) {
        if (data && id !== data.id.toString()) {
          setForm(undefined);
        }
        dispatch(showSpinner());
      }
      axios
        .getPokeSpices(id, {
          cancelToken: source.token,
        })
        .then((res) => {
          fetchMap(res.data);
        })
        .catch((e: ErrorEvent) => {
          enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
          if (params.id) {
            document.title = `#${params.id} - Not Found`;
          }
          setIsFound(false);
          source.cancel(e.message);
          dispatch(hideSpinner());
        });
    },
    [dispatch, enqueueSnackbar, fetchMap]
  );

  useEffect(() => {
    const id = params.id ? params.id.toLowerCase() : props.id;
    if (id && pokemonData.length > 0) {
      queryPokemon(id.toString());
    }
  }, [params.id, props.id, queryPokemon, reForm, pokemonData.length]);

  useEffect(() => {
    const id = params.id ? params.id.toLowerCase() : props.id;
    if (id && pokemonData.length > 0) {
      const keyDownHandler = (event: KeyboardEvent) => {
        if (!spinner.loading) {
          const currentId = getPokemonById(pokemonData, parseInt(id));
          if (currentId) {
            const result = {
              prev: getPokemonById(pokemonData, currentId.id - 1),
              current: getPokemonById(pokemonData, currentId.id - 1),
              next: getPokemonById(pokemonData, currentId.id + 1),
            };
            if (result.prev && event.keyCode === KEY_LEFT) {
              event.preventDefault();
              params.id ? navigate(`/pokemon/${result.prev.id}`) : props.onDecId?.();
            } else if (result.next && event.keyCode === KEY_RIGHT) {
              event.preventDefault();
              params.id ? navigate(`/pokemon/${result.next.id}`) : props.onIncId?.();
            }
          }
        }
      };
      document.addEventListener('keyup', keyDownHandler, false);
      return () => {
        document.removeEventListener('keyup', keyDownHandler, false);
      };
    }
  }, [params.id, props.id, spinner.loading, pokemonData]);

  const setVersionName = (version: string) => {
    setVersion(splitAndCapitalize(version, '-', ' '));
  };

  const getCostModifier = (id: number) => {
    return pokemonData.find((item) => item.num === id);
  };

  const getPokemonDetails = (id: number, form: string | null, isDefault = false) => {
    let pokemonForm: PokemonDataModel | undefined;

    if (form) {
      pokemonForm = pokemonData.find(
        (item) =>
          item.num === id &&
          item.fullName ===
            convertName(form?.replaceAll(' ', '-'), false)
              .replace('MR.', 'MR')
              .replace('SUNSHINE', 'SUNNY')
              .replace('HERO', '')
              .replace('CROWNED', `${id === 888 ? 'CROWNED_SWORD' : 'CROWNED_SHIELD'}`)
      );

      if (isDefault && !pokemonForm) {
        pokemonForm = pokemonData.find(
          (item) => item.num === id && (item.forme === FORM_NORMAL || (item.baseForme && item.baseForme === item.forme))
        );
      }
    }
    return pokemonForm;
  };

  const checkReleased = (id: number, form: string, isDefault = false) => {
    if (!form) {
      if (defaultForm) {
        form = (defaultForm.form?.form_name ?? defaultForm.default_name).replace('-', '_').toUpperCase();
      } else {
        return false;
      }
    }

    const details = getPokemonDetails(id, form, isDefault);
    return details?.releasedGO ?? false;
  };

  return (
    <Fragment>
      {!isFound ? (
        <Error />
      ) : (
        <Fragment>
          <div className="w-100 row prev-next-block sticky-top">
            {params.id ? (
              <SearchBarMain data={dataStorePokemon} setReForm={setReForm} setForm={setForm} />
            ) : (
              <SearchBar
                data={dataStorePokemon}
                setReForm={setReForm}
                setForm={setForm}
                setFormName={setFormName}
                router={router}
                onDecId={props.onDecId}
                onIncId={props.onIncId}
                onSetIDPoke={props.onSetIDPoke}
                first={props.first}
                setFirst={props.setFirst}
              />
            )}
          </div>
          <div
            style={{ color: theme.palette.text.primary }}
            className={'element-bottom position-relative poke-container' + (props.isSearch ? '' : ' container')}
          >
            <div className="w-100 text-center d-inline-block align-middle" style={{ marginTop: 15, marginBottom: 15 }}>
              <AlertReleased released={released} formName={formName} icon={icon} />
              <div className="d-inline-block img-desc">
                <img
                  className="pokemon-main-sprite"
                  style={{ verticalAlign: 'baseline' }}
                  alt="img-full-pokemon"
                  src={APIService.getPokeFullSprite(
                    data?.id,
                    splitAndCapitalize(
                      form
                        ?.toUpperCase()
                        .replace(`-${FORM_SHADOW}`, '')
                        .replace(`-${FORM_PURIFIED}`, '')
                        .replace(FORM_SHADOW, '')
                        .replace(FORM_PURIFIED, ''),
                      '-',
                      '-'
                    )
                  )}
                />
              </div>
              <div className="d-inline-block">
                <PokemonTable
                  id={data?.id}
                  gen={parseInt(data?.generation.url?.split('/').at(6) ?? '')}
                  formName={formName}
                  region={region}
                  version={version}
                  weight={WH.weight}
                  height={WH.height}
                />
              </div>
              <div className="d-inline-block" style={{ padding: 0 }}>
                <table className="table-info table-main">
                  <thead />
                  <tbody>
                    <tr className="text-center">
                      <td className="table-sub-header">Unlock third move</td>
                      <td className="table-sub-header">Costs</td>
                    </tr>
                    <tr className="info-costs">
                      <td>
                        <img alt="img-cost-info" width={100} src={APIService.getItemSprite('Item_1202')} />
                      </td>
                      <td style={{ padding: 0 }}>
                        <div className="d-flex align-items-center row-extra td-costs">
                          <Candy id={data?.id} style={{ marginRight: 5 }} />
                          <span>{costModifier.thirdMove.candy ? `x${costModifier.thirdMove.candy}` : 'Unavailable'}</span>
                        </div>
                        <div className="row-extra d-flex">
                          <div className="d-inline-flex justify-content-center" style={{ width: 20, marginRight: 5 }}>
                            <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                          </div>
                          <span>{costModifier.thirdMove.stardust ? `x${costModifier.thirdMove.stardust}` : 'Unavailable'}</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="text-center">
                      <td className="table-sub-header">Purified</td>
                      <td className="table-sub-header">Costs</td>
                    </tr>
                    <tr className="info-costs">
                      <td>
                        <img alt="img-cost-info" width={60} height={60} src={APIService.getPokePurified()} />
                      </td>
                      <td style={{ padding: 0 }}>
                        <div className="d-flex align-items-center row-extra td-costs">
                          <Candy id={data?.id} style={{ marginRight: 5 }} />
                          <span>{costModifier.purified.candy ? `x${costModifier.purified.candy}` : 'Unavailable'}</span>
                        </div>
                        <div className="row-extra d-flex">
                          <div className="d-inline-flex justify-content-center" style={{ width: 20, marginRight: 5 }}>
                            <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                          </div>
                          <span>{costModifier.purified.stardust ? `x${costModifier.purified.stardust}` : 'Unavailable'}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <Form
              pokemonRouter={router}
              onChangeForm={onChangeForm}
              setOnChangeForm={setOnChangeForm}
              onSetReForm={setReForm}
              setVersion={setVersionName}
              region={region}
              setRegion={setRegion}
              setWH={setWH}
              formName={formName}
              setFormName={setFormName}
              setForm={setForm}
              setReleased={setReleased}
              checkReleased={checkReleased}
              idDefault={data?.id}
              pokeData={pokeData}
              formList={formList}
              ratio={pokeRatio}
              stats={stats}
              species={data}
              onSetIDPoke={props.onSetIDPoke}
              paramForm={
                !searchParams.get('form') && props.searching
                  ? props.first && router?.action === 'POP'
                    ? props.searching.form
                    : ''
                  : searchParams.get('form') && searchParams.get('form')?.toLowerCase()
              }
              pokemonDetail={getPokemonDetails(data?.id ?? 0, null)}
            />
            <PokemonModel id={data?.id ?? 0} name={data?.name ?? ''} />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Pokemon;
