import React, { Fragment, useEffect, useRef, useState } from 'react';
import HexagonIcon from '@mui/icons-material/Hexagon';
import CloseIcon from '@mui/icons-material/Close';
import PlayLine from '../PlayLine';

const TimelineFit = ({ timeline, pokemonCurr, pokemonObj, state, setState, showTap, duration, setLeft, length, hide = false }: any) => {
  const elem: any = useRef(null);
  const [show, setShow] = useState(false);

  const calculateFitPoint = (length: number, index: number) => {
    return `${(index * 100) / (length - 2)}%`;
  };

  const renderTimelineFit = (poke: { timeline: any[] }, pokeObj: { timeline: { [x: string]: { type: string } } }) => {
    return (
      <Fragment>
        <div className="element-top" style={{ height: 12 }}>
          <div className="position-relative timeline-fit-container">
            {poke.timeline.map((value: { tap: any; size: any; dmgImmune: any; type: string; buff: any[] }, index: number) => (
              <Fragment key={index}>
                {value.tap && (
                  <div
                    className="charge-attack"
                    style={{
                      display: !showTap ? 'none' : 'block',
                      opacity: 0.5,
                      width: value.size,
                      left: calculateFitPoint(poke.timeline.length, index),
                      borderColor: value.dmgImmune ? 'red' : 'black',
                    }}
                  />
                )}
                {!value.tap && (
                  <Fragment>
                    {value.type === 'C' && value.buff && value.buff.length > 0 ? (
                      <div
                        className="position-absolute icon-buff-timeline"
                        style={{ left: calculateFitPoint(poke.timeline.length, index), top: 10 }}
                      >
                        {value.buff.map((b: { power: number; type: string }, i: React.Key) => (
                          <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                            {b.type.toUpperCase()} {(b.power > 0 ? '+' : '') + b.power}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <Fragment>
                        {pokeObj.timeline[index] && pokeObj.timeline[index].type === 'C' && value.buff && value.buff.length > 0 ? (
                          <div
                            className="position-absolute icon-buff-timeline"
                            style={{
                              left: calculateFitPoint(poke.timeline.length, index),
                              top: 10,
                            }}
                          >
                            {value.buff.map((b: { power: number; type: string }, i: React.Key) => (
                              <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                                {b.type.toUpperCase()} {b.power}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div
                            className="wait-attack"
                            style={{
                              display: !showTap ? 'none' : 'block',
                              width: value.size,
                              left: calculateFitPoint(poke.timeline.length, index),
                            }}
                          />
                        )}
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="position-relative timeline-fit-container" style={{ height: 30 }}>
          {poke.timeline.map((value: { type: string; size: any; color: any }, index: any) => (
            <Fragment key={index}>
              {value.type === 'B' && (
                <div id={index} style={{ left: calculateFitPoint(poke.timeline.length, index) }}>
                  <HexagonIcon sx={{ color: 'purple', fontSize: value.size }} />
                </div>
              )}
              {value.type === 'F' && (
                <div
                  id={index}
                  className={`fast-attack ${value.color} black-border`}
                  style={{ left: calculateFitPoint(poke.timeline.length, index) }}
                />
              )}
              {(value.type === 'S' || value.type === 'P') && (
                <div
                  id={index}
                  className={`charge-attack ${value.color}-border`}
                  style={{
                    width: value.size,
                    height: value.size,
                    left: calculateFitPoint(poke.timeline.length, index),
                  }}
                />
              )}
              {value.type === 'C' && (
                <div
                  id={index}
                  className={`charge-attack ${value.color} ${value.color}-border`}
                  style={{
                    width: value.size,
                    height: value.size,
                    left: calculateFitPoint(poke.timeline.length, index),
                  }}
                />
              )}
              {(value.type === 'W' || value.type === 'N') && (
                <div id={index} className="wait-attack" style={{ left: calculateFitPoint(poke.timeline.length, index) }} />
              )}
              {!value.type && (
                <div
                  id={index}
                  className="wait-charge-attack"
                  style={{
                    width: value.size,
                    height: value.size,
                    left: calculateFitPoint(poke.timeline.length, index),
                  }}
                />
              )}
              {value.type === 'X' && (
                <div id={index} style={{ left: calculateFitPoint(poke.timeline.length, index) }}>
                  <CloseIcon color="error" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </Fragment>
    );
  };

  useEffect(() => {
    if (elem.current) {
      setShow(true);
    }
  }, []);

  return (
    <Fragment>
      {!hide && (
        <div className="w-100 fit-timeline d-flex justify-content-center" ref={elem}>
          <div id="fit-timeline" className="position-relative h-100">
            {renderTimelineFit(pokemonCurr, pokemonObj)}
            <hr className="w-100" style={{ margin: 0 }} />
            {renderTimelineFit(pokemonObj, pokemonCurr)}
            {show && (
              <PlayLine
                timeline={timeline}
                state={state}
                setState={setState}
                setLeft={setLeft}
                width={elem.current?.clientWidth - 20}
                duration={duration * 1000}
                length={length}
              />
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TimelineFit;
