import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { capitalize } from '../../util/Utils';

import './TypeEffectiveSelect.scss';
import { StoreState } from '../../store/models/state.model';
import { TypeEffChart } from '../../core/models/type-eff.model';
import { ITypeEffectiveSelectComponent } from '../models/component.model';

const TypeEffectiveSelect = (props: ITypeEffectiveSelectComponent) => {
  const typeEffective = useSelector((state: StoreState) => state.store.data?.typeEff);

  const renderEffective = (text: string, data: string[]) => {
    return (
      <Fragment>
        {data.length > 0 && (
          <Fragment>
            <h6 className={props.block ? 'element-top' : ''}>
              <b className="text-shadow">x{text}</b>
            </h6>
            <div className="d-flex flex-wrap" style={{ gap: 5 }}>
              {data.map((value, index) => (
                <span key={index} className={value.toLowerCase() + ' type-select-bg d-flex align-items-center filter-shadow'}>
                  <div style={{ display: 'contents', width: 16 }}>
                    <img
                      className="pokemon-sprite-small sprite-type-select filter-shadow"
                      alt="img-type-pokemon"
                      src={APIService.getTypeHqSprite(capitalize(value))}
                    />
                  </div>
                  <span className="filter-shadow">{capitalize(value)}</span>
                </span>
              ))}
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  };

  const getTypeEffect = (effect: number, types: string[]) => {
    let data: TypeEffChart;
    if (effect === 0) {
      data = {
        weak: [],
        very_weak: [],
      };
      Object.entries(typeEffective ?? {}).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type?.toUpperCase()];
        });
        if (valueEffective >= 2.56) {
          data.very_weak?.push(key);
        } else if (valueEffective >= 1.6) {
          data.weak?.push(key);
        }
      });

      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('2.56', data.very_weak ?? [])}
          {renderEffective('1.6', data.weak ?? [])}
        </div>
      );
    } else if (effect === 1) {
      data = {
        neutral: [],
      };
      Object.entries(typeEffective ?? {}).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type?.toUpperCase()];
        });
        if (valueEffective === 1) {
          data.neutral?.push(key);
        }
      });
      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('1', data.neutral ?? [])}
        </div>
      );
    } else if (effect === 2) {
      data = {
        resist: [],
        very_resist: [],
        super_resist: [],
      };
      Object.entries(typeEffective ?? {}).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type?.toUpperCase()];
        });
        if (valueEffective <= 0.3) {
          data.super_resist?.push(key);
        } else if (valueEffective <= 0.39) {
          data.very_resist?.push(key);
        } else if (valueEffective <= 0.625) {
          data.resist?.push(key);
        }
      });
      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('0.244', data.super_resist ?? [])}
          {renderEffective('0.391', data.very_resist ?? [])}
          {renderEffective('0.625', data.resist ?? [])}
        </div>
      );
    }
    return <></>;
  };

  return <Fragment>{getTypeEffect(props.effect, props.types)}</Fragment>;
};

export default TypeEffectiveSelect;
