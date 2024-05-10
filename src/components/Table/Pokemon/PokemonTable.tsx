import React from 'react';
import { splitAndCapitalize } from '../../../util/Utils';
import { genRoman } from '../../../util/Constants';

const PokemonTable = (props: {
  id: number | undefined;
  formName: string | undefined;
  gen: number | undefined;
  region: string | undefined;
  version: string | undefined;
  weight: number | undefined;
  height: number | undefined;
  className?: string;
}) => {
  return (
    <table className={'table-info table-desc ' + props.className}>
      <thead />
      <tbody>
        <tr>
          <td>
            <h5 className="d-flex">ID</h5>
          </td>
          <td colSpan={2}>
            <h5 className="d-flex">
              <b>{props.id && `#${props.id}`}</b>
            </h5>
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Name</h5>
          </td>
          <td colSpan={2}>
            <h5 className="d-flex">
              <b>{splitAndCapitalize(props.formName, '-', ' ')}</b>
            </h5>
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Generation</h5>
          </td>
          <td colSpan={2}>
            <h5 className="d-flex align-items-center" style={{ gap: 5 }}>
              {!props.gen || props.gen === 0 ? (
                <b>{props.gen === 0 && 'Unknown'}</b>
              ) : (
                <>
                  <b>{genRoman(props.gen)}</b> <span className="text-gen">{`Gen ${props.gen}`}</span>
                </>
              )}
            </h5>
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Region</h5>
          </td>
          <td colSpan={2}>
            <h5 className="d-flex">{splitAndCapitalize(props.region, '-', ' ')}</h5>
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Version</h5>
          </td>
          <td colSpan={2}>
            <h5 className="d-flex">{splitAndCapitalize(props.version, '-', ' ').replace(/GO$/i, 'GO')}</h5>
          </td>
        </tr>
        <tr>
          <td>
            <h5 className="d-flex">Body</h5>
          </td>
          <td colSpan={2} style={{ padding: 0 }}>
            <div className="d-flex align-items-center first-extra-col h-100" style={{ float: 'left', width: '50%' }}>
              <div>
                <div className="d-inline-block" style={{ marginRight: 5 }}>
                  <h6>Weight:</h6>
                </div>
                <div className="d-inline-block">
                  <h6>{(props.weight ?? 0) / 10} kg</h6>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center h-100" style={{ float: 'left', width: '50%' }}>
              <div>
                <div className="d-inline-block" style={{ marginRight: 5 }}>
                  <h6>Height:</h6>
                </div>
                <div className="d-inline-block">
                  <h6>{(props.height ?? 0) / 10} m</h6>
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
