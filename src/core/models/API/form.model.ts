import { Type } from './info.model';

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
  sprites: {
    back_default: string;
    back_female: string;
    back_shiny: string;
    back_shiny_female: string;
    front_default: string;
    front_female: string;
    front_shiny: string;
    front_shiny_female: string;
  };
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

interface TypeModify {
  type: { name: string };
}

interface Form {
  form_name: string;
  form_names: string[];
  form_order: number;
  id: number | null;
  is_battle_only: boolean;
  is_default: boolean;
  is_mega: boolean;
  is_shadow: boolean;
  name: string;
  version_group: { name: string };
  types: TypeModify[] | Type[];
}

export interface PokemonFormModify {
  default_id: number;
  default_name: string;
  id?: number;
  name: string;
  form: Form;
}

export class PokemonFormModifyModel {
  // tslint:disable-next-line:variable-name
  default_id!: number;
  // tslint:disable-next-line:variable-name
  default_name!: string;
  id?: number;
  name!: string;
  form!: Form;

  constructor(
    id: number,
    defaultName: string,
    name: string,
    formName: string,
    isBattleOnly: boolean,
    isDefault: boolean,
    isMega: boolean,
    isShadow: boolean,
    fullFormName: string,
    version: string,
    types: TypeModify[] | Type[]
  ) {
    this.default_id = id;
    this.default_name = defaultName;
    this.name = name;
    this.form = {
      form_name: formName,
      form_names: [],
      form_order: 0,
      id: null,
      is_battle_only: isBattleOnly,
      is_default: isDefault,
      is_mega: isMega,
      is_shadow: isShadow,
      name: fullFormName,
      version_group: { name: version },
      types,
    };
  }
}
