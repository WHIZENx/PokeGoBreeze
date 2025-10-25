import React, { Fragment } from 'react';
import APIService from '../../../services/api.service';
import { priorityBadge } from '../../../utils/compute';
import { capitalize, getDataWithKey, getKeysObj, getKeyWithData } from '../../../utils/utils';
import { combineClasses } from '../../../utils/extension';
import { BadgeType } from '../../enums/badge-type.enum';
import { ISelectBadgeComponent } from '../models/component.model';

const SelectBadge = (props: ISelectBadgeComponent) => {
  const Badge = (props: ISelectBadgeComponent, type = BadgeType.None) => (
    <div className="tw-text-center">
      <div
        className={combineClasses('tw-relative frame-badge', props.priority === type ? 'frame-badge-select' : '')}
        onClick={() => props.setPriority(type)}
      >
        <span className="tw-w-6">
          <img
            alt="Frame Type"
            className={combineClasses('frame-type-sprite', type === BadgeType.Platinum ? 'filter-platinum' : '')}
            src={priorityBadge(type)}
          />
        </span>
        {type !== BadgeType.None && (
          <span className="position-badge tw-w-3">
            <img alt="Badge Type" className="badge-type-sprite" src={APIService.getTypeHqSprite(props.type)} />
          </span>
        )}
      </div>
      <span>{getKeyWithData(BadgeType, type)}</span>
    </div>
  );

  return (
    <div className="tw-w-full tw-mt-2">
      <div className="tw-flex tw-justify-center tw-items-center">
        <div className={combineClasses('type-icon-small w-max-content', props.type.toLowerCase())}>
          {capitalize(props.type)} Badge
        </div>
      </div>
      <div className="tw-flex tw-flex-wrap tw-justify-center tw-items-center tw-mt-2 tw-gap-2">
        {getKeysObj(BadgeType).map((value, i) => (
          <Fragment key={i}>{Badge(props, getDataWithKey(BadgeType, value))}</Fragment>
        ))}
      </div>
    </div>
  );
};

export default SelectBadge;
