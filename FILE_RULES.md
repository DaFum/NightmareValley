# FILE_RULES (file-specific TODOs)

> NOTE: Only TODO entries explicitly marked as "production-only" must drive changes in production source files.
> TODOs labeled for smoke/render/compile/validation or test-related tasks should be implemented in test code.
> Always follow the explicit scope label of the TODO before editing files.

## src/App.tsx

- **TODO:** Add a smoke code for that mounts `src/App.tsx` and verifies providers/routes render; include a minimal usage example in `README.md`.

## src/app/layout/GameLayout.tsx

- **TODO:** Add a snapshot/render code for `src/app/layout/GameLayout.tsx` covering desktop/mobile breakpoints and sample props.

## src/app/layout/HudLayout.tsx

- **TODO:** Add render code for `src/app/layout/HudLayout.tsx` that assert HUD element positions at common viewport sizes.

## src/app/layout/RootLayout.tsx

- **TODO:** Add  code for that mounts `src/app/layout/RootLayout.tsx` and asserts providers and `ErrorBoundary` are active.

## src/app/providers/AppProviders.tsx

- **TODO:** Add code for `src/app/providers/AppProviders.tsx` to confirm stores, theme, and error boundary are injected; include a doc snippet.

## src/app/providers/ErrorBoundary.tsx

- **TODO:** Add a code for `ErrorBoundary.tsx` that throws within a child component and asserts fallback UI and logged errors.

## src/app/providers/ThemeProvider.tsx

- **TODO:** Add code for `ThemeProvider.tsx` verifying toggle, `localStorage` persistence, and presence of theme CSS variables.

## src/app/routes/DebugRoute.tsx

- **TODO:** Add render code for `src/app/routes/DebugRoute.tsx` gated by dev mode and assert it's omitted in production builds.

## src/app/routes/GameRoute.tsx

- **TODO:** Add  code for that mounts `src/app/routes/GameRoute.tsx`, asserts `GameCanvas` initializes, and a minimal world render happens.

## src/app/routes/NotFoundRoute.tsx

- **TODO:** Add a render code for `NotFoundRoute.tsx` asserting visible navigation links and suggested actions.

## src/assets/maps/nightmare_valley.json

- **TODO:** Validate `nightmare_valley.json` with the internal map schema and add a loader code for (via `tiled.adapter.ts`) asserting layer/tile counts.

## src/assets/maps/nightmare_valley.tmx

- **TODO:** Add a TMX parse code for `nightmare_valley.tmx` using `tiled.adapter.ts` and include original editor/source metadata.

## src/assets/maps/code for_iso_map.json

- **TODO:** Keep `code for_iso_map.json` as a fixture for code for covering iso projection, hit-code foring, and chunking behavior.

## src/assets/spritesheets/buildings-sheet.json

- **TODO:** Validate frames/coordinates in `buildings-sheet.json` against source PNGs and ensure `manifest.json` references it.
- **TODO:** Add licensing/origin metadata for `buildings-sheet.json` into the spritesheets manifest if missing.

## src/env.d.ts

- **TODO:** Verify ambient module declarations in `src/env.d.ts`; add a small compile code for to ensure `import.meta.env` typings are present.

## src/game/ai/ai.economy.ts

- **TODO:** Add code for this module: cover decision logic, resource allocation across ticks, and  scenarios (use seeded RNG where applicable).
- **TODO:** Document assumptions, invariants, and edge-cases for this module (add short summary in code for comments and in Architektur.md if applicable).

## src/game/ai/ai.expansion.ts

- **TODO:** Add code for this module: cover territory selection and build-placement decisions, and  outcomes under seeded RNG.
- **TODO:** Document expansion heuristics, expected invariants, and edge-cases (e.g., tie-breaking rules).

## src/game/ai/ai.military.ts

- **TODO:** Add code for military decision-making: combat target selection, threat evaluation, and  action sequences with seeded RNG.
- **TODO:** Document military heuristics, acceptable input ranges, and failure modes (e.g., no-units available).

## src/game/ai/ai.priority.ts

- **TODO:** Add code for priority calculation functions: varied input weights, tie-breaking, and  outputs with seeded RNG.
- **TODO:** Document priority weight meanings, expected invariants, and how priorities interact with other AI subsystems.

## src/game/ai/ai.state.ts

- **TODO:** Add code for AI state transitions and persistence across ticks; include  replay code for with seeded RNG.
- **TODO:** Document state machine structure, allowed transitions, and edge-cases (e.g., invalid state recovery).

## src/game/ai/ai.tick.ts

- **TODO:** Add code for AI tick execution: sequence of subsystems, idempotency, and  results using seeded RNG.
- **TODO:** Document tick ordering, expected invariants, and performance considerations.

## src/game/ai/ai.types.ts

- **TODO:** Add code for that validate exported types/interfaces are used correctly in example inputs and edge cases.
- **TODO:** Document type invariants and expected contract for consumers of these types.

## src/game/camera/camera.clamp.ts

- **TODO:** Add code for camera clamping: world-bounds enforcement at min/max zoom and viewport sizes.
- **TODO:** Document assumptions about world margins, tile-size scaling, and behavior at extreme zoom levels.

## src/game/camera/camera.logic.ts

- **TODO:** Add code for camera centering, follow-target smoothing, and interactions with pan/zoom, including edge-case positions.
- **TODO:** Document update ordering and interactions with input handlers and world constraints.

## src/game/camera/camera.pan.ts

- **TODO:** Add code for pan inertia, drag thresholds, and multi-touch input cases; assert consistent results across devices.
- **TODO:** Document pan thresholds, expected smoothing, and failure modes (e.g., rapid input bursts).

