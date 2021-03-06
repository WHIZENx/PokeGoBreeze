import { Fragment } from "react";
import typeEffective from '../../data/type_effectiveness.json';
import APIService from "../../services/API.service";
import { capitalize, splitAndCapitalize } from "../../util/Utils";

import './TypeEffectiveSelect.css';

const TypeEffectiveSelect = (props) => {

    const renderEffective = (text, data) => {
        return (
            <Fragment>
                {data.length > 0 &&
                    <Fragment>
                    <h6 className={props.block ? "element-top" : ""}><b className="text-shadow">x{text}</b></h6>
                    <div className="d-flex flex-wrap" style={{gap: 5}}>{data.map((value, index) => (
                        <span key={index} className={value.toLowerCase()+" type-select-bg d-flex align-items-center filter-shadow"}>
                            <div style={{display: 'contents', width: 16}}>
                                <img className="pokemon-sprite-small sprite-type-select filter-shadow" alt="img-type-pokemon" src={APIService.getTypeHqSprite(capitalize(value.toLowerCase()))}/>
                            </div>
                            <span className="filter-shadow">{value}</span>
                        </span>
                    ))}
                    </div>
                    </Fragment>
                }
            </Fragment>
        )
    }

    const getTypeEffect = (effect, types) => {
        let data;
        if (effect === 0) {
            data = {
                "weak": [],
                "very_weak": []
            }
            Object.entries(typeEffective).forEach(([key, value]) => {
                let value_effective = 1;
                types.forEach((type) => {
                    value_effective *= value[splitAndCapitalize(type, "-", " ")];
                });
                if (value_effective >= 2.56) data.very_weak.push(key);
                else if (value_effective >= 1.6) data.weak.push(key);
            });

            return (
                <div className="container" style={{paddingBottom: '0.5rem'}}>
                    {renderEffective("2.56", data.very_weak)}
                    {renderEffective("1.6", data.weak)}
                </div>
            )
        } else if (effect === 1) {
            data = {
                "neutral": []
            }
            Object.entries(typeEffective).forEach(([key, value]) => {
                let value_effective = 1;
                types.forEach((type) => {
                    value_effective *= value[splitAndCapitalize(type, "-", " ")];
                });
                if (value_effective === 1) data.neutral.push(key);
            });
            return (
                <div className="container" style={{paddingBottom: '0.5rem'}}>
                    {renderEffective("1", data.neutral)}
                </div>
            )
        } else if (effect === 2) {
            data = {
                "resist": [],
                "very_resist": [],
                "super_resist": []
            }
            Object.entries(typeEffective).forEach(([key, value]) => {
                let value_effective = 1;
                types.forEach((type) => {
                    value_effective *= value[splitAndCapitalize(type, "-", " ")];
                });
                if (value_effective <= 0.3) data.super_resist.push(key);
                else if (value_effective <= 0.39) data.very_resist.push(key);
                else if (value_effective <= 0.625) data.resist.push(key);
            });
            return (
                <div className="container" style={{paddingBottom: '0.5rem'}}>
                    {renderEffective("0.244", data.super_resist)}
                    {renderEffective("0.391", data.very_resist)}
                    {renderEffective("0.625", data.resist)}
                </div>
            )
        }
        return (
            <></>
        )
    }

    return (
        <Fragment>
            {getTypeEffect(props.effect, props.types)}
        </Fragment>
    )
}

export default TypeEffectiveSelect;