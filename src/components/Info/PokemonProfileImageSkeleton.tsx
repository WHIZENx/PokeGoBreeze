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
    className="!tw-h-[205px] !tw-w-[205px]"
    data-skeleton-surface="pokemon-image"
    data-testid={testId}
  />
);

export default PokemonProfileImageSkeleton;
