import React, { Fragment } from 'react';
import { IButtonGroupLeagueComponent } from '../models/component.model';
import { combineClasses, isInclude } from '../../../utils/extension';
import ButtonMui from './ButtonMui';
import { isEqual } from '../../../utils/extension';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { BattleLeagueIconType } from '../../../utils/enums/compute.enum';
import apiService from '../../../services/api.service';
import { EqualMode } from '../../../utils/enums/string.enum';
import { useNavigate } from 'react-router-dom';

const ButtonGroupLeague = (props: IButtonGroupLeagueComponent) => {
  const navigate = useNavigate();

  const renderLeagueName = (name: string | undefined, cp: number) => {
    if (isEqual(name, LeagueBattleType.All, EqualMode.IgnoreCaseSensitive)) {
      return getPokemonBattleLeagueName(cp);
    }
    return name || getPokemonBattleLeagueName(cp);
  };

  const renderLeagueLogo = (logo: string | undefined, cp: number) => {
    if (
      !logo ||
      (logo && isInclude(logo, BattleLeagueIconType.Little)) ||
      isInclude(logo, BattleLeagueIconType.Great) ||
      isInclude(logo, BattleLeagueIconType.Ultra) ||
      isInclude(logo, BattleLeagueIconType.Master)
    ) {
      return getPokemonBattleLeagueIcon(cp);
    }
    return apiService.getAssetPokeGo(logo);
  };

  return (
    <div
      style={{ width: props.width, height: props.height }}
      className={combineClasses(
        'group-selected',
        props.className,
        props.isLoaded && props.isFullWidth ? 'tw-w-full' : ''
      )}
    >
      {props.isLoaded ? (
        <Fragment>
          {props.leagues?.map((value, index) => (
            <div key={index}>
              <ButtonMui
                key={index}
                onClick={() =>
                  props.onClick
                    ? props.onClick(value)
                    : navigate(
                        `/pvp${props.path ? `/${props.path}` : ''}${props.data ? `/${props.data.id}` : ''}/${value}`
                      )
                }
                active={props.value === value}
                sx={{ minHeight: 142 }}
                color="default"
                className="btn-default"
                label={
                  <div className="tw-flex tw-flex-col">
                    <img
                      alt="Image League"
                      title={renderLeagueName(props.data?.name, value)}
                      width={128}
                      height={128}
                      src={renderLeagueLogo(props.data?.logo, value)}
                    />
                    <div>
                      <b>{renderLeagueName(props.data?.name, value)}</b>
                    </div>
                    <span className="tw-text-red-600">CP below {value}</span>
                  </div>
                }
              />
            </div>
          ))}
        </Fragment>
      ) : (
        props.loading
      )}
    </div>
  );
};

export default ButtonGroupLeague;
