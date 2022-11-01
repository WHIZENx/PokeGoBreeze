import { useRef, useState, useEffect } from 'react';
import { useSelector, RootStateOrAny } from 'react-redux';
import APIService from '../../../services/API.service';
import { capitalize } from '../../../util/Utils';
import pokemonData from '../../../data/pokemon.json';
import './Types.css';
import CardType from '../../../components/Card/CardType';
import { computeBgType } from '../../../util/Compute';
import { Tabs, Tab } from 'react-bootstrap';

const SearchTypes = () => {
  const data = useSelector((state: RootStateOrAny) => state.store.data);
  const typeList = useRef(Object.keys(data.typeEff));

  const [currentType, setCurrentType]: any = useState(typeList.current[0]);
  const [result, setResult]: any = useState({
    pokemonList: [],
    fastMove: [],
    chargedMove: [],
  });
  const allData = {
    pokemon: Object.values(pokemonData).length - 1,
    fastMoves: data.combat.filter((type: { type_move: string; type: string }) => type.type_move === 'FAST').length,
    chargedMoves: data.combat.filter((type: { type_move: string; type: string }) => type.type_move === 'CHARGE').length,
  };

  const [showType, setShowType] = useState(false);

  useEffect(() => {
    document.title = `${capitalize(currentType)} - Type`;
    setResult({
      pokemonList: Object.values(pokemonData).filter((pokemon: any) => pokemon.types.includes(capitalize(currentType))),
      fastMove: data.combat.filter((type: { type_move: string; type: string }) => type.type_move === 'FAST' && type.type === currentType),
      chargedMove: data.combat.filter(
        (type: { type_move: string; type: string }) => type.type_move === 'CHARGE' && type.type === currentType
      ),
    });
  }, [currentType]);

  const changeType = (value: string) => {
    setShowType(false);
    setCurrentType(value);
  };

  return (
    <div className="container element-top">
      <div className="d-flex justify-content-end">
        <div>
          <h6 className="text-center">
            <b>Select Type</b>
          </h6>
          <div
            className="card-input"
            style={{ marginBottom: 15 }}
            tabIndex={0}
            onClick={() => setShowType(true)}
            onBlur={() => setShowType(false)}
          >
            <div className="card-select">
              <CardType value={capitalize(currentType)} />
            </div>
            {showType && (
              <div className="result-type">
                <ul>
                  {Object.keys(data.typeEff)
                    .filter((value) => value !== currentType)
                    .map((value: any, index: React.Key) => (
                      <li className="container card-pokemon" key={index} onMouseDown={() => changeType(value)}>
                        <CardType value={capitalize(value)} />
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-4 element-top">
          <div
            className={'d-flex flex-column align-items-center type-info-container ' + currentType.toLowerCase() + '-border'}
            style={{ background: computeBgType(currentType, false, false, 0.7) }}
          >
            <div className="filter-shadow" style={{ width: 128 }}>
              <img
                style={{ padding: 15, backgroundColor: 'black', borderRadius: '50%' }}
                className="sprite-type-large"
                alt="img-type-pokemon"
                src={APIService.getTypeHqSprite(capitalize(currentType))}
              />
            </div>
            <span
              style={{ width: 'max-content' }}
              className={currentType.toLowerCase() + ' type-select-bg d-flex align-items-center filter-shadow element-top'}
            >
              <div style={{ display: 'contents', width: 16 }}>
                <img
                  className="pokemon-sprite-small sprite-type-select filter-shadow"
                  alt="img-type-pokemon"
                  src={APIService.getTypeHqSprite(capitalize(currentType))}
                />
              </div>
              <span className="filter-shadow">{capitalize(currentType)}</span>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('pokeball_sprite')} />{' '}
              <b>{`Pokemon: ${result.pokemonList.length} (${Math.round((result.pokemonList.length * 100) / allData.pokemon)}%)`}</b>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('Item_1201')} />{' '}
              <b>{`Fast Moves: ${result.fastMove.length} (${Math.round((result.fastMove.length * 100) / allData.fastMoves)}%)`}</b>
            </span>
            <span className="element-top text-white text-shadow">
              <img height={36} src={APIService.getItemSprite('Item_1202')} />{' '}
              <b>{`Charge Moves: ${result.chargedMove.length} (${Math.round(
                (result.chargedMove.length * 100) / allData.chargedMoves
              )}%)`}</b>
            </span>
          </div>
        </div>
        <div className="col-lg-8 element-top">
          <Tabs defaultActiveKey="pokemonLegacyList" className="lg-2">
            <Tab eventKey="pokemonLegacyList" title="Pokemon Legacy Type List" />
            <Tab eventKey="pokemonMultiList" title="Pokemon Multi Types List" />
            <Tab eventKey="fastMovesList" title="Fast Move List" />
            <Tab eventKey="chargesMovesList" title="Charged Move List" />
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SearchTypes;
