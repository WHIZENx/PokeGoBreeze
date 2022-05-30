import { Badge } from "@mui/material";

import pokeStickerList from '../../data/sticker_pokemon_go.json';
import { getTime, splitAndCapitalize } from '../../components/Calculate/Calculate';

import './Sticker.css';
import APIService from '../../services/API.service';

const Sticker = () => {

    return (
        <div className='container' style={{padding: 15}}>
            <h2 className='title-leagues' style={{marginBottom: 15}}>Sticker List</h2>
            <span className="text-timestamp">* Update: {getTime(pokeStickerList.timestamp, true)}</span>
            <div className="row" style={{margin:0}}>
                <div className="col-xl" style={{padding:0}}>
                    <div className='sticker-container'>
                        <h5><span>Sticker in Shop</span></h5>
                        <div className='sticker-group'>
                        {pokeStickerList.data.filter(item => item.type === "SHOP").map((value, index) => (
                            <div key={index} className="sticker-detail">
                                <img height={64} alt='img-sticker' src={value.stickerUrl? value.stickerUrl : APIService.getPokeSprite(0)}></img>
                                <span className='caption'>{splitAndCapitalize(value.id.toLowerCase(), "_", "")}</span>
                            </div>
                        ))
                        }
                        </div>
                    </div>
                </div>
                <div className="col-xl" style={{padding:0}}>
                    <div className='sticker-container'>
                        <h5><span>Sticker</span></h5>
                        <div className='sticker-group'>
                            {pokeStickerList.data.filter(item => item.type === "DEFAULT").map((value, index) => (
                                <div key={index} className="sticker-detail">
                                    {value.pokemonId ?
                                    <Badge color="primary" overlap="circular" badgeContent="Pokemon">
                                        <img height={64} alt='img-sticker' src={value.stickerUrl? value.stickerUrl : APIService.getPokeSprite(0)}></img>
                                    </Badge>
                                    :
                                    <img height={64} alt='img-sticker' src={value.stickerUrl? value.stickerUrl : APIService.getPokeSprite(0)}></img>}
                                    <span className='caption'>{splitAndCapitalize(value.id.toLowerCase(), "_", "")}</span>
                                </div>
                            ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sticker;