import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import APIService from '../../services/api.service';
import Tools from './Tools';

import {
  convertPokemonImageName,
  convertSexName,
  getItemSpritePath,
  getPokemonType,
  getValidPokemonImgPath,
  splitAndCapitalize,
  TypeRadioGroup,
} from '../../utils/utils';
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
import { AxiosError } from 'axios';
import { IFormSelectComponent } from '../models/component.model';
import { PokemonType, TypeRaid } from '../../enums/type.enum';
import { SearchingActions } from '../../store/actions';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty, toNumber } from '../../utils/extension';
import LoadGroup from '../Sprites/Loading/LoadingGroup';
import { ItemName } from '../../pages/News/enums/item-type.enum';
import useSearch from '../../composables/useSearch';
import usePokemon from '../../composables/usePokemon';
import ButtonGroupForm from '../Commons/Buttons/ButtonGroupForm';
import { useSnackbar } from '../../contexts/snackbar.context';

interface OptionsPokemon {
  prev: IPokemonName | undefined;
  current: IPokemonName | undefined;
  next: IPokemonName | undefined;
}

const FormSelect = (props: IFormSelectComponent) => {
  const dispatch = useDispatch();
  const { searchingToolData, searchingToolCurrentData, searchingToolObjectData } = useSearch();
  const { generatePokemonGoForms, getPokemonDetails, getPokemonById, findPokemonById } = usePokemon();

  const [pokeData, setPokeData] = useState<IPokemonDetailInfo[]>([]);
  const [formList, setFormList] = useState<IPokemonFormModify[][]>([]);

  const [typePoke, setTypePoke] = useState(props.isRaid ? TypeRaid.Boss : TypeRaid.Pokemon);
  const [isRaid, setIsRaid] = useState(props.isRaid);
  const [tier, setTier] = useState(toNumber(props.tier, 1));

  const [data, setData] = useState<IPokemonSpecie>();
  const [dataStorePokemon, setDataStorePokemon] = useState<OptionsPokemon>();

  const [currentForm, setCurrentForm] = useState<IPokemonFormModify>();

  const axiosSource = useRef(APIService.getCancelToken());
  const { showSnackbar } = useSnackbar();

  const fetchMap = useCallback(
    async (specie: IPokemonSpecie) => {
      setFormList([]);
      setPokeData([]);
      const dataPokeList: IPokemonDetailInfo[] = [];
      const dataFormList: IPokemonFormDetail[][] = [];
      const cancelToken = axiosSource.current.token;
      await Promise.all(
        specie.varieties.map(async (value) => {
          const { data: pokeInfo } = await APIService.getFetchUrl<PokemonInfo>(value.path, { cancelToken });
          const pokeForm = await Promise.all(
            pokeInfo.forms.map(async (item) => {
              const { data: form } = await APIService.getFetchUrl<PokemonForm>(item.url, { cancelToken });
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

      const pokemon = findPokemonById(specie.id);
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

      generatePokemonGoForms(dataFormList, formListResult, specie.id, specie.name);

      setPokeData(dataPokeList);
      setFormList(formListResult);

      const defaultForm = formListResult.flatMap((value) => value).filter((item) => item.form.isDefault);
      let currentForm = defaultForm.find((item) => item.form.id === specie.id);
      if (searchingToolData) {
        const defaultFormSearch = formListResult
          .flatMap((value) => value)
          .find((item) =>
            isEqual(
              item.form.formName,
              props.isObjective
                ? searchingToolObjectData?.form?.form?.formName
                : searchingToolCurrentData?.form?.form?.formName
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
    [searchingToolData]
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
          showSnackbar(`Pokémon ID or name: ${id} Not found!`, 'error');
        });
    },
    [fetchMap]
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
    if (id > 0 && toNumber(data?.id) !== id) {
      clearData();
      queryPokemon(id);
    }
    return () => {
      if (data?.id) {
        APIService.cancel(axiosSource.current);
      }
    };
  }, [props.id, data?.id, queryPokemon]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (
      currentForm &&
      toNumber(data?.id) > 0 &&
      id > 0 &&
      (searchingToolObjectData?.pokemon?.id !== id ||
        !isEqual(searchingToolObjectData?.form?.form?.formName, currentForm.form.formName))
    ) {
      const formName = getValueOrDefault(
        String,
        currentForm.form.name,
        currentForm.form.formName,
        currentForm.defaultName
      );
      const details = getPokemonDetails(id, formName, currentForm.form.pokemonType, currentForm.form.isDefault);
      details.pokemonType = currentForm.form.pokemonType || PokemonType.Normal;
      const pokemonDetails = PokemonDetail.setData(details);
      if (props.isObjective) {
        dispatch(SearchingActions.SetToolObjectPokemonDetails.create(pokemonDetails));
        dispatch(SearchingActions.SetToolObjectPokemonForm.create(currentForm));
      } else {
        dispatch(SearchingActions.SetToolPokemonDetails.create(pokemonDetails));
        dispatch(SearchingActions.SetToolPokemonForm.create(currentForm));
      }
    }
  }, [currentForm, props.isObjective, dispatch, getPokemonDetails]);

  useEffect(() => {
    const id = toNumber(props.id);
    if (id > 0) {
      const currentPokemon = getPokemonById(id);
      if (currentPokemon) {
        setDataStorePokemon({
          prev: getPokemonById(currentPokemon.id - 1),
          current: getPokemonById(currentPokemon.id),
          next: getPokemonById(currentPokemon.id + 1),
        });
      }
    }
  }, [getPokemonById, props.id]);

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

  const changeForm = (value: IPokemonFormModify) => {
    const isSelected = value.form.id === currentForm?.form.id;
    const name = value.form.name;
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
          <div className="cursor-pointer" onClick={() => props.onSetPrev?.()}>
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
          <div className="cursor-pointer" onClick={() => props.onSetNext?.()}>
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
      <ButtonGroupForm
        className="my-1"
        width={350}
        height={180}
        isLoaded={toNumber(currentForm?.defaultId) > 0 && isNotEmpty(pokeData) && isNotEmpty(formList)}
        forms={formList}
        id={currentForm?.form.id}
        defaultId={currentForm?.defaultId}
        changeForm={changeForm}
        loading={<LoadGroup isShow isVertical isHideAttr size={40} />}
      />
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
        onSetStats={props.onHandleSetStats}
        onClearStats={props.onClearStats}
      />
    </Fragment>
  );
};

export default FormSelect;
