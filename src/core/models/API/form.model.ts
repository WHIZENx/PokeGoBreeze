import { FORM_NORMAL, FORM_PURIFIED, FORM_SHADOW } from '../../../util/constants';
import { DynamicObj, getValueOrDefault, isEqual, isNotEmpty } from '../../../util/extension';
import { IStatsPokemon } from '../stats.model';
import { IPokemonDetail, SpriteInfo } from './info.model';

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
  isMega: boolean;
  name: string;
  pokemon: Path;
  sprites: IPokemonSprit | undefined;
  types: string[];
  version: string;
}

export class PokemonFormDetail implements IPokemonFormDetail {
  formName = '';
  id = 0;
  isDefault = false;
  isMega = false;
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
    obj.isMega = info.is_mega;
    obj.name = info.name;
    obj.pokemon = info.pokemon;
    obj.sprites = PokemonSprit.setDetails(info.sprites);
    obj.types = info.types.map((t) => t.type.name);
    obj.version = info.version_group.name;
    return obj;
  }
}

interface Path {
  name: string;
  url: string;
}

interface SlotType {
  slot: number;
  type: Path;
}

export interface IForm {
  formName: string;
  id: number | undefined;
  isDefault: boolean;
  isMega: boolean;
  isShadow: boolean;
  isPurified: boolean;
  name: string;
  version: string;
  types: string[];
  sprites?: IPokemonSprit;
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

  static setForm(defaultId: number, defaultName: string, name: string, form: IForm) {
    const obj = new PokemonFormModify();
    obj.defaultId = defaultId;
    obj.defaultName = defaultName;
    obj.name = name;
    obj.form = form;
    return obj;
  }
}

export interface PokemonDataForm {
  stats: IStatsPokemon;
  num: number;
  types: string[];
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
    name: string,
    formName: string,
    fullFormName: string,
    version: string,
    types: string[],
    sprites: IPokemonSprit | undefined,
    formId: number,
    specialForm: 'NORMAL' | 'SHADOW' | 'PURIFIED' = FORM_NORMAL,
    isDefault = true,
    isMega = false
  ) {
    this.defaultId = id;
    this.defaultName = defaultName;
    this.name = name;
    this.form = Form.create({
      formName,
      id: formId,
      isDefault,
      isMega,
      isShadow: specialForm === FORM_SHADOW,
      isPurified: specialForm === FORM_PURIFIED,
      name: fullFormName,
      version,
      types,
      sprites,
    });
  }
}

export class Form implements IForm {
  formName = '';
  id: number | undefined;
  isDefault = false;
  isMega = false;
  isShadow = false;
  isPurified = false;
  name = '';
  version = '';
  types: string[] = [];
  sprites?: IPokemonSprit;

  constructor(data?: IPokemonFormDetail) {
    if (data) {
      this.formName = data.formName;
      this.id = data.id;
      this.isDefault = data.isDefault;
      this.isMega = data.isMega;
      this.name = data.name;
      this.version = data.version;
      this.types = data.types;
      this.sprites = data.sprites;
    }
  }

  static create(value: IForm) {
    const obj = new Form();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IFormSoundCry {
  form: string;
  cries: DynamicObj<string>;
}

export class FormSoundCry implements IFormSoundCry {
  form: string;
  cries: DynamicObj<string>;

  constructor(pokemon: IPokemonDetail) {
    const fullName = isNotEmpty(pokemon.forms) ? pokemon.forms[0].name : '';
    const speciesName = pokemon.species.name;
    this.form = isEqual(fullName, speciesName) ? FORM_NORMAL : fullName.replace(`${speciesName}-`, '').replaceAll('-', '_').toUpperCase();
    this.cries = pokemon.cries;
  }
}
