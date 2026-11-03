import React, { Fragment } from 'react';
import { IButtonGroupLeagueComponent } from '../models/component.model';
import { combineClasses, isInclude } from '../../../utils/extension';
import ButtonMui from './ButtonMui';
import { isEqual } from '../../../utils/extension';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { BattleLeagueCPType, BattleLeagueIconType } from '../../../utils/enums/compute.enum';
import apiService from '../../../services/api.service';
import { EqualMode } from '../../../utils/enums/string.enum';
import { useNavigateToTop } from '../../Link/LinkToTop';

const ButtonGroupLeague = (props: IButtonGroupLeagueComponent) => {
  const navigateToTop = useNavigateToTop();
  const leagueGroups = props.groups?.length
    ? props.groups.map((data) => ({ data, leagues: data.cp }))
    : [{ data: props.data, leagues: props.leagues }];

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

  const renderCpLimit = (cp: BattleLeagueCPType) =>
    cp === BattleLeagueCPType.Master || cp === BattleLeagueCPType.InsMaster
      ? 'No CP limit'
      : `CP ${cp.toLocaleString()} or lower`;

  return (
    <div
      style={{ width: props.width, height: props.height }}
      className={combineClasses(
        'tw-flex tw-flex-nowrap tw-gap-x-2.5 tw-overflow-x-auto tw-whitespace-nowrap tw-m-2.5',
        props.className,
        props.isLoaded && props.isFullWidth ? 'tw-w-full' : ''
      )}
    >
      {props.isLoaded ? (
        <Fragment>
          {leagueGroups.flatMap(
            (group) =>
              group.leagues?.map((value, index) => (
                <div key={`${group.data?.id ?? 'league'}-${value}-${index}`}>
                  <ButtonMui
                    onClick={() =>
                      props.onClick
                        ? props.onClick(value)
                        : navigateToTop(
                            `/pvp${props.path ? `/${props.path}` : ''}${group.data ? `/${group.data.id}` : ''}/${value}`
                          )
                    }
                    data-testid="pvp-league-card"
                    data-pvp-card-path={props.path ?? 'home'}
                    data-pvp-card-series={group.data?.id}
                    data-pvp-card-cp={value}
                    active={props.value === value}
                    color="default"
                    className="btn-default !tw-min-h-selection-button"
                    label={
                      <div className="tw-flex tw-flex-col">
                        <img
                          className="tw-mx-auto"
                          alt="Image League"
                          title={renderLeagueName(group.data?.name, value)}
                          width={128}
                          height={128}
                          src={renderLeagueLogo(group.data?.logo, value)}
                        />
                        <div>
                          <b>{renderLeagueName(group.data?.name, value)}</b>
                        </div>
                        <span className="tw-text-error">{renderCpLimit(value)}</span>
                      </div>
                    }
                  />
                </div>
              )) ?? []
          )}
        </Fragment>
      ) : (
        props.loading
      )}
    </div>
  );
};

export default ButtonGroupLeague;
