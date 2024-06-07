import { FORM_NORMAL, FORM_PURIFIED, FORM_SHADOW } from '../../../util/Constants';
import { StatsPokemon } from '../stats.model';
import { PokemonInfo } from './info.model';

interface PokemonSprit {
  back_default: string;
  back_female: string;
  back_shiny: string;
  back_shiny_female: string;
  front_default: string;
  front_female: string;
  front_shiny: string;
  front_shiny_female: string;
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
  sprites: PokemonSprit;
  types: SlotType[];
  version_group: Path;
}

interface Path {
  name: string;
  url: string;
}

interface SlotType {
  slot: number;
  type: Path;
}

export interface FormModel {
  form_name: string;
  form_names: string[];
  form_order: number;
  id: number | null;
  is_battle_only: boolean;
  is_default: boolean;
  is_mega: boolean;
  is_shadow: boolean;
  is_purified: boolean;
  name: string;
  version_group: { name: string };
  types: string[];
}

export interface PokemonFormModify {
  default_id: number;
  default_name: string;
  name: string;
  form: FormModel;
}

export class PokemonFormModify {
  // tslint:disable-next-line:variable-name
  default_id!: number;
  // tslint:disable-next-line:variable-name
  default_name!: string;
  name!: string;
  form!: FormModel;

  // tslint:disable-next-line:variable-name
  constructor(defaultId: number, defaultName: string, name: string, form: FormModel) {
    this.default_id = defaultId;
    this.default_name = defaultName;
    this.name = name;
    this.form = form;
  }
}

export interface PokemonDataForm {
  stats: StatsPokemon;
  num: number;
  types: string[];
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonFormModifyModel {
  // tslint:disable-next-line:variable-name
  default_id!: number;
  // tslint:disable-next-line:variable-name
  default_name!: string;
  name!: string;
  form!: FormModel;
  sprites!: PokemonSprit;

  constructor(
    id: number,
    defaultName: string,
    name: string,
    formName: string,
    fullFormName: string,
    version: string,
    types: string[],
    sprites: PokemonSprit | null = null,
    formId: number | null = null,
    specialForm: 'NORMAL' | 'SHADOW' | 'PURIFIED' = FORM_NORMAL,
    isBattleOnly = true,
    isDefault = true,
    isMega = false
  ) {
    this.default_id = id;
    this.default_name = defaultName;
    this.name = name;
    this.form = {
      form_name: formName,
      form_names: [],
      form_order: 0,
      id: formId,
      is_battle_only: isBattleOnly,
      is_default: isDefault,
      is_mega: isMega,
      is_shadow: specialForm === FORM_SHADOW,
      is_purified: specialForm === FORM_PURIFIED,
      name: fullFormName,
      version_group: { name: version },
      types,
      sprites,
    };
  }
}

// tslint:disable-next-line:max-classes-per-file
export class FormModel {
  // tslint:disable-next-line:variable-name
  form_name: string;
  // tslint:disable-next-line:variable-name
  form_names: string[];
  // tslint:disable-next-line:variable-name
  form_order: number;
  id: number | null;
  // tslint:disable-next-line:variable-name
  is_battle_only: boolean;
  // tslint:disable-next-line:variable-name
  is_default: boolean;
  // tslint:disable-next-line:variable-name
  is_mega: boolean;
  // tslint:disable-next-line:variable-name
  is_shadow: boolean;
  // tslint:disable-next-line:variable-name
  is_purified: boolean;
  name: string;
  // tslint:disable-next-line:variable-name
  version_group: { name: string };
  types: string[];
  sprites: PokemonSprit | null;

  constructor(data: PokemonForm) {
    this.form_name = data.form_name;
    this.form_names = data.form_names;
    this.form_order = data.form_order;
    this.id = data.id;
    this.is_battle_only = data.is_battle_only;
    this.is_default = data.is_default;
    this.is_mega = data.is_mega;
    this.is_shadow = false;
    this.is_purified = false;
    this.name = data.name;
    this.version_group = data.version_group;
    this.types = data.types.map((t) => t.type.name);
    this.sprites = data.sprites;
  }
}

export interface FormSoundCry {
  form: string;
  cries: { [x: string]: string };
}

// tslint:disable-next-line:max-classes-per-file
export class FormSoundCryModel {
  form!: string;
  cries!: { [x: string]: string };

  constructor(pokemon: PokemonInfo) {
    const fullName = pokemon.forms[0].name;
    const speciesName = pokemon.species.name;
    this.form = fullName === speciesName ? FORM_NORMAL : fullName.replace(`${speciesName}-`, '').replaceAll('-', '_').toUpperCase();
    this.cries = pokemon.cries;
  }
}
