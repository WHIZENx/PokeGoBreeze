import React, { useEffect, useState } from 'react';

import './News.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { Accordion } from 'react-bootstrap';
import {
  generateParamForm,
  getItemSpritePath,
  getKeyWithData,
  getTime,
  getValidPokemonImgPath,
  splitAndCapitalize,
} from '../../util/utils';
import {
  combineClasses,
  getValueOrDefault,
  isEqual,
  isInclude,
  isNotEmpty,
  isNumber,
  toNumber,
  UniqValueInArray,
} from '../../util/extension';
import APIService from '../../services/API.service';
import { DateEvent, TitleName } from './enums/item-type.enum';
import { IInformation, ITicketReward, RewardPokemon } from '../../core/models/information';
import { ItemTicketRewardType, TicketRewardType } from '../../core/enums/information.enum';
import { FORM_NORMAL } from '../../util/constants';
import { PokemonModelComponent } from '../../components/Info/Assets/models/pokemon-model.model';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { INewsModel, IRewardNews, NewsModel, RewardNews } from './models/news.model';
import { LinkToTop } from '../../util/hooks/LinkToTop';
import Candy from '../../components/Sprites/Candy/Candy';

const News = () => {
  useChangeTitle('News');
  const information = useSelector((state: StoreState) => state.store.data.information);
  const assets = useSelector((state: StoreState) => state.store.data.assets);

  const [data, setData] = useState<INewsModel[]>([]);

  useEffect(() => {
    if (information.isLoaded && !isNotEmpty(data)) {
      const result = mapDataInformation(information.data);
      setData(result);
    }
  }, [information, data]);

  const mapDataInformation = (information: IInformation[]) =>
    information.map((info) =>
      NewsModel.create({
        ...info,
        startTime: getTime(info.startTime),
        endTime: getTime(info.endTime),
        eventType: getDateEvent(info.startTime, info.endTime),
        rewardNews: info.rewards?.map((reward) =>
          RewardNews.create({
            ...reward,
            imageSrc: getItemSprite(reward),
            title: getItemTitle(reward),
            count: getItemCount(reward),
          })
        ),
      })
    );

  const getItemTitle = (reward: ITicketReward | undefined) => {
    let result: string | undefined;
    if (reward?.type === TicketRewardType.Item && toNumber(reward.item?.item) === 0) {
      result = reward?.item?.item.replace('ITEM_', '').replace('FREE_', '');
    } else if (reward?.type === TicketRewardType.Pokemon) {
      result = `#${reward.pokemon?.id}_${reward.pokemon?.pokemonId}${
        reward.pokemon?.form && !isEqual(reward.pokemon?.form, FORM_NORMAL) ? `_${reward.pokemon?.form}` : ''
      }`.replace(/_MR_/i, '_MR._');
    } else if (reward?.type === TicketRewardType.PokeCoin) {
      result = getKeyWithData(TicketRewardType, TicketRewardType.PokeCoin)
        ?.split(/(?=[A-Z])/)
        .join('_');
    } else if (reward?.type === TicketRewardType.Stardust) {
      result = getKeyWithData(TicketRewardType, TicketRewardType.Stardust);
    } else if (reward?.type === TicketRewardType.Exp) {
      result = TitleName.Exp;
    } else if (reward?.type === TicketRewardType.Avatar) {
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
    } else if (reward?.type === TicketRewardType.Candy) {
      result = `#${reward.candy?.id}_${reward.candy?.pokemonId}`.replace(/_MR_/i, '_MR._');
    }
    return splitAndCapitalize(result, '_', ' ');
  };

  const getImageList = (pokemon: RewardPokemon | undefined) => {
    const model = assets.find((item) => item.id === pokemon?.id);
    const result = UniqValueInArray(model?.image.map((item) => item.form)).map(
      (value) => new PokemonModelComponent(value, model?.image)
    );
    if (pokemon?.costume && toNumber(pokemon.costume) === 0) {
      const form = pokemon?.costume;
      const imageList = result.find((poke) => isEqual(poke.form, form));
      const image = imageList?.image.find((img) => isEqual(img.form, form))?.default;
      if (image) {
        return image;
      }
    }
    const imageList = result.find((poke) =>
      pokemon?.form ? isEqual(poke.form, pokemon.form) : isEqual(poke.form, FORM_NORMAL)
    );
    const image = imageList?.image.find((img) =>
      pokemon?.form ? isEqual(img.form, pokemon.form) : isEqual(img.form, FORM_NORMAL)
    )?.default;
    if (image) {
      return image;
    }
    return;
  };

  const getDateEvent = (dateStartString: string | undefined, dateEndString: string | undefined) => {
    const currentDate = new Date();
    let date = currentDate;
    if (dateStartString) {
      if (isNumber(dateStartString)) {
        date = new Date(toNumber(dateStartString) * 1000);
      } else {
        date = new Date(dateStartString);
      }
    }

    date = currentDate;
    if (dateEndString) {
      if (isNumber(dateEndString)) {
        date = new Date(toNumber(dateEndString) * 1000);
      } else {
        date = new Date(dateEndString);
      }
    }
    return currentDate > date ? DateEvent.End : DateEvent.Progressing;
  };

  const getItemSprite = (value: ITicketReward) => {
    if (value.type === TicketRewardType.Pokemon) {
      return getImageList(value.pokemon);
    } else if (value.type === TicketRewardType.Stardust) {
      return APIService.getItemSprite('stardust_painted');
    } else if (value.type === TicketRewardType.PokeCoin) {
      return APIService.getItemSprite('Item_COIN_01');
    } else if (value.type === TicketRewardType.Item && value.item?.item) {
      return getItemSpritePath(value.item.item);
    }
    return APIService.getPokeSprite();
  };

  const getItemCount = (value: ITicketReward) => {
    switch (value.type) {
      case TicketRewardType.Item:
        return toNumber(value.item?.amount, 1);
      case TicketRewardType.Stardust:
        return toNumber(value.stardust);
      case TicketRewardType.Exp:
        return toNumber(value.exp);
      case TicketRewardType.PokeCoin:
        return toNumber(value.pokeCoin);
      case TicketRewardType.Candy:
        return toNumber(value.candy?.amount, 1);
      default:
        return 0;
    }
  };

  const renderReward = (value: IRewardNews) => (
    <div>
      <div className="w-100 h-100">
        {value.type === TicketRewardType.Candy ? (
          <div className="d-flex w-100 justify-content-center">
            <Candy id={value.candy?.id} size={48} />
          </div>
        ) : (
          <img
            className="pokemon-sprite-medium w-9"
            alt="pokemon-sprite"
            src={
              value.type === TicketRewardType.Pokemon
                ? APIService.getPokemonModel(value.imageSrc, value.pokemon?.id)
                : value.imageSrc
            }
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, value.pokemon?.id, value.imageSrc);
            }}
          />
        )}
      </div>
      <p className="mt-2" style={{ fontWeight: 'bold' }}>
        <span className={value.type === TicketRewardType.Pokemon ? 'select-evo' : ''}>{value.title}</span>
        {value.count > 0 && ` x${value.count}`}
      </p>
    </div>
  );

  const reload = (element: JSX.Element) => {
    if (information.isLoaded) {
      return element;
    }
    return (
      <div className="w-100 h-100 counter-none v-align-top">
        <div className="text-origin text-center">
          <div className="ph-item bg-transparent">
            <div className="ph-col-12 m-0 p-0 gap-3">
              {[...Array(3).keys()].map((_, index) => (
                <div key={index} className="ph-row">
                  <div className="ph-picture w-100" style={{ height: 256 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mb-3">
      <div className="info-main-container pb-3 mt-2">
        <h1 className="text-center text-decoration-underline">News</h1>
        {reload(
          <div className="w-100 h-100" style={{ overflow: isNotEmpty(data) ? 'auto' : 'hidden' }}>
            {data
              .filter((info) => info.giftAble || isInclude(info.id, ItemTicketRewardType.BattlePass))
              .map((value, index) => (
                <div key={index}>
                  <div className="position-relative info-container">
                    <img alt="Info Background" className="info-background" src={value.backgroundImgUrl} />
                    <img alt="Info Banner" className="info-banner-img" src={value.bannerUrl} />
                  </div>
                  <Accordion>
                    <Accordion.Item key={index} eventKey={index.toString()}>
                      <Accordion.Header>
                        <div className="w-100 d-flex justify-content-between me-3 column-gap-3">
                          <div className="d-flex align-items-center flex-start column-gap-2">
                            {value.titleImgUrl && <img alt="Image League" height={50} src={value.titleImgUrl} />}
                            <b>{value.title}</b>
                          </div>
                          <div className="d-flex align-items-center flex-end">
                            <div
                              className={combineClasses(
                                'p-1 rounded-1',
                                value.eventType === DateEvent.End
                                  ? 'info-event-ending'
                                  : DateEvent.Progressing
                                  ? 'info-event-progress'
                                  : 'info-event-future'
                              )}
                              style={{ fontSize: 14 }}
                            >
                              <b>{getKeyWithData(DateEvent, value.eventType)}</b>
                            </div>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="sub-body">
                          {value.desc && <p>{value.desc}</p>}
                          <div className="d-flex justify-content-center">
                            <h5>
                              Start time: {value.startTime} | End time: {value.endTime}
                            </h5>
                          </div>
                          {isNotEmpty(value.rewardNews) && (
                            <>
                              <h6 className="text-decoration-underline">Rewards</h6>
                              <div className="w-100 text-center d-inline-block align-middle">
                                {value.rewardNews.map((value, i) => (
                                  <div key={i} className="d-inline-block mx-2">
                                    {value.type === TicketRewardType.Pokemon && value.pokemon ? (
                                      <LinkToTop
                                        className="select-evo"
                                        to={`/pokemon/${value.pokemon.id}${generateParamForm(value.pokemon.form)}`}
                                      >
                                        {renderReward(value)}
                                      </LinkToTop>
                                    ) : (
                                      renderReward(value)
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {value.detailsLink && (
                            <p className="mt-2" dangerouslySetInnerHTML={{ __html: value.detailsLink }} />
                          )}
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
