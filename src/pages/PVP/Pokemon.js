// import SelectFind from "../../components/Select/Select/SelectFind";

// import '../PVP.css';
// import Hexagon from "../../components/Sprites/Hexagon/Hexagon";
// import { useState } from "react";

// import { convertNameRanking } from '../../util/Utils';

// import rankingAttackers from '../../data/pvp/attackers/rankings-500.json';
// import rankingChargers from '../../data/pvp/chargers/rankings-500.json';
// import rankingClosers from '../../data/pvp/closers/rankings-500.json';
// import rankingConsistency from '../../data/pvp/consistency/rankings-500.json';
// import rankingLeads from '../../data/pvp/leads/rankings-500.json';
// import rankingSwitches from '../../data/pvp/switches/rankings-500.json';
// import rankingOverAll from '../../data/pvp/overall/rankings-500.json';

// const PVP500 = ({cp}) => {

//     const [defaultStats, setDefaultStats] = useState({
//         lead: 0,
//         atk: 0,
//         cons: 0,
//         closer: 0,
//         charger: 0,
//         switching: 0
//     });

//     const {lead, atk, cons, closer, charger, switching} = defaultStats;

//     const [initStats, setInitStats] = useState({
//         lead: 0,
//         atk: 0,
//         cons: 0,
//         closer: 0,
//         charger: 0,
//         switching: 0
//     });

//     const [form, setForm] = useState(null);
//     const [ability, setAbility] = useState(null);

//     const clearData = () => {
//         onClearStats();
//         setForm(null);
//         setAbility(null);
//         console.log(form)
//     }

//     const onSetForm = (form) => {
//         setForm(form);
//         const atk = rankingAttackers.find(pokemon => pokemon.speciesId === convertNameRanking(form.slug));
//         const charger = rankingChargers.find(pokemon => pokemon.speciesId === convertNameRanking(form.slug));
//         const closer = rankingClosers.find(pokemon => pokemon.speciesId === convertNameRanking(form.slug));
//         const consistency = rankingConsistency.find(pokemon => pokemon.speciesId === convertNameRanking(form.slug));
//         const lead = rankingLeads.find(pokemon => pokemon.speciesId === convertNameRanking(form.slug));
//         const switching = rankingSwitches.find(pokemon => pokemon.speciesId === convertNameRanking(form.slug));
//         setAbility({
//             attacker: atk,
//             charger: charger,
//             closer: closer,
//             consistency: consistency,
//             lead: lead,
//             switching: switching
//         });
//         setInitStats({
//             lead: lead.score,
//             atk: atk.score,
//             cons: consistency.score,
//             closer: closer.score,
//             charger: charger.score,
//             switching: switching.score
//         })
//     }

//     const onClearStats = () => {
//         setDefaultStats({
//             lead: 0,
//             atk: 0,
//             cons: 0,
//             closer: 0,
//             charger: 0,
//             switching: 0
//         });
//         setInitStats({
//             lead: 0,
//             atk: 0,
//             cons: 0,
//             closer: 0,
//             charger: 0,
//             switching: 0
//         })
//     }



//     return (
//         <div className="container">
//             <div className="d-flex flex-wrap w-100">
//                 <SelectFind data={rankingOverAll} title="PVP Pokémon Stats" clearData={clearData} setForm={onSetForm}/>
//                 {ability &&
//                 <>
//                     <Hexagon animation={0} size={200} defaultStats={defaultStats}
//                     setDefaultStats={setDefaultStats}
//                     lead={lead} atk={atk} cons={cons} closer={closer} charger={charger} switching={switching}
//                     stats={initStats}/>
//                 </>
//                 }
//             </div>
//         </div>
//     )
// }

// export default PVP500;