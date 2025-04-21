import { Combat, ICombat } from '../../../../core/models/combat.model';
import { MoveType, PokemonType } from '../../../../enums/type.enum';
import { getPokemonType } from '../../../../util/utils';

export interface ICounterModel {
  cMove: ICombat;
  dps: number;
  fMove: ICombat;
  pokemonForm: string | undefined;
  pokemonId: number;
  pokemonName: string;
  pokemonType?: PokemonType;
  ratio: number;
  releasedGO: boolean;
}

export class CounterModel implements ICounterModel {
  cMove = new Combat();
  dps = 0;
  fMove = new Combat();
  pokemonForm: string | undefined;
  pokemonId = 0;
  pokemonName = '';
  pokemonType = PokemonType.Normal;
  ratio = 0;
  releasedGO = false;

  constructor({ ...props }: ICounterModel) {
    if (props.cMove.moveType === MoveType.Shadow) {
      props.pokemonType = PokemonType.Shadow;
    } else if (props.cMove.moveType === MoveType.Purified) {
      props.pokemonType = PokemonType.Purified;
    } else {
      props.pokemonType = getPokemonType(props.pokemonForm, false, false);
    }
    Object.assign(this, props);
  }
}

interface IOptionFiltersCounter {
  showMegaPrimal: boolean;
  releasedGO: boolean;
  enableBest: boolean;
}

export class OptionFiltersCounter implements IOptionFiltersCounter {
  showMegaPrimal = false;
  releasedGO = true;
  enableBest = false;
}
