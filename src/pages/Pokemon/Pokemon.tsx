import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { SearchingModel } from '../../store/models/searching.model';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import './Pokemon.scss';

import { FormModel, FormSoundCry, FormSoundCryModel, PokemonForm, PokemonFormModify } from '../../core/models/API/form.model';
import { PokemonInfo } from '../../core/models/API/info.model';
import { Species } from '../../core/models/API/species.model';
import { OptionsPokemon, PokemonGenderRatio, PokemonDataModel } from '../../core/models/pokemon.model';
import APIService from '../../services/API.service';
import { RouterState, StoreState, SpinnerState } from '../../store/models/state.model';
import { PokemonTypeCost } from '../../core/models/evolution.model';
import {
  checkPokemonIncludeShadowForm,
  convertPokemonAPIDataName,
  convertPokemonImageName,
  generatePokemonGoForms,
  generatePokemonGoShadowForms,
  getPokemonById,
  getPokemonDetails,
  splitAndCapitalize,
} from '../../util/Utils';
import PokemonModel from '../../components/Info/Assets/PokemonModel';
import Candy from '../../components/Sprites/Candy/Candy';
import PokemonTable from '../../components/Table/Pokemon/PokemonTable';
import AlertReleased from './components/AlertReleased';
import SearchBar from './components/SearchBar';
import SearchBarMain from './components/SearchBarMain';
import { KEY_LEFT, KEY_RIGHT, FORM_GMAX, regionList } from '../../util/Constants';
import { useTheme } from '@mui/material';
import Error from '../Error/Error';
import { Action } from 'history';
import Form from '../../components/Info/Form/Form';
import { AxiosError } from 'axios';
import { APIUrl } from '../../services/constants';

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
  setId?: (id: number) => void;
}) => {
  const theme = useTheme();
  const router = useSelector((state: RouterState) => state.router);
  const icon = useSelector((state: StoreState) => state.store.icon);
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const pokemonData = useSelector((state: StoreState) => state.store?.data?.pokemon ?? []);

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [generation, setGeneration] = useState('');
  const [WH, setWH] = useState({ weight: -1, height: -1 });
  const [formName, setFormName]: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>] = useState();
  const [originForm, setOriginForm]: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>] = useState();
  const [originSoundCry, setOriginSoundCry] = useState([] as FormSoundCry[]);
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

  const [progress, setProgress] = useState({ isLoadedForms: false });

  const { isLoadedForms } = progress;

  const axiosSource = useRef(APIService.getCancelToken());
  const { enqueueSnackbar } = useSnackbar();

  const fetchMap = useCallback(
    async (data: Species) => {
      const dataPokeList: PokemonInfo[] = [];
      const dataFormList: PokemonForm[][] = [];
      const soundCries: FormSoundCry[] = [];
      const cancelToken = axiosSource.current.token;
      await Promise.all(
        data.varieties.map(async (value) => {
          const pokeInfo = (await APIService.getFetchUrl<PokemonInfo>(value.pokemon.url, { cancelToken })).data;
          const pokeForm = await Promise.all(
            pokeInfo.forms.map(async (item) => (await APIService.getFetchUrl<PokemonForm>(item.url, { cancelToken })).data)
          );
          soundCries.push(new FormSoundCryModel(pokeInfo));
          dataPokeList.push({
            ...pokeInfo,
            is_include_shadow: checkPokemonIncludeShadowForm(pokemonData, pokeInfo.name),
          });
          dataFormList.push(pokeForm);
        })
      ).catch(() => {
        return;
      });

      const pokemon = pokemonData.find((item) => item.num === data.id);
      setPokeRatio(pokemon?.genderRatio);
      setCostModifier({
        purified: {
          candy: pokemon?.purified?.candy ?? 0,
          stardust: pokemon?.purified?.stardust ?? 0,
        },
        thirdMove: {
          candy: pokemon?.thirdMove?.candy ?? 0,
          stardust: pokemon?.thirdMove?.stardust ?? 0,
        },
      });

      const formListResult = dataFormList
        .map((item) =>
          item
            .map(
              (item) =>
                new PokemonFormModify(
                  data.id,
                  data.name,
                  data.varieties.find((v) => item.pokemon.name.includes(v.pokemon.name))?.pokemon.name ?? '',
                  new FormModel({
                    ...item,
                    form_name: item.form_name.toUpperCase() === FORM_GMAX ? item.name.replace(`${data.name}-`, '') : item.form_name,
                  })
                )
            )
            .sort((a, b) => (a.form.id ?? 0) - (b.form.id ?? 0))
        )
        .sort((a, b) => (a[0]?.form.id ?? 0) - (b[0]?.form.id ?? 0));

      const indexPokemonGO = generatePokemonGoForms(pokemonData, dataFormList, formListResult, data.id, data.name);

      if (pokemon?.isShadow && pokemon?.purified?.candy && pokemon?.purified.stardust) {
        generatePokemonGoShadowForms(dataPokeList, formListResult, data.id, data.name, indexPokemonGO);
      }

      setOriginSoundCry(soundCries);
      setPokeData(dataPokeList);
      setFormList(formListResult);

      // Set Default Form
      let currentForm: PokemonFormModify | undefined;
      const formParams = searchParams.get('form')?.toLowerCase().replaceAll('_', '-');
      const defaultForm = formListResult.map((value) => value.find((item) => item.form.is_default)).filter((item) => item);
      if (formParams) {
        const defaultFormSearch = formListResult.find((value) =>
          value.find(
            (item) =>
              convertPokemonAPIDataName(item.form.form_name).toLowerCase().replaceAll('_', '-') === formParams ||
              convertPokemonAPIDataName(item.form.name).toLowerCase().replaceAll('_', '-') === `${item.default_name}-${formParams}`
          )
        );
        if (defaultFormSearch) {
          currentForm = defaultFormSearch.at(0);
        } else {
          currentForm = defaultForm.find((item) => item?.form.id === data.id);
          searchParams.delete('form');
        }
        setSearchParams(searchParams);
      } else if (router.action === Action.Pop && props.searching) {
        currentForm = defaultForm.find((item) => item?.form.form_name === props.searching?.form);
      } else {
        currentForm = defaultForm.find((item) => item?.form.id === data.id);
      }
      if (!currentForm) {
        currentForm = formListResult.map((value) => value.find((item) => item.form.id === data.id)).find((item) => item);
      }
      let defaultData = dataPokeList.find((value) => value.name === currentForm?.form.name);
      if (!defaultData) {
        defaultData = dataPokeList.find((value) => value.name === currentForm?.name);
      }
      setWH((prevWH) => ({ ...prevWH, weight: defaultData?.weight ?? 0, height: defaultData?.height ?? 0 }));
      setCurrentData(defaultData);
      setCurrentForm(currentForm);
      setData(data);

      setProgress((p) => ({ ...p, isLoadedForms: true }));
    },
    [pokemonData, searchParams]
  );

  const queryPokemon = useCallback(
    (id: string) => {
      axiosSource.current = APIService.reNewCancelToken();
      const cancelToken = axiosSource.current.token;

      APIService.getPokeSpices(id, { cancelToken })
        .then((res) => {
          if (res.data) {
            fetchMap(res.data);
          }
        })
        .catch((e: AxiosError) => {
          if (APIService.isCancel(e)) {
            return;
          }
          enqueueSnackbar(`Pokémon ID or name: ${id} Not found!`, { variant: 'error' });
          if (params.id) {
            document.title = `#${params.id} - Not Found`;
            setIsFound(false);
          } else {
            navigate('/error', { replace: true, state: { url: location.pathname, id } });
          }
        });
    },
    [enqueueSnackbar, fetchMap]
  );

  const clearData = (isForceClear = false) => {
    setOriginForm(undefined);
    setReleased(true);
    setFormName(undefined);
    setWH({ weight: -1, height: -1 });
    setVersion('');
    setRegion('');
    setGeneration('');
    setPokeRatio(undefined);
    if (isForceClear) {
      setProgress((p) => ({ ...p, isLoadedForms: false }));
      setFormList([]);
      setPokeData([]);
      setCurrentForm(undefined);
      setCurrentData(undefined);
      setCostModifier({
        purified: {
          candy: -1,
          stardust: -1,
        },
        thirdMove: {
          candy: -1,
          stardust: -1,
        },
      });
    }
  };

  useEffect(() => {
    const id = params.id?.toLowerCase() ?? props.id;
    if (id && (data?.id ?? 0) !== parseInt(id) && pokemonData.length > 0) {
      clearData(true);
      queryPokemon(id);
    }
    return () => {
      if (data?.id) {
        APIService.cancel(axiosSource.current);
      }
    };
  }, [params.id, props.id, pokemonData, data?.id, queryPokemon]);

  useEffect(() => {
    if (!data) {
      let id = 0;
      if (params.id && !isNaN(parseInt(params.id))) {
        id = parseInt(params.id);
      } else if (props.id) {
        id = parseInt(props.id);
      }
      setDataStorePokemon({
        current: {
          id,
          name: '',
        },
      });
      setCostModifier({
        purified: {
          candy: -1,
          stardust: -1,
        },
        thirdMove: {
          candy: -1,
          stardust: -1,
        },
      });
    }
  }, [data]);

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
              params.id ? navigate(`/pokemon/${result.prev.id}`, { replace: true }) : props.onDecId?.();
            } else if (result.next && event.keyCode === KEY_RIGHT) {
              event.preventDefault();
              params.id ? navigate(`/pokemon/${result.next.id}`, { replace: true }) : props.onIncId?.();
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

  const checkReleased = (id: number, form: string, defaultForm: PokemonFormModify) => {
    if (!form) {
      if (defaultForm) {
        form = defaultForm.form?.form_name || defaultForm.default_name;
      } else {
        return false;
      }
    }

    const details = getPokemonDetails(pokemonData, id, form, defaultForm.form.is_default);
    setPokemonDetails(details);
    return details?.releasedGO ?? false;
  };

  useEffect(() => {
    if (currentForm && (data?.id ?? 0) > 0) {
      const released = checkReleased(data?.id ?? 0, formName ?? '', currentForm);
      setReleased(released);

      const formParams = searchParams.get('form');
      setVersion(currentForm?.form.version_group.name);
      const gen = data?.generation.url?.split('/').at(6);
      setGeneration(gen ?? '');
      if (!params.id) {
        setRegion(regionList[parseInt(gen ?? '')]);
      } else {
        const currentRegion = Object.values(regionList).find((item) => currentForm?.form.form_name.includes(item.toLowerCase()));
        if (currentForm?.form.form_name !== '' && currentRegion) {
          setRegion(!region || region !== currentRegion ? currentRegion : region);
        } else {
          setRegion(regionList[parseInt(gen ?? '0')]);
        }
      }
      const nameInfo =
        router.action === Action.Pop && props.searching
          ? props.searching.fullName
          : currentForm?.form?.is_default
          ? currentForm?.form?.name
          : formParams || (currentForm?.form.id ?? 0) < 0
          ? currentForm?.form.name
          : data?.name;
      setFormName(nameInfo?.replace(/-f$/, '-female').replace(/-m$/, '-male'));
      const originForm = splitAndCapitalize(
        router.action === Action.Pop && props.searching ? props.searching.form : currentForm?.form.form_name,
        '-',
        '-'
      );
      setOriginForm(originForm);
      if (params.id) {
        document.title = `#${data?.id} - ${splitAndCapitalize(nameInfo, '-', ' ')}`;
      }
    } else {
      clearData();
    }
  }, [data?.id, props.id, params.id, formName, currentForm]);

  useEffect(() => {
    const id = params.id?.toLowerCase() ?? props.id;
    if (pokemonData.length > 0 && id && parseInt(id.toString()) > 0) {
      const currentId = getPokemonById(pokemonData, parseInt(id.toString()));
      if (currentId) {
        setDataStorePokemon({
          prev: getPokemonById(pokemonData, currentId.id - 1),
          current: getPokemonById(pokemonData, currentId.id),
          next: getPokemonById(pokemonData, currentId.id + 1),
        });
      }
    }
  }, [pokemonData.length, params.id, props.id]);

  const reload = (element: JSX.Element, color = '#f5f5f5') => {
    if (isLoadedForms) {
      return element;
    }
    return (
      <div className="ph-item w-75" style={{ padding: 0, margin: 0, height: 24 }}>
        <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: color }} />
      </div>
    );
  };

  return (
    <Fragment>
      {!isFound ? (
        <Error />
      ) : (
        <Fragment>
          <div className="w-100 row prev-next-block sticky-top">
            {params.id ? (
              <SearchBarMain data={dataStorePokemon} />
            ) : (
              <SearchBar data={dataStorePokemon} router={router} onDecId={props.onDecId} onIncId={props.onIncId} />
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
                    dataStorePokemon?.current?.id ?? 0,
                    convertPokemonImageName(
                      currentForm && originForm && currentForm.default_id === currentForm.form.id
                        ? ''
                        : originForm || searchParams.get('form')
                    )
                  )}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    if (e.currentTarget.src.includes(APIUrl.POKE_SPRITES_FULL_API_URL)) {
                      e.currentTarget.src = APIService.getPokeFullAsset(dataStorePokemon?.current?.id ?? 0);
                    } else {
                      e.currentTarget.src = APIService.getPokeFullSprite(0);
                    }
                  }}
                />
              </div>
              <div className="d-inline-block">
                <PokemonTable
                  id={dataStorePokemon?.current?.id}
                  gen={parseInt(generation)}
                  formName={formName}
                  region={region}
                  version={version}
                  weight={WH.weight ?? 0}
                  height={WH.height ?? 0}
                  isLoadedForms={isLoadedForms}
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
                          <Candy id={dataStorePokemon?.current?.id} style={{ marginRight: 5 }} />
                          {reload(
                            <span>
                              {costModifier.thirdMove.candy
                                ? costModifier.purified.candy === -1
                                  ? ''
                                  : `x${costModifier.thirdMove.candy}`
                                : 'Unavailable'}
                            </span>
                          )}
                        </div>
                        <div className="row-extra d-flex">
                          <div className="d-inline-flex justify-content-center" style={{ width: 20, marginRight: 5 }}>
                            <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                          </div>
                          {reload(
                            <span>
                              {costModifier.thirdMove.stardust
                                ? costModifier.purified.stardust === -1
                                  ? ''
                                  : `x${costModifier.thirdMove.stardust}`
                                : 'Unavailable'}
                            </span>
                          )}
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
                          <Candy id={dataStorePokemon?.current?.id} style={{ marginRight: 5 }} />
                          {reload(
                            <span>
                              {costModifier.purified.candy
                                ? costModifier.purified.candy === -1
                                  ? ''
                                  : `x${costModifier.purified.candy}`
                                : 'Unavailable'}
                            </span>
                          )}
                        </div>
                        <div className="row-extra d-flex">
                          <div className="d-inline-flex justify-content-center" style={{ width: 20, marginRight: 5 }}>
                            <img alt="img-stardust" height={20} src={APIService.getItemSprite('stardust_painted')} />
                          </div>
                          {reload(
                            <span>
                              {costModifier.purified.stardust
                                ? costModifier.purified.stardust === -1
                                  ? ''
                                  : `x${costModifier.purified.stardust}`
                                : 'Unavailable'}
                            </span>
                          )}
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
              setOriginForm={setOriginForm}
              setWH={setWH}
              data={currentData}
              setData={setCurrentData}
              formList={formList}
              pokeData={pokeData}
              ratio={pokeRatio}
              setId={props.setId}
              pokemonDetail={pokemonDetails}
              defaultId={dataStorePokemon?.current?.id ?? 0}
              region={region}
              setProgress={setProgress}
              isLoadedForms={isLoadedForms}
            />
            <PokemonModel
              id={dataStorePokemon?.current?.id ?? 0}
              name={dataStorePokemon?.current?.name ?? ''}
              originSoundCry={originSoundCry}
              isLoadedForms={isLoadedForms}
            />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Pokemon;
