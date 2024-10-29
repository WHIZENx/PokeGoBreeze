import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../../util/utils';

import './TypeBadge.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { ITypeBadgeComponent } from '../../models/component.model';
import { combineClasses, getValueOrDefault, isEqual, isNotEmpty } from '../../../util/extension';
import { MoveType } from '../../../enums/type.enum';

const TypeBadge = (props: ITypeBadgeComponent) => {
  const combat = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.combat));

  const [move, setMove] = useState<ICombat>();
  useEffect(() => {
    if (props.move?.name && isNotEmpty(combat)) {
      setMove(combat.find((item) => isEqual(item.name, props.move?.name)));
    }
  }, [combat, props.move?.name]);

  return (
    <div className={combineClasses('type-badge-container', props.isGrow ? 'filter-shadow' : '')} style={props.style}>
      <span className="caption text-type-border" style={{ color: props.color ?? 'gray' }}>
        {props.title}
      </span>
      <Link to={`/move/${move?.id}`} className="d-flex align-items-center position-relative" style={{ width: 'fit-content' }}>
        <span className={combineClasses(move?.type?.toLowerCase(), 'type-border position-relative')}>
          {(props.isElite || props.isShadow || props.isPurified || props.isSpecial || props.isUnavailable) && (
            <span className="type-badge-border">
              {props.isElite && (
                <span className="type-icon-small ic elite-ic">
                  <span>{MoveType.Elite}</span>
                </span>
              )}
              {props.isShadow && (
                <span className="type-icon-small ic shadow-ic">
                  <span>{MoveType.Shadow}</span>
                </span>
              )}
              {props.isPurified && (
                <span className="type-icon-small ic purified-ic">
                  <span>{MoveType.Purified}</span>
                </span>
              )}
              {props.isSpecial && (
                <span className="type-icon-small ic special-ic">
                  <span>{MoveType.Special}</span>
                </span>
              )}
              {props.isUnavailable && (
                <span className="type-icon-small ic unavailable-ic">
                  <span>Unavailable</span>
                </span>
              )}
            </span>
          )}
          <span>{splitAndCapitalize(props.move?.name, '_', ' ')}</span>
        </span>
        <span className={combineClasses(move?.type?.toLowerCase(), 'type-icon-border')}>
          <div style={{ width: 35 }}>
            <img
              style={{ padding: 5, backgroundColor: 'black' }}
              className="sprite-type"
              alt="img-type-pokemon"
              src={APIService.getTypeHqSprite(capitalize(move?.type))}
            />
          </div>
        </span>
      </Link>
    </div>
  );
};

export default TypeBadge;