## src/game/camera/camera.types.ts

- **TODO:** Add code for camera-related types and sample fixtures exercising edge-case values.
- **TODO:** Document type contracts, units (pixels vs world units), and expected ranges.

## src/game/camera/camera.zoom.ts

- **TODO:** Add code for zoom behavior: zoom-to-cursor, min/max zoom clamping, and zoom smoothing interactions.
- **TODO:** Document zoom math, expected limits, and interaction with camera clamp logic.

## src/game/core/economy.data.ts

- **TODO:** Add code for data integrity in `economy.data.ts`: recipe and resource definitions validate against expected schema.
- **TODO:** Document assumptions about data units, default values, and any canonical ordering.

## src/game/core/economy.simulation.ts

- **TODO:** Add  simulation code for production/consumption over N ticks and assert resource conservation where expected.
- **TODO:** Document tick invariants, expected rounding/overflow behavior, and performance considerations.

## src/game/core/economy.types.ts

- **TODO:** Add code for that validate economy types against sample payloads and invalid inputs.
- **TODO:** Document type contracts and any compatibility expectations.

## src/game/core/entity.ids.ts

- **TODO:** Add code for ID generation: uniqueness across sequences and  behavior with seeds if applicable.
- **TODO:** Document id format, entropy assumptions, and collision expectations.

## src/game/core/game.constants.ts

- **TODO:** Add code for that assert constant values are present and used consistently in the code forbase (e.g., tick rates, tile sizes).
- **TODO:** Document constants' intended use and any platform-dependent assumptions.

## src/game/core/game.types.ts

- **TODO:** Add code for exported game types and example fixtures showing valid/invalid shapes.
- **TODO:** Document type contracts, backwards-compatibility notes, and typical value ranges.

## src/game/core/random.ts

- **TODO:** Add code for verifying RNG seeding, reproducibility, and edge values; include code for  sequences.
- **TODO:** Document RNG contract (seed behavior) and recommended usage across subsystems.

## src/game/core/victory.rules.ts

- **TODO:** Add code for victory condition evaluation under different world states and edge-case triggers.
- **TODO:** Document win/loss conditions, evaluation frequency, and known edge-cases.

## src/game/economy/balancing.constants.ts

- **TODO:** Add code for asserting balancing constants remain within sane bounds and changes are surfaced in snapshots.
- **TODO:** Document balancing assumptions and how constants affect gameplay metrics.

## src/game/economy/economy.snapshot.ts

- **TODO:** Add snapshot code for that produce  economy snapshots for given world seeds and tick counts.
- **TODO:** Document what each snapshot field represents and when to use snapshots for debugging.

## src/game/economy/extraction.logic.ts

- **TODO:** Add code for extraction rates, deposit depletion behavior, and  extraction outcomes with seeded RNG.
- **TODO:** Document deposit assumptions, depletion rates, and error modes (e.g., missing deposit data).

## src/game/economy/production.logic.ts

- **TODO:** Add code for recipe consumption/production over ticks and edge cases like insufficient inputs.
- **TODO:** Document production rules, bottleneck behaviors, and rounding rules.

## src/game/economy/recipes.data.ts

- **TODO:** Add schema/consistency code for recipe definitions and sample conversions.
- **TODO:** Document recipe assumptions (e.g., units, time costs) and backward compatibility.

## src/game/economy/recipes.types.ts

- **TODO:** Add code for recipe types and example fixtures for invalid/valid recipes.
- **TODO:** Document type invariants and optional/required fields.

## src/game/economy/stockpile.logic.ts

- **TODO:** Add code for stockpile add/remove/reservation behavior, edge-case overflow, and  ordering.
- **TODO:** Document reservation rules, capacity assumptions, and concurrency considerations.

## src/game/economy/transport.logic.ts

- **TODO:** Add code for transport job creation, assignment, and delivery flows; include  scenarios with seeded RNG.
- **TODO:** Document reservation semantics, route expectations, and failure modes.

## src/game/entities/buildings/building.data.ts

- **TODO:** Add code for asserting building data (cost, size, slots) match expected definitions and manifest references.
- **TODO:** Document data schema fields and any optional/required metadata.

## src/game/entities/buildings/building.footprints.ts

- **TODO:** Add code for footprint calculations and placement masks for common building sizes; include overlap/edge cases.
- **TODO:** Document footprint coordinate system, rotation rules, and placement constraints.

## src/game/entities/buildings/building.logic.ts

- **TODO:** Add code for building state transitions (construction -> active), blocked states, and production triggers.
- **TODO:** Document lifecycle states, blocking reasons, and expected inputs/outputs.

## src/game/entities/buildings/building.placement.ts

- **TODO:** Add code for placement acceptance/rejection across boundary and occlusion cases; include footprint overlap code for.
- **TODO:** Document placement rules, required adjacency constraints, and failure reasons.

## src/game/entities/buildings/building.status.ts

- **TODO:** Add code for deriving building status (idle, working, blocked) from inputs and world state snapshots.
- **TODO:** Document status computation rules and observable triggers.

## src/game/entities/buildings/building.types.ts

- **TODO:** Add code for that validate building type shapes and sample fixtures for each building type.
- **TODO:** Document type fields, expected defaults, and compatibility notes.

## src/game/entities/buildings/building.upgrades.ts

- **TODO:** Add code for upgrade cost calculations, effect application, and invalid upgrade handling.
- **TODO:** Document upgrade prerequisites, effect semantics, and rollback behavior.

## src/game/entities/roads/road.connections.ts

