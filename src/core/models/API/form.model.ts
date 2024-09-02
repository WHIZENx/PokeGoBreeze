import { FORM_NORMAL, FORM_PURIFIED, FORM_SHADOW } from '../../../util/constants';
import { DynamicObj } from '../../../util/models/util.model';
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
  backDefault: string;
  backFemale: string;
  backShiny: string;
  backShinyFemale: string;
  frontDefault: string;
  frontFemale: string;
  frontShiny: string;
  frontShinyFemale: string;

  constructor() {
    this.backDefault = '';
    this.backFemale = '';
    this.backShiny = '';
    this.backShinyFemale = '';
    this.frontDefault = '';
    this.frontFemale = '';
    this.frontShiny = '';
    this.frontShinyFemale = '';
  }

  static setDetails(info: SpriteInfo | undefined) {
    const obj = new PokemonSprit();
    if (info) {
      obj.backDefault = info.back_default;
      obj.backFemale = info.back_female ?? '';
      obj.backShiny = info.back_shiny ?? '';
      obj.backShinyFemale = info.back_shiny_female ?? '';
      obj.frontDefault = info.front_default;
      obj.frontFemale = info.front_female ?? '';
      obj.frontShiny = info.front_shiny ?? '';
      obj.frontShinyFemale = info.front_shiny_female ?? '';
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
  types: SlotType[];
  versionGroup: Path;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonFormDetail implements IPokemonFormDetail {
  formName: string = '';
  id: number = 0;
  isDefault: boolean = false;
  isMega: boolean = false;
  name: string = '';
  pokemon!: Path;
  sprites: IPokemonSprit | undefined;
  types: SlotType[] = [];
  versionGroup!: Path;

  static setDetails(info: PokemonForm) {
    const obj = new PokemonFormDetail();
    obj.formName = info.form_name;
    obj.id = info.id;
    obj.isDefault = info.is_default;
    obj.isMega = info.is_mega;
    obj.name = info.name;
    obj.pokemon = info.pokemon;
    obj.sprites = PokemonSprit.setDetails(info.sprites);
    obj.types = info.types;
    obj.versionGroup = info.version_group;
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
  id: number | null;
  isDefault: boolean;
  isMega: boolean;
  isShadow: boolean;
  isPurified: boolean;
  name: string;
  versionGroup: { name: string };
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

// tslint:disable-next-line:max-classes-per-file
export class PokemonFormModify implements IPokemonFormModify {
  defaultId: number = 0;
  defaultName: string = '';
  name: string = '';
  form: IForm = new Form();

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

// tslint:disable-next-line:max-classes-per-file
export class PokemonFormModifyModel implements IPokemonFormModify {
  defaultId: number;
  defaultName: string;
  name: string;
  form: IForm;
  sprites: IPokemonSprit = new PokemonSprit();

  constructor(
    id: number,
    defaultName: string,
    name: string,
    formName: string,
    fullFormName: string,
    version: string,
    types: string[],
    sprites: IPokemonSprit | undefined,
    formId: number | null = null,
    specialForm: 'NORMAL' | 'SHADOW' | 'PURIFIED' = FORM_NORMAL,
    isDefault = true,
    isMega = false
  ) {
    this.defaultId = id;
    this.defaultName = defaultName;
    this.name = name;
    this.form = {
      formName,
      id: formId,
      isDefault,
      isMega,
      isShadow: specialForm === FORM_SHADOW,
      isPurified: specialForm === FORM_PURIFIED,
      name: fullFormName,
      versionGroup: { name: version },
      types,
      sprites,
    };
  }
}

// tslint:disable-next-line:max-classes-per-file
export class Form implements IForm {
  formName: string = '';
  id: number | null = 0;
  isDefault: boolean = false;
  isMega: boolean = false;
  isShadow: boolean = false;
  isPurified: boolean = false;
  name: string = '';
  versionGroup: { name: string } = { name: '' };
  types: string[] = [];
  sprites: IPokemonSprit | undefined;

  constructor(data?: IPokemonFormDetail) {
    if (data) {
      this.formName = data.formName;
      this.id = data.id;
      this.isDefault = data.isDefault;
      this.isMega = data.isMega;
      this.isShadow = false;
      this.isPurified = false;
      this.name = data.name;
      this.versionGroup = data.versionGroup;
      this.types = data.types.map((t) => t.type.name);
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
  cries: DynamicObj<string, string>;
}

// tslint:disable-next-line:max-classes-per-file
export class FormSoundCry implements IFormSoundCry {
  form: string;
  cries: DynamicObj<string, string>;

  constructor(pokemon: IPokemonDetail) {
    const fullName = pokemon.forms[0].name;
    const speciesName = pokemon.species.name;
    this.form = fullName === speciesName ? FORM_NORMAL : fullName.replace(`${speciesName}-`, '').replaceAll('-', '_').toUpperCase();
    this.cries = pokemon.cries;
  }
}
