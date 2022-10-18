import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import APIService from '../../services/API.service';

import './Pokemon.css';

import { convertName, splitAndCapitalize } from '../../util/Utils';
import { computeCandyBgColor, computeCandyColor } from '../../util/Compute';
import { regionList } from '../../util/Constants';

import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Form from '../../components/Info/Form/Form-v2';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import pokemonData from '../../data/pokemon.json';
import pokeListName from '../../data/pokemon_names.json';
import PokemonModel from '../../components/Info/Assets/PokemonModel';
import Error from '../Error/Error';
import { Alert } from 'react-bootstrap';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../store/actions/spinner.action';

const Pokemon = (props: { id?: any; onDecId?: any; onIncId?: any; isSearch?: any; onSetIDPoke?: any }) => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: RootStateOrAny) => state.store.data);
  const stats = useSelector((state: RootStateOrAny) => state.stats);

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const maxPokemon = Object.keys(pokeListName).length;

  const [pokeData, setPokeData]: any = useState([]);
  const [formList, setFormList]: any = useState([]);

  const [reForm, setReForm] = useState(false);
  const [loadForm, setLoadForm] = useState(false);

  const [data, setData]: any = useState(null);
  const [pokeRatio, setPokeRatio]: any = useState(null);

  const [version, setVersion]: any = useState(null);
  const [region, setRegion] = useState(null);
  const [WH, setWH] = useState({ weight: 0, height: 0 });
  const [formName, setFormName]: any = useState(null);
  const [isFound, setIsFound] = useState(true);

  const [onChangeForm, setOnChangeForm] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const getRatioGender = useCallback((id: number) => {
    return Object.values(pokemonData).find((item) => id === item.num)?.genderRatio;
  }, []);

  const fetchMap = useCallback(
    async (
      data: { varieties: any[]; name: string; id: number; generation: { url: string } },
      axios: { getFetchUrl: (arg0: any, arg1: { cancelToken: any }) => any },
      source: { token: any }
    ) => {
      setLoadForm(false);
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
        dataFromList.push([
          {
            default_name: 'mewtwo',
            name: 'mewtwo',
            form: {
              form_name: 'armor',
              form_names: [],
              form_order: 4,
              id: null,
              is_battle_only: true,
              is_default: true,
              is_mega: false,
              name: 'mewtwo-armor',
              version_group: { name: 'Pokémon-GO' },
              types: [{ type: { name: 'psychic' } }],
            },
          },
        ]);
      }
      setFormList(dataFromList);
      let defaultFrom,
        isDefaultForm: {
          form_name: string;
          form: { name: string; version_group: { name: string } };
          default_name: string;
          name: any;
        },
        defaultData: { weight: any; height: any };
      let form: any = searchParams.get('form');

      if (form) {
        if (data.id === 555 && form === 'galar') {
          form += '-standard';
        }
        defaultFrom = dataFromList.find((value) =>
          value.find(
            (item: { form: { form_name: string; name: string }; default_name: string }) =>
              item.form.form_name === form.toLowerCase() || item.form.name === item.default_name + '-' + form.toLowerCase()
          )
        );

        if (defaultFrom) {
          isDefaultForm = defaultFrom[0];
          if (
            isDefaultForm.form_name !== form.toLowerCase() &&
            isDefaultForm.form.name !== isDefaultForm.default_name + '-' + form.toLowerCase()
          ) {
            isDefaultForm = defaultFrom.find((value: { form: { form_name: string } }) => value.form.form_name === form.toLowerCase());
          }
        } else {
          defaultFrom = dataFromList.map((value) => value.find((item: { form: { is_default: any } }) => item.form.is_default));
          isDefaultForm = defaultFrom.find((item) => item.form.id === data.id);
          searchParams.delete('form');
          setSearchParams(searchParams);
        }
      } else {
        defaultFrom = dataFromList.map((value) => value.find((item: { form: { is_default: any } }) => item.form.is_default));
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
      const nameInfo = splitAndCapitalize(form ? isDefaultForm.form.name : data.name, '-', ' ');
      setLoadForm(true);
      setFormName(nameInfo);
      if (params.id) {
        document.title = `#${data.id} - ${nameInfo}`;
      }
      setOnChangeForm(false);
    },
    [searchParams, setSearchParams, params.id]
  );

  const queryPokemon = useCallback(
    (id: any, axios: any, source: { token: any; cancel: () => void }) => {
      if (!params.id || (params.id && data && parseInt(id) !== data.id)) {
        dispatch(showSpinner());
      }
      axios
        .getPokeSpicies(id, {
          cancelToken: source.token,
        })
        .then((res: { data: any }) => {
          setPokeRatio(getRatioGender(res.data.id));
          fetchMap(res.data, axios, source);
          setData(res.data);
        })
        .catch(() => {
          enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
          if (params.id) {
            document.title = `#${params.id} - Not Found`;
          }
          setIsFound(false);
          source.cancel();
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

  const getNumGen = (url: string) => {
    return 'Gen ' + url.split('/')[6];
  };

  const setVersionName = (version: string) => {
    setVersion(splitAndCapitalize(version, '-', ' '));
  };

  const getCostModifier = (id: any) => {
    return dataStore.evolution.find((item: { id: any }) => item.id === id);
  };

  const checkReleased = () => {
    if (!formName || !loadForm) {
      return false;
    }
    const pokemonForm =
      dataStore.details.find(
        (item: { id: any; name: string }) =>
          item.id === data.id && item.name === convertName(formName.replaceAll(' ', '-')).replaceAll('MR.', 'MR')
      )?.releasedGO ?? false;
    return !pokemonForm;
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
                    {data.id > 1 && (
                      <div
                        title="Previous Pokémon"
                        className={`prev-block col${data.id < maxPokemon - 1 ? '-6' : ''}`}
                        style={{ padding: 0 }}
                      >
                        <Link
                          onClick={() => setReForm(false)}
                          className="d-flex justify-content-start align-items-center"
                          to={'/pokemon/' + (data.id - 1)}
                          title={`#${data.id - 1} ${splitAndCapitalize((pokeListName as any)[data.id - 1].name, '-', ' ')}`}
                        >
                          <div style={{ cursor: 'pointer' }}>
                            <b>
                              <NavigateBeforeIcon fontSize="large" />
                            </b>
                          </div>
                          <div style={{ width: 60, cursor: 'pointer' }}>
                            <img
                              className="pokemon-navigate-sprite"
                              alt="img-full-pokemon"
                              src={APIService.getPokeFullSprite(data.id - 1)}
                            />
                          </div>
                          <div className="w-100" style={{ cursor: 'pointer' }}>
                            <div style={{ textAlign: 'start' }}>
                              <b>#{data.id - 1}</b>
                            </div>
                            <div className="text-navigate">{splitAndCapitalize((pokeListName as any)[data.id - 1].name, '-', ' ')}</div>
                          </div>
                        </Link>
                      </div>
                    )}
                    {data.id < maxPokemon && (pokeListName as any)[data.id + 1] && (
                      <div
                        title="Next Pokémon"
                        className={`next-block col${data.id > 1 ? '-6' : ''}`}
                        style={{ float: 'right', padding: 0 }}
                      >
                        <Link
                          onClick={() => setReForm(false)}
                          className="d-flex justify-content-end align-items-center"
                          to={'/pokemon/' + (data.id + 1)}
                          title={`#${data.id + 1} ${splitAndCapitalize((pokeListName as any)[data.id + 1].name, '-', ' ')}`}
                        >
                          <div className="w-100" style={{ cursor: 'pointer', textAlign: 'end' }}>
                            <div style={{ textAlign: 'end' }}>
                              <b>#{data.id + 1}</b>
                            </div>
                            <div className="text-navigate">{splitAndCapitalize((pokeListName as any)[data.id + 1].name, '-', ' ')}</div>
                          </div>
                          <div style={{ width: 60, cursor: 'pointer' }}>
                            <img
                              className="pokemon-navigate-sprite"
                              alt="img-full-pokemon"
                              src={APIService.getPokeFullSprite(data.id + 1)}
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
                    {data.id > 1 && (
                      <div
                        title="Previous Pokémon"
                        className={`prev-block col${data.id < maxPokemon - 1 ? '-6' : ''}`}
                        style={{ padding: 0 }}
                      >
                        <div
                          className="d-flex justify-content-start align-items-center"
                          onClick={() => props.onDecId()}
                          title={`#${data.id - 1} ${splitAndCapitalize((pokeListName as any)[data.id - 1].name, '-', ' ')}`}
                        >
                          <div style={{ cursor: 'pointer' }}>
                            <b>
                              <NavigateBeforeIcon fontSize="large" />
                            </b>
                          </div>
                          <div style={{ width: 60, cursor: 'pointer' }}>
                            <img
                              className="pokemon-navigate-sprite"
                              alt="img-full-pokemon"
                              src={APIService.getPokeFullSprite(data.id - 1)}
                            />
                          </div>
                          <div className="w-100" style={{ cursor: 'pointer' }}>
                            <div style={{ textAlign: 'start' }}>
                              <b>#{data.id - 1}</b>
                            </div>
                            <div className="text-navigate">{splitAndCapitalize((pokeListName as any)[data.id - 1].name, '-', ' ')}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {data.id < maxPokemon && (pokeListName as any)[data.id + 1] && (
                      <div
                        title="Next Pokémon"
                        className={`next-block col${data.id > 1 ? '-6' : ''}`}
                        style={{ float: 'right', padding: 0 }}
                      >
                        <div
                          className="d-flex justify-content-end align-items-center"
                          onClick={() => props.onIncId()}
                          title={`#${data.id + 1} ${splitAndCapitalize((pokeListName as any)[data.id + 1].name, '-', ' ')}`}
                        >
                          <div className="w-100" style={{ cursor: 'pointer', textAlign: 'end' }}>
                            <div style={{ textAlign: 'end' }}>
                              <b>#{data.id + 1}</b>
                            </div>
                            <div className="text-navigate">{splitAndCapitalize((pokeListName as any)[data.id + 1].name, '-', ' ')}</div>
                          </div>
                          <div style={{ width: 60, cursor: 'pointer' }}>
                            <img
                              className="pokemon-navigate-sprite"
                              alt="img-full-pokemon"
                              src={APIService.getPokeFullSprite(data.id + 1)}
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
              <div className={'element-bottom position-relative poke-container' + (props.isSearch ? '' : ' container')}>
                <div className="w-100 text-center d-inline-block align-middle" style={{ marginTop: 15, marginBottom: 15 }}>
                  {checkReleased() && (
                    <Alert variant="danger">
                      <h5 className="text-danger" style={{ margin: 0 }}>
                        * <b>{formName}</b> not released in Pokémon GO
                        <img
                          width={50}
                          height={50}
                          style={{ marginLeft: 10 }}
                          alt="pokemon-go-icon"
                          src={APIService.getPokemonGoIcon('Standard')}
                        />
                      </h5>
                    </Alert>
                  )}
                  <div className="d-inline-block img-desc">
                    <img
                      className="pokemon-main-sprite"
                      style={{ verticalAlign: 'baseline' }}
                      alt="img-full-pokemon"
                      src={APIService.getPokeFullSprite(data.id)}
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
                            <h5 className="d-flex">{version && version.replace('Go', 'GO')}</h5>
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
                              <div
                                className="d-inline-block bg-poke-candy"
                                style={{
                                  backgroundColor: computeCandyBgColor(dataStore.candy, data.id),
                                  marginRight: 5,
                                }}
                              >
                                <div
                                  className="poke-candy"
                                  style={{
                                    background: computeCandyColor(dataStore.candy, data.id),
                                    width: 20,
                                    height: 20,
                                  }}
                                />
                              </div>
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
                              <div
                                className="d-inline-block bg-poke-candy"
                                style={{
                                  backgroundColor: computeCandyBgColor(dataStore.candy, data.id),
                                  marginRight: 5,
                                }}
                              >
                                <div
                                  className="poke-candy"
                                  style={{
                                    background: computeCandyColor(dataStore.candy, data.id),
                                    width: 20,
                                    height: 20,
                                  }}
                                />
                              </div>
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
                  onChangeForm={onChangeForm}
                  setOnChangeForm={setOnChangeForm}
                  onSetReForm={setReForm}
                  setVersion={setVersionName}
                  region={region}
                  setRegion={setRegion}
                  setWH={setWH}
                  formName={formName}
                  setFormName={setFormName}
                  id_default={data.id}
                  pokeData={pokeData}
                  formList={formList}
                  ratio={pokeRatio}
                  stats={stats}
                  species={data}
                  onSetIDPoke={props.onSetIDPoke}
                  paramForm={searchParams.get('form') && searchParams.get('form')?.toLowerCase()}
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