- **TODO:** Add code for road connectivity graph updates on add/remove and edge-case junctions.
- **TODO:** Document connection rules, expected neighbor ordering, and constraints.

## src/game/entities/roads/road.logic.ts

- **TODO:** Add code for road creation/removal, automatic connection stitching, and invalid placement rejection.
- **TODO:** Document intended connection behaviors and performance considerations.

## src/game/entities/roads/road.render-shape.ts

- **TODO:** Add code for mapping road topology to sprite choices; include corner/cross/t-junction cases.
- **TODO:** Document mapping rules and expected sprite selection logic.

## src/game/entities/roads/road.types.ts

- **TODO:** Add code for road-related types and example fixtures for unusual topologies.
- **TODO:** Document type contracts and any assumptions about indexing/ordering.

## src/game/entities/roads/road.validation.ts

- **TODO:** Add code for validation logic: illegal placements, overlapping structures, and correct error messages.
- **TODO:** Document validation rules, priority of checks, and remediation steps.

## src/game/entities/workers/worker.animation.ts

- **TODO:** Add code for verifying animation selection for worker states and transitions under sample inputs.
- **TODO:** Document mapping from worker state to animation and fallback behaviors.

## src/game/entities/workers/worker.data.ts

- **TODO:** Add code for ensuring worker data (speed, capacity) follow documented constraints and defaults.
- **TODO:** Document data fields, units, and expected ranges.

## src/game/entities/workers/worker.jobs.ts

- **TODO:** Add code for job assignment, priority handling, and edge-cases like no-available-workers.
- **TODO:** Document job lifecycle and expected preconditions for assignment.

## src/game/entities/workers/worker.logic.ts

- **TODO:** Add code for worker behavior: state transitions, job pickup/dropoff, and  movement under seeded RNG.
- **TODO:** Add benchmarks for pathing hot-paths and document performance expectations.
- **TODO:** Document assumptions about capacities, collision resolution, and retry logic.

## src/game/entities/workers/worker.pathing.ts

- **TODO:** Add code for worker path calculation, re-pathing, and edge cases with blocked nodes; ensure  behavior with seeds.
- **TODO:** Document pathing constraints, heuristics, and cache invalidation rules.

## src/game/entities/workers/worker.status.ts

- **TODO:** Add code for deriving worker status from job and movement states, including concurrent updates.
- **TODO:** Document status definitions and any transient states.

## src/game/entities/workers/worker.types.ts

- **TODO:** Add code for worker type shapes and sample fixtures covering role variations.
- **TODO:** Document field meanings, optional fields, and compatibility notes.

## src/game/events/disaster.logic.ts

- **TODO:** Add  code for disaster triggers, propagation, and recovery behavior using seeded RNG.
- **TODO:** Document disaster parameters, trigger conditions, and recovery paths.

## src/game/events/events.data.ts

- **TODO:** Add schema/consistency code for event definitions and example payloads.
- **TODO:** Document event metadata fields and usage examples.

## src/game/events/events.logic.ts

- **TODO:** Add code for event evaluation and ordering, including edge-case overlaps and  ordering.
- **TODO:** Document event processing order and expected side-effects.

## src/game/events/events.types.ts

- **TODO:** Add code for event types and sample fixtures required fields.
- **TODO:** Document type contracts and field semantics.

## src/game/events/random-events.ts

- **TODO:** Add  code for random event scheduling and ensuring seeded RNG reproduces sequences.
- **TODO:** Document scheduling heuristics and any rate-limiting or cooldown rules.

## src/game/iso/iso.bounds.ts

- **TODO:** Add code for iso bounds calculation and viewport clipping at various zooms and tile sizes.
- **TODO:** Document coordinate spaces and any conversion assumptions.

## src/game/iso/iso.constants.ts

- **TODO:** Add code for asserting iso constants (tile width/height, offsets) are consistent and used properly.
- **TODO:** Document how constants affect projection math and any compatibility notes.

## src/game/iso/iso.depth.ts

- **TODO:** Add code for depth sorting rules given a set of entities with varying footpoints and Y positions.
- **TODO:** Document depth tie-breaking rules and expected rendering order.

## src/game/iso/iso.hit-code for.ts

- **TODO:** Add code for hit-code foring tiles and sprites (diamond hit areas), including edge and boundary cases.
- **TODO:** Document hit-code for math and behavior when tiles overlap or are occluded.

## src/game/iso/iso.inverse.ts

- **TODO:** Add code for inverse projection from screen->tile for representative viewport transforms.
- **TODO:** Document numeric stability concerns and rounding conventions.

## src/game/iso/iso.project.ts

- **TODO:** Add code for projection math for canonical tile coordinates and rotated viewports.
- **TODO:** Document projection formula derivation and coordinate system assumptions.

## src/game/iso/iso.selection.ts

- **TODO:** Add code for selection algorithms (single/tile/area) ensuring consistent selection and deselection semantics.
- **TODO:** Document selection priority rules and expected UX behaviors.

## src/game/iso/iso.snap.ts

- **TODO:** Add code for snapping rules when placing buildings and ensure expected tile alignment across rotations.
- **TODO:** Document snap rules and tolerance thresholds.

## src/game/iso/iso.types.ts

- **TODO:** Add code for iso-related types and example fixtures for conversion helpers.
- **TODO:** Document type expectations and coordinate system notes.

## src/game/map/map.building-slots.ts

- **TODO:** Add code for building slot detection and validity across various footprints and terrains.
- **TODO:** Document slot allocation rules and priority ordering.

## src/game/map/map.chunks.ts

