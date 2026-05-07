# Playable Defense Slice Design

## Goal

Complete the current playable economy slice by adding the missing opponent, territory, military pressure, and defense feedback needed for a self-contained NightmareValley settlement game.

## Current Baseline

The repository already has a green baseline for dependency install, Jest, TypeScript build, and Vite build. Existing systems include deterministic terrain generation, vault-first storage, production/extraction, road-gated transport jobs, carrier movement, construction, upgrades, hiring, territory influence, event logs, campaign objectives, and a Pixi-rendered isometric map.

## Architecture

Keep the simulation state authoritative in `WorldState` and keep rendering as a projection of store state. Add military and enemy pressure as a small deterministic domain under `src/game/military`, then call it from `tickWorld` after economy/AI actions and before scheduled world events. Use `warInfant` workers as soldiers so the existing worker hiring and population systems stay intact.

## Gameplay Decisions

- The player starts with a central vault, starter production, roads, carriers, and enough resources to bootstrap.
- A visible hostile faction owns a small edge territory with a vault and spire.
- `pitOfWarBirth` recruits `warInfant` soldiers through existing worker hiring costs.
- `spireOfJurisdiction` contributes territory and defense strength.
- Enemy pressure rises on a deterministic schedule based on scenario profile: sandbox/easy, challenging/medium, hardcore/hard.
- Combat is tick based and automated: defense strength from player soldiers and spires is compared against incoming raid strength. Successful defense logs an event; failed defense damages the vault and can trigger defeat if the vault is destroyed.

## UI Decisions

- `MilitaryPanel` becomes a real panel showing soldiers, defense strength, next attack, active raid, enemy pressure, and a recruit action when a war pit exists.
- `TopHud` exposes speed controls at 1x, 2x, and 4x.
- The territory layer tints player, enemy, and neutral territory under roads/buildings.
- `/debug` reports seed, tick, world metrics, transport, AI, pathing, and military data.
- Settings keeps the existing scenario selector and labels it as difficulty.

## Testing

Add deterministic Jest coverage for:

- soldier counts and defense strength derivation,
- raid spawning and combat resolution,
- defeat when the vault is destroyed,
- `aiOwnerId` routing AI actions to the hostile faction instead of the player,
- render projection carrying tile ownership for the territory layer.

## Scope Boundary

This slice favors stability and playability over content breadth. It does not add manual combat commands, siege pathfinding, formations, or new image assets.
