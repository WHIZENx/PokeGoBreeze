export const isStatsRankingNavigationDisabled = (
  isDisabled: boolean | undefined,
  rank: number | string | undefined,
  hasStatsRanking: boolean
) =>
  Boolean(
    isDisabled ||
      !hasStatsRanking ||
      rank === undefined ||
      (typeof rank === 'string' && rank.trim().toLowerCase() === 'unavailable')
  );