- **TODO:** Add code for chunking logic, culling, and expected chunk boundaries at different viewports.
- **TODO:** Document chunk size choices and culling heuristics.

## src/game/map/map.constants.ts

- **TODO:** Add code for asserting map constants and ensure safe defaults are present.
- **TODO:** Document constant meanings and any constraints they impose.

## src/game/map/map.generator.ts

- **TODO:** Add  generator code for seeded world generation and ensure repeatable outputs.
- **TODO:** Document generation parameters and tuning knobs.

## src/game/map/map.loader.ts

- **TODO:** Add loader code for JSON/TMX inputs, layers, tile indices, and error handling.
- **TODO:** Document loader assumptions and supported input variants.

## src/game/map/map.occupancy.ts

- **TODO:** Add code for occupancy lookup, reservation, and eviction behaviors; include concurrency scenarios.
- **TODO:** Document occupancy semantics and expected invariants.

## src/game/map/map.query.ts

- **TODO:** Add code for `getTileAt`, neighbor queries, and buildability checks under varied inputs.
- **TODO:** Document query complexity and caching expectations.

## src/game/map/map.territory.ts

- **TODO:** Add code for territory assignment, ownership changes, and edge merge behaviors.
- **TODO:** Document territory propagation rules and conflict resolution.

## src/game/map/map.types.ts

- **TODO:** Add code for map types and sample fixtures for tile/layer structures.
- **TODO:** Document type contracts and optional fields.

## src/game/map/tiled.adapter.ts

- **TODO:** Add code for converting Tiled JSON to internal map format, object layers and properties.
- **TODO:** Document adapter limitations and supported Tiled features.

## src/game/pathing/path.a-star.ts

- **TODO:** Add code for A* correctness on varied grids, including blocked cells, and  tie-breaking.
- **TODO:** Document heuristic choices and complexity expectations.

## src/game/pathing/path.cache.ts

- **TODO:** Add code for path cache hits/misses, invalidation, and memory constraints.
- **TODO:** Document cache TTL and invalidation triggers.

## src/game/pathing/path.debug.ts

- **TODO:** Add code for that validate debug output formatting and ensure debug helpers do not alter state.
- **TODO:** Document how to enable/interpret debug traces.

## src/game/pathing/path.flowfield.ts

- **TODO:** Add code for flowfield generation and correctness under multiple destinations and obstacles.
- **TODO:** Document flowfield update frequency and expected performance characteristics.

## src/game/pathing/path.grid.ts

- **TODO:** Add code for grid walkability, neighbor enumeration, and bounds handling.
- **TODO:** Document grid origin, indexing, and performance notes.

## src/game/pathing/path.types.ts

- **TODO:** Add code for path-related types and example payloads for callers.
- **TODO:** Document type expectations and fields in interfaces.

## src/game/render/render.adapter.ts

- **TODO:** Add code for that verify simulation->render adapter transforms expected entity fields and z-order.
- **TODO:** Document adapter responsibilities and expected input/output shapes.

## src/game/render/render.animations.ts

- **TODO:** Add code for mapping logic states to animation frames and transitions under sample states.
- **TODO:** Document animation timing rules and fallback behavior.

## src/game/render/render.culling.ts

- **TODO:** Add code for culling: entities inside/outside viewport and chunk-level culling behavior.
- **TODO:** Document culling heuristics and corner cases for large entities.

## src/game/render/render.debug.ts

- **TODO:** Add code for ensuring debug render helpers are side-effect free and produce expected overlays.
- **TODO:** Document debug toggles and expected overlay semantics.

## src/game/render/render.interpolation.ts

- **TODO:** Add code for verifying position interpolation between ticks and edge-case behavior at variable tick deltas.
- **TODO:** Document interpolation strategy and numerical stability notes.

## src/game/render/render.overlays.ts

- **TODO:** Add code for overlay rendering decisions (status icons, selection markers) and ordering.
- **TODO:** Document overlay priorities and expected triggers.

## src/game/render/render.sort.ts

- **TODO:** Add code for ensuring stable sorting by footpoint/Y and predictable tie-breakers across render frames.
- **TODO:** Document sorting invariants and performance implications.

## src/game/render/render.textures.ts

- **TODO:** Add code for that validate texture lookup mapping for entity types and fallback behavior when textures missing.
- **TODO:** Document texture naming conventions and manifest expectations.

## src/game/render/render.types.ts

- **TODO:** Add code for render-type interfaces and usage examples for renderers.
- **TODO:** Document type contracts and expected data shapes.

## src/game/selection/selection.actions.ts

- **TODO:** Add code for selection action creators and resulting state mutations under common flows.
- **TODO:** Document action semantics and expected preconditions.

## src/game/selection/selection.logic.ts

- **TODO:** Add code for selection resolution logic (hover, click, drag) and conflict resolution with UI overlays.
- **TODO:** Document selection priority rules and interaction with placement mode.

## src/game/selection/selection.queries.ts

- **TODO:** Add code for queries returning selection candidates and boundary cases with overlapping entities.
- **TODO:** Document query complexity and caching behavior.

## src/game/selection/selection.types.ts

- **TODO:** Add code for selection types and expected shapes for different selection modes.
- **TODO:** Document type fields and optional metadata.

## src/game/transport/carrier.routing.ts

- **TODO:** Add code for carrier routing selection and  routing under identical constraints.
- **TODO:** Document routing heuristics and expected performance bounds.

## src/game/transport/transport.assignment.ts

- **TODO:** Add code for transport assignment fairness, starvation cases, and  assignment under seeded RNG.
- **TODO:** Document assignment priorities and reservation guarantees.

