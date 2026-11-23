import { Skeleton } from '@mui/material';

interface PokemonProfileImageSkeletonProps {
  testId?: string;
}

const PokemonProfileImageSkeleton = ({
  testId = 'pokemon-profile-image-skeleton',
}: PokemonProfileImageSkeletonProps) => (
  <Skeleton
    variant="rounded"
    animation="wave"
    className="!tw-h-pokemon-sprite-inner !tw-w-pokemon-sprite-inner"
    data-skeleton-surface="pokemon-image"
    data-testid={testId}
  />
);

export default PokemonProfileImageSkeleton;
