import { useSnackbar } from 'notistack';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import APIService from '../../services/API.service';
import Tools from './Tools';

import {
  capitalize,
  convertPokemonImageName,
  convertSexName,
  formIconAssets,
  generatePokemonGoForms,
  getItemSpritePath,
  getPokemonById,
  getPokemonDetails,
  getPokemonType,
  getValidPokemonImgPath,
  splitAndCapitalize,
  TypeRadioGroup,
} from '../../util/utils';
import TypeInfo from '../Sprites/Type/Type';
import { FormControlLabel, Radio } from '@mui/material';
import { useDispatch } from 'react-redux';
import { IPokemonName, IPokemonSpecie, PokemonSpecie } from '../../core/models/pokemon.model';
import {
  Form,
  PokemonForm,
  IPokemonFormModify,
  PokemonFormModify,
  PokemonFormDetail,
  IPokemonFormDetail,
} from '../../core/models/API/form.model';
import { IPokemonDetailInfo, PokemonDetail, PokemonDetailInfo, PokemonInfo } from '../../core/models/API/info.model';
import { FORM_NORMAL } from '../../util/constants';
import { AxiosError } from 'axios';
import { IFormSelectComponent } from '../models/component.model';
import { PokemonType, TypeRaid, VariantType } from '../../enums/type.enum';
import { SearchingActions } from '../../store/actions';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../util/extension';
import LoadGroup from '../Sprites/Loading/LoadingGroup';
import { ItemName } from '../../pages/News/enums/item-type.enum';

interface OptionsPokemon {
  prev: IPokemonName | undefined;
  current: IPokemonName | undefined;
  next: IPokemonName | undefined;
}

