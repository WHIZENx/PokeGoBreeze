import { createPool } from '@vercel/postgres';
import { CPMData } from '../core/models/cpm.model';
import { IPokemonDetail } from '../core/models/API/info.model';
import { PokemonEncounter } from '../core/models/pokemon.model';

const db = createPool({
  connectionString: process.env.REACT_APP_POKEGO_BREEZE_DB_URL,
});

export const getDbCpMultiply = async () => {
  return await db.sql`SELECT * from tblCpMultiply`;
};

export const createDbCpMultiply = async (cpm: CPMData) => {
  return await db.sql`INSERT INTO tblCpMultiply(
    Level,
    Multiplier,
    Stardust,
    Sum_stadust,
    Candy,
    Sum_candy,
    Xl_candy,
    Sum_xl_candy
  ) VALUES (
    ${cpm.level},
    ${cpm.multiplier},
    ${cpm.stadust},
    ${cpm.sum_stadust},
    ${cpm.candy},
    ${cpm.sum_candy},
    ${cpm.xl_candy},
    ${cpm.sum_xl_candy}
  )`;
};

export const getDbPokemonName = async () => {
  return await db.sql`SELECT * from tblPokemonName`;
};

export const createDbPokemonName = async (pokemon: IPokemonDetail) => {
  return await db.sql`INSERT INTO tblPokemonName(
    Id,
    Name
  ) VALUES (
    ${pokemon.id},
    ${pokemon.name}
  )`;
};

export const getDbPokemonEncounter = async () => {
  return await db.sql`SELECT * from tblPokemonEncounter`;
};

export const createDbPokemonEncounter = async (pokemon: PokemonEncounter, index: number) => {
  return await db.sql`INSERT INTO tblPokemonEncounter(
    Id,
    Name,
    Basecapturerate,
    Basefleerate
  ) VALUES (
    ${parseInt(index.toString() + 1)},
    ${pokemon.name},
    ${parseFloat(pokemon.basecapturerate.toString())},
    ${parseFloat(pokemon.basefleerate.toString())}
  )`;
};
