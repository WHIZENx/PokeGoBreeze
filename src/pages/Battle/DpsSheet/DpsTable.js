import { useCallback, useEffect, useState } from "react";

import pokemonData from '../../../data/pokemon.json';
import combatData from '../../../data/combat.json';
import combatPokemonData from '../../../data/combat_pokemon_go_list.json';
import { calculateAvgDPS, calculateStatsByTag, calculateTDO, getBarCharge } from "../../../components/Calculate/Calculate";
import DataTable from "react-data-table-component";
import APIService from "../../../services/API.service";

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const splitAndCapitalize = (string, splitBy) => {
    return string.split(splitBy).map(text => capitalize(text.toLowerCase())).join(" ");
};

const columns = [
    {
        name: 'ID',
        selector: row => row.pokemon.num,
        sortable: true,
    },
    {
        name: 'Pokemon Name',
        selector: row =>
            <span><img height={48} alt='img-pokemon'
            src={APIService.getPokeIconSprite(row.pokemon.sprite, true)}
            onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(row.pokemon.baseSpecies)}}></img>
            {splitAndCapitalize(row.pokemon.name, "-")}</span>
        ,
        sortable: true,
    },
    {
        name: 'Fast Move',
        selector: row => <span><img width={25} height={25} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(row.fmove.type))}></img> {splitAndCapitalize(row.fmove.name, "_")}</span>,
        sortable: true,
    },
    {
        name: 'Charge Move',
        selector: row => <span><img width={25} height={25} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(row.cmove.type))}></img> {splitAndCapitalize(row.cmove.name, "_")}</span>,
        sortable: true,
    },
    {
        name: 'DPS',
        selector: row => parseFloat(row.dps.toFixed(2)),
        sortable: true,
    },
    {
        name: 'TDO',
        selector: row => parseFloat(row.tdo.toFixed(2)),
        sortable: true,
    },
];

const DpsTable = (props) => {

    const [dpsTable, setDpsTable] = useState([]);

    const convertName = (text) => {
        return text.toUpperCase()
        .replaceAll("-", "_")
        .replaceAll("NIDORAN_F", "NIDORAN_FEMALE")
        .replaceAll("NIDORAN_M", "NIDORAN_MALE")
        .replaceAll("’", "")
        .replaceAll(".", "")
        .replaceAll(":", "")
        .replaceAll(" ", "_")
        .replaceAll("É", "E")
    }

    const checkStab = (typePoke, typeMove) => {
        return typePoke.includes(capitalize(typeMove).toLowerCase()) ? 1.2 : 1;
    }

    const calculateDPSTable = useCallback(() => {
        setDpsTable([]);
        Object.values(pokemonData).forEach((value, index) => {
            if (value.num > 0) {
                let combatPoke = combatPokemonData.filter(item => item.ID === value.num
                    && item.BASE_SPECIES === (value.baseSpecies ? convertName(value.baseSpecies) : convertName(value.name))
                );
                let result = combatPoke.find(item => item.NAME === convertName(value.name));
                if (result === undefined) combatPoke = combatPoke[0]
                else combatPoke = result;
                if (combatPoke !== undefined) {
                    combatPoke.QUICK_MOVES.forEach(vf => {
                        combatPoke.CINEMATIC_MOVES.forEach(vc => {
                            let fmove = combatData.find(item => item.name === vf.replaceAll("_FAST", ""));
                            let cmove = combatData.find(item => item.name === vc);
                            let stats = calculateStatsByTag(value.baseStats, value.slug);
                            setDpsTable(oldArr => [...oldArr, {
                                pokemon: value,
                                fmove: fmove,
                                cmove: cmove,
                                dps: calculateAvgDPS(fmove, cmove, 200, 150, getBarCharge(false, Math.abs(cmove.pvp_energy), false)),
                                tdo: calculateTDO(fmove, cmove, stats.atk, stats.def, stats.sta, 150, checkStab(value.types, fmove.type), checkStab(value.types, cmove.type))
                            }]);
                        })
                    })
                }
            }
        });
    }, []);

    useEffect(() => {
        calculateDPSTable();
    }, [calculateDPSTable]);

    // console.log(dpsTable)

    return (
        <div className="container">
            <DataTable
                title={"DPS Table"}
                columns={columns}
                data={dpsTable}
                pagination
                defaultSortFieldId={6}
                defaultSortAsc={false}
                highlightOnHover
                striped
            />
        </div>
    )
}

export default DpsTable;