import React from 'react';
import { splitAndCapitalize } from '../../../../utils/utils';
import { genRoman } from '../../../../utils/compute';
import { IPokemonTableComponent } from '../../models/component.model';
import { combineClasses, isNumber, isUndefined, toNumber } from '../../../../utils/extension';
import { Skeleton } from '@mui/material';
import './PokemonTable.scss';
import { formatPokemonDisplayName } from '../../../../utils/pokemon-display-name';

const bodyMeasurementFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const formatBodyMeasurement = (value: number, unit: 'kg' | 'm') => `${bodyMeasurementFormatter.format(value)} ${unit}`;

const PokemonTable = (props: IPokemonTableComponent) => {
  const reload = (element: JSX.Element, hasValue = false) => {
    if (props.isLoadedForms) {
      return element;
    }
    if (hasValue) {
      return <div className="tw-opacity-60 tw-animate-pulse">{element}</div>;
    }
    return (
      <div className="slide-container tw-w-full !tw-h-full !tw-m-0 !tw-p-0">
        <Skeleton variant="rectangular" animation="wave" className="!tw-w-full !tw-h-full !tw-m-0 !tw-p-0" />
      </div>
    );
  };

  const renderPokemonId = () => (
    <h5 className="tw-flex">
      <b>#{props.id}</b>
    </h5>
  );

  return (
    <table
      data-testid="pokemon-info-table"
      data-body-weight-kg={props.weightKg ?? ''}
      data-body-height-m={props.heightM ?? ''}
      className={combineClasses('table-info table-desc tw-w-full', props.className)}
    >
      <thead />
      <tbody>
        <tr>
          <td>
            <h5 className="tw-flex">ID</h5>
          </td>
          <td colSpan={2}>{reload(renderPokemonId(), toNumber(props.id) > 0)}</td>
        </tr>
        <tr>
          <td>
            <h5 className="tw-flex">Name</h5>
          </td>
          <td colSpan={2}>
            {reload(
              <h5 className="tw-flex">
                <b>{formatPokemonDisplayName(props.formName)}</b>
              </h5>,
              Boolean(props.formName)
            )}
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="tw-flex">Generation</h5>
          </td>
          <td colSpan={2}>
            {reload(
              <h5 className="tw-flex tw-items-center tw-gap-1">
                {isUndefined(props.gen) || !isNumber(props.gen) ? (
                  <></>
                ) : props.gen === 0 ? (
                  <b>Unknown</b>
                ) : (
                  <>
                    <b>{genRoman(props.gen)}</b> <span className="text-gen">{`(Gen ${toNumber(props.gen)})`}</span>
                  </>
                )}
              </h5>,
              !isUndefined(props.gen) && isNumber(props.gen)
            )}
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="tw-flex">Region</h5>
          </td>
          <td colSpan={2}>
            {reload(<h5 className="tw-flex">{splitAndCapitalize(props.region, '-', ' ')}</h5>, Boolean(props.region))}
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="tw-flex">Version</h5>
          </td>
          <td colSpan={2}>
            {reload(
              <h5 className="tw-flex">
                {splitAndCapitalize(props.version, '-', ' ').replace(/GO$/i, 'GO').replace(/X y$/i, 'X-Y')}
              </h5>,
              Boolean(props.version)
            )}
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="tw-flex">Body</h5>
          </td>
          <td colSpan={2} className="!tw-p-0">
            <div className="tw-grid tw-grid-cols-[minmax(max-content,1.1fr)_minmax(max-content,0.9fr)] min-[420px]:tw-grid-cols-[minmax(max-content,1.15fr)_minmax(max-content,0.85fr)]">
              <div className="first-extra-col tw-flex tw-h-full tw-min-w-0 tw-items-center tw-gap-0.5 tw-whitespace-nowrap !tw-px-0.5 min-[420px]:tw-gap-1 min-[420px]:!tw-px-1.5 sm:!tw-px-2.5">
                <h6 className="max-[419px]:tw-text-body2">Weight:</h6>
                <div className="tw-min-w-0 tw-tabular-nums">
                  {reload(
                    <h6 className="tw-whitespace-nowrap max-[419px]:tw-text-body2">
                      {!isUndefined(props.weightKg) && formatBodyMeasurement(props.weightKg, 'kg')}
                    </h6>,
                    !isUndefined(props.weightKg)
                  )}
                </div>
              </div>
              <div className="tw-flex tw-h-full tw-min-w-0 tw-items-center tw-gap-0.5 tw-whitespace-nowrap !tw-pl-0.5 !tw-pr-3 min-[420px]:tw-gap-1 min-[420px]:!tw-pl-1.5 min-[420px]:!tw-pr-3 sm:!tw-pl-2.5 sm:!tw-pr-4">
                <h6 className="max-[419px]:tw-text-body2">Height:</h6>
                <div className="tw-min-w-0 tw-tabular-nums">
                  {reload(
                    <h6 className="tw-whitespace-nowrap max-[419px]:tw-text-body2">
                      {!isUndefined(props.heightM) && formatBodyMeasurement(props.heightM, 'm')}
                    </h6>,
                    !isUndefined(props.heightM)
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default PokemonTable;
