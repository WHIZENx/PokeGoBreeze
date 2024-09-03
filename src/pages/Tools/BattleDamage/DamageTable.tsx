import React, { Fragment } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import APIService from '../../../services/API.service';

import { capitalize, combineClasses, splitAndCapitalize } from '../../../util/utils';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import { FORM_SHADOW } from '../../../util/constants';
import { IDamageTableComponent } from '../../models/page.model';
import { ThrowOption } from '../../../core/models/options.model';
import { ILabelDamage, LabelDamage } from '../../../core/models/damage.model';
import { DynamicObj } from '../../../util/models/util.model';

const eff: DynamicObj<ILabelDamage> = {
  0.244140625: LabelDamage.create({
    label: 0.244,
    style: 'super-resistance',
  }),
  0.390625: LabelDamage.create({
    label: 0.391,
    style: 'very-resistance',
  }),
  0.625: LabelDamage.create({
    label: 0.625,
    style: 'resistance',
  }),
  1: LabelDamage.create({
    label: 1,
    style: 'neutral',
  }),
  1.6: LabelDamage.create({
    label: 1.6,
    style: 'weakness',
  }),
  2.5600000000000005: LabelDamage.create({
    label: 2.56,
    style: 'super-weakness',
  }),
};

const DamageTable = (props: IDamageTableComponent) => {
  const globalOptions = useSelector((state: StoreState) => state.store.data?.options);

  return (
    <div className="container">
      <div className="d-flex justify-content-center">
        <table className="table-info table-result">
          <thead />
          <tbody>
            <tr className="text-center">
              <td className="table-sub-header" colSpan={2}>
                Battle Result
              </td>
            </tr>
            <tr>
              <td>Attacker</td>
              <td>
                {props.result.objPoke ? (
                  <Fragment>
                    {props.result.type === 'buddy' && (
                      <img height={20} style={{ marginRight: 8 }} alt="img-buddy" src={APIService.getPokeBuddy()} />
                    )}
                    {props.result.type?.toUpperCase() === FORM_SHADOW && (
                      <img height={20} style={{ marginRight: 8 }} alt="img-shadow" src={APIService.getPokeShadow()} />
                    )}
                    {splitAndCapitalize(props.result.currPoke?.form.name, '-', ' ')}{' '}
                    <span className="d-inline-block caption">(LV. {props.result.currLevel})</span>
                  </Fragment>
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>Target</td>
              <td>
                {props.result.objPoke ? (
                  <Fragment>
                    {props.result.typeObj === 'buddy' && (
                      <img height={20} style={{ marginRight: 8 }} alt="img-buddy" src={APIService.getPokeBuddy()} />
                    )}
                    {props.result.typeObj?.toUpperCase() === FORM_SHADOW && (
                      <img height={20} style={{ marginRight: 8 }} alt="img-shadow" src={APIService.getPokeShadow()} />
                    )}
                    {splitAndCapitalize(props.result.objPoke.form.name, '-', ' ')}{' '}
                    <span className="d-inline-block caption">(LV. {props.result.objLevel})</span>
                  </Fragment>
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>Move name</td>
              <td>{props.result.move ? splitAndCapitalize(props.result.move.name, '_', ' ') : '-'}</td>
            </tr>
            <tr>
              <td>Move damage</td>
              <td>{props.result.move ? props.result.move.pvePower : '-'}</td>
            </tr>
            <tr>
              <td>Stab</td>
              <td>
                {props.result.battleState ? (
                  props.result.battleState.stab ? (
                    <DoneIcon sx={{ color: 'green' }} />
                  ) : (
                    <CloseIcon sx={{ color: 'red' }} />
                  )
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>Weather Boosts</td>
              <td>
                {props.result.battleState ? (
                  props.result.battleState.wb ? (
                    <DoneIcon sx={{ color: 'green' }} />
                  ) : (
                    <CloseIcon sx={{ color: 'red' }} />
                  )
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>Dodge</td>
              <td>
                {props.result.battleState ? (
                  props.result.battleState.dodge ? (
                    <DoneIcon sx={{ color: 'green' }} />
                  ) : (
                    <CloseIcon sx={{ color: 'red' }} />
                  )
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>Battle with Trainer</td>
              <td>
                {props.result.battleState ? (
                  props.result.battleState.trainer ? (
                    <DoneIcon sx={{ color: 'green' }} />
                  ) : (
                    <CloseIcon sx={{ color: 'red' }} />
                  )
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>Pokémon Friendship level</td>
              <td>{props.result.battleState ? props.result.battleState.fLevel : '-'}</td>
            </tr>
            <tr>
              <td>Charge ability</td>
              <td>
                {props.result.battleState
                  ? capitalize(Object.keys(globalOptions?.throwCharge ?? new ThrowOption()).at(props.result.battleState.cLevel ?? 0))
                  : '-'}
              </td>
            </tr>
            <tr>
              <td>Damage Effective</td>
              <td>
                {props.result.battleState ? (
                  <span className={combineClasses(`eff-${eff[props.result.battleState.effective].style}`)}>
                    {`x${eff[props.result.battleState.effective].label}`}
                  </span>
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>
                <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={ATK_LOGO} />
                Damage Taken
              </td>
              <td>{props.result.damage ? <b>{props.result.damage}</b> : '-'}</td>
            </tr>
            <tr>
              <td>
                <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                Damage Reduced
              </td>
              <td>
                {props.result.damage ? (
                  <Fragment>
                    {props.result.damage < (props.result.move?.pvePower ?? 0) ? (
                      <b className="text-success">
                        {((((props.result.move?.pvePower ?? 0) - props.result.damage) * 100) / (props.result.move?.pvePower ?? 0)).toFixed(
                          2
                        )}
                        %
                      </b>
                    ) : (
                      <b className="text-danger">0</b>
                    )}
                  </Fragment>
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>
                <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                HP Object remaining
              </td>
              <td>
                {props.result.hp ? (
                  <b>
                    {Math.floor(props.result.hp - (props.result.damage ?? 0))}
                    {Math.floor(props.result.hp - (props.result.damage ?? 0)) > 0 ? (
                      <span className="caption-small text-success"> (Alive)</span>
                    ) : (
                      <span className="caption-small text-danger"> (Dead)</span>
                    )}
                  </b>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DamageTable;
