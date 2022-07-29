import { useEffect } from "react";
import { Button } from "react-bootstrap";
import APIService from "../../services/API.service";
import { leaguesRanking, leaguesTeam, leaguesTeamBattle } from "../../util/Constants";

const PVPHome = () => {

    useEffect(() => {
        document.title = "PVP - Simulator";
    }, []);

    return (
        <div className="container">
            <h1>Top Rank Pokémon Leagues</h1>
            <div className="group-selected">
                {leaguesRanking.map((value, index) => (
                    <Button key={index} className="btn btn-form" style={{height: 200}} target="_blank" href={`/pvp/rankings/${value.id}/${value.cp}/overall`}>
                        <img alt='img-league' width={128} height={128} src={!value.logo ?
                        value.cp === 500 ? APIService.getPokeOtherLeague("GBL_littlecup")
                        :
                        value.cp === 1500 ? APIService.getPokeLeague("great_league")
                        :
                        value.cp === 2500 ? APIService.getPokeLeague("ultra_league")
                        :
                        APIService.getPokeLeague("master_league") : value.logo}/>
                        <div><b>{value.name}</b></div>
                        <span className="text-danger">CP below {value.cp}</span>
                    </Button>
                ))}
            </div>
            <h1>Top Teams Pokémon Leagues</h1>
            <div className="group-selected">
                {leaguesTeam.map((value, index) => (
                    <Button key={index} className="btn btn-form" style={{height: 200}} target="_blank" href={`/pvp/teams/${value.id}/${value.cp}`}>
                        <img alt='img-league' width={128} height={128} src={!value.logo ?
                        value.cp === 500 ? APIService.getPokeOtherLeague("GBL_littlecup")
                        :
                        value.cp === 1500 ? APIService.getPokeLeague("great_league")
                        :
                        value.cp === 2500 ? APIService.getPokeLeague("ultra_league")
                        :
                        APIService.getPokeLeague("master_league") : value.logo}/>
                        <div><b>{value.name}</b></div>
                        <span className="text-danger">CP below {value.cp}</span>
                    </Button>
                ))}
            </div>
            <h1>Battle League Simulator</h1>
            <div className="group-selected">
                {leaguesTeamBattle.map((value, index) => (
                    <Button key={index} className="btn btn-form" style={{height: 200}} target="_blank" href={`/pvp/battle/${value.cp}`}>
                        <img alt='img-league' width={128} height={128} src={!value.logo ?
                        value.cp === 500 ? APIService.getPokeOtherLeague("GBL_littlecup")
                        :
                        value.cp === 1500 ? APIService.getPokeLeague("great_league")
                        :
                        value.cp === 2500 ? APIService.getPokeLeague("ultra_league")
                        :
                        APIService.getPokeLeague("master_league") : value.logo}/>
                        <div><b>{value.name}</b></div>
                        <span className="text-danger">CP below {value.cp}</span>
                    </Button>
                ))}
            </div>
        </div>
    )
}

export default PVPHome;