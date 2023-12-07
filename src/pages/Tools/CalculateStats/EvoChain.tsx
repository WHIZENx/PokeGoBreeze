import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { splitAndCapitalize } from '../../../util/Utils';
import APIService from '../../../services/API.service';

const EvoChain = (props: { url: string; id: number }) => {
  const [arrEvoList, setArrEvoList]: any = useState([]);

  const getEvoChain = useCallback((data: any) => {
    if (data.length === 0) {
      return false;
    }
    setArrEvoList((oldArr: any) => [
      ...oldArr,
      data.map((item: { species: { name: string; url: string }; is_baby: boolean }) => {
        return { name: item.species.name, id: item.species.url.split('/').at(6), baby: item.is_baby };
      }),
    ]);
    return data.map((item: { evolves_to: string }) => getEvoChain(item.evolves_to));
  }, []);

  useEffect(() => {
    const fetchEvolution = async () => {
      setArrEvoList([]);
      const dataEvo = await APIService.getFetchUrl(props.url);
      getEvoChain([dataEvo.data.chain]);
    };
    if (props.url) {
      fetchEvolution();
    }
  }, [getEvoChain, props.url]);

  return (
    <Fragment>
      <tr className="text-center">
        <td className="table-sub-header" colSpan={2}>
          Evolution Chains
        </td>
      </tr>
      {arrEvoList.map((value: { id: string; name: string }[], index: React.Key) => (
        <Fragment key={index}>
          {value.map((value, index: React.Key) => (
            <Fragment key={index}>
              {parseInt(value.id) !== props.id && (
                <Fragment>
                  <tr className="text-center">
                    <td className="img-table-evo" colSpan={2}>
                      <img width="96" height="96" alt="img-pokemon" src={APIService.getPokeSprite(parseInt(value.id))} />
                    </td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td>{splitAndCapitalize(value.name, '-', ' ')}</td>
                  </tr>
                  <tr>
                    <td>CP</td>
                  </tr>
                </Fragment>
              )}
            </Fragment>
          ))}
        </Fragment>
      ))}
    </Fragment>
  );
};

export default EvoChain;