## src/game/transport/transport.delivery.ts

- **TODO:** Add code for delivery handoff, success/failure conditions, and edge-case drop scenarios.
- **TODO:** Document delivery lifecycle and retry semantics.

## src/game/transport/transport.jobs.ts

- **TODO:** Add code for job creation, prioritization, and lifecycle completion under varied world states.
- **TODO:** Document job type semantics and expected payloads.

## src/game/transport/transport.metrics.ts

- **TODO:** Add code for asserting metric calculations (throughput, latency) produce expected values under sample traces.
- **TODO:** Document metric definitions and acceptable ranges.

## src/game/transport/transport.reservation.ts

- **TODO:** Add code for reservation semantics, conflicts, and expiry behavior under high contention.
- **TODO:** Document reservation lifecycle and rules for preemption.

## src/game/transport/transport.types.ts

- **TODO:** Add code for transport-related types and sample job/reservation fixtures.
- **TODO:** Document type contracts and backward compatibility notes.

## src/game/world/world.generator.ts

- **TODO:** Add  world generator code for using seeds and assert repeatable outputs across runs.
- **TODO:** Document generator parameters and constraints.

## src/game/world/world.metrics.ts

- **TODO:** Add code for verifying metric aggregation over ticks and edge-case handling when entities are removed.
- **TODO:** Document metric definitions and collection intervals.

## src/game/world/world.state.ts

- **TODO:** Add code for world state initialization, snapshot/restore, and  tick replay with seeded RNG.
- **TODO:** Document world state shape and persistence expectations.

## src/game/world/world.tick.ts

- **TODO:** Add code for full world tick orchestration and ensure  ordering of subsystem updates.
- **TODO:** Document tick ordering, per-subsystem invariants, and time budget expectations.

## src/game/world/world.types.ts

- **TODO:** Add code for world type shapes and example fixtures for serialization.
- **TODO:** Document type fields and compatibility expectations.

## src/lib/array.ts

- **TODO:** Add code for in `src/code for/lib/array.code for.ts` covering exported helpers (edge cases: empty arrays, single elements, duplicates) and verify functions do not mutate inputs; add JSDoc and explicit TypeScript types for all exports.

## src/lib/asserts.ts

- **TODO:** Add code for in `src/code for/lib/asserts.code for.ts` that assert correct throw/no-throw behavior for truthy/falsey inputs; add JSDoc and TypeScript types for exported helpers.

## src/lib/deep-clone.ts

- **TODO:** Add code for in `src/code for/lib/deep-clone.code for.ts` covering nested objects, arrays, and special types (Date/RegExp if supported); assert clones are deep and independent; add JSDoc and TypeScript types.

## src/lib/logger.ts

- **TODO:** Add code for in `src/code for/lib/logger.code for.ts` to validate formatting, level filtering, and that the logger can be mocked; add JSDoc and TypeScript types for public APIs.

## src/lib/math.ts

- **TODO:** Add code for in `src/code for/lib/math.code for.ts` exercising boundary values, NaN/infinite handling, and rounding behavior for exported helpers; add JSDoc and TypeScript types.

## src/lib/object.ts

- **TODO:** Add code for in `src/code for/lib/object.code for.ts` for exported helpers (merge/clone/pick/omit behaviors), including null/undefined edge-cases; add JSDoc and TypeScript types.

## src/lib/profiler.ts

- **TODO:** Add code for in `src/code for/lib/profiler.code for.ts` that validate start/stop, measurement reporting, and no-op behavior in production; add JSDoc and TypeScript types.

## src/main.tsx

- **TODO:** Add a mount/hydration smoke code for; verify global `error` and `unhandledrejection` handlers are registered and document startup commands.

## src/pixi/GameCanvas.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/GameCanvas.code for.tsx`) that mounts this component with `PixiAppProvider`, asserts it renders without throwing, and verifies texture fallback behavior.

## src/pixi/GameStage.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/GameStage.code for.tsx`) that mounts the stage with textures mocked and asserts it renders without errors and respects texture readiness.

## src/pixi/PixiAppProvider.tsx

- **TODO:** Ensure `useTextures()` `ready` flag is checked before rendering textures; add a code for to cover missing-texture fallback.

## src/pixi/entities/buildings/BloodSmelteryGlow.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/BloodSmelteryGlow.code for.tsx`) that mounts this component and checks it renders without throwing and that any texture fallbacks are handled.

## src/pixi/entities/buildings/BloodSmelteryShadow.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/BloodSmelteryShadow.code for.tsx`) that mounts this component and asserts it renders without throwing; include a texture-fallback case.

## src/pixi/entities/buildings/BloodSmelterySmoke.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/BloodSmelterySmoke.code for.tsx`) that mounts this component and asserts it renders without throwing and handles missing textures.

## src/pixi/entities/buildings/BloodSmelterySparks.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/BloodSmelterySparks.code for.tsx`) that mounts this component and asserts it renders without throwing; include a texture-fallback assertion.

## src/pixi/entities/buildings/BloodSmelteryStatus.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/BloodSmelteryStatus.code for.tsx`) that mounts this component and checks render stability and texture fallback.

## src/pixi/entities/buildings/BloodSmelteryStorage.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/BloodSmelteryStorage.code for.tsx`) that mounts this component and asserts it renders without errors and handles missing textures.

## src/pixi/entities/buildings/IsoBloodSmeltery.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoBloodSmeltery.code for.tsx`) that mounts the component and asserts stable render behavior and texture fallback handling.

## src/pixi/entities/buildings/IsoBuildingLabel.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoBuildingLabel.code for.tsx`) that mounts this component and asserts it renders without errors and that label text is present.

