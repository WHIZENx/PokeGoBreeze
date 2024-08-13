import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import './Pokemon.scss';

import {
  Form,
  IFormSoundCry,
  FormSoundCry,
  PokemonForm,
  IPokemonFormModify,
  PokemonFormModify,
  PokemonFormDetail,
  IPokemonFormDetail,
} from '../../core/models/API/form.model';
import { IPokemonDetail, PokemonDetail, PokemonInfo } from '../../core/models/API/info.model';
import { Species } from '../../core/models/API/species.model';
import { OptionsPokemon, IPokemonGenderRatio, IPokemonData } from '../../core/models/pokemon.model';
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
import FormComponent from '../../components/Info/Form/Form';
import { AxiosError } from 'axios';
import { APIUrl } from '../../services/constants';
import { IPokemonPage } from '../models/page.model';

interface TypeCost {
  purified: PokemonTypeCost;
  thirdMove: PokemonTypeCost;
}

const Pokemon = (props: IPokemonPage) => {
  const theme = useTheme();
  const router = useSelector((state: RouterState) => state.router);
  const icon = useSelector((state: StoreState) => state.store.icon);
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const pokemonData = useSelector((state: StoreState) => state.store?.data?.pokemon ?? []);

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pokeData, setPokeData] = useState<IPokemonDetail[]>([]);
  const [currentData, setCurrentData] = useState<IPokemonDetail>();
  const [formList, setFormList] = useState<IPokemonFormModify[][]>();

  const [data, setData] = useState<Species>();
  const [dataStorePokemon, setDataStorePokemon] = useState<OptionsPokemon>();
  const [pokeRatio, setPokeRatio] = useState<IPokemonGenderRatio>();

  const [version, setVersion] = useState('');
  const [region, setRegion] = useState('');
  const [generation, setGeneration] = useState('');
  const [WH, setWH] = useState({ weight: -1, height: -1 });
  const [formName, setFormName] = useState<string>();
  const [originForm, setOriginForm] = useState<string>();
  const [originSoundCry, setOriginSoundCry] = useState<IFormSoundCry[]>([]);
  const [released, setReleased] = useState(true);
  const [isFound, setIsFound] = useState(true);
  const [currentForm, setCurrentForm] = useState<IPokemonFormModify>();
  const [pokemonDetails, setPokemonDetails] = useState<IPokemonData>();

  const [costModifier, setCostModifier] = useState<TypeCost>();

  const [progress, setProgress] = useState({ isLoadedForms: false });

  const { isLoadedForms } = progress;

  const axiosSource = useRef(APIService.getCancelToken());
  const { enqueueSnackbar } = useSnackbar();

  const fetchMap = useCallback(
    async (data: Species) => {
      const dataPokeList: IPokemonDetail[] = [];
      const dataFormList: IPokemonFormDetail[][] = [];
      const soundCries: IFormSoundCry[] = [];
      const cancelToken = axiosSource.current.token;
      await Promise.all(
        data.varieties.map(async (value) => {
          const pokeInfo = (await APIService.getFetchUrl<PokemonInfo>(value.pokemon.url, { cancelToken })).data;
          const pokeForm = await Promise.all(
            pokeInfo.forms.map(async (item) => {
              const form = (await APIService.getFetchUrl<PokemonForm>(item.url, { cancelToken })).data;
              return PokemonFormDetail.setDetails(form);
            })
          );
          const pokeDetail = PokemonDetail.setDetails({
            ...pokeInfo,
            isIncludeShadow: checkPokemonIncludeShadowForm(pokemonData, pokeInfo.name),
          });
          soundCries.push(new FormSoundCry(pokeDetail));
          dataPokeList.push(pokeDetail);
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
            .map((item) =>
              PokemonFormModify.setForm(
                data.id,
                data.name,
                data.varieties.find((v) => item.pokemon.name.includes(v.pokemon.name))?.pokemon.name ?? '',
                new Form({
                  ...item,
                  formName: item.formName.toUpperCase() === FORM_GMAX ? item.name.replace(`${data.name}-`, '') : item.formName,
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
      let currentForm: IPokemonFormModify | undefined = new PokemonFormModify();
      const formParams = searchParams.get('form')?.toLowerCase().replaceAll('_', '-');
      const defaultForm = formListResult.flatMap((item) => item).filter((item) => item.form.isDefault);
      if (formParams) {
        const defaultFormSearch = formListResult
          .flatMap((form) => form)
          .find(
            (item) =>
              convertPokemonAPIDataName(item.form.formName).toLowerCase().replaceAll('_', '-') === formParams ||
              convertPokemonAPIDataName(item.form.name).toLowerCase().replaceAll('_', '-') === `${item.defaultName}-${formParams}`
          );
        if (defaultFormSearch) {
          currentForm = defaultFormSearch;
        } else {
          currentForm = defaultForm.find((item) => item?.form.id === data.id);
          searchParams.delete('form');
          setSearchParams(searchParams);
        }
      } else if (router.action === Action.Pop && props.searching) {
        currentForm = defaultForm.find((item) => item?.form.formName === props.searching?.form);
      } else {
        currentForm = defaultForm.find((item) => item?.form.id === data.id);
      }
      if (!currentForm) {
        currentForm = formListResult.flatMap((item) => item).find((item) => item.form.id === data.id);
      }
      let defaultData = dataPokeList.find((value) => value.name === currentForm?.form.name);
      if (!defaultData) {
        defaultData = dataPokeList.find((value) => value.name === currentForm?.name);
      }
      setWH((prevWH) => ({ ...prevWH, weight: defaultData?.weight ?? 0, height: defaultData?.height ?? 0 }));
      setCurrentData(defaultData);
      setCurrentForm(currentForm ?? defaultForm.at(0));
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
      setCostModifier(undefined);
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
      setCostModifier(undefined);
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

  const checkReleased = (id: number, form: string, defaultForm: IPokemonFormModify) => {
    if (!form) {
      if (defaultForm) {
        form = defaultForm.form?.formName || defaultForm.defaultName;
      } else {
        return false;
      }
    }

    const details = getPokemonDetails(pokemonData, id, form, defaultForm.form.isDefault);
    setPokemonDetails(details);
    return details?.releasedGO ?? false;
  };

  useEffect(() => {
    if (currentForm && (data?.id ?? 0) > 0) {
      const released = checkReleased(data?.id ?? 0, formName ?? '', currentForm);
      setReleased(released);

      const formParams = searchParams.get('form');
      setVersion(currentForm?.form.versionGroup.name);
      const gen = data?.generation.url?.split('/').at(6);
      setGeneration(gen ?? '');
      if (!params.id) {
        setRegion(regionList[parseInt(gen ?? '')]);
      } else {
        const currentRegion = Object.values(regionList).find((item) => currentForm?.form.formName.includes(item.toLowerCase()));
        if (currentForm?.form.formName !== '' && currentRegion) {
          setRegion(!region || region !== currentRegion ? currentRegion : region);
        } else {
          setRegion(regionList[parseInt(gen ?? '0')]);
        }
      }
      const nameInfo =
        router.action === Action.Pop && props.searching
          ? props.searching.fullName
          : currentForm?.form?.isDefault
          ? currentForm?.form?.name
          : formParams || (currentForm?.form.id ?? 0) < 0
          ? currentForm?.form.name
          : data?.name;
      setFormName(nameInfo?.replace(/-f$/, '-female').replace(/-m$/, '-male'));
      const originForm = splitAndCapitalize(
        router.action === Action.Pop && props.searching ? props.searching.form : currentForm?.form.formName,
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
                      currentForm && originForm && currentForm.defaultId === currentForm.form.id
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
                              {costModifier?.thirdMove.candy
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
                              {costModifier?.thirdMove.stardust
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
                              {costModifier?.purified.candy
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
                              {costModifier?.purified.stardust
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
            <FormComponent
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
