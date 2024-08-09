import { useSnackbar } from 'notistack';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import APIService from '../../services/API.service';
import Tools from './Tools';

import loading from '../../assets/loading.png';
import {
  capitalize,
  convertPokemonImageName,
  formIconAssets,
  generatePokemonGoForms,
  getPokemonById,
  splitAndCapitalize,
  TypeRadioGroup,
} from '../../util/Utils';
import TypeInfo from '../Sprites/Type/Type';
import { FormControlLabel, Radio } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setSearchToolPage } from '../../store/actions/searching.action';
import { Action } from 'history';
import { ToolSearching } from '../../core/models/searching.model';
import { IPokemonName } from '../../core/models/pokemon.model';
import {
  Form,
  PokemonForm,
  IPokemonFormModify,
  PokemonFormModify,
  PokemonFormDetail,
  IPokemonFormDetail,
} from '../../core/models/API/form.model';
import { Species } from '../../core/models/API/species.model';
import { IPokemonDetail, PokemonDetail, PokemonInfo } from '../../core/models/API/info.model';
import { FORM_GMAX, FORM_NORMAL } from '../../util/Constants';
import { AxiosError } from 'axios';
import { APIUrl } from '../../services/constants';
import { IFormSelectComponent } from '../models/component.model';
import { TypeRaid } from '../../enums/type.enum';

interface OptionsPokemon {
  prev: IPokemonName | undefined;
  current: IPokemonName | undefined;
  next: IPokemonName | undefined;
}

