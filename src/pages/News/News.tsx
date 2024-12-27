import React from 'react';

import './News.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { Accordion } from 'react-bootstrap';
import { generateParamForm, getKeyWithData, getLureItemType, getTime, splitAndCapitalize } from '../../util/utils';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty, isNotNumber, toNumber } from '../../util/extension';
import APIService from '../../services/API.service';
import { DateEvent, ItemName, TitleName } from './enums/item-type.enum';
import { ITicketReward, RewardPokemon } from '../../core/models/information';
import { TicketRewardType } from '../../core/enums/information.enum';
import { FORM_NORMAL } from '../../util/constants';
import { PokemonModelComponent } from '../../components/Info/Assets/models/pokemon-model.model';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { Link } from 'react-router-dom';

const News = () => {
  useChangeTitle('News');
  const information = useSelector((state: StoreState) => state.store.data.information);
  const assets = useSelector((state: StoreState) => state.store.data.assets);

  const getItemTitle = (reward: ITicketReward) => {
    let result: string | undefined;
    if (reward.type === TicketRewardType.Item && toNumber(reward.item?.item) === 0) {
      result = reward?.item?.item.replace('ITEM_', '').replace('FREE_', '');
    } else if (reward.type === TicketRewardType.Pokemon) {
      result = `#${reward.pokemon?.id}_${reward.pokemon?.pokemonId}${
        reward.pokemon?.form && !isEqual(reward.pokemon?.form, FORM_NORMAL) ? `_${reward.pokemon?.form}` : ''
      }`.replace(/_MR_/i, '_MR._');
    } else if (reward.type === TicketRewardType.PokeCoin) {
      result = getKeyWithData(TicketRewardType, TicketRewardType.PokeCoin)
        ?.split(/(?=[A-Z])/)
        .join('_');
    } else if (reward.type === TicketRewardType.Stardust) {
      result = getKeyWithData(TicketRewardType, TicketRewardType.Stardust);
    } else if (reward.type === TicketRewardType.Exp) {
      result = TitleName.Exp;
    } else if (reward.type === TicketRewardType.Avatar) {
      result = reward.avatarTemplateId;
      if (!result && reward.neutralAvatarItemTemplate) {
        result = getValueOrDefault(
          String,
          reward.neutralAvatarItemTemplate.neutralAvatarItemTemplateString1,
          reward.neutralAvatarItemTemplate.neutralAvatarItemTemplateString2
        )
          .replaceAll('-', '_')
          .replace('N_AVATAR_n_', '')
          .replace('N_DISPLAY_n_', '')
          .replace(/_\d{1}$/, '');
      }
    }
    return splitAndCapitalize(result, '_', ' ');
  };

  const getImageList = (pokemon: RewardPokemon | undefined) => {
    const model = assets.find((item) => item.id === pokemon?.id);
    const result = [...new Set(model?.image.map((item) => item.form))].map((value) => new PokemonModelComponent(value, model?.image));
    if (pokemon?.costume && toNumber(pokemon.costume) === 0) {
      const form = pokemon?.costume;
      const imageList = result.find((poke) => isEqual(poke.form, form));
      const image = imageList?.image.find((img) => isEqual(img.form, form))?.default;
      if (image) {
        return APIService.getPokemonModel(image);
      }
    }
    const imageList = result.find((poke) => (pokemon?.form ? isEqual(poke.form, pokemon.form) : isEqual(poke.form, FORM_NORMAL)));
    const image = imageList?.image.find((img) =>
      pokemon?.form ? isEqual(img.form, pokemon.form) : isEqual(img.form, FORM_NORMAL)
    )?.default;
    if (image) {
      return APIService.getPokemonModel(image);
    }
    return APIService.getPokeFullSprite(pokemon?.id);
  };

  const getDateEvent = (dateStartString: string | undefined, dateEndString: string | undefined) => {
    const currentDate = new Date();
    let date = currentDate;
    if (dateStartString) {
      if (!isNotNumber(dateStartString)) {
        date = new Date(toNumber(dateStartString) * 1000);
      } else {
        date = new Date(dateStartString);
      }
    }

    date = currentDate;
    if (dateEndString) {
      if (!isNotNumber(dateEndString)) {
        date = new Date(toNumber(dateEndString) * 1000);
      } else {
        date = new Date(dateEndString);
      }
    }
    return currentDate > date ? DateEvent.End : DateEvent.Progress;
  };

  const getItemSprite = (value: ITicketReward) => {
    if (
      (value.type === TicketRewardType.Item && !isNotNumber(value.item?.item)) ||
      value.type === TicketRewardType.Exp ||
      value.type === TicketRewardType.Avatar
    ) {
      return APIService.getPokeSprite(0);
    } else if (value.item?.item === ItemName.RaidTicket) {
      return APIService.getItemSprite('Item_1401');
    } else if (value.item?.item === ItemName.RareCandy) {
      return APIService.getItemSprite('Item_1301');
    } else if (value.item?.item === ItemName.XlRareCandy) {
      return APIService.getItemSprite('RareXLCandy_PSD');
    } else if (value.item?.item === ItemName.MasterBall) {
      return APIService.getItemSprite('masterball_sprite');
    } else if (value.item?.item === ItemName.GoldenPinapBerry) {
      return APIService.getItemSprite('Item_0705');
    } else if (value.item?.item === ItemName.LuckyEgg) {
      return APIService.getItemSprite('luckyegg');
    } else if (isInclude(value.item?.item, ItemName.Troy)) {
      const itemLure = getLureItemType(value.item?.item);
      return APIService.getItemTroy(itemLure);
    } else if (value.item?.item === ItemName.PaidRaidTicket) {
      return APIService.getItemSprite('Item_1402');
    } else if (value.item?.item === ItemName.StarPice) {
      return APIService.getItemSprite('starpiece');
    } else if (value.item?.item === ItemName.Poffin) {
      return APIService.getItemSprite('Item_0704');
    } else if (value.item?.item === ItemName.EliteSpecialAttack) {
      return APIService.getItemSprite('Item_1204');
    } else if (value.item?.item === ItemName.IncubatorBasic) {
      return APIService.getItemSprite('EggIncubatorIAP_Empty');
    } else if (value.type === TicketRewardType.Pokemon) {
      return getImageList(value.pokemon);
    } else if (value.type === TicketRewardType.Stardust) {
      return APIService.getItemSprite('stardust_painted');
    } else if (value.type === TicketRewardType.PokeCoin) {
      return APIService.getItemSprite('Item_COIN_01');
    }
    return APIService.getPokeSprite(0);
  };

  const renderReward = (value: ITicketReward) => (
    <div>
      <div className="w-100 h-100">
        <img style={{ width: 64 }} className="pokemon-sprite-medium" src={getItemSprite(value)} />
      </div>
      <p className="element-top" style={{ fontWeight: 'bold' }}>
        <span className={value.type === TicketRewardType.Pokemon ? 'select-evo' : ''}>{getItemTitle(value)}</span>
        {value.type === TicketRewardType.Item && ` x${toNumber(value.item?.amount, 1)}`}
        {value.type === TicketRewardType.Stardust && ` x${toNumber(value.stardust)}`}
        {value.type === TicketRewardType.Exp && ` x${toNumber(value.exp)}`}
        {value.type === TicketRewardType.PokeCoin && ` x${toNumber(value.pokeCoin)}`}
      </p>
    </div>
  );

  const reload = (element: JSX.Element) => {
    if (information.isLoaded) {
      return element;
    }
    return (
      <div className="w-100 h-100 counter-none" style={{ verticalAlign: 'top' }}>
        <div className="text-origin text-center">
          <div className="ph-item" style={{ backgroundColor: 'transparent' }}>
            <div className="ph-col-12" style={{ padding: 0, margin: 0, gap: 20 }}>
              {[...Array(3).keys()].map((_, index) => (
                <div key={index} className="ph-row">
                  <div className="ph-picture" style={{ width: '100%', height: 256 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="info-main-bg">
      <div className="container info-main-container element-top">
        <h1 className="text-center" style={{ textDecoration: 'underline' }}>
          News
        </h1>
        {reload(
          <>
            {information.data
              .filter((info) => info.giftAble)
              .map((value, index) => (
                <div key={index}>
                  <div className="position-relative info-container">
                    <img className="info-background" src={value.backgroundImgUrl} />
                    <img className="info-banner-img" src={value.bannerUrl} />
                  </div>
                  <Accordion>
                    <Accordion.Item key={index} eventKey={index.toString()}>
                      <Accordion.Header>
                        <div className="w-100 d-flex justify-content-between" style={{ marginRight: 15, columnGap: 15 }}>
                          <div className="d-flex align-items-center flex-start" style={{ columnGap: 10 }}>
                            {value.titleImgUrl && <img alt="img-league" height={50} src={value.titleImgUrl} />}
                            <b>{value.title}</b>
                          </div>
                          <div className="d-flex align-items-center flex-end">
                            <div
                              className={
                                getDateEvent(value.startTime, value.endTime) === DateEvent.End
                                  ? 'info-event-ending'
                                  : DateEvent.Progress
                                  ? 'info-event-progress'
                                  : 'info-event-future'
                              }
                              style={{ padding: 6, borderRadius: 4, fontSize: 14 }}
                            >
                              <b>{getDateEvent(value.startTime, value.endTime)}</b>
                            </div>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="sub-body">
                          {value.desc && <p>{value.desc}</p>}
                          <div className="d-flex justify-content-center">
                            <h5>
                              Start time: {getTime(value.startTime)} | End time: {getTime(value.endTime)}
                            </h5>
                          </div>
                          {isNotEmpty(value.rewards) && (
                            <>
                              <h6 style={{ textDecoration: 'underline' }}>Rewards</h6>
                              <div className="w-100 text-center d-inline-block align-middle">
                                {value.rewards.map((value, i) => (
                                  <div key={i} className="d-inline-block" style={{ margin: '0 10px' }}>
                                    {value.type === TicketRewardType.Pokemon && value.pokemon ? (
                                      <Link
                                        className="select-evo"
                                        to={`/pokemon/${value.pokemon.id}${generateParamForm(value.pokemon.form)}`}
                                      >
                                        {renderReward(value)}
                                      </Link>
                                    ) : (
                                      renderReward(value)
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {value.detailsLink && <p className="element-top" dangerouslySetInnerHTML={{ __html: value.detailsLink }} />}
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default News;
