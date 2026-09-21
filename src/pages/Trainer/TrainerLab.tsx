import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Chip, LinearProgress, Tab, Tabs, Typography } from '@mui/material';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import useDataStore from '../../composables/useDataStore';
import { useTitle } from '../../utils/hooks/useTitle';
import { capitalize, getMoveType, splitAndCapitalize } from '../../utils/utils';
import { IPokemonData } from '../../core/models/pokemon.model';
import { ITrainerBattlePreset } from '../../core/models/trainer.model';
import APIService from '../../services/api.service';
import type { TrainerBattleSimulatorApiResponse } from '../../services/models/tools-api.model';
import TypeBadge from '../../components/Sprites/TypeBadge/TypeBadge';
import SelectMui from '../../components/Commons/Selects/SelectMui';
import SelectCardPokemon from '../../components/Commons/Selects/SelectCardPokemon';
import ButtonMui from '../../components/Commons/Buttons/ButtonMui';
import IconType from '../../components/Sprites/Icon/Type/Type';
import TrainerLevelRewards from './Trainer';
import TrainerBattleTimeline from './TrainerBattleTimeline';
import TrainerMoveSelect, { createDefaultTrainerMoveSelection, type TrainerMoveSelection } from './TrainerMoveSelect';
import './TrainerLab.scss';
import { formatPokemonDisplayName } from '../../utils/pokemon-display-name';

type TrainerTab = 'battle' | 'rewards';
type League = ITrainerBattlePreset['league'];
type Simulation = TrainerBattleSimulatorApiResponse['data'];

const leagueLabels: Record<League, string> = {
  great: 'Great League · 1,500 CP',
  ultra: 'Ultra League · 2,500 CP',
  master: 'Master League · No CP limit',
};

const displayPokemonName = (value: string) => splitAndCapitalize(value.replace(/_NORMAL$/, ''), '_', ' ');
const normalizeMoveName = (value: string) => value.toUpperCase().replaceAll('-', '_');

const emptyTrainerMoves = (): TrainerMoveSelection => ({ chargedMoves: [undefined, undefined] });

