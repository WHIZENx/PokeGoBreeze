export type AppraisalIvs = { atk: number; def: number; sta: number };

export const pokemonGoAppraisalStars = (iv: AppraisalIvs) => {
  const total = iv.atk + iv.def + iv.sta;
  if (total === 45) {
    return 4;
  }
  if (total >= 37) {
    return 3;
  }
  if (total >= 30) {
    return 2;
  }
  if (total >= 23) {
    return 1;
  }
  return 0;
};
