import APIService from '../../../services/api.service';
import { useImageSourceSequence } from '../../../utils/hooks/useImageSourceSequence';
import { markImageAsPreloaded } from '../../../utils/hooks/usePreloadedImage';

interface PokemonNavigationImageProps {
  id: number;
  className: string;
}

export const getPokemonNavigationImageSources = (id: number) => [
  APIService.getPokeOfficialArtwork(id),
  APIService.getPokeFullSprite(id),
  APIService.getPokeSprite(id),
  APIService.getPokeSprite(),
];

const PokemonNavigationImage = ({ id, className }: PokemonNavigationImageProps) => {
  const { source, advanceSource } = useImageSourceSequence(getPokemonNavigationImageSources(id));

  return (
    <img
      key={`${id}-${source}`}
      className={className}
      alt="Image Pokemon"
      src={source}
      onLoad={(event) => markImageAsPreloaded(event.currentTarget.currentSrc || event.currentTarget.src)}
      onError={advanceSource}
    />
  );
};

export default PokemonNavigationImage;
