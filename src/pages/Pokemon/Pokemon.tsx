import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../services/API.service';

import './Pokemon.scss';

import {
  checkPokemonIncludeShadowForm,
  convertFormNameImg,
  convertName,
  getPokemonById,
  getPokemonByIndex,
  splitAndCapitalize,
} from '../../util/Utils';
import { FORM_NORMAL, KEY_LEFT, KEY_RIGHT, regionList } from '../../util/Constants';

import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Form from '../../components/Info/Form/Form';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import PokemonModel from '../../components/Info/Assets/PokemonModel';
import Error from '../Error/Error';
import { Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../store/actions/spinner.action';
import Candy from '../../components/Sprites/Candy/Candy';
import { getFormsGO } from '../../core/forms';
import { useTheme } from '@mui/material';
import { Action } from 'history';
import { RouterState, SpinnerState, StatsState, StoreState } from '../../store/models/state.model';
import { SearchingModel } from '../../store/models/searching.model';
import { Species } from '../../core/models/API/species.model';
import { PokemonInfo } from '../../core/models/API/info.model';
import { FormModel, PokemonForm, PokemonFormModify, PokemonFormModifyModel } from '../../core/models/API/form.model';
import { CancelTokenSource } from 'axios';
import { PokemonGenderRatio, PokemonNameModel } from '../../core/models/pokemon.model';
import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import { PokemonTypeCost } from '../../core/models/evolution.model';

interface OptionsPokemon {
  prev: PokemonNameModel | undefined;
  current: PokemonNameModel | undefined;
  next: PokemonNameModel | undefined;
}

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
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const stats = useSelector((state: StatsState) => state.stats);
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const pokemonName = useSelector((state: StoreState) => state.store?.data?.pokemonName ?? []);
  const pokemonData = useSelector((state: StoreState) => state.store?.data?.pokemonData ?? []);

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

  const { enqueueSnackbar } = useSnackbar();

  const getRatioGender = (id: number) => {
    return pokemonData.find((item) => id === item.num)?.genderRatio;
  };

  const fetchMap = useCallback(
    async (data: Species, axios: typeof APIService, source: CancelTokenSource) => {
      const dataPokeList: PokemonInfo[] = [];
      const dataFormList: PokemonForm[][] = [];
      await Promise.all(
        data?.varieties.map(async (value) => {
          const pokeInfo: PokemonInfo = (await axios.getFetchUrl(value.pokemon.url, { cancelToken: source.token })).data;
          const pokeForm: PokemonForm[] = await Promise.all(
            pokeInfo.forms.map(async (item) => (await axios.getFetchUrl(item.url, { cancelToken: source.token })).data)
          );
          dataPokeList.push({
            ...pokeInfo,
            is_include_shadow: checkPokemonIncludeShadowForm(dataStore?.pokemon ?? [], pokeInfo.name),
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

      const formListResult: PokemonFormModify[][] = formListModify
        .map((item) => {
          return item
            ? item
                .map((item) => ({
                  form: new FormModel(item),
                  name: data?.varieties.find((v) => item.pokemon.name.includes(v.pokemon.name))?.pokemon.name ?? '',
                  default_name: data?.name,
                  default_id: data.id,
                }))
                .sort((a, b) => (a.form.id ?? 0) - (b.form.id ?? 0))
            : [];
        })
        .sort((a, b) => (a[0]?.form.id ?? 0) - (b[0]?.form.id ?? 0));

      const goForm = getFormsGO(data.id);
      if (goForm.length > 0) {
        formListResult.push(goForm);
      }

      if (formListResult.filter((form) => form.find((pokemon) => pokemon.form.form_name === 'gmax')).length > 1) {
        formListResult.forEach((form) => {
          form.forEach((pokemon) => {
            if (pokemon.form.form_name === 'gmax') {
              pokemon.form.form_name = pokemon.form.name.replace(`${pokemon.default_name}-`, '');
            }
          });
        });
      }

      if (costModifier?.purified?.candy && costModifier?.purified.stardust) {
        const pokemonDefault = dataPokeList.filter((p) => p.is_include_shadow);
        pokemonDefault.forEach((p, index) => {
          let form = '';
          if (!p.is_default) {
            form = p.name.replace(`${data?.name}-`, '') + '-';
          }
          const pokemonShadowModify = new PokemonFormModifyModel(
            data?.id,
            data?.name,
            p.name,
            `${form}shadow`,
            true,
            p.is_default,
            false,
            true,
            false,
            `${p.name}-shadow`,
            'Pokémon-GO',
            p.types.map((item) => item.type.name) ?? [],
            null,
            -1 + -2 * index
          );
          const pokemonPurifiedModify = new PokemonFormModifyModel(
            data?.id,
            data?.name,
            p.name,
            `${form}purified`,
            true,
            p.is_default,
            false,
            false,
            true,
            `${p.name}-purified`,
            'Pokémon-GO',
            p.types.map((item) => item.type.name) ?? [],
            null,
            -2 * (index + 1)
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
          formParams += '-standard';
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
          : splitAndCapitalize(formParams ? isDefaultForm?.form.name : data?.name, '-', ' ');
      const formInfo = formParams ? splitAndCapitalize(convertFormNameImg(data?.id, isDefaultForm?.form.form_name ?? ''), '-', '-') : null;
      setFormName(nameInfo);
      setReleased(checkReleased(data?.id, nameInfo ?? '', isDefaultForm?.form?.is_default));
      setForm(router.action === Action.Pop && props.searching ? props.searching.form : formInfo ?? undefined);
      setDefaultForm(isDefaultForm);
      if (params.id) {
        document.title = `#${data?.id} - ${nameInfo}`;
      }
      setOnChangeForm(false);
      const currentId = getPokemonById(pokemonName, data?.id);
      if (currentId) {
        setDataStorePokemon({
          prev: getPokemonByIndex(pokemonName, currentId.index - 1),
          current: currentId,
          next: getPokemonByIndex(pokemonName, currentId.index + 1),
        });
      }
    },
    [searchParams, params.id, dataStore?.pokemon, pokemonName, pokemonData, dataStore?.evolution, dataStore?.details]
  );

  const queryPokemon = useCallback(
    (id: number | string | undefined, axios: typeof APIService, source: CancelTokenSource) => {
      if (id && dataStore?.pokemon && pokemonName.length > 0 && pokemonData.length > 0 && dataStore?.evolution && dataStore?.details) {
        if (!params.id || (params.id && data && parseInt(id.toString()) !== data?.id)) {
          dispatch(showSpinner());
        }
        if (data?.id !== parseInt(id.toString())) {
          setForm(undefined);
        }
        axios
          .getPokeSpices(parseInt(id.toString()), {
            cancelToken: source.token,
          })
          .then((res: { data: Species }) => {
            fetchMap(res.data, axios, source);
            setData(res.data);
          })
          .catch((e: { message: string }) => {
            enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
            if (params.id) {
              document.title = `#${params.id} - Not Found`;
            }
            setIsFound(false);
            source.cancel(e.message);
            dispatch(hideSpinner());
          });
      }
    },
    [dispatch, enqueueSnackbar, fetchMap]
  );

  useEffect(() => {
    const axios = APIService;
    const cancelToken = axios.getAxios().CancelToken;
    const source = cancelToken.source();
    const id = params.id ? params.id.toLowerCase() : props.id;
    queryPokemon(id, axios, source);
  }, [dispatch, params.id, props.id, queryPokemon, reForm]);

  useEffect(() => {
    if (pokemonName.length > 0) {
      const keyDownHandler = (event: { keyCode: number; preventDefault: () => void }) => {
        if (!spinner.loading) {
          const currentId = getPokemonById(pokemonName, parseInt(params.id ? params.id.toLowerCase() : props.id ?? ''));
          if (currentId) {
            const result = {
              prev: getPokemonByIndex(pokemonName, currentId.index - 1),
              current: currentId,
              next: getPokemonByIndex(pokemonName, currentId.index + 1),
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
  }, [params.id, props.id, spinner.loading, pokemonName]);

  const getNumGen = (url: string) => {
    return 'Gen ' + url?.split('/').at(6);
  };

  const setVersionName = (version: string) => {
    setVersion(splitAndCapitalize(version, '-', ' '));
  };

  const getCostModifier = (id: number) => {
    return dataStore?.evolution?.find((item) => item.id === id);
  };

  const getPokemonDetails = (id: number, form: string | null, isDefault = false) => {
    let pokemonForm;

    if (form) {
      pokemonForm = dataStore?.details?.find(
        (item) => item.id === id && item.name === convertName(form.replaceAll(' ', '-')).replaceAll('MR.', 'MR')
      );

      if (isDefault && !pokemonForm) {
        pokemonForm = dataStore?.details?.find((item) => item.id === id && item.form?.toUpperCase() === FORM_NORMAL);
      }
    }

    if (!form && defaultForm) {
      pokemonForm = dataStore?.details?.find(
        (item) => item.id === id && item.form === defaultForm.form?.form_name.replace('-', '_').toUpperCase()
      );
    }

    return pokemonForm;
  };

  const checkReleased = (id: number, form: string, isDefault = false) => {
    if (!form) {
      return false;
    }

    return getPokemonDetails(id, form, isDefault)?.releasedGO ?? false;
  };

  return (
    <Fragment>
      {!isFound ? (
        <Error />
      ) : (
        <Fragment>
          <div className="w-100 row prev-next-block sticky-top">
            {params.id ? (
              <Fragment>
                {dataStorePokemon?.prev && (
                  <div title="Previous Pokémon" className={`prev-block col${dataStorePokemon?.next ? '-6' : ''}`} style={{ padding: 0 }}>
                    <Link
                      onClick={() => {
                        setReForm(false);
                        setForm(undefined);
                      }}
                      className="d-flex justify-content-start align-items-center"
                      to={'/pokemon/' + dataStorePokemon?.prev?.id}
                      title={`#${dataStorePokemon?.prev?.id} ${splitAndCapitalize(dataStorePokemon?.prev?.name, '-', ' ')}`}
                    >
                      <div style={{ cursor: 'pointer' }}>
                        <b>
                          <NavigateBeforeIcon fontSize="large" />
                        </b>
                      </div>
                      <div style={{ width: 60, cursor: 'pointer' }}>
                        <img
                          style={{ padding: '5px 5px 5px 0' }}
                          className="pokemon-navigate-sprite"
                          alt="img-full-pokemon"
                          src={APIService.getPokeFullSprite(dataStorePokemon?.prev?.id)}
                        />
                      </div>
                      <div className="w-100" style={{ cursor: 'pointer' }}>
                        <div style={{ textAlign: 'start' }}>
                          <b>#{dataStorePokemon?.prev?.id}</b>
                        </div>
                        <div className="text-navigate">{splitAndCapitalize(dataStorePokemon?.prev?.name, '-', ' ')}</div>
                      </div>
                    </Link>
                  </div>
                )}
                {dataStorePokemon?.next && (
                  <div
                    title="Next Pokémon"
                    className={`next-block col${dataStorePokemon?.prev ? '-6' : ''}`}
                    style={{ float: 'right', padding: 0 }}
                  >
                    <Link
                      onClick={() => {
                        setReForm(false);
                        setForm(undefined);
                      }}
                      className="d-flex justify-content-end align-items-center"
                      to={'/pokemon/' + dataStorePokemon?.next?.id}
                      title={`#${dataStorePokemon?.next?.id} ${splitAndCapitalize(dataStorePokemon?.next?.name, '-', ' ')}`}
                    >
                      <div className="w-100" style={{ cursor: 'pointer', textAlign: 'end' }}>
                        <div style={{ textAlign: 'end' }}>
                          <b>#{dataStorePokemon?.next?.id}</b>
                        </div>
                        <div className="text-navigate">{splitAndCapitalize(dataStorePokemon?.next?.name, '-', ' ')}</div>
                      </div>
                      <div style={{ width: 60, cursor: 'pointer' }}>
                        <img
                          style={{ padding: '5px 0 5px 5px' }}
                          className="pokemon-navigate-sprite"
                          alt="img-full-pokemon"
                          src={APIService.getPokeFullSprite(dataStorePokemon?.next?.id)}
                        />
                      </div>
                      <div style={{ cursor: 'pointer' }}>
                        <b>
                          <NavigateNextIcon fontSize="large" />
                        </b>
                      </div>
                    </Link>
                  </div>
                )}
              </Fragment>
            ) : (
              <Fragment>
                {dataStorePokemon?.prev && (
                  <div title="Previous Pokémon" className={`prev-block col${dataStorePokemon?.next ? '-6' : ''}`} style={{ padding: 0 }}>
                    <div
                      className="d-flex justify-content-start align-items-center"
                      onClick={() => {
                        if (router?.action === 'POP') {
                          setFormName(undefined);
                          router.action = null as any;
                        }
                        props.onDecId?.();
                        setForm(undefined);
                        if (props.first && props.setFirst) {
                          props.setFirst(false);
                        }
                      }}
                      title={`#${dataStorePokemon?.prev?.id} ${splitAndCapitalize(dataStorePokemon?.prev?.name, '-', ' ')}`}
                    >
                      <div style={{ cursor: 'pointer' }}>
                        <b>
                          <NavigateBeforeIcon fontSize="large" />
                        </b>
                      </div>
                      <div style={{ width: 60, cursor: 'pointer' }}>
                        <img
                          style={{ padding: '5px 5px 5px 0' }}
                          className="pokemon-navigate-sprite"
                          alt="img-full-pokemon"
                          src={APIService.getPokeFullSprite(dataStorePokemon?.prev?.id)}
                        />
                      </div>
                      <div className="w-100" style={{ cursor: 'pointer' }}>
                        <div style={{ textAlign: 'start' }}>
                          <b>#{dataStorePokemon?.prev?.id}</b>
                        </div>
                        <div className="text-navigate">{splitAndCapitalize(dataStorePokemon?.prev?.name, '-', ' ')}</div>
                      </div>
                    </div>
                  </div>
                )}
                {dataStorePokemon?.next && (
                  <div
                    title="Next Pokémon"
                    className={`next-block col${dataStorePokemon?.prev ? '-6' : ''}`}
                    style={{ float: 'right', padding: 0 }}
                  >
                    <div
                      className="d-flex justify-content-end align-items-center"
                      onClick={() => {
                        if (router?.action === 'POP') {
                          setFormName(undefined);
                          router.action = null as any;
                        }
                        props.onIncId?.();
                        setForm(undefined);
                        if (props.first && props.setFirst) {
                          props.setFirst(false);
                        }
                      }}
                      title={`#${dataStorePokemon?.next?.id} ${splitAndCapitalize(dataStorePokemon?.next?.name, '-', ' ')}`}
                    >
                      <div className="w-100" style={{ cursor: 'pointer', textAlign: 'end' }}>
                        <div style={{ textAlign: 'end' }}>
                          <b>#{dataStorePokemon?.next?.id}</b>
                        </div>
                        <div className="text-navigate">{splitAndCapitalize(dataStorePokemon?.next?.name, '-', ' ')}</div>
                      </div>
                      <div style={{ width: 60, cursor: 'pointer' }}>
                        <img
                          style={{ padding: '5px 0 5px 5px' }}
                          className="pokemon-navigate-sprite"
                          alt="img-full-pokemon"
                          src={APIService.getPokeFullSprite(dataStorePokemon?.next?.id)}
                        />
                      </div>
                      <div style={{ cursor: 'pointer' }}>
                        <b>
                          <NavigateNextIcon fontSize="large" />
                        </b>
                      </div>
                    </div>
                  </div>
                )}
              </Fragment>
            )}
          </div>
          <div
            style={{ color: theme.palette.text.primary }}
            className={'element-bottom position-relative poke-container' + (props.isSearch ? '' : ' container')}
          >
            <div className="w-100 text-center d-inline-block align-middle" style={{ marginTop: 15, marginBottom: 15 }}>
              {!released && formName && (
                <Alert variant="danger">
                  <h5 className="text-danger" style={{ margin: 0 }}>
                    * <b>{splitAndCapitalize(convertName(formName?.replaceAll(' ', '-')).replace('MEWTWO_A', 'MEWTOW_ARMOR'), '_', ' ')}</b>{' '}
                    not released in Pokémon GO
                    <img
                      width={50}
                      height={50}
                      style={{ marginLeft: 10 }}
                      alt="pokemon-go-icon"
                      src={APIService.getPokemonGoIcon(icon ?? 'Standard')}
                    />
                  </h5>
                </Alert>
              )}
              <div className="d-inline-block img-desc">
                <img
                  className="pokemon-main-sprite"
                  style={{ verticalAlign: 'baseline' }}
                  alt="img-full-pokemon"
                  src={APIService.getPokeFullSprite(
                    data?.id,
                    splitAndCapitalize(
                      form?.endsWith('Shadow') || form?.endsWith('Purified')
                        ? form.replace('Shadow', '').replace('Purified', '').replaceAll('-', '').toLowerCase()
                        : form,
                      '-',
                      '-'
                    )
                  )}
                />
              </div>
              <div className="d-inline-block">
                <table className="table-info table-desc">
                  <thead />
                  <tbody>
                    <tr>
                      <td>
                        <h5 className="d-flex">ID</h5>
                      </td>
                      <td colSpan={2}>
                        {data && (
                          <h5 className="d-flex">
                            <b>#{data.id}</b>
                          </h5>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h5 className="d-flex">Name</h5>
                      </td>
                      <td colSpan={2}>
                        <h5 className="d-flex">
                          <b>
                            {formName &&
                              splitAndCapitalize(convertName(formName.replaceAll(' ', '-')).replace('MEWTWO_A', 'MEWTOW_ARMOR'), '_', ' ')}
                          </b>
                        </h5>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h5 className="d-flex">Generation</h5>
                      </td>
                      <td colSpan={2}>
                        {data && (
                          <h5 className="d-flex align-items-center" style={{ gap: 5 }}>
                            <b>{data?.generation.name.split('-').at(1)?.toUpperCase()}</b>{' '}
                            <span className="text-gen">({getNumGen(data.generation.url)})</span>
                          </h5>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h5 className="d-flex">Region</h5>
                      </td>
                      <td colSpan={2}>
                        <h5 className="d-flex">{region}</h5>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h5 className="d-flex">Version</h5>
                      </td>
                      <td colSpan={2}>
                        <h5 className="d-flex">{version && version.replace(' Go', ' GO')}</h5>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h5 className="d-flex">Body</h5>
                      </td>
                      <td colSpan={2} style={{ padding: 0 }}>
                        <div className="d-flex align-items-center first-extra-col h-100" style={{ float: 'left', width: '50%' }}>
                          <div>
                            <div className="d-inline-block" style={{ marginRight: 5 }}>
                              <h6>Weight:</h6>
                            </div>
                            <div className="d-inline-block">
                              <h6>{WH.weight / 10} kg</h6>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center h-100" style={{ float: 'left', width: '50%' }}>
                          <div>
                            <div className="d-inline-block" style={{ marginRight: 5 }}>
                              <h6>Height:</h6>
                            </div>
                            <div className="d-inline-block">
                              <h6>{WH.height / 10} m</h6>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
