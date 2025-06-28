import React, { Fragment } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import APIService from '../../../services/api.service';

import { capitalize, getKeyWithData, splitAndCapitalize } from '../../../utils/utils';
import { IDamageTableComponent } from '../../models/page.model';
import { LabelDamage } from '../../../core/models/damage.model';
import { combineClasses, getValueOrDefault, toFloat, toFloatWithPadding, toNumber } from '../../../utils/extension';
import { PokemonType } from '../../../enums/type.enum';
import { EffectiveType } from '../../../components/Effective/enums/type-effective.enum';
import { getThrowCharge } from '../../../utils/helpers/options-context.helpers';

const DamageTable = (props: IDamageTableComponent) => {
  const setLabelDamage = (amount: EffectiveType) =>
    LabelDamage.create({
      label: toFloat(amount, 3),
      style: getValueOrDefault(
        String,
        splitAndCapitalize(getKeyWithData(EffectiveType, amount), /(?=[A-Z])/, '-').toLowerCase()
      ),
    });

  const getLabelDamage = (valueEffective: number) => {
    if (valueEffective >= EffectiveType.VeryWeakness) {
      return setLabelDamage(EffectiveType.VeryWeakness);
    } else if (valueEffective >= EffectiveType.Weakness) {
      return setLabelDamage(EffectiveType.Weakness);
    } else if (valueEffective >= EffectiveType.Neutral) {
      return setLabelDamage(EffectiveType.Neutral);
    } else if (valueEffective >= EffectiveType.Resistance) {
      return setLabelDamage(EffectiveType.Resistance);
    } else if (valueEffective >= EffectiveType.VeryResistance) {
      return setLabelDamage(EffectiveType.VeryResistance);
    } else if (valueEffective >= EffectiveType.SuperResistance) {
      return setLabelDamage(EffectiveType.SuperResistance);
    }
    return new LabelDamage();
  };

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
                    {props.result.type === PokemonType.Buddy && (
                      <img height={20} className="me-2" alt="Image Buddy" src={APIService.getPokeBuddy()} />
                    )}
                    {props.result.type === PokemonType.Shadow && (
                      <img height={20} className="me-2" alt="Image Shadow" src={APIService.getPokeShadow()} />
                    )}
                    {`${splitAndCapitalize(props.result.currPoke?.form?.name, '-', ' ')} `}
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
                    {props.result.typeObj === PokemonType.Buddy && (
                      <img height={20} className="me-2" alt="Image Buddy" src={APIService.getPokeBuddy()} />
                    )}
                    {props.result.typeObj === PokemonType.Shadow && (
                      <img height={20} className="me-2" alt="Image Shadow" src={APIService.getPokeShadow()} />
                    )}
                    {`${splitAndCapitalize(props.result.objPoke.form?.name, '-', ' ')} `}
                    <span className="d-inline-block caption">(LV. {props.result.objLevel})</span>
                  </Fragment>
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>Move name</td>
              <td>{splitAndCapitalize(props.result.move?.name, '_', ' ', '-')}</td>
            </tr>
            <tr>
              <td>Move damage</td>
              <td>{props.result.move ? props.result.move.pvePower : '-'}</td>
            </tr>
            <tr>
              <td>Stab</td>
              <td>
                {props.result.battleState ? (
                  props.result.battleState.isStab ? (
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
                  props.result.battleState.isWb ? (
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
                  props.result.battleState.isDodge ? (
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
                  props.result.battleState.isTrainer ? (
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
              <td>{props.result.battleState ? props.result.battleState.friendshipLevel : '-'}</td>
            </tr>
            <tr>
              <td>Charge ability</td>
              <td>
                {props.result.battleState
                  ? capitalize(Object.keys(getThrowCharge()).at(toNumber(props.result.battleState.throwLevel)))
                  : '-'}
              </td>
            </tr>
            <tr>
              <td>Damage Effective</td>
              <td>
                {props.result.battleState ? (
                  <span className={combineClasses(`eff-${getLabelDamage(props.result.battleState.effective).style}`)}>
                    {`x${getLabelDamage(props.result.battleState.effective).label}`}
                  </span>
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>
                <img className="me-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                Damage Taken
              </td>
              <td>{props.result.damage ? <b>{props.result.damage}</b> : '-'}</td>
            </tr>
            <tr>
              <td>
                <img className="me-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                Damage Reduced
              </td>
              <td>
                {props.result.damage ? (
                  <Fragment>
                    {props.result.damage < toNumber(props.result.move?.pvePower) ? (
                      <b className="text-success">
                        {toFloatWithPadding(
                          ((toNumber(props.result.move?.pvePower) - props.result.damage) * 100) /
                            toNumber(props.result.move?.pvePower, 1),
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
                <img className="me-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                HP Object remaining
              </td>
              <td>
                {props.result.hp ? (
                  <b>
                    {Math.floor(props.result.hp - toNumber(props.result.damage))}
                    {Math.floor(props.result.hp - toNumber(props.result.damage)) > 0 ? (
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
