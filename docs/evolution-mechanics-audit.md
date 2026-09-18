# Pokémon GO transformation audit

Reviewed 2026-09-19 against the local API snapshot generated 2026-09-16
(Game Master `fa0d638806324556ada89ea162f30fd79af31f2e`) and official Pokémon GO sources.

## Corrections

- Permanent evolution paths now come only from explicit Pokémon GO API branches.
  Main-series PokeAPI paths and Pokédex-number ordering are not proof of GO availability.
- Mega, Primal and Gigantamax forms no longer receive a fabricated permanent
  evolution arrow from their ordinary form.
- Evolution Candy remains visible alongside an evolution item. Buddy-distance
  requirements render as elements instead of a stringified React object.
- Selected form captions and Form Change sprites use the actual form.
- Fusion and separation are labeled separately, with partner, both families'
  Candy, energy, required moves and move replacements from the API.
- Mega energy is a snapshot baseline, not a quote for the user's Pokémon.
  Rest periods, unlocked forms, Rayquaza's Meteorite requirement, separate
  Charizard unlocks and the 2026 Mega system are explained.

## Whole-snapshot follow-up

The current upstream blob matches the reviewed SHA. The automated sweep covers
2,472 Pokémon settings templates representing 1,024 species (including preloaded
unreleased species), 1,177 evolution branches including temporary branches,
54 referenced evolution quests and 35 quest conditions. It is a data-coverage
audit, not proof that all 1,024 species are publicly released.

Added API-generated readable details and lossless quest goals/conditions:

- Ursaring → Ursaluna: in-game full moon; do not calculate availability from an astronomical calendar.
- Eligible Rockruff → Lycanroc Dusk: eligible source form and in-game dusk, not an arbitrary clock time.
- Bisharp → Kingambit: win 15 raids against Dark or Steel types with Bisharp as buddy.
- Kubfu → Urshifu: win 30 raids or Max Battles against the appropriate Dark/Water types with Kubfu as buddy.
- Applin: Sweet/Tart/Syrupy Apples, 20 plus 200 Candy; Dipplin: seven Dragon catches with buddy, plus 400 Candy.
- Gimmighoul → Gholdengo: 999 Gimmighoul Coins, not a generic evolution stone.
- All referenced catch, raid, throw, hearts, feed, incense and walking quests retain every goal and condition.
- Every branch with `noCandyCostViaTrade` receives a zero-Candy-if-traded explanation, without setting the normal Candy cost to zero.
- Weighted random outcomes (Tandemaus and Dunsparce) show their snapshot weight without claiming a guaranteed live percentage.
- Curated GO-only notes cover Tyrogue's highest IV/ties, random Wurmple/Clamperl/Cherubi outcomes, and Eevee's one-time nickname shortcuts.
- Zygarde's same-species progression is excluded from the permanent species evolution list; its raw formChange routes remain available.
- Target forms are no longer blindly inherited from the source. This fixes previously unresolved Clodsire, Overqwil, Sneasler, male Burmy → Mothim, base Scatterbug/Spewpa and Finizen → Palafin Zero branches. Explicit target forms stay authoritative; missing explicit forms are not replaced by a different regional form.
- Evolution links use the target's form instead of the currently viewed Pokémon's form. Missing purified-cost data no longer appears as a free evolution.

Detailed requirements render below the chain instead of cramming text onto arrows.
Legacy single-condition fields remain for compatibility; new clients use the
complete `quest.details` and `quest.requirements` fields. Event quest templates
not referenced by active snapshot branches are not silently substituted.

## Boundaries still requiring individual/live data

- Trade Candy waivers depend on an individual Pokémon's trade history.
- Unknown future quest conditions are preserved and displayed with a verify-in-game warning.
- Furfrou region/event eligibility, Zygarde unlocked forms, Mega level/rest
  state and Crowned unlock state cannot be inferred from a species snapshot.
- A Game Master transition is not proof that it is currently enabled for every
  account or region. Costs are displayed as snapshot data, not live eligibility.
- No level-up energy or Super Max cost calculator is implemented here.

Do not fill these gaps with main-series rules or silently replace missing costs
with zero. Regenerate all derived sections together and keep the exhaustive
snapshot audit and regression fixtures passing.

## Primary sources

- [Pokémon Fusion](https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/4736-what-is-pokemon-fusion/)
- [Kyurem Fusion costs](https://pokemongo.com/news/kyurem-fusion-raid-day-2026)
- [Crowned forms](https://pokemongo.com/news/crowned-energy-resource-zacian-zamazenta)
- [Mega Evolution help](https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/3332-how-can-i-mega-evolve-my-pokemon/)
- [2026 Mega system](https://pokemongo.com/news/mega-evolution-2026-update)
- [Energy-based level upgrades](https://pokemongo.com/news/falinks-super-mega-raid-day-2026)
- [Trade evolution](https://pokemongo.com/news/trade-evolution)
- [Event-specific Furfrou availability](https://pokemongo.com/gotour/global/)
- [Kingambit](https://pokemongo.com/news/crown-clash-2025?hl=en)
- [Urshifu](https://pokemongo.com/news/final-strike-2025?hl=en)
- [Dipplin and Hydrapple](https://pokemongo.com/news/harvest-festival-2025?hl=en)
- [Sweet and Tart Apples](https://pokemongo.com/pl/news/sweet-discoveries-2025)
- [Gimmighoul Coins](https://pokemongo.com/news/gocoin)
- [Dusk-eligible Rockruff](https://pokemongo.com/en/post/lustrous-odyssey-2024)
- [Ursaluna](https://pokemongo.com/news/community-day-november-2022-teddiursa)

Supplementary community references for rules absent from snapshot branches:
[GO branched outcomes and nickname limits](<https://bulbapedia.bulbagarden.net/wiki/Draft:Evolution_(GO)>)
and [Tyrogue GO Pokédex](https://www.serebii.net/pokemongo/pokemon/236.shtml).
These are not used as authoritative evidence of release availability.
