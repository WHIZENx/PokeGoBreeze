import React from 'react';
import { IIconTypeComponent } from '../../../models/component.model';
import APIService from '../../../../services/api.service';
import { EqualMode } from '../../../../utils/enums/string.enum';
import { combineClasses, isEqual } from '../../../../utils/extension';
import { getLocalTypeIcon } from '../../../../assets/local-ui-assets';

const IconType = (props: IIconTypeComponent) => {
  return (
    <img
      alt={props.alt}
      title={props.title}
      className={combineClasses(props.isBorder ? 'type-border-white' : '', props.className)}
      style={props.style}
      width={props.width}
      height={props.height}
      src={
        !props.type || isEqual(props.type, 'unknown', EqualMode.IgnoreCaseSensitive)
          ? APIService.getPokeSprite()
          : (getLocalTypeIcon(props.type) ?? APIService.getPokeSprite())
      }
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = APIService.getPokeSprite();
      }}
    />
  );
};

export default IconType;
