import { useSnackbar } from 'notistack';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import APIService from '../../services/API.service';
import Tools from './Tools';

import {
  capitalize,
  convertPokemonImageName,
  formIconAssets,
  generatePokemonGoForms,
  getItemSpritePath,
  getPokemonById,
  getValidPokemonImgPath,
  splitAndCapitalize,
  TypeRadioGroup,
} from '../../util/utils';
import TypeInfo from '../Sprites/Type/Type';
import { FormControlLabel, Radio } from '@mui/material';
import { useDispatch } from 'react-redux';
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
import { FORM_NORMAL } from '../../util/constants';
import { AxiosError } from 'axios';
import { IFormSelectComponent } from '../models/component.model';
import { TypeRaid, VariantType } from '../../enums/type.enum';
import { SearchingActions } from '../../store/actions';
import { SearchingModel } from '../../store/models/searching.model';
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

  const [pokeData, setPokeData] = useState<IPokemonDetail[]>([]);
  const [formList, setFormList] = useState<IPokemonFormModify[][]>([]);

  const [typePoke, setTypePoke] = useState(props.isRaid ? TypeRaid.Boss : TypeRaid.Pokemon);
  const [isRaid, setIsRaid] = useState(props.isRaid);
  const [tier, setTier] = useState(toNumber(props.tier, 1));

  const [data, setData] = useState<Species>();
  const [dataStorePokemon, setDataStorePokemon] = useState<OptionsPokemon>();

  const [currentForm, setCurrentForm] = useState<IPokemonFormModify>();

  const axiosSource = useRef(APIService.getCancelToken());
  const { enqueueSnackbar } = useSnackbar();

  const fetchMap = useCallback(
    async (data: Species) => {
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
                data.varieties.find((v) => isInclude(item.pokemon.name, v.pokemon.name))?.pokemon.name,
                Form.setValue(item, data.name)
              )
            )
            .sort((a, b) => toNumber(a.form.id) - toNumber(b.form.id))
        )
        .sort((a, b) => toNumber(a[0]?.form.id) - toNumber(b[0]?.form.id));

      generatePokemonGoForms(props.data, dataFormList, formListResult, data.id, data.name);

      setPokeData(dataPokeList);
      setFormList(formListResult);

      const defaultForm = formListResult.flatMap((value) => value).filter((item) => item.form.isDefault);
      let currentForm = defaultForm.find((item) => item.form.id === data.id);
      if (props.searching) {
        const defaultFormSearch = formListResult
          .flatMap((value) => value)
          .find((item) =>
            isEqual(item.form.formName, props.isObjective ? (props.searching?.obj ? props.searching.obj.form : '') : props.searching?.form)
          );
        if (defaultFormSearch) {
          currentForm = defaultFormSearch;
        } else {
          currentForm = defaultForm.find((item) => item.form.id === data.id);
        }
      }
      if (!currentForm) {
        currentForm = formListResult.flatMap((item) => item).find((item) => item.form.id === data.id);
      }
      if (!currentForm && isNotEmpty(defaultForm)) {
        currentForm = defaultForm.at(0);
      }
      if (currentForm) {
        setCurrentForm(currentForm);
      }
      setData(data);
    },
    [props.searching]
  );

  const queryPokemon = useCallback(
    (id: number) => {
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
          enqueueSnackbar(`Pokémon ID or name: ${id} Not found!`, { variant: VariantType.Error });
        });
    },
    [enqueueSnackbar, fetchMap]
  );

  useEffect(() => {
    if (props.setName) {
      props.setName(currentForm ? splitAndCapitalize(currentForm.form.name, '-', ' ') : getValueOrDefault(String, props.name));
    }
  }, [props.setName, props.name, currentForm]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (id > 0 && toNumber(data?.id) !== id && isNotEmpty(props.data)) {
      clearData();
      queryPokemon(id);
    }
    return () => {
      if (data?.id) {
        APIService.cancel(axiosSource.current);
      }
    };
  }, [props.id, props.data, data?.id, queryPokemon]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (currentForm && toNumber(data?.id) > 0 && id > 0) {
      const obj = ToolSearching.create(props.searching);
      const searching = new SearchingModel({
        id,
        name: currentForm.defaultName,
        form: currentForm.form.formName,
        formType: currentForm.form.pokemonType,
        fullName: currentForm.form.name,
        timestamp: new Date(),
      });
      if (props.isObjective && (props.searching?.obj?.id !== props.id || !isEqual(props.searching?.obj?.form, currentForm.form.formName))) {
        const result = ToolSearching.create({
          ...obj,
          obj: {
            ...searching,
          },
        });
        dispatch(SearchingActions.SetPokemonToolSearch.create(result));
      }
      if (!props.isObjective && (props.searching?.id !== props.id || !isEqual(props.searching?.form, currentForm.form.formName))) {
        const result = ToolSearching.create({
          ...obj,
          ...searching,
        });
        dispatch(SearchingActions.SetPokemonToolSearch.create(result));
      }
    }
  }, [currentForm, dispatch]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (isNotEmpty(props.data) && id > 0) {
      const currentPokemon = getPokemonById(props.data, id);
      if (currentPokemon) {
        setDataStorePokemon({
          prev: getPokemonById(props.data, currentPokemon.id - 1),
          current: getPokemonById(props.data, currentPokemon.id),
          next: getPokemonById(props.data, currentPokemon.id + 1),
        });
      }
    }
  }, [props.data, props.id]);

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

  const changeForm = (name: string) => {
    setCurrentForm(undefined);
    const findForm = formList.flatMap((item) => item).find((item) => isEqual(item.form.name, name));
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
      <div className="d-inline-block" style={{ width: 60, height: 60 }}>
        {dataStorePokemon?.prev && (
          <div style={{ cursor: 'pointer' }} onClick={() => props.onSetPrev?.()}>
            <div>
              <img
                height={60}
                alt="img-full-pokemon"
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
          e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, dataStorePokemon?.current?.id);
        }}
      />
      <div className="d-inline-block" style={{ width: 60, height: 60 }}>
        {dataStorePokemon?.next && (
          <div style={{ cursor: 'pointer' }} onClick={() => props.onSetNext?.()}>
            <div>
              <img
                height={60}
                alt="img-full-pokemon"
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
      <div className="element-top" style={{ height: 64 }}>
        {currentForm?.defaultId && <TypeInfo arr={currentForm.form.types} />}
      </div>
      <h4>
        <b>
          {dataStorePokemon?.current?.id && <>{`#${dataStorePokemon.current.id} `}</>}
          {currentForm ? splitAndCapitalize(currentForm.form.name.replace('-f', '-female').replace('-m', '-male'), '-', ' ') : props.name}
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
                    className={combineClasses('btn btn-form', value.form.id === currentForm.form.id ? 'form-selected' : '')}
                    onClick={() => changeForm(value.form.name)}
                  >
                    <img
                      width={64}
                      height={64}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = APIService.getPokeIconSprite();
                      }}
                      alt="img-icon-form"
                      src={formIconAssets(value, currentForm.defaultId)}
                    />
                    <p>{!value.form.formName ? capitalize(FORM_NORMAL) : splitAndCapitalize(value.form.formName, '-', ' ')}</p>
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
          <LoadGroup isShow={true} isVertical={true} isHideAttr={true} size={40} />
        )}
      </div>
      {!props.isHide && (
        <div className="d-flex justify-content-center text-center">
          <TypeRadioGroup
            row={true}
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
                  <img height={32} alt="img-pokemon" src={getItemSpritePath(ItemName.PokeBall)} /> Pokémon Stats
                </span>
              }
            />
            <FormControlLabel
              value={TypeRaid.Boss}
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
        isHide={props.isHide}
        isRaid={isRaid}
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
