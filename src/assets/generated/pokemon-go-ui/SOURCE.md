# Local Pokémon GO UI assets

These small, frequently reused UI images are vendored from
[`PokeMiners/pogo_assets`](https://github.com/PokeMiners/pogo_assets). The
Experience reward uses the official transparent `TodayView_Icon_XP` glyph on
an application-rendered badge so it remains visible in both color themes. The
separate `move-type-hq` directory preserves the Pokémon GO Wiki type artwork
previously used by `getTypeHqSprite`; it must not be replaced by the circular
PokeMiners type badges because the two sets have different semantics and visual
bounds. The `move-type-mask` directory preserves the transparent glyphs used
by `CircleBar` CSS masks; circular badges are not valid mask inputs. Run
`npm run update:local-ui-assets` to refresh the PNG files and their generated
manifest together.

The manifest records the upstream path, URL, byte size, and SHA-256 checksum
for every file. Pokémon GO images remain the property of their respective
rights holders.
