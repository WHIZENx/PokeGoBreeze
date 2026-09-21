import { Badge } from '@mui/material';
import { PokemonType } from '../../../enums/type.enum';
import APIService from '../../../services/api.service';
import { APIUrl } from '../../../services/constants';
import { convertFormGif } from '../../../utils/utils';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';

interface EvolutionPokemonDisplayProps {
  id: number;
  name: string;
  sprite: string;
  pokemonType?: PokemonType;
  stage?: number;
  formLabel?: string;
  formVaries?: boolean;
}

const EvolutionPokemonDisplay = ({
  id,
  name,
  sprite,
  pokemonType = PokemonType.Normal,
  stage,
  formLabel,
  formVaries = false,
}: EvolutionPokemonDisplayProps) => {
  const image = (
    <PokemonIconType pokemonType={pokemonType} size={30}>
      <img
        className="pokemon-sprite"
        alt={name}
        src={
          formVaries
            ? APIService.getPokeSprite()
            : APIService.getPokemonAsset('pokemon-animation', 'all', convertFormGif(sprite), 'gif')
        }
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = event.currentTarget.src.includes(APIUrl.POKE_SPRITES_API_URL)
            ? APIService.getPokeSprite()
            : APIService.getPokeSprite(id);
        }}
      />
    </PokemonIconType>
  );
  const stageImage = stage ? (
    <Badge color="primary" overlap="circular" badgeContent={stage} className="tw-w-24">
      {image}
    </Badge>
  ) : (
    <span className="img-evo-container">{image}</span>
  );

  return (
    <>
      {formLabel ? (
        <Badge
          color="secondary"
          overlap="circular"
          badgeContent={formLabel}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {stageImage}
        </Badge>
      ) : (
        stageImage
      )}
      <span className="tw-block">
        <b className="tw-text-default">#{id}</b>
      </span>
      <span className="tw-block">
        <b className="link-title">{name}</b>
      </span>
    </>
  );
};

export default EvolutionPokemonDisplay;
