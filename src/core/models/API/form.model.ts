import { PokemonType } from '../../../enums/type.enum';
import { FORM_NORMAL } from '../../../util/constants';
import { DynamicObj, getValueOrDefault, isEqual, isNotEmpty } from '../../../util/extension';
import { convertPokemonAPIDataFormName, getPokemonType } from '../../../util/utils';
import { IStatsPokemon } from '../stats.model';
import { IPokemonDetail, SpriteInfo } from './info.model';
import { Path } from './species.model';

export interface IPokemonSprit {
  backDefault: string;
  backFemale: string;
  backShiny: string;
  backShinyFemale: string;
  frontDefault: string;
  frontFemale: string;
  frontShiny: string;
  frontShinyFemale: string;
}

export class PokemonSprit implements IPokemonSprit {
  backDefault = '';
  backFemale = '';
  backShiny = '';
  backShinyFemale = '';
  frontDefault = '';
  frontFemale = '';
  frontShiny = '';
  frontShinyFemale = '';

  static setDetails(info: SpriteInfo | undefined) {
    const obj = new PokemonSprit();
    if (info) {
      obj.backDefault = info.back_default;
      obj.backFemale = getValueOrDefault(String, info.back_female);
      obj.backShiny = getValueOrDefault(String, info.back_shiny);
      obj.backShinyFemale = getValueOrDefault(String, info.back_shiny_female);
      obj.frontDefault = info.front_default;
      obj.frontFemale = getValueOrDefault(String, info.front_female);
      obj.frontShiny = getValueOrDefault(String, info.front_shiny);
      obj.frontShinyFemale = getValueOrDefault(String, info.front_shiny_female);
    }
    return obj;
  }
}

export interface PokemonForm {
  form_name: string;
  form_names: string[];
  form_order: number;
  id: number;
  is_battle_only: boolean;
  is_default: boolean;
  is_mega: boolean;
  name: string;
  names: string[];
  order: number;
  pokemon: Path;
  sprites: SpriteInfo | undefined;
  types: SlotType[];
  version_group: Path;
}

export interface IPokemonFormDetail {
  formName: string;
  id: number;
  isDefault: boolean;
  pokemonType: PokemonType;
  name: string;
  pokemon: Path;
  sprites?: IPokemonSprit;
  types: string[];
  version: string | undefined;
}

export class PokemonFormDetail implements IPokemonFormDetail {
  formName = '';
  id = 0;
  isDefault = false;
  pokemonType = PokemonType.None;
  name = '';
  pokemon!: Path;
  sprites: IPokemonSprit | undefined;
  types: string[] = [];
  version = '';

  static setDetails(info: PokemonForm) {
    const obj = new PokemonFormDetail();
    obj.formName = info.form_name;
    obj.id = info.id;
    obj.isDefault = info.is_default;
    obj.pokemonType = getPokemonType(obj.formName, info.is_mega);
    obj.name = info.name;
    obj.pokemon = info.pokemon;
    obj.sprites = PokemonSprit.setDetails(info.sprites);
    obj.types = info.types.map((t) => t.type.name);
    obj.version = info.version_group.name;
    return obj;
  }
}

interface SlotType {
  slot: number;
  type: Path;
}

export interface IForm extends Partial<IPokemonFormDetail> {
  formName: string | undefined;
  id: number | undefined;
  isDefault: boolean;
  pokemonType?: PokemonType;
  name: string;
  version: string | undefined;
  types: string[] | undefined;
}

export interface IPokemonFormModify {
  defaultId: number;
  defaultName: string;
  name: string;
  form: IForm;
  sprites?: IPokemonSprit;
}

export class PokemonFormModify implements IPokemonFormModify {
  defaultId = 0;
  defaultName = '';
  name = '';
  form = new Form();

  static setForm(defaultId: number, defaultName: string, name: string | undefined, form: Form) {
    const obj = new PokemonFormModify();
    obj.defaultId = defaultId;
    obj.defaultName = defaultName;
    obj.name = getValueOrDefault(String, name);
    obj.form = form;
    return obj;
  }

  static create(value: IPokemonFormModify) {
    const obj = new PokemonFormModify();
    Object.assign(obj, value);
    return obj;
  }
}

export interface PokemonDataForm {
  stats: IStatsPokemon;
  num: number;
  types: string[] | undefined;
}

export class PokemonFormModifyModel implements IPokemonFormModify {
  defaultId: number;
  defaultName: string;
  name: string;
  form: IForm;
  sprites = new PokemonSprit();

  constructor(
    id: number,
    defaultName: string,
    name: string | undefined,
    formName: string | undefined,
    fullFormName: string | undefined,
    version: string | undefined,
    types: string[],
    sprites: IPokemonSprit | undefined,
    formId: number,
    pokemonType = PokemonType.Normal,
    isDefault = true
  ) {
    this.defaultId = id;
    this.defaultName = defaultName;
    this.name = getValueOrDefault(String, name);
    this.form = Form.create({
      formName,
      id: formId,
      isDefault,
      pokemonType,
      name: getValueOrDefault(String, fullFormName),
      version,
      types,
      sprites,
    });
  }
}

export class Form implements IForm {
  formName: string | undefined;
  id: number | undefined;
  isDefault = false;
  pokemonType = PokemonType.Normal;
  name = '';
  version: string | undefined;
  types: string[] | undefined = [];

  static create(value: IForm, isMega = false, isShadow = true) {
    const obj = new Form();
    obj.pokemonType = getPokemonType(value.formName, isMega, isShadow);
    Object.assign(obj, value);
    return obj;
  }

  static setValue(value: IPokemonFormDetail, name: string) {
    const obj = new Form();
    const formName = isEqual(value.pokemonType, PokemonType.GMax)
      ? value.name.replace(`${name}-`, '')
      : convertPokemonAPIDataFormName(value.formName, value.name);
    if (formName) {
      value.formName = formName;
    }
    Object.assign(obj, value);
    return obj;
  }
}

export interface IFormSoundCry {
  form: string;
  cries?: DynamicObj<string>;
}

export class FormSoundCry implements IFormSoundCry {
  form: string;
  cries?: DynamicObj<string>;

  constructor(pokemon: IPokemonDetail) {
    const fullName = isNotEmpty(pokemon.forms) ? pokemon.forms[0].name : '';
    const speciesName = pokemon.speciesName;
    this.form = isEqual(fullName, speciesName)
      ? FORM_NORMAL
      : fullName.replace(`${speciesName}-`, '').replaceAll('-', '_').toUpperCase();
    this.cries = pokemon.cries;
  }
}
