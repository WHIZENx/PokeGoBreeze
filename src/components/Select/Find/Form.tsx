import { useSnackbar } from 'notistack';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import Tools from './Tools';

import loading from '../../../assets/loading.png';
import { convertFormNameImg, getPokemonById, getPokemonByIndex, splitAndCapitalize, TypeRadioGroup } from '../../../util/Utils';
import TypeInfo from '../../Sprites/Type/Type';
import { FormControlLabel, Radio } from '@mui/material';
import { getFormsGO } from '../../../core/forms';
import { useDispatch } from 'react-redux';
import { setSearchToolPage } from '../../../store/actions/searching.action';
import { Action } from 'history';
import { StatsModel } from '../../../core/models/stats.model';
import { ToolSearching } from '../../../core/models/searching.model';
import { PokemonDataModel, PokemonNameModel } from '../../../core/models/pokemon.model';
import { CancelTokenSource } from 'axios';
import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import { PokemonFormModify } from '../../../core/models/API/form.model';

const Form = (props: {
  router: ReduxRouterState;
  searching: ToolSearching | null;
  raid?: boolean | undefined;
  tier?: number;
  id?: number;
  onClearStats?: any;
  // eslint-disable-next-line no-unused-vars
  setTier?: (arg0: any) => void;
  onSetPrev?: () => void;
  onSetNext?: () => void;
  name: string;
  hide?: boolean;
  // eslint-disable-next-line no-unused-vars
  setRaid?: (arg0: boolean) => void;
  form?: string | null;
  setForm?: any;
  setFormOrigin?: any;
  stats: StatsModel;
  onHandleSetStats?: any;
  data: PokemonDataModel[];
  setUrlEvo: any;
  objective?: boolean;
  pokemonName: PokemonNameModel[];
}) => {
  const dispatch = useDispatch();

  const [pokeData, setPokeData]: any = useState([]);
  const [formList, setFormList]: any = useState([]);

  const [typePoke, setTypePoke] = useState(props.raid ? 'boss' : 'pokemon');
  const [tier, setTier] = useState(props.tier ?? 1);

  const [data, setData]: any = useState(null);
  const [dataStorePokemon, setDataStorePokemon]: any = useState(null);

  const [currForm, setCurrForm]: any = useState(null);

  const [pokeID, setPokeID]: any = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const fetchMap = useCallback(async (data: { varieties: any[]; name: string; id: number }, axios: any, source: CancelTokenSource) => {
    setFormList([]);
    setPokeData([]);
    const dataPokeList = [];
    let dataFromList: any[] = [];
    await Promise.all(
      data.varieties.map(async (value: { pokemon: { url: string } }) => {
        const pokeInfo = await axios.getFetchUrl(value.pokemon.url, {
          cancelToken: source.token,
        });
        const pokeForm = await Promise.all(
          pokeInfo.data.forms.map(async (item: { url: string }) => (await axios.getFetchUrl(item.url, { cancelToken: source.token })).data)
        );
        dataPokeList.push(pokeInfo.data);
        dataFromList.push(pokeForm);
      })
    );
    const goForm = getFormsGO(data.id).map(() => {
      return {};
    });
    if (goForm.length > 0) {
      dataPokeList.push(...goForm);
      data.varieties.push(...goForm);
    }
    setPokeData(dataPokeList);
    let modify = false;
    dataFromList = dataFromList.map((value: PokemonFormModify[]) => {
      if (value.length === 0) {
        modify = true;
        return dataFromList.find((item: PokemonFormModify[]) => item.length === dataFromList.length);
      }
      return value;
    });
    if (modify) {
      dataFromList = dataFromList.map((value: { [x: string]: any }, index: string | number) => {
        return [value[index]];
      });
    }
    dataFromList = dataFromList
      .map((item) => {
        return item
          .map((item: { pokemon: { name: string } }) => ({
            form: item,
            name: data.varieties.find((v) => item.pokemon.name.includes(v.pokemon.name)).pokemon.name,
            default_name: data.name,
          }))
          .sort((a: { form: { id: number } }, b: { form: { id: number } }) => a.form.id - b.form.id);
      })
      .sort((a: { form: { id: number } }[], b: { form: { id: number } }[]) => a[0].form.id - b[0].form.id);
    if (data.id === 150) {
      dataFromList.push(getFormsGO(data.id));
    }
    setFormList(dataFromList);
    const formDefault = dataFromList.map((item: any[]) => {
      return item.find((item: PokemonFormModify) => item.form.is_default);
    });
    const isDefault = formDefault.find((item: PokemonFormModify) => item.form.id === data.id);
    if (props.searching) {
      const form = formDefault.find(
        (item: PokemonFormModify) =>
          item.form.form_name === (props.objective ? (props.searching?.obj ? props.searching?.obj.form : '') : props.searching?.form)
      );
      setCurrForm(form ?? isDefault ?? formDefault.at(0));
      setPokeID(data.id);
    } else if (isDefault) {
      setCurrForm(isDefault);
      setPokeID(isDefault.form.id);
    } else {
      setCurrForm(formDefault.at(0));
      setPokeID(formDefault.at(0).form.id);
    }
    const currentId = getPokemonById(props.pokemonName, data.id);
    if (currentId) {
      setDataStorePokemon({
        prev: getPokemonByIndex(props.pokemonName, currentId.index - 1),
        current: currentId,
        next: getPokemonByIndex(props.pokemonName, currentId.index + 1),
      });
    }
  }, []);

  const queryPokemon = useCallback(
    (id: string, axios: any, source: CancelTokenSource) => {
      if (!id) {
        return;
      }
      axios
        .getPokeSpices(id, {
          cancelToken: source.token,
        })
        .then((res: { data: { varieties: string[]; name: string; id: number } }) => {
          fetchMap(res.data, axios, source);
          setData(res.data);
        })
        .catch(() => {
          enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
          source.cancel();
        });
    },
    [enqueueSnackbar, fetchMap]
  );

  useEffect(() => {
    const axios = APIService;
    const cancelToken = axios.getAxios().CancelToken;
    const source = cancelToken.source();
    queryPokemon(props.id?.toString() ?? '', axios, source);
  }, [props.id, queryPokemon]);

  useEffect(() => {
    if (currForm || (!props.searching && props.router.action === Action.Push)) {
      dispatch(
        props.objective
          ? setSearchToolPage({
              ...(props.searching as ToolSearching),
              obj: {
                id: props.id ?? 0,
                name: currForm?.default_name,
                form: currForm?.form.form_name,
                fullName: currForm?.form.name,
                timestamp: new Date(),
              },
            })
          : setSearchToolPage({
              ...props.searching,
              id: props.id ?? 0,
              name: currForm?.default_name,
              form: currForm?.form.form_name,
              fullName: currForm?.form.name,
              timestamp: new Date(),
            })
      );
      if (props.setFormOrigin) {
        props.setFormOrigin(currForm?.form.form_name);
      }
    }
  }, [currForm]);

  const changeForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const findForm = formList
      .map((item: any[]) => item.find((item: { form: { name: string } }) => item.form.name === e.currentTarget.value))
      .find((item: any) => item);
    setCurrForm(findForm);
    if (props.onClearStats) {
      props.onClearStats();
    }
  };

  const onSetTier = (tier: number) => {
    if (props.setTier) {
      props.setTier(tier);
    }
    setTier(tier);
  };

  return (
    <Fragment>
      <div className="d-inline-block" style={{ width: 60, height: 60 }}>
        {dataStorePokemon?.prev && (
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              props.onSetPrev?.();
              setCurrForm(null);
            }}
          >
            <div>
              <img height={60} alt="img-full-pokemon" src={APIService.getPokeFullSprite(dataStorePokemon?.prev?.id)} />
            </div>
            <span>
              <b>
                <span className="text-navigater">{'<'}</span> <span>#{dataStorePokemon?.prev?.id}</span>
              </b>
            </span>
          </div>
        )}
      </div>
      <img
        style={{ padding: 10 }}
        height={200}
        alt="img-full-pokemon"
        src={
          props.form
            ? APIService.getPokeFullSprite(props.id, splitAndCapitalize(convertFormNameImg(props.id ?? 0, props.form), '-', '-'))
            : APIService.getPokeFullSprite(props.id)
        }
      />
      <div className="d-inline-block" style={{ width: 60, height: 60 }}>
        {dataStorePokemon?.next && (
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              props.onSetNext?.();
              setCurrForm(null);
            }}
          >
            <div>
              <img height={60} alt="img-full-pokemon" src={APIService.getPokeFullSprite(dataStorePokemon?.next?.id)} />
            </div>
            <span>
              <b>
                <span>#{dataStorePokemon?.next?.id}</span> <span className="text-navigater">{'>'}</span>
              </b>
            </span>
          </div>
        )}
      </div>
      <div className="element-top" style={{ height: 64 }}>
        {currForm && pokeID && pokeData.length === data.varieties.length && formList.length === data.varieties.length && (
          <TypeInfo arr={currForm.form.types.map((type: { type: { name: string } }) => type.type.name)} />
        )}
      </div>
      <h4>
        <b>
          #{props.id} {currForm ? splitAndCapitalize(currForm.form.name, '-', ' ') : props.name}
        </b>
      </h4>
      <div className="scroll-card">
        {currForm && pokeID && pokeData.length === data.varieties.length && formList.length === data.varieties.length ? (
          <Fragment>
            {formList.map((value: PokemonFormModify[], index: React.Key) => (
              <Fragment key={index}>
                {value.map((value, index: React.Key) => (
                  <button
                    value={value.form.name}
                    key={index}
                    className={'btn btn-form' + (value.form.id === currForm.form.id ? ' form-selected' : '')}
                    onClick={(e) => changeForm(e)}
                  >
                    <img
                      width={64}
                      height={64}
                      onError={(e: any) => {
                        e.onerror = null;
                        APIService.getFetchUrl(e.target.currentSrc)
                          .then(() => {
                            e.target.src = APIService.getPokeIconSprite(value.default_name);
                          })
                          .catch(() => {
                            e.target.src = APIService.getPokeIconSprite('unknown-pokemon');
                          });
                      }}
                      alt="img-icon-form"
                      src={
                        value.form.name.includes('-totem') ||
                        value.form.name.includes('-hisui') ||
                        value.form.name.includes('power-construct') ||
                        value.form.name.includes('own-tempo') ||
                        value.form.name.includes('-meteor') ||
                        value.form.name === 'mewtwo-armor' ||
                        value.form.name === 'arceus-unknown' ||
                        value.form.name === 'dialga-origin' ||
                        value.form.name === 'palkia-origin' ||
                        value.form.name === 'mothim-sandy' ||
                        value.form.name === 'mothim-trash' ||
                        value.form.name === 'basculin-white-striped' ||
                        value.form.name === 'greninja-battle-bond' ||
                        value.form.name === 'urshifu-rapid-strike' ||
                        (pokeID && pokeID >= 899)
                          ? APIService.getPokeIconSprite('unknown-pokemon')
                          : APIService.getPokeIconSprite(value.form.name)
                      }
                    />
                    <p>{value.form.form_name === '' ? 'Normal' : splitAndCapitalize(value.form.form_name, '-', ' ')}</p>
                    {value.form.id === pokeID && (
                      <b>
                        <small>(Default)</small>
                      </b>
                    )}
                    {!value.form.id && <small className="text-danger">* Only in GO</small>}
                  </button>
                ))}
              </Fragment>
            ))}
          </Fragment>
        ) : (
          <div className="loading-group vertical-center">
            <img className="loading" width={40} height={40} alt="img-pokemon" src={loading} />
            <span className="caption text-black" style={{ fontSize: 18 }}>
              <b>
                Loading<span id="p1">.</span>
                <span id="p2">.</span>
                <span id="p3">.</span>
              </b>
            </span>
          </div>
        )}
      </div>
      {!props.hide && (
        <div className="d-flex justify-content-center text-center">
          <TypeRadioGroup
            row={true}
            aria-labelledby="row-types-group-label"
            name="row-types-group"
            value={typePoke}
            onChange={(e) => {
              setTypePoke(e.target.value);
              if (props.setRaid) {
                props.setRaid(e.target.value === 'pokemon' ? false : true);
              }
              if (props.onClearStats) {
                props.onClearStats(true);
              }
            }}
          >
            <FormControlLabel
              value="pokemon"
              control={<Radio />}
              label={
                <span>
                  <img height={32} alt="img-pokemon" src={APIService.getItemSprite('pokeball_sprite')} /> Pokémon Stats
                </span>
              }
            />
            <FormControlLabel
              value="boss"
              control={<Radio />}
              label={
                <span>
                  <img className="img-type-icon" height={32} alt="img-boss" src={APIService.getRaidSprite('ic_raid_small')} /> Boss Stats
                </span>
              }
            />
          </TypeRadioGroup>
        </div>
      )}
      <div className="row">
        <div className="col-sm-6" />
        <div className="col-sm-6" />
      </div>
      <Tools
        hide={props.hide}
        raid={typePoke === 'pokemon' ? false : true}
        tier={tier}
        setTier={onSetTier}
        setForm={props.setForm}
        id={props.id}
        dataPoke={pokeData}
        currForm={currForm}
        formList={formList}
        stats={props.stats}
        onSetStats={props.onHandleSetStats}
        onClearStats={props.onClearStats}
      />
    </Fragment>
  );
};

export default Form;