const FormSelect = (props: IFormSelectComponent) => {
  const dispatch = useDispatch();

  const [pokeData, setPokeData]: [IPokemonDetail[], React.Dispatch<React.SetStateAction<IPokemonDetail[]>>] = useState(
    [] as IPokemonDetail[]
  );
  const [formList, setFormList]: [IPokemonFormModify[][], React.Dispatch<React.SetStateAction<IPokemonFormModify[][]>>] = useState(
    [] as IPokemonFormModify[][]
  );

  const [typePoke, setTypePoke] = useState(props.raid ? TypeRaid.BOSS.toString() : TypeRaid.POKEMON.toString());
  const [tier, setTier] = useState(props.tier ?? 1);

  const [data, setData]: [Species | undefined, React.Dispatch<React.SetStateAction<Species | undefined>>] = useState();
  const [dataStorePokemon, setDataStorePokemon]: [
    OptionsPokemon | undefined,
    React.Dispatch<React.SetStateAction<OptionsPokemon | undefined>>
  ] = useState();

  const [currentForm, setCurrentForm]: [
    IPokemonFormModify | undefined,
    React.Dispatch<React.SetStateAction<IPokemonFormModify | undefined>>
  ] = useState();

  const axiosSource = useRef(APIService.getCancelToken());
  const { enqueueSnackbar } = useSnackbar();

  const fetchMap = async (data: Species) => {
    setFormList([]);
    setPokeData([]);
    const dataPokeList: IPokemonDetail[] = [];
    const dataFormList: IPokemonFormDetail[][] = [];
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
        const pokeDetail = PokemonDetail.setDetails(pokeInfo);
        dataPokeList.push(pokeDetail);
        dataFormList.push(pokeForm);
      })
    ).catch(() => {
      return;
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

    generatePokemonGoForms(props.data, dataFormList, formListResult, data.id, data.name);

    setPokeData(dataPokeList);
    setFormList(formListResult);

    const defaultFrom = formListResult.map((value) => value.find((item) => item.form.isDefault)).filter((item) => item);
    let currentForm = defaultFrom?.find((item) => item?.form.id === data.id);
    if (props.searching) {
      const defaultFormSearch = formListResult.find((value) =>
        value.find(
          (item) =>
            item?.form.formName === (props.objective ? (props.searching?.obj ? props.searching?.obj.form : '') : props.searching?.form)
        )
      );
      if (defaultFormSearch) {
        currentForm = defaultFormSearch.at(0);
      }
    }
    if (!currentForm) {
      currentForm = formListResult.map((value) => value.find((item) => item.form.id === data.id)).find((item) => item);
    }
    setCurrentForm(currentForm ?? defaultFrom.at(0));
    setData(data);
  };

  const queryPokemon = useCallback(
    (id: string) => {
      axiosSource.current = APIService.reNewCancelToken();
      const cancelToken = axiosSource.current.token;
      APIService.getPokeSpices(id, {
        cancelToken,
      })
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
        });
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    if (props.setName) {
      props.setName(currentForm ? splitAndCapitalize(currentForm.form.name, '-', ' ') : props.name);
    }
  }, [props.setName, props.name, currentForm]);

  useEffect(() => {
    if (props.id && (data?.id ?? 0) !== props.id && props.data.length > 0) {
      props.setForm?.(undefined);
      setCurrentForm(undefined);
      queryPokemon(props.id.toString());
    }
    return () => {
      if (data) {
        APIService.cancel(axiosSource.current);
      }
    };
  }, [props.id, props.data.length, data, queryPokemon]);

  useEffect(() => {
    if (currentForm || (!props.searching && props.router.action === Action.Push)) {
      dispatch(
        props.objective
          ? setSearchToolPage({
              ...(props.searching as ToolSearching),
              obj: {
                id: props.id ?? 0,
                name: currentForm?.defaultName,
                form: currentForm?.form.formName,
                fullName: currentForm?.form.name,
                timestamp: new Date(),
              },
            })
          : setSearchToolPage({
              ...props.searching,
              id: props.id ?? 0,
              name: currentForm?.defaultName,
              form: currentForm?.form.formName,
              fullName: currentForm?.form.name,
              timestamp: new Date(),
            })
      );
    }
  }, [currentForm]);

  useEffect(() => {
    if (props.data.length > 0 && (props.id ?? 0) > 0) {
      const currentId = getPokemonById(props.data, props.id ?? 0);
      if (currentId) {
        setDataStorePokemon({
          prev: getPokemonById(props.data, currentId.id - 1),
          current: getPokemonById(props.data, currentId.id),
          next: getPokemonById(props.data, currentId.id + 1),
        });
      }
    }
  }, [props.data, props.id]);

  const changeForm = (name: string) => {
    setCurrentForm(undefined);
    const findForm = formList.map((item) => item.find((item) => item.form.name === name)).find((item) => item);
    setCurrentForm(findForm);
    if (props.onClearStats) {
      props.onClearStats();
    }
    if (props.setName) {
      props.setName(splitAndCapitalize(findForm?.form.name, '-', ' '));
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
          <div style={{ cursor: 'pointer' }} onClick={() => props.onSetPrev?.()}>
            <div>
              <img
                height={60}
                alt="img-full-pokemon"
                src={APIService.getPokeFullSprite(dataStorePokemon?.prev.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  if (e.currentTarget.src.includes(APIUrl.POKE_SPRITES_FULL_API_URL)) {
                    e.currentTarget.src = APIService.getPokeFullAsset(dataStorePokemon?.prev?.id ?? 0);
                  } else {
                    e.currentTarget.src = APIService.getPokeFullSprite(0);
                  }
                }}
              />
            </div>
            <span>
              <b>
                <span className="text-navigator">{'<'}</span> <span>#{dataStorePokemon?.prev.id}</span>
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
          currentForm?.form
            ? APIService.getPokeFullSprite(dataStorePokemon?.current?.id, convertPokemonImageName(currentForm?.form.formName))
            : APIService.getPokeFullSprite(dataStorePokemon?.current?.id)
        }
        onError={(e) => {
          e.currentTarget.onerror = null;
          if (e.currentTarget.src.includes(APIUrl.POKE_SPRITES_FULL_API_URL)) {
            e.currentTarget.src = APIService.getPokeFullAsset(dataStorePokemon?.current?.id ?? 0);
          } else {
            e.currentTarget.src = APIService.getPokeFullSprite(0);
          }
        }}
      />
      <div className="d-inline-block" style={{ width: 60, height: 60 }}>
        {dataStorePokemon?.next && (
          <div style={{ cursor: 'pointer' }} onClick={() => props.onSetNext?.()}>
            <div>
              <img
                height={60}
                alt="img-full-pokemon"
                src={APIService.getPokeFullSprite(dataStorePokemon?.next.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  if (e.currentTarget.src.includes(APIUrl.POKE_SPRITES_FULL_API_URL)) {
                    e.currentTarget.src = APIService.getPokeFullAsset(dataStorePokemon?.next?.id ?? 0);
                  } else {
                    e.currentTarget.src = APIService.getPokeFullSprite(0);
                  }
                }}
              />
            </div>
            <span>
              <b>
                <span>#{dataStorePokemon?.next.id}</span> <span className="text-navigator">{'>'}</span>
              </b>
            </span>
          </div>
        )}
      </div>
      <div className="element-top" style={{ height: 64 }}>
        {currentForm?.defaultId && <TypeInfo arr={currentForm.form.types} />}
      </div>
      <h4>
        <b>
          #{dataStorePokemon?.current?.id}{' '}
          {currentForm ? splitAndCapitalize(currentForm.form.name?.replace('-f', '-female').replace('-m', '-male'), '-', ' ') : props.name}
        </b>
      </h4>
      <div className="scroll-card">
        {currentForm?.defaultId && pokeData.length > 0 && formList.length > 0 ? (
          <Fragment>
            {formList.map((value, index) => (
              <Fragment key={index}>
                {value.map((value, index) => (
                  <button
                    key={index}
                    className={`btn btn-form ${value.form.id === currentForm.form.id ? ' form-selected' : ''}`}
                    onClick={() => changeForm(value.form.name)}
                  >
                    <img
                      width={64}
                      height={64}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
                      }}
                      alt="img-icon-form"
                      src={formIconAssets(value, currentForm?.defaultId ?? 0)}
                    />
                    <p>{!value.form.formName ? capitalize(FORM_NORMAL) : splitAndCapitalize(value.form.formName, '-', ' ')}</p>
                    {(value.form.id ?? 0 > 0) && value.form.id === currentForm?.defaultId && (
                      <b>
                        <small>(Default)</small>
                      </b>
                    )}
                    {(value.form.id ?? 0) <= 0 && <small className="text-danger">* Only in GO</small>}
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
                props.setRaid(e.target.value === TypeRaid.POKEMON ? false : true);
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
        isRaid={typePoke === TypeRaid.POKEMON ? false : true}
        tier={tier}
        setTier={onSetTier}
        setForm={props.setForm}
        id={dataStorePokemon?.current?.id}
        dataPoke={pokeData}
        currForm={currentForm}
        formList={formList}
        stats={props.stats}
        onSetStats={props.onHandleSetStats}
        onClearStats={props.onClearStats}
      />
    </Fragment>
  );
};

export default FormSelect;
