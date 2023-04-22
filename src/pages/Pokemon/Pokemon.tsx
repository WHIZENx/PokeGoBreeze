import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../services/API.service';

import './Pokemon.scss';

import { convertFormNameImg, convertName, getPokemonById, getPokemonByIndex, splitAndCapitalize } from '../../util/Utils';
import { regionList } from '../../util/Constants';

import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Form from '../../components/Info/Form/Form-v2';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import PokemonModel from '../../components/Info/Assets/PokemonModel';
import Error from '../Error/Error';
import { Alert } from 'react-bootstrap';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../store/actions/spinner.action';
import Candy from '../../components/Sprites/Candy/Candy';
import { getFormsGO } from '../../core/forms';
import { RouterState } from '../..';
import { useTheme } from '@mui/material';

const Pokemon = (props: {
  prevRouter?: any;
  searching?: any;
  id?: any;
  onDecId?: any;
  onIncId?: any;
  isSearch?: boolean;
  onSetIDPoke?: any;
  first?: boolean;
  setFirst?: any;
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useSelector((state: RouterState) => state.router);
  const icon = useSelector((state: RootStateOrAny) => state.store.icon);
  const dataStore = useSelector((state: RootStateOrAny) => state.store.data);
  const stats = useSelector((state: RootStateOrAny) => state.stats);
  const spinner = useSelector((state: RootStateOrAny) => state.spinner);

  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pokeData, setPokeData]: any = useState([]);
  const [formList, setFormList]: any = useState([]);

  const [reForm, setReForm] = useState(false);

  const [data, setData]: any = useState(null);
  const [dataStorePokemon, setDataStorePokemon]: any = useState(null);
  const [pokeRatio, setPokeRatio]: any = useState(null);

  const [version, setVersion]: any = useState(null);
  const [region, setRegion] = useState(null);
  const [WH, setWH] = useState({ weight: 0, height: 0 });
  const [formName, setFormName]: any = useState(null);
  const [form, setForm]: any = useState(null);
  const [released, setReleased] = useState(true);
  const [isFound, setIsFound] = useState(true);
  const [defaultForm, setDefaultForm]: any = useState(true);

  const [onChangeForm, setOnChangeForm] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const getRatioGender = useCallback((id: number) => {
    return (Object.values(dataStore.pokemonData).find((item: any) => id === item.num) as any)?.genderRatio;
  }, []);

  const fetchMap = useCallback(
    async (
      data: { varieties: any[]; name: string; id: number; generation: { url: string } },
      // eslint-disable-next-line no-unused-vars
      axios: { getFetchUrl: (arg0: any, arg1: { cancelToken: any }) => any },
      source: { token: any }
    ) => {
      const dataPokeList: any[] = [];
      let dataFromList: any[] = [];
      await Promise.all(
        data.varieties.map(async (value: { pokemon: { url: any } }) => {
          const pokeInfo = (await axios.getFetchUrl(value.pokemon.url, { cancelToken: source.token })).data;
          const pokeForm = await Promise.all(
            pokeInfo.forms.map(async (item: { url: any }) => (await axios.getFetchUrl(item.url, { cancelToken: source.token })).data)
          );
          dataPokeList.push(pokeInfo);
          dataFromList.push(pokeForm);
        })
      );

      setPokeData(dataPokeList);
      let modify = false;
      dataFromList = dataFromList.map((value) => {
        if (value.length === 0) {
          modify = true;
          return dataFromList.find((item) => item.length === dataFromList.length);
        }
        return value;
      });
      if (modify) {
        dataFromList = dataFromList.map((value, index) => {
          return [value[index]];
        });
      }
      dataFromList = dataFromList
        .map((item) => {
          return item
            .map((item: { pokemon: { name: string | any[] } }) => ({
              form: item,
              name: data.varieties.find((v: { pokemon: { name: any } }) => item.pokemon.name.includes(v.pokemon.name)).pokemon.name,
              default_name: data.name,
            }))
            .sort((a: { form: { id: number } }, b: { form: { id: number } }) => a.form.id - b.form.id);
        })
        .sort((a, b) => a[0].form.id - b[0].form.id);
      if (data.id === 150) {
        dataFromList.push(getFormsGO(data.id));
      }
      setFormList(dataFromList);
      let defaultFrom,
        isDefaultForm: {
          form: { form_name: string; name: string; version_group: { name: string }; is_default: boolean };
          default_name: string;
          name: any;
        },
        defaultData: { weight: any; height: any };
      let formParams: any = searchParams.get('form');

      if (formParams) {
        if (data.id === 555 && formParams === 'galar') {
          formParams += '-standard';
        }
        defaultFrom = dataFromList.find((value) =>
          value.find(
            (item: { form: { form_name: string; name: string }; default_name: string }) =>
              item.form.form_name === formParams.toLowerCase() || item.form.name === item.default_name + '-' + formParams.toLowerCase()
          )
        );

        if (defaultFrom) {
          isDefaultForm = defaultFrom[0];
          if (
            isDefaultForm.form.form_name !== formParams.toLowerCase() &&
            isDefaultForm.form.name !== isDefaultForm.default_name + '-' + formParams.toLowerCase()
          ) {
            isDefaultForm = defaultFrom.find((value: { form: { form_name: string } }) => value.form.form_name === formParams.toLowerCase());
          }
        } else {
          defaultFrom = dataFromList.map((value) => value.find((item: { form: { is_default: boolean } }) => item.form.is_default));
          isDefaultForm = defaultFrom.find((item) => item.form.id === data.id);
          searchParams.delete('form');
          setSearchParams(searchParams);
        }
      } else if (router.action === 'POP' && props.searching) {
        defaultFrom = dataFromList.map((value) => value.find((item: { form: { is_default: boolean } }) => item.form.is_default));
        isDefaultForm = defaultFrom.find((item) => item.form.form_name === props.searching.form);
      } else {
        defaultFrom = dataFromList.map((value) => value.find((item: { form: { is_default: boolean } }) => item.form.is_default));
        isDefaultForm = defaultFrom.find((item) => item.form.id === data.id);
      }
      defaultData = dataPokeList.find((value) => value.name === isDefaultForm.form.name);
      if (!defaultData) {
        defaultData = dataPokeList.find((value) => value.name === isDefaultForm.name);
      }
      setWH((prevWH) => ({ ...prevWH, weight: defaultData.weight, height: defaultData.height }));
      setVersion(splitAndCapitalize((isDefaultForm ?? defaultFrom[0]).form.version_group.name, '-', ' '));
      if (!params.id) {
        setRegion(regionList[parseInt(data.generation.url.split('/')[6])]);
      }
      const nameInfo =
        router.action === 'POP' && props.searching
          ? props.searching.fullName
          : splitAndCapitalize(formParams ? isDefaultForm.form.name : data.name, '-', ' ');
      const formInfo = formParams ? splitAndCapitalize(convertFormNameImg(data.id, isDefaultForm.form.form_name), '-', '-') : null;
      setFormName(nameInfo);
      setReleased(checkReleased(data.id, nameInfo, isDefaultForm.form.is_default));
      setForm(router.action === 'POP' && props.searching ? props.searching.form : formInfo);
      setDefaultForm(isDefaultForm);
      if (params.id) {
        document.title = `#${data.id} - ${nameInfo}`;
      }
      setOnChangeForm(false);
      const currentId: any = getPokemonById(Object.values(dataStore.pokemonName), data.id);
      setDataStorePokemon({
        prev: getPokemonByIndex(Object.values(dataStore.pokemonName), currentId.index - 1),
        current: currentId,
        next: getPokemonByIndex(Object.values(dataStore.pokemonName), currentId.index + 1),
      });
    },
    [searchParams, params.id]
  );

  const queryPokemon = useCallback(
    (
      id: any,
      axios: any,
      source: {
        // eslint-disable-next-line no-unused-vars
        cancel: (arg0: string) => void;
        token: any;
      }
    ) => {
      if (!params.id || (params.id && data && parseInt(id) !== data.id)) {
        dispatch(showSpinner());
      }
      if (data?.id !== parseInt(id)) {
        setForm(null);
      }
      axios
        .getPokeSpices(id, {
          cancelToken: source.token,
        })
        .then((res: { data: any }) => {
          setPokeRatio(getRatioGender(res.data.id));
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
    },
    [dispatch, enqueueSnackbar, getRatioGender, fetchMap, params.id]
  );

  useEffect(() => {
    const axios = APIService;
    const cancelToken = axios.getAxios().CancelToken;
    const source = cancelToken.source();
    const id = params.id ? params.id.toLowerCase() : props.id;
    queryPokemon(id, axios, source);
  }, [dispatch, params.id, props.id, queryPokemon, reForm]);

  useEffect(() => {
    const keyDownHandler = (event: any) => {
      if (!spinner.loading) {
        const currentId: any = getPokemonById(
          Object.values(dataStore.pokemonName),
          parseInt(params.id ? params.id.toLowerCase() : props.id)
        );
        const result: any = {
          prev: getPokemonByIndex(Object.values(dataStore.pokemonName), currentId.index - 1),
          current: currentId,
          next: getPokemonByIndex(Object.values(dataStore.pokemonName), currentId.index + 1),
        };
        if (result.prev && event.keyCode === 37) {
          event.preventDefault();
          params.id ? navigate(`/pokemon/${result.prev.id}`) : props.onDecId();
        } else if (result.next && event.keyCode === 39) {
          event.preventDefault();
          params.id ? navigate(`/pokemon/${result.next.id}`) : props.onIncId();
        }
      }
    };
    document.addEventListener('keyup', keyDownHandler, false);
    return () => {
      document.removeEventListener('keyup', keyDownHandler, false);
    };
  }, [params.id, props.id, spinner.loading]);

  const getNumGen = (url: string) => {
    return 'Gen ' + url.split('/')[6];
  };

  const setVersionName = (version: string) => {
    setVersion(splitAndCapitalize(version, '-', ' '));
  };

  const getCostModifier = (id: any) => {
    return dataStore.evolution.find((item: { id: any }) => item.id === id);
  };

  const getPokemonDetails = (id: number, form: string | null, isDefault = false) => {
    let pokemonForm;

    if (form) {
      pokemonForm = dataStore.details.find(
        (item: { id: number; name: string }) =>
          item.id === id && item.name === convertName(form.replaceAll(' ', '-')).replaceAll('MR.', 'MR')
      );

      if (isDefault && !pokemonForm) {
        pokemonForm = dataStore.details.find((item: { id: number; form: string }) => item.id === id && item.form === 'NORMAL');
      }
    }

    if (!form && defaultForm) {
      pokemonForm = dataStore.details.find(
        (item: { id: number; form: string }) => item.id === id && item.form === defaultForm.form?.form_name.replace('-', '_').toUpperCase()
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
          {data && (
            <Fragment>
              <div className="w-100 row prev-next-block sticky-top">
                {params.id ? (
                  <Fragment>
                    {dataStorePokemon?.prev && (
                      <div
                        title="Previous Pokémon"
                        className={`prev-block col${dataStorePokemon?.next ? '-6' : ''}`}
                        style={{ padding: 0 }}
                      >
                        <Link
                          onClick={() => {
                            setReForm(false);
                            setForm(null);
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
                            setForm(null);
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
                      <div
                        title="Previous Pokémon"
                        className={`prev-block col${dataStorePokemon?.next ? '-6' : ''}`}
                        style={{ padding: 0 }}
                      >
                        <div
                          className="d-flex justify-content-start align-items-center"
                          onClick={() => {
                            if (router?.action === 'POP') {
                              setFormName(null);
                              router.action = null as any;
                            }
                            props.onDecId();
                            setForm(null);
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
                              setFormName(null);
                              router.action = null as any;
                            }
                            props.onIncId();
                            setForm(null);
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
                        *{' '}
                        <b>
                          {splitAndCapitalize(convertName(formName.replaceAll(' ', '-')).replace('MEWTWO_A', 'MEWTOW_ARMOR'), '_', ' ')}
                        </b>{' '}
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
                      src={APIService.getPokeFullSprite(data.id, splitAndCapitalize(form, '-', '-'))}
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
                            <h5 className="d-flex">
                              <b>#{data.id}</b>
                            </h5>
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
                                  splitAndCapitalize(
                                    convertName(formName.replaceAll(' ', '-')).replace('MEWTWO_A', 'MEWTOW_ARMOR'),
                                    '_',
                                    ' '
                                  )}
                              </b>
                            </h5>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <h5 className="d-flex">Generation</h5>
                          </td>
                          <td colSpan={2}>
                            <h5 className="d-flex align-items-center" style={{ gap: 5 }}>
                              <b>{data.generation.name.split('-')[1].toUpperCase()}</b>{' '}
                              <span className="text-gen">({getNumGen(data.generation.url)})</span>
                            </h5>
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
                              <Candy id={data.id} style={{ marginRight: 5 }} />
                              <span>
                                {getCostModifier(data.id) && getCostModifier(data.id).thirdMove.candy
                                  ? `x${getCostModifier(data.id).thirdMove.candy}`
                                  : 'Unavailable'}
                              </span>
                            </div>
                            <div className="row-extra d-flex">
                              <div className="d-inline-flex justify-content-center" style={{ width: 20, marginRight: 5 }}>
                                <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                              </div>
                              <span>
                                {getCostModifier(data.id) && getCostModifier(data.id).thirdMove.stardust
                                  ? `x${getCostModifier(data.id).thirdMove.stardust}`
                                  : 'Unavailable'}
                              </span>
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
                              <Candy id={data.id} style={{ marginRight: 5 }} />
                              <span>
                                {getCostModifier(data.id) && getCostModifier(data.id).purified.candy
                                  ? `x${getCostModifier(data.id).purified.candy}`
                                  : 'Unavailable'}
                              </span>
                            </div>
                            <div className="row-extra d-flex">
                              <div className="d-inline-flex justify-content-center" style={{ width: 20, marginRight: 5 }}>
                                <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                              </div>
                              <span>
                                {getCostModifier(data.id) && getCostModifier(data.id).purified.stardust
                                  ? `x${getCostModifier(data.id).purified.stardust}`
                                  : 'Unavailable'}
                              </span>
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
                  idDefault={data.id}
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
                  pokemonList={dataStore.released}
                  pokemonDetail={getPokemonDetails(data.id, null)}
                />
                <PokemonModel id={data.id} name={data.name} />
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default Pokemon;
