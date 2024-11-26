import React from 'react';
import APIService from '../../services/API.service';
import { priorityBadge } from '../../util/compute';
import { capitalize } from '../../util/utils';
import { ISelectBadgeComponent } from '../models/component.model';
import { combineClasses } from '../../util/extension';

const SelectBadge = (props: ISelectBadgeComponent) => {
  const Badge = (props: ISelectBadgeComponent, text: string, priorityNumber: number) => {
    return (
      <div className="text-center">
        <div
          className={combineClasses('position-relative frame-badge', props.priority === priorityNumber ? 'frame-badge-select' : '')}
          onClick={() => props.setPriority(priorityNumber)}
        >
          <span style={{ width: 40 }}>
            <img
              alt="frame-type"
              className={combineClasses('frame-type-sprit', priorityNumber === 4 ? 'filter-platinum' : '')}
              src={priorityBadge(priorityNumber)}
            />
          </span>
          {priorityNumber > 0 && (
            <span className="position-badge" style={{ width: 20 }}>
              <img alt="badge-type" className="badge-type-sprit" src={APIService.getTypeHqSprite(props.type)} />
            </span>
          )}
        </div>
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="w-100 element-top">
      <div className="d-flex justify-content-center align-items-center">
        <div className={combineClasses('type-icon-small', props.type.toLowerCase())} style={{ width: 'max-content' }}>
          {capitalize(props.type)} Badge
        </div>
      </div>
      <div className="d-flex flex-wrap justify-content-center align-items-center element-top" style={{ gap: 10 }}>
        {Badge(props, 'None', 0)}
        {Badge(props, 'Bronze', 1)}
        {Badge(props, 'Silver', 2)}
        {Badge(props, 'Gold', 3)}
        {Badge(props, 'Platinum', 4)}
      </div>
    </div>
  );
};

export default SelectBadge;
