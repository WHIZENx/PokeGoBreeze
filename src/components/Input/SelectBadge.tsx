import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import { priorityBadge } from '../../util/compute';
import { capitalize, getDataWithKey, getKeysObj, getKeyWithData } from '../../util/utils';
import { ISelectBadgeComponent } from '../models/component.model';
import { combineClasses } from '../../util/extension';
import { BadgeType } from './enums/badge-type.enum';

const SelectBadge = (props: ISelectBadgeComponent) => {
  const Badge = (props: ISelectBadgeComponent, type = BadgeType.None) => (
    <div className="text-center">
      <div
        className={combineClasses('position-relative frame-badge', props.priority === type ? 'frame-badge-select' : '')}
        onClick={() => props.setPriority(type)}
      >
        <span style={{ width: 40 }}>
          <img
            alt="Frame Type"
            className={combineClasses('frame-type-sprit', type === BadgeType.Platinum ? 'filter-platinum' : '')}
            src={priorityBadge(type)}
          />
        </span>
        {type !== BadgeType.None && (
          <span className="position-badge" style={{ width: 20 }}>
            <img alt="Badge Type" className="badge-type-sprit" src={APIService.getTypeHqSprite(props.type)} />
          </span>
        )}
      </div>
      <span>{getKeyWithData(BadgeType, type)}</span>
    </div>
  );

  return (
    <div className="w-100 element-top">
      <div className="d-flex justify-content-center align-items-center">
        <div className={combineClasses('type-icon-small', props.type.toLowerCase())} style={{ width: 'max-content' }}>
          {capitalize(props.type)} Badge
        </div>
      </div>
      <div className="d-flex flex-wrap justify-content-center align-items-center element-top" style={{ gap: 10 }}>
        {getKeysObj(BadgeType).map((value, i) => (
          <Fragment key={i}>{Badge(props, getDataWithKey(BadgeType, value))}</Fragment>
        ))}
      </div>
    </div>
  );
};

export default SelectBadge;
