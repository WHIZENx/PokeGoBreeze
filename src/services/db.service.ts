import { createPool } from '@vercel/postgres';
import { CPMData } from '../core/models/cpm.model';
import { PokemonInfo } from '../core/models/API/info.model';

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
    Stadust,
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

export const createDbPokemonName = async (pokemon: PokemonInfo) => {
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

export const createDbPokemonEncounter = async (pokemon: any, index: any) => {
  return await db.sql`INSERT INTO tblPokemonEncounter(
    Id,
    Name,
    Basecapturerate,
    Basefleerate
  ) VALUES (
    ${parseInt(index + 1)},
    ${pokemon.name},
    ${parseFloat(pokemon.baseCaptureRate)},
    ${parseFloat(pokemon.baseFleeRate)}
  )`;
};
