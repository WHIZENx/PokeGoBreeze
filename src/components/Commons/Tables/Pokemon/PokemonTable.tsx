import React from 'react';
import { splitAndCapitalize } from '../../../../utils/utils';
import { genRoman } from '../../../../utils/compute';
import { IPokemonTableComponent } from '../../models/component.model';
import { combineClasses, isNumber, isUndefined, toFloatWithPadding, toNumber } from '../../../../utils/extension';
import { Skeleton } from '@mui/material';
import './PokemonTable.scss';

const PokemonTable = (props: IPokemonTableComponent) => {
  const reload = (element: JSX.Element, hasValue = false, color = 'var(--loading-custom-bg)') => {
    if (props.isLoadedForms) {
      return element;
    }
    if (hasValue) {
      return <div className="tw-opacity-60 tw-animate-pulse">{element}</div>;
    }
    return (
      <div className="slide-container tw-w-full !tw-h-full !tw-m-0 !tw-p-0 tw-opacity-50" style={{ background: color }}>
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
      data-body-weight={props.weight ?? ''}
      data-body-height={props.height ?? ''}
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
                <b>{splitAndCapitalize(props.formName, '-', ' ')}</b>
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
              !isUndefined(props.gen) && isNumber(props.gen),
              'var(--background-btn-type)'
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
              Boolean(props.version),
              'var(--background-btn-type)'
            )}
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="tw-flex">Body</h5>
          </td>
          <td colSpan={2} className="!tw-p-0">
            <div className="tw-flex tw-items-center first-extra-col tw-h-full tw-w-1/2 tw-float-left">
              <div>
                <div className="tw-inline-block tw-mr-1">
                  <h6>Weight:</h6>
                </div>
                <div className="tw-inline-block">
                  {reload(
                    <h6>{!isUndefined(props.weight) && `${toFloatWithPadding(props.weight / 10, 2)} kg`}</h6>,
                    !isUndefined(props.weight)
                  )}
                </div>
              </div>
            </div>
            <div className="tw-flex tw-items-center tw-h-full tw-w-1/2 tw-float-left">
              <div>
                <div className="tw-inline-block tw-mr-1">
                  <h6>Height:</h6>
                </div>
                <div className="tw-inline-block">
                  {reload(
                    <h6>{!isUndefined(props.height) && `${toFloatWithPadding(props.height / 10, 2)} m`}</h6>,
                    !isUndefined(props.height)
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
