import React, { Fragment } from 'react';
import APIService from '../../services/api.service';
import { priorityBadge } from '../../utils/compute';
import { capitalize, getDataWithKey, getKeysObj, getKeyWithData } from '../../utils/utils';
import { ISelectBadgeComponent } from '../models/component.model';
import { combineClasses } from '../../utils/extension';
import { BadgeType } from './enums/badge-type.enum';

const SelectBadge = (props: ISelectBadgeComponent) => {
  const Badge = (props: ISelectBadgeComponent, type = BadgeType.None) => (
    <div className="text-center">
      <div
        className={combineClasses('position-relative frame-badge', props.priority === type ? 'frame-badge-select' : '')}
        onClick={() => props.setPriority(type)}
      >
        <span className="w-6">
          <img
            alt="Frame Type"
            className={combineClasses('frame-type-sprit', type === BadgeType.Platinum ? 'filter-platinum' : '')}
            src={priorityBadge(type)}
          />
        </span>
        {type !== BadgeType.None && (
          <span className="position-badge w-3">
            <img alt="Badge Type" className="badge-type-sprit" src={APIService.getTypeHqSprite(props.type)} />
          </span>
        )}
      </div>
      <span>{getKeyWithData(BadgeType, type)}</span>
    </div>
  );

  return (
    <div className="w-100 mt-2">
      <div className="d-flex justify-content-center align-items-center">
        <div className={combineClasses('type-icon-small w-max-content', props.type.toLowerCase())}>
          {capitalize(props.type)} Badge
        </div>
      </div>
      <div className="d-flex flex-wrap justify-content-center align-items-center mt-2 gap-2">
        {getKeysObj(BadgeType).map((value, i) => (
          <Fragment key={i}>{Badge(props, getDataWithKey(BadgeType, value))}</Fragment>
        ))}
      </div>
    </div>
  );
};

export default SelectBadge;