const FormSelect = (props: IFormSelectComponent) => {
  const dispatch = useDispatch();

  const [pokeData, setPokeData] = useState<IPokemonDetailInfo[]>([]);
  const [formList, setFormList] = useState<IPokemonFormModify[][]>([]);

  const [typePoke, setTypePoke] = useState(props.isRaid ? TypeRaid.Boss : TypeRaid.Pokemon);
  const [isRaid, setIsRaid] = useState(props.isRaid);
  const [tier, setTier] = useState(toNumber(props.tier, 1));

  const [data, setData] = useState<IPokemonSpecie>();
  const [dataStorePokemon, setDataStorePokemon] = useState<OptionsPokemon>();

  const [currentForm, setCurrentForm] = useState<IPokemonFormModify>();

  const axiosSource = useRef(APIService.getCancelToken());
  const { enqueueSnackbar } = useSnackbar();

  const fetchMap = useCallback(
    async (specie: IPokemonSpecie) => {
      setFormList([]);
      setPokeData([]);
      const dataPokeList: IPokemonDetailInfo[] = [];
      const dataFormList: IPokemonFormDetail[][] = [];
      const cancelToken = axiosSource.current.token;
      await Promise.all(
        specie.varieties.map(async (value) => {
          const pokeInfo = (await APIService.getFetchUrl<PokemonInfo>(value.path, { cancelToken })).data;
          const pokeForm = await Promise.all(
            pokeInfo.forms.map(async (item) => {
              const form = (await APIService.getFetchUrl<PokemonForm>(item.url, { cancelToken })).data;
              return PokemonFormDetail.setDetails(form);
            })
          );
          const pokeDetail = PokemonDetailInfo.setDetails(pokeInfo);
          dataPokeList.push(pokeDetail);
          dataFormList.push(pokeForm);
        })
      ).catch(() => {
        return;
      });

      const pokemon = props.pokemonData.find((item) => item.num === specie.id);
      const isShadow = Boolean(
        pokemon?.hasShadowForm && toNumber(pokemon.purified?.candy) >= 0 && toNumber(pokemon.purified?.stardust) >= 0
      );
      const formListResult = dataFormList
        .map((item) =>
          item
            .map((item) => {
              item.pokemonType = getPokemonType(item.formName, item.pokemonType === PokemonType.Mega, isShadow);
              return PokemonFormModify.setForm(
                specie.id,
                specie.name,
                specie.varieties.find((v) => isInclude(item.pokemon.name, v.name))?.name,
                Form.setValue(item, specie.name)
              );
            })
            .sort((a, b) => toNumber(a.form.id) - toNumber(b.form.id))
        )
        .sort((a, b) => toNumber(a[0]?.form.id) - toNumber(b[0]?.form.id));

      generatePokemonGoForms(props.pokemonData, dataFormList, formListResult, specie.id, specie.name);

      setPokeData(dataPokeList);
      setFormList(formListResult);

      const defaultForm = formListResult.flatMap((value) => value).filter((item) => item.form.isDefault);
      let currentForm = defaultForm.find((item) => item.form.id === specie.id);
      if (props.searching) {
        const defaultFormSearch = formListResult
          .flatMap((value) => value)
          .find((item) =>
            isEqual(
              item.form.formName,
              props.isObjective
                ? props.searching?.object
                  ? props.searching.object.form?.form?.formName
                  : ''
                : props.searching?.current?.form?.form?.formName
            )
          );
        if (defaultFormSearch) {
          currentForm = defaultFormSearch;
        } else {
          currentForm = defaultForm.find((item) => item.form.id === specie.id);
        }
      }
      if (!currentForm) {
        currentForm = formListResult.flatMap((item) => item).find((item) => item.form.id === specie.id);
      }
      if (!currentForm && isNotEmpty(defaultForm)) {
        currentForm = defaultForm.at(0);
      }
      if (currentForm) {
        setCurrentForm(currentForm);
      }
      if (props.setForm) {
        props.setForm(currentForm);
      }

      setData(specie);
    },
    [props.searching]
  );

  const queryPokemon = useCallback(
    (id: number) => {
      axiosSource.current = APIService.reNewCancelToken();
      const cancelToken = axiosSource.current.token;

      APIService.getPokeSpices(id, { cancelToken })
        .then(async (res) => {
          if (res.data) {
            const result = PokemonSpecie.create(res.data);
            await fetchMap(result);
          }
        })
        .catch((e: AxiosError) => {
          if (APIService.isCancel(e)) {
            return;
          }
          enqueueSnackbar(`Pokémon ID or name: ${id} Not found!`, { variant: VariantType.Error });
        });
    },
    [enqueueSnackbar, fetchMap]
  );

  useEffect(() => {
    if (props.setName) {
      props.setName(
        currentForm ? splitAndCapitalize(currentForm.form.name, '-', ' ') : getValueOrDefault(String, props.name)
      );
    }
  }, [props.setName, props.name, currentForm]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (id > 0 && toNumber(data?.id) !== id && isNotEmpty(props.pokemonData)) {
      clearData();
      queryPokemon(id);
    }
    return () => {
      if (data?.id) {
        APIService.cancel(axiosSource.current);
      }
    };
  }, [props.id, props.pokemonData, data?.id, queryPokemon]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (currentForm && toNumber(data?.id) > 0 && id > 0) {
      const formName = getValueOrDefault(
        String,
        currentForm.form.name,
        currentForm.form.formName,
        currentForm.defaultName
      );
      const details = getPokemonDetails(
        props.pokemonData,
        id,
        formName,
        currentForm.form.pokemonType,
        currentForm.form.isDefault
      );
      details.pokemonType = currentForm.form.pokemonType || PokemonType.Normal;
      if (
        props.searching?.object?.pokemon?.id !== props.id ||
        !isEqual(props.searching?.object?.form?.form?.formName, currentForm.form.formName)
      ) {
        const pokemonDetails = PokemonDetail.setData(details);
        if (props.isObjective) {
          dispatch(SearchingActions.SetToolObjectPokemonDetails.create(pokemonDetails));
          dispatch(SearchingActions.SetToolObjectPokemonForm.create(currentForm));
        } else {
          dispatch(SearchingActions.SetToolPokemonDetails.create(pokemonDetails));
          dispatch(SearchingActions.SetToolPokemonForm.create(currentForm));
        }
      }
    }
  }, [currentForm, props.isObjective, dispatch]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (isNotEmpty(props.pokemonData) && id > 0) {
      const currentPokemon = getPokemonById(props.pokemonData, id);
      if (currentPokemon) {
        setDataStorePokemon({
          prev: getPokemonById(props.pokemonData, currentPokemon.id - 1),
          current: getPokemonById(props.pokemonData, currentPokemon.id),
          next: getPokemonById(props.pokemonData, currentPokemon.id + 1),
        });
      }
    }
  }, [props.pokemonData, props.id]);

  const clearData = () => {
    setCurrentForm(undefined);
    setFormList([]);
    setPokeData([]);
    if (props.onClearStats) {
      props.onClearStats();
    }
    if (props.setForm) {
      props.setForm(undefined);
    }
  };

  const changeForm = (isSelected: boolean, name: string) => {
    if (isSelected) {
      return;
    }
    setCurrentForm(undefined);
    const findForm = formList.flatMap((item) => item).find((item) => isEqual(item.form.name, name));
    setCurrentForm(findForm);
    if (findForm) {
      dispatch(SearchingActions.SetToolPokemonForm.create(findForm));
    }
    if (props.onClearStats) {
      props.onClearStats();
    }
    if (props.setName) {
      props.setName(splitAndCapitalize(findForm?.form.name, '-', ' '));
    }
    if (props.setForm) {
      props.setForm(findForm);
    }
  };

  const onSetTier = (tier: number) => {
    if (props.setTier) {
      props.setTier(tier);
    }
    setTier(tier);
  };

  const onHandleType = useCallback(
    (v: TypeRaid) => {
      setTypePoke(v);
      setIsRaid(v !== TypeRaid.Pokemon);
      if (props.setRaid) {
        props.setRaid(v !== TypeRaid.Pokemon);
      }
      if (props.onClearStats) {
        props.onClearStats(true);
      }
    },
    [props.setRaid, props.onClearStats]
  );

  return (
    <Fragment>
      <div className="d-inline-block w-9 h-9">
        {dataStorePokemon?.prev && (
          <div style={{ cursor: 'pointer' }} onClick={() => props.onSetPrev?.()}>
            <div>
              <img
                height={64}
                alt="Image Pokemon"
                src={APIService.getPokeFullSprite(dataStorePokemon.prev.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, dataStorePokemon.prev?.id);
                }}
              />
            </div>
            <span>
              <b>
                <span className="text-navigator">{'<'}</span> <span>#{dataStorePokemon.prev.id}</span>
              </b>
            </span>
          </div>
        )}
      </div>
      <img
        className="p-2"
        height={200}
        alt="Image Pokemon"
        src={APIService.getPokeFullSprite(
          dataStorePokemon?.current?.id,
          convertPokemonImageName(currentForm?.form.formName)
        )}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, dataStorePokemon?.current?.id);
        }}
      />
      <div className="d-inline-block w-9 h-9">
        {dataStorePokemon?.next && (
          <div style={{ cursor: 'pointer' }} onClick={() => props.onSetNext?.()}>
            <div>
              <img
                height={64}
                alt="Image Pokemon"
                src={APIService.getPokeFullSprite(dataStorePokemon.next.id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, dataStorePokemon.next?.id);
                }}
              />
            </div>
            <span>
              <b>
                <span>#{dataStorePokemon.next.id}</span> <span className="text-navigator">{'>'}</span>
              </b>
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 h-9">{currentForm?.defaultId && <TypeInfo arr={currentForm.form.types} />}</div>
      <h4>
        <b>
          {dataStorePokemon?.current?.id && <>{`#${dataStorePokemon.current.id} `}</>}
          {currentForm ? splitAndCapitalize(convertSexName(currentForm.form.name), '-', ' ') : props.name}
        </b>
      </h4>
      <div className="scroll-card">
        {currentForm?.defaultId && isNotEmpty(pokeData) && isNotEmpty(formList) ? (
          <Fragment>
            {formList.map((value, index) => (
              <Fragment key={index}>
                {value.map((value, index) => (
                  <button
                    key={index}
                    className={combineClasses(
                      'btn btn-form',
                      value.form.id === currentForm.form.id ? 'form-selected' : ''
                    )}
                    onClick={() => changeForm(value.form.id === currentForm.form.id, value.form.name)}
                  >
                    <img
                      width={64}
                      height={64}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = APIService.getPokeIconSprite();
                      }}
                      alt="Image Icon Form"
                      src={formIconAssets(value)}
                    />
                    <p>
                      {!value.form.formName
                        ? capitalize(FORM_NORMAL)
                        : splitAndCapitalize(value.form.formName, '-', ' ')}
                    </p>
                    {toNumber(value.form.id) > 0 && value.form.id === currentForm.defaultId && (
                      <b>
                        <small>(Default)</small>
                      </b>
                    )}
                    {toNumber(value.form.id) <= 0 && <small className="text-danger">* Only in GO</small>}
                  </button>
                ))}
              </Fragment>
            ))}
          </Fragment>
        ) : (
          <LoadGroup isShow isVertical isHideAttr size={40} />
        )}
      </div>
      {!props.isHide && (
        <div className="d-flex justify-content-center text-center">
          <TypeRadioGroup
            row
            aria-labelledby="row-types-group-label"
            name="row-types-group"
            value={typePoke}
            onChange={(e) => onHandleType(toNumber(e.target.value))}
          >
            <FormControlLabel
              value={TypeRaid.Pokemon}
              control={<Radio />}
              label={
                <span>
                  <img height={32} alt="Pokémon Image" src={getItemSpritePath(ItemName.PokeBall)} /> Pokémon Stats
                </span>
              }
            />
            <FormControlLabel
              value={TypeRaid.Boss}
              control={<Radio />}
              label={
                <span>
                  <img
                    className="img-type-icon"
                    height={32}
                    alt="img-boss"
                    src={APIService.getRaidSprite('ic_raid_small')}
                  />{' '}
                  Boss Stats
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
        isHide={props.isHide}
        isRaid={isRaid}
        tier={tier}
        setTier={onSetTier}
        id={dataStorePokemon?.current?.id}
        dataPoke={pokeData}
        stats={props.stats}
        onSetStats={props.onHandleSetStats}
        onClearStats={props.onClearStats}
      />
    </Fragment>
  );
};

export default FormSelect;
