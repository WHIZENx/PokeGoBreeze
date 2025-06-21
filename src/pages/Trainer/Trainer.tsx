import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { Form } from 'react-bootstrap';
import { getValueOrDefault, isNotEmpty, toNumber } from '../../utils/extension';
import { getItemSpritePath, splitAndCapitalize } from '../../utils/utils';

import './Trainer.scss';
import { AwardItem } from '../../core/models/trainer.model';

interface TrainerLevelUp {
  levelUps: AwardItem[];
  itemUnlocks?: string[];
}

const Trainer = () => {
  const trainers = useSelector((state: StoreState) => state.store.data.trainers);

  const [level, setLevel] = useState(2);
  const [data, setData] = useState<TrainerLevelUp>();

  useEffect(() => {
    if (isNotEmpty(trainers)) {
      const result = trainers.find((trainer) => trainer.level === level);
      setData({
        levelUps: getValueOrDefault(Array, result?.items),
        itemUnlocks: result?.itemsUnlock,
      });
    }
  }, [trainers, level]);

  return (
    <div className="container p-3">
      <h2 className="title-leagues mb-3">Trainer</h2>
      <hr />
      <div>
        <Form.Select onChange={(e) => setLevel(toNumber(e.target.value))} defaultValue={level}>
          {trainers.map((value, index) => (
            <option key={index} value={value.level}>
              Level {value.level}
            </option>
          ))}
        </Form.Select>
      </div>
      {data && (
        <>
          <p className="title-leagues mt-2">Receive Items</p>
          <div className="d-flex justify-content-center mt-2">
            <div className="trainer-levelup">
              <div className="levelup-container">
                <>
                  {data.levelUps.map((value, index) => (
                    <div className="d-flex justify-content-center flex-column align-items-center" key={index}>
                      <img
                        className="pokemon-sprite-medium w-9"
                        alt="Pokémon Image"
                        title={splitAndCapitalize(value.name.replace('ITEM_', ''), '_', ' ')}
                        src={getItemSpritePath(value.name)}
                      />
                      <span className="caption text-black">
                        {splitAndCapitalize(value.name.replace('ITEM_', ''), '_', ' ')} <b>x{value.amount}</b>
                      </span>
                    </div>
                  ))}
                </>
              </div>
            </div>
          </div>
          {isNotEmpty(data.itemUnlocks) && (
            <>
              <p className="title-leagues mt-2">Receive Items</p>
              <div className="d-flex justify-content-center mt-2">
                <div className="trainer-levelup">
                  <div className="levelup-container justify-content-center">
                    <>
                      {data.itemUnlocks?.map((value, index) => (
                        <div className="d-flex justify-content-center flex-column align-items-center" key={index}>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title={splitAndCapitalize(value.replace('ITEM_', ''), '_', ' ')}
                            src={getItemSpritePath(value)}
                          />
                          <span className="caption text-black">
                            {splitAndCapitalize(value.replace('ITEM_', ''), '_', ' ')}
                          </span>
                        </div>
                      ))}
                    </>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Trainer;
