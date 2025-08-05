import React, { useEffect, useState } from 'react';
import APIService from '../../../services/api.service';
import { getKeyWithData, splitAndCapitalize } from '../../../utils/utils';

import './TypeBadge.scss';
import { ICombat } from '../../../core/models/combat.model';
import { ITypeBadgeComponent } from '../../models/component.model';
import { combineClasses, getValueOrDefault } from '../../../utils/extension';
import { MoveType } from '../../../enums/type.enum';
import { LinkToTop } from '../../Link/LinkToTop';
import useCombats from '../../../composables/useCombats';

const TypeBadge = (props: ITypeBadgeComponent) => {
  const { findMoveByName } = useCombats();

  const [move, setMove] = useState<ICombat>();
  useEffect(() => {
    if (props.move?.name) {
      setMove(findMoveByName(props.move?.name));
    }
  }, [findMoveByName, props.move?.name]);

  return (
    <div className={combineClasses('type-badge-container', props.isGrow ? 'filter-shadow' : '')} style={props.style}>
      <span
        className="caption text-type-border"
        style={{
          color: getValueOrDefault(String, props.color, props.isGrow ? 'white' : 'var(--text-primary)'),
        }}
      >
        {props.title}
      </span>
      <LinkToTop to={`/move/${move?.id}`} className="tw-flex tw-items-center tw-relative tw-w-fit">
        <span className={combineClasses(move?.type?.toLowerCase(), 'type-border tw-relative')}>
          {move && props.moveType !== MoveType.None && (
            <span className="type-badge-border">
              <span
                className={combineClasses(
                  'type-icon-small ic',
                  `${getKeyWithData(MoveType, props.moveType)?.toLowerCase()}-ic`
                )}
              >
                {getKeyWithData(MoveType, props.moveType)}
              </span>
            </span>
          )}
          <span>{splitAndCapitalize(move?.name, '_', ' ')}</span>
        </span>
        <span className={combineClasses(move?.type?.toLowerCase(), 'type-icon-border')}>
          <div style={{ width: 35 }}>
            <img
              className="sprite-type tw-p-1 bg-black"
              alt="Pokémon GO Type Logo"
              src={APIService.getTypeHqSprite(move?.type)}
            />
          </div>
        </span>
      </LinkToTop>
    </div>
  );
};

export default TypeBadge;
