type RankingMove = { moveId: string; uses: number | undefined };

const normalizeMoveId = (value: string) =>
  value
    .trim()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
    .toUpperCase()
    .replace(/_PLUS$/, '+');

export const includeGameMasterSpecialMoves = (
  rankingMoves: RankingMove[] | undefined,
  specialMoves: string[] | undefined
) => {
  const result = [...(rankingMoves ?? [])];
  const seen = new Set(result.map((move) => normalizeMoveId(move.moveId)));
  specialMoves?.forEach((moveId) => {
    const normalized = normalizeMoveId(moveId);
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    result.push({ moveId, uses: 0 });
  });
  return result;
};