## src/pixi/entities/buildings/IsoBuildingSelectionRing.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoBuildingSelectionRing.code for.tsx`) that mounts this component and asserts it renders and responds to selection props.

## src/pixi/entities/buildings/IsoBuildingShadow.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoBuildingShadow.code for.tsx`) that mounts this component and asserts it renders without throwing and handles fallback textures.

## src/pixi/entities/buildings/IsoBuildingSprite.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoBuildingSprite.code for.tsx`) that mounts this component and asserts correct sprite selection and fallback texture behavior.

## src/pixi/entities/buildings/IsoBuildingStatusIcon.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoBuildingStatusIcon.code for.tsx`) that verifies icon selection and render stability.

## src/pixi/entities/buildings/IsoConstructionOverlay.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoConstructionOverlay.code for.tsx`) that mounts overlay and asserts visibility and no runtime errors.

## src/pixi/entities/roads/IsoRoadNodeMarker.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoRoadNodeMarker.code for.tsx`) that mounts this component and asserts it renders correctly.

## src/pixi/entities/roads/IsoRoadSegment.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoRoadSegment.code for.tsx`) that mounts this component and asserts it renders and picks correct sprite variant.

## src/pixi/entities/roads/IsoRoadSprite.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoRoadSprite.code for.tsx`) that mounts this sprite and asserts correct render variant selection.

## src/pixi/entities/shared/IsoAnimatedIcon.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoAnimatedIcon.code for.tsx`) that mounts this component and asserts animation frame selection and render stability.

## src/pixi/entities/shared/IsoFootprintPreview.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoFootprintPreview.code for.tsx`) that mounts this component and asserts footprint preview behavior and no runtime errors.

## src/pixi/entities/shared/IsoHoverMarker.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoHoverMarker.code for.tsx`) that mounts this component and asserts hover marker visibility and no runtime errors.

## src/pixi/entities/shared/IsoSelectionDiamond.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoSelectionDiamond.code for.tsx`) that mounts this component and asserts selection diamond render and properties.

## src/pixi/entities/shared/IsoTextLabel.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoTextLabel.code for.tsx`) that mounts this component and asserts text content and accessibility attributes.

## src/pixi/entities/terrain/IsoAutotileSprite.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoAutotileSprite.code for.tsx`) that mounts this sprite and asserts autotile variant selection correctness.

## src/pixi/entities/terrain/IsoChunkSprite.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoChunkSprite.code for.tsx`) that mounts this chunk sprite and asserts it renders without error and respects texture readiness.

## src/pixi/entities/terrain/IsoTileSprite.tsx

- **TODO:** Ensure `useTextures()` `ready` flag is checked before rendering textures; add a code for to cover missing-texture fallback.

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoTileSprite.code for.tsx`) that mounts the tile sprite and verifies hit-area, texture selection, and fallback handling.

## src/pixi/entities/workers/IsoWorkerCarryIcon.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoWorkerCarryIcon.code for.tsx`) that mounts this component and asserts render stability and icon presence.

## src/pixi/entities/workers/IsoWorkerPathPreview.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoWorkerPathPreview.code for.tsx`) that mounts this component and asserts path preview rendering and performance characteristics.

## src/pixi/entities/workers/IsoWorkerSelectionMarker.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoWorkerSelectionMarker.code for.tsx`) that mounts this component and asserts selection marker visibility and no runtime errors.

## src/pixi/entities/workers/IsoWorkerShadow.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoWorkerShadow.code for.tsx`) that mounts this component and asserts shadow render and performance.

## src/pixi/entities/workers/IsoWorkerSprite.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoWorkerSprite.code for.tsx`) that mounts worker sprite, asserts animation frame selection, and fallback texture handling.

## src/pixi/hooks/useGameLoop.ts

- **TODO:** Add code for `useGameLoop` that simulate tick progression and assert callbacks are invoked and cleaned up correctly; include a simple render integration code for.

## src/pixi/hooks/useIsoCamera.ts

- **TODO:** Add code for `useIsoCamera` to assert transform math, center/zoom calculations, and correct cleanup on unmount.

## src/pixi/hooks/useIsoPointer.ts

- **TODO:** Add code for `useIsoPointer` to validate pointer->tile conversion and basic pointer-event flows under mocked viewport transforms.

## src/pixi/hooks/useRenderWorld.ts

- **TODO:** Add integration code for `useRenderWorld` that assert world rendering updates when world state changes and that subscriptions are cleaned up.

## src/pixi/hooks/useSelectionInput.ts

- **TODO:** Add unit/integration code for `useSelectionInput` covering click/drag selection flows and keyboard modifiers.

## src/pixi/hooks/useVisibleChunks.ts

- **TODO:** Add code for `useVisibleChunks` that assert correct chunk calculation given viewport transforms and chunk size.

## src/pixi/layers/IsoBuildingLayer.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.
- **TODO:** Ensure `useTextures()` `ready` flag is checked before rendering textures; add a code for to cover missing-texture fallback.
- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoBuildingLayer.code for.tsx`) that mounts the layer with a small set of buildings and asserts rendering and chunk culling behavior.

## src/pixi/layers/IsoDebugLayer.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoDebugLayer.code for.tsx`) that mounts the debug layer and asserts overlay rendering without side-effects.

## src/pixi/layers/IsoGhostPlacementLayer.tsx

- **TODO:** Add  code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoGhostPlacementLayer.code for.tsx`) verifying ghost placement visuals and snapping behavior.

## src/pixi/layers/IsoOverlayLayer.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoOverlayLayer.code for.tsx`) that ensures overlays render in the expected order and do not throw.

