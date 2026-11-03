import React from 'react';
import IconType from '../../components/Sprites/Icon/Type/Type';
import { DynamicObj, combineClasses, safeObjectEntries, toFloat, toNumber } from '../../utils/extension';
import { capitalize } from '../../utils/utils';
import { getTypeEffective } from '../../utils/helpers/options-context.helpers';

const multiplierClass = (value: number) => {
  if (value > 1) {
    return 'tw-bg-red-100 tw-text-red-950 dark:tw-bg-red-950 dark:tw-text-red-100';
  }
  if (value < 1) {
    return 'tw-bg-green-100 tw-text-green-950 dark:tw-bg-green-950 dark:tw-text-green-100';
  }
  return 'tw-bg-table-primary';
};

const TypeMatchupMatrix = () => {
  const typeEffective = getTypeEffective() as unknown as DynamicObj<DynamicObj<number>>;
  const entries = safeObjectEntries<DynamicObj<number>>(typeEffective);
  const types = entries.map(([type]) => type);

  return (
    <section className="pokemon-detail-section" data-testid="type-matchup-matrix-section">
      <h4 className="info-title">
        <b>Type matchup matrix</b>
      </h4>
      <div className="tw-overflow-x-auto tw-pb-1">
        <table className="tw-min-w-[980px] tw-w-full tw-border-collapse" aria-label="Pokémon GO type matchup matrix">
          <thead>
            <tr>
              <th className="tw-sticky tw-left-0 tw-z-[1] tw-bg-custom-default tw-p-2 tw-text-left tw-text-caption">
                ATK / DEF
              </th>
              {types.map((type) => (
                <th className="tw-p-1" key={type} title={capitalize(type)}>
                  <IconType type={type} width={28} height={28} alt={capitalize(type)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(([attackType, defenses]) => (
              <tr key={attackType}>
                <th className="tw-sticky tw-left-0 tw-z-[1] tw-bg-custom-default tw-p-2 tw-text-left">
                  <span className="tw-flex tw-items-center tw-gap-2">
                    <IconType type={attackType} width={28} height={28} alt="" />
                    <span className="tw-text-caption">{capitalize(attackType)}</span>
                  </span>
                </th>
                {types.map((defenseType) => {
                  const multiplier = toNumber(defenses[defenseType], 1);
                  const displayMultiplier = toFloat(multiplier, 3);
                  return (
                    <td
                      className={combineClasses(
                        'tw-border tw-border-solid tw-border-gray-300 tw-p-2 tw-text-center tw-text-caption tw-font-medium',
                        multiplierClass(multiplier)
                      )}
                      key={defenseType}
                      title={`${capitalize(attackType)} → ${capitalize(defenseType)}: ${displayMultiplier}×`}
                    >
                      {displayMultiplier}×
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TypeMatchupMatrix;
