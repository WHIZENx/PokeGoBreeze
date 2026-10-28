import APIService from '../../../services/api.service';
import { useImageSourceSequence } from '../../../utils/hooks/useImageSourceSequence';
import { markImageAsPreloaded } from '../../../utils/hooks/usePreloadedImage';

interface PokemonNavigationImageProps {
  id: number;
  className: string;
}

const PokemonNavigationImage = ({ id, className }: PokemonNavigationImageProps) => {
  const { source, advanceSource } = useImageSourceSequence([
    APIService.getPokeOfficialArtwork(id),
    APIService.getPokeFullSprite(id),
    APIService.getPokeSprite(id),
    APIService.getPokeSprite(),
  ]);

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
