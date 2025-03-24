import React from 'react';
import { splitAndCapitalize } from '../../../util/utils';
import { genRoman } from '../../../util/constants';
import { IPokemonTableComponent } from '../../models/component.model';
import { combineClasses, isNumber, isUndefined, toFloatWithPadding, toNumber } from '../../../util/extension';

const PokemonTable = (props: IPokemonTableComponent) => {
  const reload = (element: JSX.Element, color = '#f5f5f5') => {
    if (props.isLoadedForms) {
      return element;
    }
    return (
      <div className="ph-item w-75 h-100" style={{ padding: 0, margin: 0 }}>
        <div className="ph-picture ph-col-3 w-100 h-100" style={{ padding: 0, margin: 0, background: color }} />
      </div>
    );
  };

  const renderPokemonId = () => (
    <h5 className="d-flex">
      <b>#{props.id}</b>
    </h5>
  );

  return (
    <table className={combineClasses('table-info table-desc', props.className)}>
      <thead />
      <tbody>
        <tr>
          <td>
            <h5 className="d-flex">ID</h5>
          </td>
          <td colSpan={2}>{toNumber(props.id) > 0 ? renderPokemonId() : reload(renderPokemonId())}</td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Name</h5>
          </td>
          <td colSpan={2}>
            {reload(
              <h5 className="d-flex">
                <b>{splitAndCapitalize(props.formName, '-', ' ')}</b>
              </h5>
            )}
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Generation</h5>
          </td>
          <td colSpan={2}>
            {reload(
              <h5 className="d-flex align-items-center" style={{ gap: 5 }}>
                {isUndefined(props.gen) || !isNumber(props.gen) ? (
                  <></>
                ) : props.gen === 0 ? (
                  <b>Unknown</b>
                ) : (
                  <>
                    <b>{genRoman(props.gen)}</b> <span className="text-gen">{`Gen ${toNumber(props.gen)}`}</span>
                  </>
                )}
              </h5>,
              '#eeeeee'
            )}
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Region</h5>
          </td>
          <td colSpan={2}>{reload(<h5 className="d-flex">{splitAndCapitalize(props.region, '-', ' ')}</h5>)}</td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Version</h5>
          </td>
          <td colSpan={2}>
            {reload(
              <h5 className="d-flex">{splitAndCapitalize(props.version, '-', ' ').replace(/GO$/i, 'GO').replace(/X y$/i, 'X-Y')}</h5>,
              '#eeeeee'
            )}
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Body</h5>
          </td>
          <td colSpan={2} style={{ padding: 0 }}>
            <div className="d-flex align-items-center first-extra-col h-100 w-50" style={{ float: 'left' }}>
              <div>
                <div className="d-inline-block" style={{ marginRight: 5 }}>
                  <h6>Weight:</h6>
                </div>
                <div className="d-inline-block">
                  {reload(<h6>{!isUndefined(props.weight) && `${toFloatWithPadding(props.weight / 10, 2)} kg`}</h6>)}
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center h-100 w-50" style={{ float: 'left' }}>
              <div>
                <div className="d-inline-block" style={{ marginRight: 5 }}>
                  <h6>Height:</h6>
                </div>
                <div className="d-inline-block">
                  {reload(<h6>{!isUndefined(props.height) && `${toFloatWithPadding(props.height / 10, 2)} m`}</h6>)}
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
