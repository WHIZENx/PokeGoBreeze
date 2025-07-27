import React, { useEffect, useState } from 'react';
import { getValueOrDefault, isNotEmpty } from '../../utils/extension';
import { getItemSpritePath, splitAndCapitalize } from '../../utils/utils';

import './Trainer.scss';
import { AwardItem } from '../../core/models/trainer.model';
import useDataStore from '../../composables/useDataStore';
import SelectMui from '../../components/Commons/Selects/SelectMui';

interface TrainerLevelUp {
  levelUps: AwardItem[];
  itemUnlocks?: string[];
}

const Trainer = () => {
  const { trainersData } = useDataStore();

  const [level, setLevel] = useState(2);
  const [data, setData] = useState<TrainerLevelUp>();

  useEffect(() => {
    if (isNotEmpty(trainersData)) {
      const result = trainersData.find((trainer) => trainer.level === level);
      setData({
        levelUps: getValueOrDefault(Array, result?.items),
        itemUnlocks: result?.itemsUnlock,
      });
    }
  }, [trainersData, level]);

  return (
    <div className="container p-3">
      <h2 className="title-leagues mb-3">Trainer</h2>
      <hr />
      <div>
        <SelectMui
          formSx={{ width: 200 }}
          value={level}
          onChangeSelect={(value) => setLevel(value)}
          menuItems={trainersData.map((value) => ({
            value: value.level,
            label: `Level ${value.level}`,
          }))}
        />
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