## src/pixi/layers/IsoRoadLayer.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoRoadLayer.code for.tsx`) that mounts a small road network and asserts correct sprite selection and no runtime errors.

## src/pixi/layers/IsoSelectionLayer.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoSelectionLayer.code for.tsx`) that asserts selection visuals and hit-code foring correctness.

## src/pixi/layers/IsoTerrainLayer.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.
- **TODO:** Ensure `useTextures()` `ready` flag is checked before rendering textures; add a code for to cover missing-texture fallback.
- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoTerrainLayer.code for.tsx`) that mounts a small terrain set and asserts tile rendering and fallback handling.

## src/pixi/layers/IsoTerritoryLayer.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoTerritoryLayer.code for.tsx`) that mounts territory polygons and asserts render stability.

## src/pixi/layers/IsoWaterLayer.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoWaterLayer.code for.tsx`) that mounts water tiles and asserts animations/render stability.

## src/pixi/layers/IsoWorkerEntity.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoWorkerEntity.code for.tsx`) that mounts a worker entity and asserts it renders and responds to basic state props.

## src/pixi/layers/IsoWorkerLayer.tsx

- **TODO:** Ensure `useTextures()` `ready` flag is checked before rendering textures; add a code for to cover missing-texture fallback.

- **TODO:** Add  code for in `src/code for/pixi/` (e.g., `src/code for/pixi/IsoWorkerLayer.code for.tsx`) that mounts several workers and asserts rendering and z-ordering.

## src/pixi/systems/animation.system.ts

- **TODO:** Add code for `animation.system` that assert frame advancement and cleanup behavior under mocked timing.

## src/pixi/systems/culling.system.ts

- **TODO:** Add unit/integration code for `culling.system` that assert entities are culled/un-culled correctly given viewport transforms.

## src/pixi/systems/debug.system.ts

- **TODO:** Add code for `debug.system` ensuring debug overlays produce expected traces without modifying state.

## src/pixi/systems/sorting.system.ts

- **TODO:** Add code for `sorting.system` verifying  ordering and tie-breakers for renderable entities.

## src/pixi/systems/texture.system.ts

- **TODO:** Add code for `texture.system` texture allocation/release and fallback insertion on load error.

## src/pixi/utils/pixi.cache.ts

- **TODO:** Add code for `pixi.cache` ensuring caching behavior, hits/misses and invalidation work as intended.

## src/pixi/utils/pixi.coordinates.ts

- **TODO:** Add code for coordinate conversion utilities and verify consistency with iso projection math.

## src/pixi/utils/pixi.depth.ts

- **TODO:** Add code for depth helpers to ensure sorting keys and tie-breakers are stable across inputs.

## src/pixi/utils/pixi.hitareas.ts

- **TODO:** Add code for hit-area calculations and diamond hit areas used by iso tiles and sprites.

## src/pixi/utils/pixi.iso.ts

- **TODO:** Add code for iso-specific Pixi helpers, ensuring transforms and projections are consistent.

## src/pixi/utils/pixi.spritesheet.ts

- **TODO:** Add code for spritesheet parsing and frame lookup functions with representative manifest fixtures.

## src/pixi/utils/pixi.textures.ts

- **TODO:** Add code for texture utilities to validate URI resolution, texture creation, and fallback handling.

## src/pixi/utils/spritesheetLoader.ts

- **TODO:** Surface loader errors instead of swallowing; add code for failure modes and ensure fallback texture is logged with context.

## src/pixi/utils/textureRegistry.ts

- **TODO:** Ensure `useTextures()` `ready` flag is checked before rendering textures; add a code for to cover missing-texture fallback.
- **TODO:** Ensure `initTextures()` is idempotent, expose  `ready` state, and add code for concurrency.

## src/pixi/utils/vite-asset-loader.ts

- **TODO:** Add code for to verify asset globbing and URL resolution behavior; include error-mode code for and ensure loader errors are surfaced.

## src/pixi/world/ChunkContainer.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/ChunkContainer.code for.tsx`) that mounts a small set of chunks and asserts that chunk mounting/unmounting and culling behave correctly.

## src/pixi/world/SortableWorldContainer.tsx

- **TODO:** Add a focused render code for in `src/code for/pixi/` (e.g., `src/code for/pixi/SortableWorldContainer.code for.tsx`) that mounts the container with multiple children and asserts stable z-order sorting and no runtime errors.

## src/pixi/world/WorldChunks.tsx

- **TODO:** Add  code for in `src/code for/pixi/` (e.g., `src/code for/pixi/WorldChunks.code for.tsx`) that asserts chunk generation, culling, and texture usage with mocked texture registry.

## src/pixi/world/WorldRoot.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

## src/pixi/world/WorldViewport.tsx

- **TODO:** Confirm `eventMode` values (`static`/`dynamic`/`passive`) are correct for intended interactions.

## src/store/camera.store.ts

- **TODO:** Ensure stores are fully typed and add code for selectors and actions.
- **TODO:** Avoid direct state mutations; prefer immutable updates or helper utilities.

## src/store/debug.store.ts

- **TODO:** Ensure stores are fully typed and add code for selectors and actions.
- **TODO:** Avoid direct state mutations; prefer immutable updates or helper utilities.

## src/store/game.store.ts

- **TODO:** Ensure stores are fully typed and add code for selectors and actions.
- **TODO:** Avoid direct state mutations; prefer immutable updates or helper utilities.

## src/store/render.store.ts

- **TODO:** Ensure stores are fully typed and add code for selectors and actions.
- **TODO:** Avoid direct state mutations; prefer immutable updates or helper utilities.

