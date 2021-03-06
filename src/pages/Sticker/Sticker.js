import { Badge } from "@mui/material";

import pokeStickerList from '../../data/sticker_pokemon_go.json';
import { getTime, splitAndCapitalize } from '../../util/Utils';

import './Sticker.css';
import APIService from '../../services/API.service';
import { useEffect } from "react";

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { OverlayTrigger } from "react-bootstrap";
import PopoverConfig from "../../components/Popover/PopoverConfig";

const Sticker = () => {

    useEffect(() => {
        document.title = "Stickers List";
    }, []);

    return (
        <div className='container' style={{padding: 15}}>
            <h2 className='title-leagues' style={{marginBottom: 15}}>Sticker List</h2>
            <span className="text-timestamp">* Update: {getTime(pokeStickerList.timestamp, true)}</span>
            <div className='sticker-container'>
                <h5><span>Sticker</span></h5>
                <div className='sticker-group'>
                    {pokeStickerList.data.map((value, index) => (
                        <OverlayTrigger
                        key={index}
                        placement='auto'
                        overlay={<PopoverConfig id={`popover-sticker-${index}`}>{value.shop ?
                            <span>Available in shop sell pack: {value.pack.join(", ")}</span>
                            :
                            <span>Unavailable in shop</span>}</PopoverConfig>
                        }
                      >
                        <div className="sticker-detail position-relative">
                            <Badge color="primary" overlap="circular" badgeContent={value.pokemonId ? "Pokémon" : null}>
                                <img height={64} alt='img-sticker' src={value.stickerUrl ?? APIService.getSticker(value.id.toLowerCase())}/>
                            </Badge>
                            {value.shop &&
                                <span className="icon-shop">
                                    <ShoppingCartIcon fontSize="small" sx={{color: 'white'}}/>
                                </span>
                            }
                            <span className='caption'>{splitAndCapitalize(value.id.toLowerCase(), "_", " ")}</span>
                        </div>
                      </OverlayTrigger>
                    ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Sticker;