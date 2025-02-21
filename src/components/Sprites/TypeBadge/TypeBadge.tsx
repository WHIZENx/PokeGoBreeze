import React, { useEffect, useState } from 'react';
import APIService from '../../../services/API.service';
import { getKeyWithData, splitAndCapitalize } from '../../../util/utils';

import './TypeBadge.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { ITypeBadgeComponent } from '../../models/component.model';
import { combineClasses, getValueOrDefault, isEqual, isNotEmpty } from '../../../util/extension';
import { MoveType } from '../../../enums/type.enum';
import { LinkToTop } from '../../../util/hooks/LinkToTop';

const TypeBadge = (props: ITypeBadgeComponent) => {
  const combat = useSelector((state: StoreState) => state.store.data.combat);

  const [move, setMove] = useState<ICombat>();
  useEffect(() => {
    if (props.move?.name && isNotEmpty(combat)) {
      setMove(combat.find((item) => isEqual(item.name, props.move?.name)));
    }
  }, [combat, props.move?.name]);

  return (
    <div className={combineClasses('type-badge-container', props.isGrow ? 'filter-shadow' : '')} style={props.style}>
      <span className="caption text-type-border" style={{ color: getValueOrDefault(String, props.color, 'gray') }}>
        {props.title}
      </span>
      <LinkToTop to={`/move/${move?.id}`} className="d-flex align-items-center position-relative" style={{ width: 'fit-content' }}>
        <span className={combineClasses(move?.type?.toLowerCase(), 'type-border position-relative')}>
          {move && props.moveType !== MoveType.None && (
            <span className="type-badge-border">
              <span className={combineClasses('type-icon-small ic', `${getKeyWithData(MoveType, props.moveType)?.toLowerCase()}-ic`)}>
                {getKeyWithData(MoveType, props.moveType)}
              </span>
            </span>
          )}
          <span>{splitAndCapitalize(move?.name, '_', ' ')}</span>
        </span>
        <span className={combineClasses(move?.type?.toLowerCase(), 'type-icon-border')}>
          <div style={{ width: 35 }}>
            <img
              style={{ padding: 5, backgroundColor: 'black' }}
              className="sprite-type"
              alt="img-type-pokemon"
              src={APIService.getTypeHqSprite(move?.type)}
            />
          </div>
        </span>
      </LinkToTop>
    </div>
  );
};

export default TypeBadge;