## src/store/selection.store.ts

- **TODO:** Ensure stores are fully typed and add code for selectors and actions.
- **TODO:** Avoid direct state mutations; prefer immutable updates or helper utilities.

## src/store/ui.store.ts

- **TODO:** Ensure stores are fully typed and add code for selectors and actions.
- **TODO:** Avoid direct state mutations; prefer immutable updates or helper utilities.

## src/styles/globals.css

- **TODO:** Audit CSS variables and base styles; add a visual regression baseline for key pages and document theme tokens used.

## src/styles/reset.css

- **TODO:** Verify the reset rules are minimal and compatible across browsers; annotate source and add a small screenshot code for.

## src/styles/theme.css

- **TODO:** Verify dark/light tokens and color contrast for accessibility; add examples for theme switching and code for variable presence.

## src/styles/ui.css

- **TODO:** Ensure component classes are scoped and documented; add style code for (class presence) and responsive breakpoint checks.

## src/code for/core/building.placement.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/core/economy.simulation.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/core/pathfinding.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/core/transport.logic.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/iso/iso.depth.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/iso/iso.hit-code for.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/iso/iso.inverse.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/iso/iso.project.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/render/render.adapter.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/render/render.culling.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/code for/render/render.sort.code for.ts

- **TODO:** Run code for and address failures; add coverage for recent changes.

## src/ui/dialogs/PauseMenuDialog.tsx

- **TODO:** Add interactive code for (keyboard shortcuts, focus trap) and accessibility checks; ensure close behavior and analytics logging are code fored.

## src/ui/dialogs/SettingsDialog.tsx

- **TODO:** Add control code for toggles/inputs, verify persistence of settings, and ensure ARIA labels are present.

## src/ui/dialogs/VictoryDialog.tsx

- **TODO:** Add render and callback code for; verify button actions (continue/restart) and success-state visuals.

## src/ui/hud/FpsCounter.tsx

- **TODO:** Add a render code for with simulated tick updates; assert value formatting and that updates are throttled to avoid excessive re-renders.

## src/ui/hud/PopulationBar.tsx

- **TODO:** Add code for dynamic value updates and responsive layout; verify accessibility labels for current population.

## src/ui/hud/ResourceBar.tsx

- **TODO:** Add code for resource formatting, tooltip behavior, and stress-code for with many resource types to check performance.

## src/ui/hud/TopHud.tsx

- **TODO:** Add render/integration code for ensuring layout and interactions with HUD elements; code for keyboard navigation where applicable.

## src/ui/hud/TransportIndicator.tsx

- **TODO:** Add code for indicator states and ensure accessible text/labels are present for screen readers.

## src/ui/hud/WorldPulseBar.tsx

- **TODO:** Add code for to verify pulse/animation bounds and that it remains performant under frequent updates.

## src/ui/panels/BuildingInspector.tsx

- **TODO:** Add data-driven code for multiple building types and ensure proper focus and keyboard navigation.

## src/ui/panels/BuildingMenu.tsx

- **TODO:** Add interaction code for selection, hover previews, and keyboard navigation between menu items.

## src/ui/panels/EconomyPanel.tsx

- **TODO:** Add rendering code for economic statistics and verify computations shown match simulation snapshots.

## src/ui/panels/EventLogPanel.tsx

- **TODO:** Add code for log append behavior, filtering, and clear actions; verify scroll behavior with many entries.

## src/ui/panels/InspectorPanel.tsx

- **TODO:** Add render code for and ensure selection changes in state reflect correctly in the panel UI.

## src/ui/panels/MapDebugPanel.tsx

- **TODO:** Add code for toggleable debug layers and ensure no runtime errors when toggling options on/off.

## src/ui/panels/MilitaryPanel.tsx

- **TODO:** Add code for unit listings, command buttons, disabled states, and proper aria labels for controls.

## src/ui/panels/WorkerInspector.tsx

- **TODO:** Add code for worker state rendering and job assignment flows; ensure UI updates reflect state changes.

## src/ui/shared/HotkeyHint.tsx

- **TODO:** Add code for correct key rendering and ensure tooltip/accessibility text is present.

## src/ui/shared/Icon.tsx

- **TODO:** Add code for icon rendering with different sizes and ensure `aria-hidden`/roles are correctly applied.

## src/ui/shared/Panel.tsx

- **TODO:** Add wrapper render code for, confirm class names and ARIA landmarks, and include a usage example.

## src/ui/shared/SectionTitle.tsx

- **TODO:** Add small render code for and ensure heading levels and semantics are preserved for accessibility.

## src/ui/shared/StatRow.tsx

- **TODO:** Add snapshot/render code for different stat types and edge values.

## src/ui/shared/Tooltip.tsx

- **TODO:** Add code for show/hide triggers, hover/focus flows, and verify `aria-describedby`/roles for accessibility.

## symbols.json

- **TODO:** Verify the symbol index reflects exported modules; add a regeneration script or CI check and document how to refresh it.

## code for/pixi/textureRegistry.code for.ts

- **TODO:** Ensure code for cover fallback texture behavior and loader error modes; add  fixtures for CI.

## tsconfig.json

- **TODO:** Verify build/dev/CI scripts are accurate and compatible with current Node/Vite/TypeScript versions.
- **TODO:** Document any non-default flags in `README.md` or `Architektur.md`.

## vite.config.ts

- **TODO:** Verify build/dev/CI scripts are accurate and compatible with current Node/Vite/TypeScript versions.
- **TODO:** Document any non-default flags in `README.md` or `Architektur.md`.

