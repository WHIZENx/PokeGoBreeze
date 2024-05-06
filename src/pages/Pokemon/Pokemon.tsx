import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { SearchingModel } from '../../store/models/searching.model';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import './Pokemon.scss';

import { FormModel, PokemonForm, PokemonFormModify, PokemonFormModifyModel } from '../../core/models/API/form.model';
import { PokemonInfo } from '../../core/models/API/info.model';
import { Species } from '../../core/models/API/species.model';
import { OptionsPokemon, PokemonGenderRatio, PokemonDataModel } from '../../core/models/pokemon.model';
import APIService from '../../services/API.service';
import { RouterState, StoreState, SpinnerState } from '../../store/models/state.model';
import { PokemonTypeCost } from '../../core/models/evolution.model';
import { showSpinner, hideSpinner } from '../../store/actions/spinner.action';
import {
  checkPokemonIncludeShadowForm,
  convertFormNameImg,
  convertPokemonAPIDataName,
  getPokemonById,
  splitAndCapitalize,
} from '../../util/Utils';
import PokemonModel from '../../components/Info/Assets/PokemonModel';
import Candy from '../../components/Sprites/Candy/Candy';
import PokemonTable from '../../components/Table/Pokemon/PokemonTable';
import AlertReleased from './components/AlertReleased';
import SearchBar from './components/SearchBar';
import SearchBarMain from './components/SearchBarMain';
import { FORM_SHADOW, FORM_PURIFIED, KEY_LEFT, KEY_RIGHT, FORM_NORMAL, FORM_GMAX, FORM_STANDARD, regionList } from '../../util/Constants';
import { useTheme } from '@mui/material';
import Error from '../Error/Error';
import { Action } from 'history';
import Form from '../../components/Info/Form/Form';

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
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const pokemonData = useSelector((state: StoreState) => state.store?.data?.pokemon ?? []);

  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pokeData, setPokeData]: [PokemonInfo[], React.Dispatch<React.SetStateAction<PokemonInfo[]>>] = useState([] as PokemonInfo[]);
  const [currentData, setCurrentData]: [PokemonInfo | undefined, React.Dispatch<React.SetStateAction<PokemonInfo | undefined>>] =
    useState();
  const [formList, setFormList]: [
    PokemonFormModify[][] | undefined,
    React.Dispatch<React.SetStateAction<PokemonFormModify[][] | undefined>>
  ] = useState();

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
  const [currentForm, setCurrentForm]: [
    PokemonFormModify | undefined,
    React.Dispatch<React.SetStateAction<PokemonFormModify | undefined>>
  ] = useState();
  const [pokemonDetails, setPokemonDetails]: [
    PokemonDataModel | undefined,
    React.Dispatch<React.SetStateAction<PokemonDataModel | undefined>>
  ] = useState();

  const [costModifier, setCostModifier]: [TypeCost, React.Dispatch<React.SetStateAction<TypeCost>>] = useState({
    purified: {},
    thirdMove: {},
  });

  const axios = APIService;
  const cancelToken = axios.getAxios().CancelToken;
  const source = cancelToken.source();
  const { enqueueSnackbar } = useSnackbar();

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

      const pokemon = pokemonData.find((item) => item.num === data.id);
      setPokeRatio(pokemon?.genderRatio);
      setCostModifier({
        purified: {
          candy: pokemon?.purified?.candy,
          stardust: pokemon?.purified?.stardust,
        },
        thirdMove: {
          candy: pokemon?.thirdMove?.candy,
          stardust: pokemon?.thirdMove?.stardust,
        },
      });

      const formListResult = dataFormList
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
      dataFormList.forEach((form) => form?.forEach((p) => formList.push(convertPokemonAPIDataName(p.form_name || FORM_NORMAL))));
      const pokemonGOForm = pokemonData.filter((pokemon) => pokemon.num === data.id);

      pokemonGOForm.forEach((pokemon) => {
        const isIncludeFormGO = formList.some((form) => pokemon.forme?.includes(form));
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

      if (pokemon?.isShadow && pokemon?.purified?.candy && pokemon?.purified.stardust) {
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

      setPokeData(dataPokeList);
      setFormList(formListResult);

      // Set Default Form
      let defaultFrom: (PokemonFormModify | undefined)[] | undefined,
        currentForm: PokemonFormModify | undefined,
        defaultData: PokemonInfo | undefined;
      let formParams = searchParams.get('form');
      if (formParams) {
        if (data?.id === 555 && formParams === 'galar') {
          formParams += `-${FORM_STANDARD.toLowerCase()}`;
        }
        defaultFrom = formListResult.find((value) =>
          value.find(
            (item) =>
              item.form.form_name === formParams?.toLowerCase() || item.form.name === `${item.default_name}-${formParams?.toLowerCase()}`
          )
        );

        if (defaultFrom) {
          currentForm = defaultFrom.at(0);
          if (
            currentForm?.form.form_name !== formParams.toLowerCase() &&
            currentForm?.form.name !== `${currentForm?.default_name}-${formParams?.toLowerCase()}`
          ) {
            currentForm = defaultFrom.find((value) => value?.form.form_name === formParams?.toLowerCase());
          }
        } else {
          defaultFrom = formListResult.map((value) => value.find((item) => item.form.is_default));
          currentForm = defaultFrom?.find((item) => item?.form.id === data?.id);
          searchParams.delete('form');
          setSearchParams(searchParams);
        }
      } else if (router.action === Action.Pop && props.searching) {
        defaultFrom = formListResult.map((value) => value.find((item) => item.form.is_default));
        currentForm = defaultFrom?.find((item) => item?.form.form_name === props.searching?.form);
      } else {
        defaultFrom = formListResult.map((value) => value.find((item) => item.form.is_default));
        currentForm = defaultFrom?.find((item) => item?.form.id === data?.id);
      }
      defaultData = dataPokeList.find((value) => value.name === currentForm?.form.name);
      if (!defaultData) {
        defaultData = dataPokeList.find((value) => value.name === currentForm?.name);
      }
      setWH((prevWH) => ({ ...prevWH, weight: defaultData?.weight ?? 0, height: defaultData?.height ?? 0 }));
      setCurrentData(defaultData);
      setCurrentForm(currentForm);
    },
    [pokemonData]
  );

  const queryPokemon = useCallback(
    (id: string) => {
      if (pokemonData.length > 0 && id !== data?.id.toString()) {
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
      queryPokemon(id);
    }
  }, [params.id, props.id, queryPokemon, pokemonData.length]);

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

  const getPokemonDetails = (id: number, form: string | null, isDefault = false) => {
    let pokemonForm: PokemonDataModel | undefined;

    if (form) {
      pokemonForm = pokemonData.find((item) => item.num === id && item.fullName === convertPokemonAPIDataName(form?.replaceAll(' ', '-')));

      if (isDefault && !pokemonForm) {
        pokemonForm = pokemonData.find(
          (item) => item.num === id && (item.forme === FORM_NORMAL || (item.baseForme && item.baseForme === item.forme))
        );
      }
    }
    return pokemonForm;
  };

  const checkReleased = (id: number, form: string, defaultForm: PokemonFormModify) => {
    if (!form) {
      if (defaultForm) {
        form = defaultForm.form?.form_name || defaultForm.default_name;
      } else {
        return false;
      }
    }

    const details = getPokemonDetails(id, form, defaultForm.form.is_default);
    setPokemonDetails(details);
    return details?.releasedGO ?? false;
  };

  useEffect(() => {
    if (currentForm && currentForm.default_id === parseInt(props.id ?? params.id ?? '0') && (data?.id ?? 0) > 0) {
      const released = checkReleased(data?.id ?? 0, formName ?? '', currentForm);
      setReleased(released);

      const formParams = searchParams.get('form');
      setVersion(splitAndCapitalize(currentForm?.form.version_group.name, '-', ' '));
      if (!params.id) {
        setRegion(regionList[parseInt(data?.generation.url.split('/').at(6) ?? '')]);
      } else {
        const currentRegion = Object.values(regionList).find((item) => currentForm?.form.form_name.includes(item.toLowerCase()));
        if (currentForm?.form.form_name !== '' && currentRegion) {
          setRegion(!region || region !== currentRegion ? currentRegion : region);
        } else {
          setRegion(regionList[parseInt(data?.generation.url.split('/').at(6) ?? '0')]);
        }
      }
      const nameInfo =
        router.action === Action.Pop && props.searching
          ? props.searching.fullName
          : currentForm?.form?.is_default
          ? currentForm?.form?.name
          : splitAndCapitalize(formParams ? currentForm?.form.name : data?.name, '-', ' ');
      const formInfo = splitAndCapitalize(convertFormNameImg(data?.id ?? 0, currentForm?.form.form_name ?? ''), '-', '-');
      setFormName(nameInfo);
      setForm(router.action === Action.Pop && props.searching ? props.searching.form : formInfo ?? undefined);
      if (params.id) {
        document.title = `#${data?.id} - ${splitAndCapitalize(nameInfo, '-', ' ')}`;
      }
    }
  }, [data?.id, props.id, params.id, formName, currentForm]);

  useEffect(() => {
    if (pokemonData.length > 0 && data && data.id > 0) {
      const currentId = getPokemonById(pokemonData, data.id);
      if (currentId) {
        setDataStorePokemon({
          prev: getPokemonById(pokemonData, currentId.id - 1),
          current: getPokemonById(pokemonData, currentId.id),
          next: getPokemonById(pokemonData, currentId.id + 1),
        });
      }
    }
  }, [pokemonData.length, data]);

  return (
    <Fragment>
      {!isFound ? (
        <Error />
      ) : (
        <Fragment>
          <div className="w-100 row prev-next-block sticky-top">
            {params.id ? (
              <SearchBarMain data={dataStorePokemon} setForm={setForm} />
            ) : (
              <SearchBar
                data={dataStorePokemon}
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
              form={currentForm}
              setForm={setCurrentForm}
              setWH={setWH}
              data={currentData}
              setData={setCurrentData}
              formList={formList}
              pokeData={pokeData}
              ratio={pokeRatio}
              species={data}
              onSetIDPoke={props.onSetIDPoke}
              pokemonDetail={pokemonDetails}
            />
            <PokemonModel id={data?.id ?? 0} name={data?.name ?? ''} />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Pokemon;
