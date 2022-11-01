import { splitAndCapitalize } from '../../util/Utils';
import './CardPokemonInfo.css';

const CardPokemonInfo = (props: { image: string; name: string }) => {
  return (
    <div className="pokemoninfo-container border-types">
      <div className="d-flex justify-content-center" style={{ padding: 15 }}>
        <span style={{ width: 96 }}>
          <img className="pokemon-sprite-large" alt="pokemon-img" src={props.image} />
        </span>
      </div>
      <span className="text-info text-center caption text-black">{splitAndCapitalize(props.name, '-', ' ')}</span>
      <hr />
    </div>
  );
};

export default CardPokemonInfo;