const TrainerLab = () => {
  const { pokemonsData, combatsData, trainerBattlePresetsData } = useDataStore();
  const [tab, setTab] = useState<TrainerTab>('battle');
  const [league, setLeague] = useState<League>('great');
  const [presetId, setPresetId] = useState('');
  const [team, setTeam] = useState<Array<IPokemonData | undefined>>([undefined, undefined, undefined]);
  const [teamMoves, setTeamMoves] = useState<TrainerMoveSelection[]>(() =>
    Array.from({ length: 3 }, emptyTrainerMoves)
  );
  const [shields, setShields] = useState(2);
  const [seed, setSeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Simulation>();

  useTitle({
    title: 'Trainer Lab - Pokémon GO Battle Simulator | PokéGO Breeze',
    description:
      'Build a three-Pokémon team, train against Blanche, Candela, or Spark, and inspect a reproducible Pokémon GO battle simulation.',
    keywords: ['Pokémon GO trainer', 'trainer battle simulator', 'team builder', 'Blanche', 'Candela', 'Spark'],
  });

  const presets = useMemo(
    () => trainerBattlePresetsData.filter((preset) => preset.league === league),
    [league, trainerBattlePresetsData]
  );
  const preset = presets.find((item) => item.id === presetId) ?? presets[0];
  const selectablePokemon = useMemo(
    () =>
      pokemonsData.filter(
        (pokemon) => pokemon.releasedGO && pokemon.quickMoves?.length && pokemon.cinematicMoves?.length
      ),
    [pokemonsData]
  );
  const selectedTeam = useMemo(() => team.filter((pokemon): pokemon is IPokemonData => pokemon !== undefined), [team]);
  const hasCompleteTeam = selectedTeam.length === 3;
  const hasUniqueTeam =
    new Set(selectedTeam.map((pokemon) => String(pokemon.pokemonId).toUpperCase())).size === selectedTeam.length;
  const hasCompleteMoves = team.every((pokemon, index) => {
    const moves = teamMoves[index];
    return Boolean(pokemon && moves.fastMove && moves.chargedMoves.some(Boolean));
  });
  const isBattleReady = hasCompleteTeam && hasUniqueTeam && hasCompleteMoves;

  useEffect(() => {
    if (presets.length && !presets.some((item) => item.id === presetId)) {
      setPresetId(presets[0].id);
      setResult(undefined);
    }
  }, [presetId, presets]);

  const findPokemon = (pokemonId: string, form?: string) =>
    pokemonsData.find(
      (pokemon) =>
        String(pokemon.pokemonId).toUpperCase() === pokemonId.toUpperCase() &&
        (!form ||
          pokemon.form?.toUpperCase() === form.toUpperCase() ||
          pokemon.fullName?.toUpperCase() === form.toUpperCase())
    ) ?? pokemonsData.find((pokemon) => String(pokemon.pokemonId).toUpperCase() === pokemonId.toUpperCase());

  const setTeamSlot = (index: number, pokemon?: IPokemonData) => {
    setTeam((current) => current.map((item, slot) => (slot === index ? pokemon : item)));
    setTeamMoves((current) =>
      current.map((moves, slot) =>
        slot === index ? (pokemon ? createDefaultTrainerMoveSelection(pokemon) : emptyTrainerMoves()) : moves
      )
    );
    setResult(undefined);
    setError('');
  };
  const setTeamMoveSelection = (index: number, selection: TrainerMoveSelection) => {
    setTeamMoves((current) => current.map((moves, slot) => (slot === index ? selection : moves)));
    setResult(undefined);
    setError('');
  };

  const simulate = async () => {
    if (!hasCompleteTeam) {
      setError(`Select ${3 - selectedTeam.length} more Pokemon to complete your team.`);
      return;
    }
    if (!hasUniqueTeam) {
      setError('A Trainer Battle team cannot contain duplicate Pokemon species.');
      return;
    }
    if (!hasCompleteMoves) {
      setError('Select a Fast Move and at least one Charged Move for every Pokémon.');
      return;
    }
    if (!preset) {
      setError('The selected Team Leader preset is not available. Try another league or reload the battle data.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await APIService.postTrainerBattleSimulator({
        presetId: preset.id,
        team: selectedTeam.map((pokemon, index) => {
          const moves = teamMoves[index];
          return {
            pokemonId: String(pokemon.pokemonId ?? pokemon.fullName ?? ''),
            form: pokemon.form,
            fastMove: moves.fastMove,
            chargedMoves: moves.chargedMoves.filter((move): move is string => !!move),
          };
        }),
        shields,
        seed,
      });
      setResult(response.data.data);
    } catch (requestError) {
      const responseError = requestError as { response?: { data?: { error?: string; pokemon?: string } } };
      const code = responseError.response?.data?.error;
      const pokemon = responseError.response?.data?.pokemon;
      setError(
        code === 'duplicate_team_species'
          ? 'A Trainer Battle team cannot contain duplicate Pokémon species.'
          : code === 'pokemon_not_eligible'
            ? `${displayPokemonName(pokemon ?? '')} cannot fit this league with the current default build.`
            : 'The simulation could not be completed. Please adjust the team and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPokemon = (pokemon: IPokemonData) => (
    <Box className="trainer-picker-row">
      <img src={APIService.getPokeIconSprite(pokemon.sprite)} width={44} height={44} alt="" />
      <Box>
        <Typography variant="body2" fontWeight={700}>
          {formatPokemonDisplayName(pokemon.name)}
        </Typography>
        <Box className="trainer-picker-meta">
          <Typography variant="caption" color="text.secondary">
            #{pokemon.num}
          </Typography>
          {pokemon.types.map((type) => (
            <IconType
              key={type}
              type={type}
              width={22}
              height={22}
              alt={`${capitalize(type)} type`}
              title={capitalize(type)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderMoveBadge = (title: string, moveName: string, pokemon: IPokemonData | undefined) => (
    <TypeBadge
      key={`${title}-${moveName}`}
      title={title}
      move={combatsData.find((move) => normalizeMoveName(move.name) === normalizeMoveName(moveName))}
      moveType={getMoveType(pokemon, moveName)}
    />
  );

  const resultTitle = result?.winner === 'player' ? 'Victory' : result?.winner === 'opponent' ? 'Defeat' : 'Draw';

  return (
    <main className="tw-container tw-p-3 trainer-lab">
      <section className="trainer-hero">
        <Box>
          <Typography variant="overline">PokéGO Breeze</Typography>
          <Typography variant="h3" component="h1">
            Trainer Lab
          </Typography>
          <Typography color="text.secondary">
            Build a team, train against the official Team Leader presets, and learn what happens turn by turn.
          </Typography>
        </Box>
        <SportsMmaIcon className="trainer-hero-icon" aria-hidden="true" />
      </section>

      <Tabs value={tab} onChange={(_, value: TrainerTab) => setTab(value)} className="trainer-tabs">
        <Tab icon={<SchoolIcon />} iconPosition="start" label="Battle Lab" value="battle" />
        <Tab icon={<EmojiEventsIcon />} iconPosition="start" label="Level Rewards" value="rewards" />
      </Tabs>

      {tab === 'rewards' ? (
        <TrainerLevelRewards />
      ) : (
        <>
          <Alert severity="info" className="tw-mb-3">
            Team Leader lineups and battle values come from the same Game Master snapshot. This MVP uses automatic moves
            and switches only after a Pokémon faints.
          </Alert>

          <section className="trainer-setup-grid">
            <Card className="trainer-panel">
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Match setup
                </Typography>
                <Box className="trainer-controls">
                  <SelectMui
                    fullWidth
                    inputLabel="League"
                    value={league}
                    onChangeSelect={(value) => {
                      setLeague(value);
                      setResult(undefined);
                    }}
                    menuItems={(Object.keys(leagueLabels) as League[]).map((value) => ({
                      value,
                      label: leagueLabels[value],
                    }))}
                  />
                  <SelectMui
                    fullWidth
                    inputLabel="Team Leader"
                    value={preset?.id ?? ''}
                    onChangeSelect={(value) => {
                      setPresetId(value);
                      setResult(undefined);
                    }}
                    menuItems={presets.map((item) => ({
                      value: item.id,
                      label: capitalize(item.trainer),
                    }))}
                  />
                  <SelectMui
                    fullWidth
                    inputLabel="Protect Shields"
                    value={shields}
                    onChangeSelect={(value) => {
                      setShields(value);
                      setResult(undefined);
                    }}
                    menuItems={[0, 1, 2].map((value) => ({ value, label: `${value} shield${value === 1 ? '' : 's'}` }))}
                  />
                </Box>

                {preset && (
                  <Box className={`trainer-opponent trainer-${preset.trainer}`}>
                    {preset.iconUrl && <img src={preset.iconUrl} alt={capitalize(preset.trainer)} />}
                    <Box className="tw-flex-1">
                      <Box className="tw-flex tw-gap-2 tw-items-center tw-flex-wrap">
                        <Typography variant="h5">{capitalize(preset.trainer)}</Typography>
                        <Chip size="small" label={capitalize(preset.league)} />
                        <Chip size="small" color="success" variant="outlined" label="Game Master preset" />
                      </Box>
                      <Box className="trainer-opponent-team">
                        {preset.pokemon.map((member) => {
                          const pokemon = findPokemon(member.pokemonId, member.form);
                          return (
                            <Box key={`${member.pokemonId}-${member.form ?? ''}`} className="trainer-opponent-pokemon">
                              {pokemon && <img src={APIService.getPokeIconSprite(pokemon.sprite)} alt="" />}
                              <span>{displayPokemonName(member.form ?? member.pokemonId)}</span>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card className="trainer-panel">
              <CardContent>
                <Typography variant="h5" component="h2">
                  Your team
                </Typography>
                <Typography variant="body2" color="text.secondary" className="tw-mb-3">
                  Pick three different Pokémon, then customize one Fast Move and up to two Charged Moves for each team
                  member. The API chooses the highest eligible 15/15/15 build.
                </Typography>
                <Chip
                  className="tw-mb-3"
                  color={isBattleReady ? 'success' : 'default'}
                  label={`Team ${selectedTeam.length}/3`}
                  variant={isBattleReady ? 'filled' : 'outlined'}
                />
                <Box className="trainer-team-pickers">
                  {team.map((selected, index) => (
                    <Box key={index}>
                      <Typography variant="caption" fontWeight={700}>
                        Slot {index + 1}
                      </Typography>
                      <SelectCardPokemon
                        pokemonList={selectablePokemon.filter(
                          (pokemon) =>
                            !team.some((member, slot) => slot !== index && member?.pokemonId === pokemon.pokemonId)
                        )}
                        value={formatPokemonDisplayName(selected?.name)}
                        sprite={selected ? APIService.getPokeIconSprite(selected.sprite) : undefined}
                        placeholder="Search Pokémon"
                        isShowPokemonIcon
                        isFit
                        onFilter={(pokemon) => ({ name: pokemon.name, id: pokemon.num })}
                        onSelect={(pokemon) => formatPokemonDisplayName(pokemon.name)}
                        onSprite={(pokemon) => pokemon.sprite}
                        onSetPokemon={(pokemon) => setTeamSlot(index, pokemon)}
                        onRemove={() => setTeamSlot(index)}
                        onIsSelectedPokemon={(pokemon) => pokemon.fullName === selected?.fullName}
                        cardElement={renderPokemon}
                      />
                      {selected && (
                        <TrainerMoveSelect
                          key={`moves-${selected.fullName}`}
                          pokemon={selected}
                          combats={combatsData}
                          selection={teamMoves[index]}
                          onChange={(selection) => setTeamMoveSelection(index, selection)}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
                <Box className="trainer-actions">
                  <ButtonMui
                    label={
                      <>
                        <SportsMmaIcon fontSize="small" /> Simulate battle
                      </>
                    }
                    onClick={simulate}
                    disabled={loading || !isBattleReady}
                  />
                  <ButtonMui
                    variant="outlined"
                    label={
                      <>
                        <RestartAltIcon fontSize="small" /> New seed
                      </>
                    }
                    onClick={() => {
                      setSeed((value) => value + 1);
                      setResult(undefined);
                    }}
                  />
                  <Chip label={`Seed ${seed}`} variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </section>

          {loading && <LinearProgress className="tw-mt-3" />}
          {error && (
            <Alert severity="error" className="tw-mt-3">
              {error}
            </Alert>
          )}

          {result && (
            <section className={`trainer-result trainer-result-${result.winner}`}>
              <Box className="trainer-result-heading">
                <Box>
                  <Typography variant="overline">Simulation result</Typography>
                  <Typography variant="h3" component="h2">
                    {resultTitle}
                  </Typography>
                </Box>
                <Box className="trainer-result-stats">
                  <Chip label={`${result.durationSeconds.toFixed(1)} seconds`} />
                  <Chip label={`${result.player.remaining}–${result.opponent.remaining} remaining`} />
                  <Chip label={`${result.player.shields}–${result.opponent.shields} shields`} />
                </Box>
              </Box>
              <Box className="trainer-result-teams">
                {(['player', 'opponent'] as const).map((side) => (
                  <Card key={side} variant="outlined">
                    <CardContent>
                      <Typography variant="h6">
                        {side === 'player' ? 'Your team' : capitalize(preset?.trainer ?? 'Opponent')}
                      </Typography>
                      {result[side].team.map((pokemon) => (
                        <Box
                          key={`${side}-${pokemon.pokemonId}-${pokemon.form ?? ''}`}
                          className="trainer-result-pokemon"
                        >
                          <img src={APIService.getPokeIconSprite(pokemon.sprite)} alt="" />
                          <Box className="tw-flex-1">
                            <Box className="tw-flex tw-justify-between tw-gap-2">
                              <strong>{pokemon.name}</strong>
                              <span>CP {pokemon.cp}</span>
                            </Box>
                            <LinearProgress variant="determinate" value={(pokemon.remainingHp / pokemon.maxHp) * 100} />
                            <Typography variant="caption" color="text.secondary">
                              Lv. {pokemon.level}
                            </Typography>
                            <Box className="trainer-result-moves">
                              {renderMoveBadge(
                                'Fast Move',
                                pokemon.fastMove,
                                findPokemon(pokemon.pokemonId, pokemon.form)
                              )}
                              {pokemon.chargedMoves.map((move, index) =>
                                renderMoveBadge(
                                  `Charged Move ${index + 1}`,
                                  move,
                                  findPokemon(pokemon.pokemonId, pokemon.form)
                                )
                              )}
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </Box>
              <Typography variant="h6" className="tw-mt-3">
                Key events
              </Typography>
              <TrainerBattleTimeline
                events={result.events}
                combats={combatsData}
                durationSeconds={result.durationSeconds}
                opponentLabel={capitalize(preset?.trainer ?? 'Opponent')}
              />
              <Alert severity="warning" className="tw-mt-3">
                {result.assumptions.join(' ')}
              </Alert>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default TrainerLab;
