## FILE_RULES (implementation-focused audit status)

Note: These items are tracked implementation tasks that should result in production code changes in the referenced source files (implementations, runtime behavior, and docs/examples). They are intentionally focused on producing or fixing code in the prod files rather than creating test scaffolding.

Audit status (2026-04-25): VERIFIED entries passed repository checks (file exists + no obvious stub markers + test suite pass). Current tally: VERIFIED=242, UNVERIFIED=0.

## src/App.tsx

- **VERIFIED:** * Implement provider wiring and route mounting in `src/App.tsx`: ensure providers and routes initialize at runtime and export an easy-to-mount `App` component. Add a short usage example in `README.md`.

## src/app/layout/GameLayout.tsx

- **VERIFIED:** * Implement responsive layout logic and runtime props handling in `src/app/layout/GameLayout.tsx` for desktop and mobile breakpoints.

## src/app/layout/HudLayout.tsx

- **VERIFIED:** * Implement HUD placement and layout rules in `src/app/layout/HudLayout.tsx` so HUD elements are positioned correctly across viewports.

## src/app/layout/RootLayout.tsx

- **VERIFIED:** * Implement root composition in `src/app/layout/RootLayout.tsx`: wire providers and `ErrorBoundary` for production usage.

## src/app/providers/AppProviders.tsx

- **VERIFIED:** * Implement `AppProviders` to register stores, theme, and error handling at runtime; export the provider component and document its public API.

## src/app/providers/ErrorBoundary.tsx

- **VERIFIED:** * Implement a production `ErrorBoundary` rendering a fallback UI and logging errors to the configured logger/telemetry.

## src/app/providers/ThemeProvider.tsx

- **VERIFIED:** * Implement theme provider behavior: toggle API, `localStorage` persistence, and injection of CSS variables.

## src/app/routes/DebugRoute.tsx

- **VERIFIED:** * Implement `DebugRoute` feature-flagging so it is excluded from production bundles when appropriate.

## src/app/routes/GameRoute.tsx

- **VERIFIED:** * Implement `GameRoute` startup and bootstrap `GameCanvas` for runtime initialization.

## src/app/routes/NotFoundRoute.tsx

- **VERIFIED:** * Implement a user-facing Not Found UI with navigation actions and suggested recovery.

## src/assets/maps/nightmare_valley.json

- **VERIFIED:** * Implement map validation in the loader and add runtime checks with clear errors for malformed maps.

## src/assets/maps/nightmare_valley.tmx

- **VERIFIED:** * Implement TMX ingestion and preserve source/editor metadata when converting to internal map format.

## src/assets/maps/code for_iso_map.json

- **VERIFIED:** * Treat this fixture as a production example used by the loader and projection code; ensure it remains runnable.

## src/assets/spritesheets/buildings-sheet.json

- **VERIFIED:** * Validate spritesheet frames at build/runtime and ensure `manifest.json` points to correct assets; add licensing metadata if needed.

## src/env.d.ts

- **VERIFIED:** * Ensure ambient module declarations cover runtime usage (`import.meta.env` etc.) and adjust typings as necessary.

## src/game/ai/ai.economy.ts

- **VERIFIED:** * Implement production AI economy logic: decisions, resource allocation, and seeded-RNG compatibility; document invariants.

## src/game/ai/ai.expansion.ts

- **VERIFIED:** * Implement expansion heuristics and placement decisions used by the production AI.

## src/game/ai/ai.military.ts

- **VERIFIED:** * Implement military decision-making and threat evaluation for runtime; document edge-case behavior.

## src/game/ai/ai.priority.ts

- **VERIFIED:** * Implement priority calculation utilities and document weight semantics for production use.

## src/game/ai/ai.state.ts

- **VERIFIED:** * Implement AI state machine and persistence behavior required for runtime ticks.

## src/game/ai/ai.tick.ts

- **VERIFIED:** * Implement AI tick orchestration (ordering, idempotency) in production code.

## src/game/ai/ai.types.ts

- **VERIFIED:** * Define and refine AI types/interfaces used across production modules.

## src/game/camera/camera.clamp.ts

- **VERIFIED:** * Implement camera clamp logic to enforce world bounds at various zoom and viewport sizes.

## src/game/camera/camera.logic.ts

- **VERIFIED:** * Implement camera centering and smoothing behavior for production usage.

## src/game/camera/camera.pan.ts

- **VERIFIED:** * Implement pan behavior (inertia, drag thresholds, multi-touch) as production features.

## src/game/camera/camera.types.ts

- **VERIFIED:** * Define production camera types and document units/expected ranges.

## src/game/camera/camera.zoom.ts

- **VERIFIED:** * Implement zoom-to-cursor, clamping and smoothing used by production camera controls.

## src/game/core/economy.data.ts

- **VERIFIED:** * Implement and validate production economy data (recipes/resources) with clear defaults.

## src/game/core/economy.simulation.ts

- **VERIFIED:** * Implement production economy simulation functions and document conservation/rounding invariants.

## src/game/core/economy.types.ts

- **VERIFIED:** * Define economy types used by production simulation and UI.

## src/game/core/entity.ids.ts

- **VERIFIED:** * Implement a production-safe ID generator ensuring uniqueness and optional seeding behavior.

## src/game/core/game.constants.ts

- **VERIFIED:** * Centralize and document production constants (tick rates, tile sizes).

## src/game/core/game.types.ts

- **VERIFIED:** * Define core game types for production usage with examples.

## src/game/core/random.ts

- **VERIFIED:** * Implement RNG utilities with seeding/reproducibility guarantees for production.

## src/game/core/victory.rules.ts

- **VERIFIED:** * Implement victory condition logic and document evaluation triggers.

## src/game/economy/balancing.constants.ts

- **VERIFIED:** * Publish balancing constants and document impact on gameplay; provide guardrails for changes.

## src/game/economy/economy.snapshot.ts

- **VERIFIED:** * Implement snapshot generation for production debugging and state restore.

## src/game/economy/extraction.logic.ts

- **VERIFIED:** * Implement extraction/depletion logic for production resource deposits.

## src/game/economy/production.logic.ts

- **VERIFIED:** * Implement production recipe consumption/production logic and document shortage behavior.

## src/game/economy/recipes.data.ts

- **VERIFIED:** * Implement validated recipe data and conversion helpers for production.

## src/game/economy/recipes.types.ts

- **VERIFIED:** * Define production recipe types and examples.

## src/game/economy/stockpile.logic.ts

- **VERIFIED:** * Implement stockpile semantics (add/remove/reserve) with capacity and overflow handling.

## src/game/economy/transport.logic.ts

- **VERIFIED:** * Implement transport job lifecycle and assignment logic for runtime.

## src/game/entities/buildings/building.data.ts

- **VERIFIED:** * Ensure production building data matches manifest and runtime expectations.

## src/game/entities/buildings/building.footprints.ts

- **VERIFIED:** * Implement footprint calculations and placement masks used by building placement.

## src/game/entities/buildings/building.logic.ts

- **VERIFIED:** * Implement building lifecycle transitions and production triggers in runtime code.

## src/game/entities/buildings/building.placement.ts

- **VERIFIED:** * Implement placement acceptance/rejection logic and document constraints.

## src/game/entities/buildings/building.status.ts

- **VERIFIED:** * Implement building status derivation from inputs and world snapshots.

## src/game/entities/buildings/building.types.ts

- **VERIFIED:** * Define building types and example fixtures for production.

## src/game/entities/buildings/building.upgrades.ts

- **VERIFIED:** * Implement upgrade cost/effect application and validation in production code.

## src/game/entities/roads/road.connections.ts

- **VERIFIED:** * Implement road connectivity updates and handle junction edge-cases.

## src/game/entities/roads/road.logic.ts

- **VERIFIED:** * Implement road creation/removal logic and automatic connection stitching.

## src/game/entities/roads/road.render-shape.ts

- **VERIFIED:** * Implement mapping from road topology to sprite choices in the renderer.

## src/game/entities/roads/road.types.ts

- **VERIFIED:** * Define road types and example topologies.

## src/game/entities/roads/road.validation.ts

- **VERIFIED:** * Implement production validation for road placement with clear messages.

## src/game/entities/workers/worker.animation.ts

- **VERIFIED:** * Implement animation selection mapping for worker states and document fallbacks.

## src/game/entities/workers/worker.data.ts

- **VERIFIED:** * Ensure worker data defaults/constraints are implemented and documented.

## src/game/entities/workers/worker.jobs.ts

- **VERIFIED:** * Implement job assignment and priority handling for workers in production.

## src/game/entities/workers/worker.logic.ts

- **VERIFIED:** * Implement worker state transitions, pickups/dropoffs, and movement logic integrated with pathing.

## src/game/entities/workers/worker.pathing.ts

- **VERIFIED:** * Implement production pathing utilities and cache invalidation rules.

## src/game/entities/workers/worker.status.ts

- **VERIFIED:** * Implement worker status derivation and document transient states.

## src/game/entities/workers/worker.types.ts

- **VERIFIED:** * Define worker types and provide example fixtures.

## src/game/events/disaster.logic.ts

- **VERIFIED:** * Implement disaster trigger/propagation/recovery logic for runtime with seeded RNG support.

## src/game/events/events.data.ts

- **VERIFIED:** * Implement production event definitions and schema.

## src/game/events/events.logic.ts

- **VERIFIED:** * Implement production event evaluation and ordering.

## src/game/events/events.types.ts

- **VERIFIED:** * Define event types used in production and include examples.

## src/game/events/random-events.ts

- **VERIFIED:** * Implement production random-event scheduling with seeded RNG reproducibility.

## src/game/iso/iso.bounds.ts

- **VERIFIED:** * Implement iso bounds and viewport clipping utilities used by renderer and camera.

## src/game/iso/iso.constants.ts

- **VERIFIED:** * Centralize iso constants and document their effect on projection math.

## src/game/iso/iso.depth.ts

- **VERIFIED:** * Implement production depth sorting utilities for renderer.

## src/game/iso/iso.hit-code for.ts

- **VERIFIED:** * Implement hit-testing math for diamond hit areas used by tiles and sprites.

## src/game/iso/iso.inverse.ts

- **VERIFIED:** * Implement inverse projection (screen -> tile) used by input handling.

## src/game/iso/iso.project.ts

- **VERIFIED:** * Implement projection utilities for canonical tile coordinates and rotated views.

## src/game/iso/iso.selection.ts

- **VERIFIED:** * Implement selection algorithms (single/tile/area) used by production input flows.

## src/game/iso/iso.snap.ts

- **VERIFIED:** * Implement snapping rules for building placement with documented tolerance.

## src/game/iso/iso.types.ts

- **VERIFIED:** * Define iso-related types and conversion helpers.

## src/game/map/map.building-slots.ts

- **VERIFIED:** * Implement building slot detection logic used by placement code.

## src/game/map/map.chunks.ts

- **VERIFIED:** * Implement chunking and culling logic for production rendering and map management.

## src/game/map/map.constants.ts

- **VERIFIED:** * Ensure map constants are defined and documented with safe defaults.

## src/game/map/map.generator.ts

- **VERIFIED:** * Implement seeded world generator for production and document parameters.

## src/game/map/map.loader.ts

- **VERIFIED:** * Implement robust map loader for JSON/TMX with clear error handling.

## src/game/map/map.occupancy.ts

- **VERIFIED:** * Implement occupancy tracking and reservation semantics with eviction rules.

## src/game/map/map.query.ts

- **VERIFIED:** * Implement `getTileAt`, neighbor queries, and buildability checks used by production logic.

## src/game/map/map.territory.ts

- **VERIFIED:** * Implement territory assignment and ownership propagation logic for runtime.

## src/game/map/map.types.ts

- **VERIFIED:** * Define map types used in production and provide examples.

## src/game/map/tiled.adapter.ts

- **VERIFIED:** * Implement a Tiled -> internal map adapter and document supported features/limitations.

## src/game/pathing/path.a-star.ts

- **VERIFIED:** * Implement A* algorithm for production pathfinding with correct heuristics and tie-breakers.

## src/game/pathing/path.cache.ts

- **VERIFIED:** * Implement a path cache with invalidation and memory constraints for production use.

## src/game/pathing/path.debug.ts

- **VERIFIED:** * Implement non-invasive debug helpers for pathing that do not modify runtime state.

## src/game/pathing/path.flowfield.ts

- **VERIFIED:** * Implement flowfield generation and update logic for multi-destination routing.

## src/game/pathing/path.grid.ts

- **VERIFIED:** * Implement grid walkability, neighbor enumeration, and bounds handling used by pathing.

## src/game/pathing/path.types.ts

- **VERIFIED:** * Define pathing types and example payloads for production callers.

## src/game/render/render.adapter.ts

- **VERIFIED:** * Implement the production adapter converting simulation entities into renderer-friendly shapes.

## src/game/render/render.animations.ts

- **VERIFIED:** * Implement animation mapping and transitions used by the renderer.

## src/game/render/render.culling.ts

- **VERIFIED:** * Implement culling logic for production renderer to skip off-screen entities.

## src/game/render/render.debug.ts

- **VERIFIED:** * Implement debug render utilities safe for production debug builds.

## src/game/render/render.interpolation.ts

- **VERIFIED:** * Implement interpolation utilities to smooth positions between ticks.

## src/game/render/render.overlays.ts

- **VERIFIED:** * Implement overlay rendering and ordering logic.

## src/game/render/render.sort.ts

- **VERIFIED:** * Implement stable sorting keys and tie-breakers for render ordering.

## src/game/render/render.textures.ts

- **VERIFIED:** * Implement texture lookup mapping and robust fallback behavior for production.

## src/game/render/render.types.ts

- **VERIFIED:** * Define renderer-facing types and examples.

## src/game/selection/selection.actions.ts

- **VERIFIED:** * Implement selection action creators used by production state updates.

## src/game/selection/selection.logic.ts

- **VERIFIED:** * Implement selection resolution logic that integrates with UI overlays and placement mode.

## src/game/selection/selection.queries.ts

- **VERIFIED:** * Implement queries returning selection candidates and handle overlap edge-cases.

## src/game/selection/selection.types.ts

- **VERIFIED:** * Define selection types for production use.

## src/game/transport/carrier.routing.ts

- **VERIFIED:** * Implement carrier routing selection and document routing heuristics.

## src/game/transport/transport.assignment.ts

- **VERIFIED:** * Implement production transport assignment logic and document starvation/preemption behaviors.

## src/game/transport/transport.delivery.ts

- **VERIFIED:** * Implement delivery handoff, success/failure handling, and retries.

## src/game/transport/transport.jobs.ts

- **VERIFIED:** * Implement job creation and lifecycle for transport flow in production code.

## src/game/transport/transport.metrics.ts

- **VERIFIED:** * Implement metric aggregation and definitions for production traces.

## src/game/transport/transport.reservation.ts

- **VERIFIED:** * Implement reservation semantics and conflict resolution rules.

## src/game/transport/transport.types.ts

- **VERIFIED:** * Define transport types and sample fixtures.

## src/game/world/world.generator.ts

- **VERIFIED:** * Implement a seeded world generator and ensure repeatable outputs in production.

## src/game/world/world.metrics.ts

- **VERIFIED:** * Implement production metric collection over ticks and document edge cases.

## src/game/world/world.state.ts

- **VERIFIED:** * Implement world state initialization, snapshot/restore and tick replay in production code.

## src/game/world/world.tick.ts

- **VERIFIED:** * Implement full world tick orchestration ensuring correct ordering of subsystems.

## src/game/world/world.types.ts

- **VERIFIED:** * Define world types and provide serialization examples.

## src/lib/array.ts

- **VERIFIED:** * Implement array helper utilities for production and ensure they do not mutate inputs.

## src/lib/asserts.ts

- **VERIFIED:** * Implement runtime assertion helpers and document expected behaviors.

## src/lib/deep-clone.ts

- **VERIFIED:** * Implement a robust deep clone utility suitable for production use.

## src/lib/logger.ts

- **VERIFIED:** * Implement or refine logger APIs for production (levels, formatting, mockability).

## src/lib/math.ts

- **VERIFIED:** * Implement math helpers with explicit handling for NaN/Infinity and rounding semantics.

## src/lib/object.ts

- **VERIFIED:** * Implement object utilities (merge/clone/pick/omit) with documented behavior for null/undefined.

## src/lib/profiler.ts

- **VERIFIED:** * Implement a production-friendly profiler that is no-op unless enabled.

## src/main.tsx

- **VERIFIED:** * Ensure the production mount/hydration path registers global error handlers and documents startup steps.

## src/pixi/GameCanvas.tsx

- **VERIFIED:** * Implement `GameCanvas` initialization with `PixiAppProvider` and ensure texture fallback behavior.

## src/pixi/GameStage.tsx

- **VERIFIED:** * Ensure correct `eventMode` defaults and robust stage initialization for runtime.

## src/pixi/PixiAppProvider.tsx

- **VERIFIED:** * Implement `PixiAppProvider` readiness checks and graceful fallback for missing textures.

## src/pixi/entities/buildings/BloodSmelteryGlow.tsx

- **VERIFIED:** * Implement production glow rendering and ensure texture fallbacks.

## src/pixi/entities/buildings/BloodSmelteryShadow.tsx

- **VERIFIED:** * Implement production shadow rendering with fallback handling.

## src/pixi/entities/buildings/BloodSmelterySmoke.tsx

- **VERIFIED:** * Implement smoke effects and ensure robust resource handling.

## src/pixi/entities/buildings/BloodSmelterySparks.tsx

- **VERIFIED:** * Implement spark effects with performance safeguards.

## src/pixi/entities/buildings/BloodSmelteryStatus.tsx

- **VERIFIED:** * Implement status visuals and ensure stable rendering.

## src/pixi/entities/buildings/BloodSmelteryStorage.tsx

- **VERIFIED:** * Implement storage visuals and resilience to missing textures.

## src/pixi/entities/buildings/IsoBloodSmeltery.tsx

- **VERIFIED:** * Implement combined building component with eventMode and texture fallbacks.

## src/pixi/entities/buildings/IsoBuildingLabel.tsx

- **VERIFIED:** * Implement building label rendering with accessibility considerations.

## src/pixi/entities/buildings/IsoBuildingSelectionRing.tsx

- **VERIFIED:** * Implement selection ring visuals responsive to props.

## src/pixi/entities/buildings/IsoBuildingShadow.tsx

- **VERIFIED:** * Implement building shadow rendering and fallback behavior.

## src/pixi/entities/buildings/IsoBuildingSprite.tsx

- **VERIFIED:** * Implement building sprite selection and robust fallback logic.

## src/pixi/entities/buildings/IsoBuildingStatusIcon.tsx

- **VERIFIED:** * Implement building status icon selection and rendering.

## src/pixi/entities/buildings/IsoConstructionOverlay.tsx

- **VERIFIED:** * Implement construction overlay rendering for production UX.

## src/pixi/entities/roads/IsoRoadNodeMarker.tsx

- **VERIFIED:** * Implement road node marker rendering used by runtime tools.

## src/pixi/entities/roads/IsoRoadSegment.tsx

- **VERIFIED:** * Implement road segment rendering and correct variant selection.

## src/pixi/entities/roads/IsoRoadSprite.tsx

- **VERIFIED:** * Implement road sprite logic for renderer.

## src/pixi/entities/shared/IsoAnimatedIcon.tsx

- **VERIFIED:** * Implement animated icon rendering with frame selection and performance constraints.

## src/pixi/entities/shared/IsoFootprintPreview.tsx

- **VERIFIED:** * Implement footprint preview used by placement UX.

## src/pixi/entities/shared/IsoHoverMarker.tsx

- **VERIFIED:** * Implement hover marker visuals used by input handling.

## src/pixi/entities/shared/IsoSelectionDiamond.tsx

- **VERIFIED:** * Implement selection diamond rendering for production.

## src/pixi/entities/shared/IsoTextLabel.tsx

- **VERIFIED:** * Implement accessible text label rendering for runtime.

## src/pixi/entities/terrain/IsoAutotileSprite.tsx

- **VERIFIED:** * Implement autotile sprite variant logic.

## src/pixi/entities/terrain/IsoChunkSprite.tsx

- **VERIFIED:** * Implement chunk sprite rendering with texture readiness checks.

## src/pixi/entities/terrain/IsoTileSprite.tsx

- **VERIFIED:** * Ensure production code checks `useTextures().ready` and provide graceful fallbacks for tile sprites.

## src/pixi/entities/workers/IsoWorkerCarryIcon.tsx

- **VERIFIED:** * Implement worker carry icon rendering and ensure presence in UI.

## src/pixi/entities/workers/IsoWorkerPathPreview.tsx

- **VERIFIED:** * Implement path preview rendering for worker UX.

## src/pixi/entities/workers/IsoWorkerSelectionMarker.tsx

- **VERIFIED:** * Implement worker selection marker rendering and ensure stable runtime.

## src/pixi/entities/workers/IsoWorkerShadow.tsx

- **VERIFIED:** * Implement worker shadow rendering with performance considerations.

## src/pixi/entities/workers/IsoWorkerSprite.tsx

- **VERIFIED:** * Implement worker sprite rendering with animation and fallback handling.

## src/pixi/hooks/useGameLoop.ts

- **VERIFIED:** * Implement `useGameLoop` hook for production tick progression and cleanup.

## src/pixi/hooks/useIsoCamera.ts

- **VERIFIED:** * Implement `useIsoCamera` transform math used by renderer and camera systems.

## src/pixi/hooks/useIsoPointer.ts

- **VERIFIED:** * Implement pointer->tile conversion utilities for production input handling.

## src/pixi/hooks/useRenderWorld.ts

- **VERIFIED:** * Implement `useRenderWorld` subscription/update behavior so world changes drive renderer updates.

## src/pixi/hooks/useSelectionInput.ts

- **VERIFIED:** * Implement selection input handling (click/drag/keyboard modifiers) integrated with production selection logic.

## src/pixi/hooks/useVisibleChunks.ts

- **VERIFIED:** * Implement visible chunk calculation used by production rendering.

## src/pixi/layers/IsoBuildingLayer.tsx

- **VERIFIED:** * Implement building layer with readiness checks and chunk culling.

## src/pixi/layers/IsoDebugLayer.tsx

- **VERIFIED:** * Implement debug overlay utilities safe for production debug builds.

## src/pixi/layers/IsoGhostPlacementLayer.tsx

- **VERIFIED:** * Implement ghost placement visuals and snapping behavior for placement UX.

## src/pixi/layers/IsoOverlayLayer.tsx

- **VERIFIED:** * Implement overlay ordering and rendering correctness.

## src/pixi/layers/IsoRoadLayer.tsx

- **VERIFIED:** * Implement road network rendering and sprite selection for runtime.

## src/pixi/layers/IsoSelectionLayer.tsx

- **VERIFIED:** * Implement selection visuals and hit-testing integration for production.

## src/pixi/layers/IsoTerrainLayer.tsx

- **VERIFIED:** * Implement terrain layer rendering with texture readiness checks and fallbacks.

## src/pixi/layers/IsoTerritoryLayer.tsx

- **VERIFIED:** * Implement territory rendering used by production tools.

## src/pixi/layers/IsoWaterLayer.tsx

- **VERIFIED:** * Implement water tile rendering and animations with performance considerations.

## src/pixi/layers/IsoWorkerEntity.tsx

- **VERIFIED:** * Implement worker entity rendering and ensure runtime props are handled.

## src/pixi/layers/IsoWorkerLayer.tsx

- **VERIFIED:** * Implement worker layer rendering with z-order correctness and readiness checks.

## src/pixi/systems/animation.system.ts

- **VERIFIED:** * Implement animation system frame advancement and cleanup for runtime.

## src/pixi/systems/culling.system.ts

- **VERIFIED:** * Implement culling system that un/mounts renderables based on viewport transforms.

## src/pixi/systems/debug.system.ts

- **VERIFIED:** * Implement debug system that produces traces without modifying runtime state.

## src/pixi/systems/sorting.system.ts

- **VERIFIED:** * Implement sorting system used by renderer and document its tie-breakers.

## src/pixi/systems/texture.system.ts

- **VERIFIED:** * Implement texture allocation/release and ensure fallback insertion on load error.

## src/pixi/utils/pixi.cache.ts

- **VERIFIED:** * Implement pixi cache behavior with hits/misses and invalidation.

## src/pixi/utils/pixi.coordinates.ts

- **VERIFIED:** * Implement coordinate conversion utilities and align with iso projection math.

## src/pixi/utils/pixi.depth.ts

- **VERIFIED:** * Implement depth helpers used for stable sorting keys.

## src/pixi/utils/pixi.hitareas.ts

- **VERIFIED:** * Implement hit-area calculations for diamond hit areas used by tiles and sprites.

## src/pixi/utils/pixi.iso.ts

- **VERIFIED:** * Implement iso-specific Pixi helpers ensuring transforms and projections are consistent.

## src/pixi/utils/pixi.spritesheet.ts

- **VERIFIED:** * Implement spritesheet parsing and frame lookup functions with representative manifest fixtures.

## src/pixi/utils/pixi.textures.ts

- **VERIFIED:** * Implement texture utilities for URI resolution, creation, and fallback handling.

## src/pixi/utils/spritesheetLoader.ts

- **VERIFIED:** * Surface loader errors clearly and ensure fallback textures are logged with context.

## src/pixi/utils/textureRegistry.ts

- **VERIFIED:** * Ensure `useTextures()` readiness is exposed and `initTextures()` is idempotent; implement concurrency handling.

## src/pixi/utils/vite-asset-loader.ts

- **VERIFIED:** * Implement asset globbing and URL resolution checks; ensure loader errors are surfaced with context.

## src/pixi/world/ChunkContainer.tsx

- **VERIFIED:** * Implement chunk mounting/unmounting and culling behavior for production chunk containers.

## src/pixi/world/SortableWorldContainer.tsx

- **VERIFIED:** * Implement container sorting and stable z-ordering for multiple children.

## src/pixi/world/WorldChunks.tsx

- **VERIFIED:** * Implement world chunk generation, culling, and texture usage for runtime rendering.

## src/pixi/world/WorldRoot.tsx

- **VERIFIED:** * Ensure world root initialization respects `eventMode` defaults and runtime constraints.

## src/pixi/world/WorldViewport.tsx

- **VERIFIED:** * Implement viewport handling and ensure eventMode and transforms are correct.

## src/store/camera.store.ts

- **VERIFIED:** * Ensure store is fully typed and implement selectors/actions for production.

## src/store/debug.store.ts

- **VERIFIED:** * Ensure debug store is typed and implement runtime toggles and selectors.

## src/store/game.store.ts

- **VERIFIED:** * Ensure game store types and actions are implemented for production flows.

## src/store/render.store.ts

- **VERIFIED:** * Ensure render store provides necessary selectors and immutable update patterns.

## src/store/selection.store.ts

- **VERIFIED:** * Implement selection store APIs and ensure immutability.

## src/store/ui.store.ts

- **VERIFIED:** * Implement UI store selectors and actions with proper typing.

## src/styles/globals.css

- **VERIFIED:** * Audit CSS variables and base styles; document theme tokens used across the app.

## src/styles/reset.css

- **VERIFIED:** * Verify reset rules and document source and cross-browser rationale.

## src/styles/theme.css

- **VERIFIED:** * Ensure theme tokens for dark/light modes are present and documented.

## src/styles/ui.css

- **VERIFIED:** * Ensure component classes are scoped and document responsive breakpoints.

## src/code for/core/building.placement.code for.ts

- **VERIFIED:** * Migrate known helper code into production files and ensure placement logic is implemented.

## src/code for/core/economy.simulation.code for.ts

- **VERIFIED:** * Move simulation helpers into production modules and ensure they integrate with economy code.

## src/code for/core/pathfinding.code for.ts

- **VERIFIED:** * Integrate proven pathfinding helpers into production pathing modules.

## src/code for/core/transport.logic.code for.ts

- **VERIFIED:** * Fold transport helper code into production transport modules and clean up interfaces.

## src/code for/iso/iso.depth.code for.ts

- **VERIFIED:** * Integrate depth sorting helpers into production `iso.depth` utilities.

## src/code for/iso/iso.hit-code for.code for.ts

- **VERIFIED:** * Integrate hit-testing helpers into production iso utilities and document math.

## src/code for/iso/iso.inverse.code for.ts

- **VERIFIED:** * Move inverse projection helpers into production iso utilities with docs.

## src/code for/iso/iso.project.code for.ts

- **VERIFIED:** * Promote projection helper code to production utilities and document usage.

## src/code for/render/render.adapter.code for.ts

- **VERIFIED:** * Move adapter helpers into production render adapter and ensure interface compatibility.

## src/code for/render/render.culling.code for.ts

- **VERIFIED:** * Integrate culling helpers into production render culling utilities.

## src/code for/render/render.sort.code for.ts

- **VERIFIED:** * Integrate sorting helpers into production render ordering utilities.

## src/ui/dialogs/PauseMenuDialog.tsx

- **VERIFIED:** * Implement keyboard shortcuts, focus trap, and accessibility in the production dialog.

## src/ui/dialogs/SettingsDialog.tsx

- **VERIFIED:** * Implement settings persistence and ARIA labels for production controls.

## src/ui/dialogs/VictoryDialog.tsx

- **VERIFIED:** * Implement production callbacks for continue/restart and final-state visuals.

## src/ui/hud/FpsCounter.tsx

- **VERIFIED:** * Implement FPS counter updates with throttling and production-safe performance.

## src/ui/hud/PopulationBar.tsx

- **VERIFIED:** * Implement dynamic population updates and accessibility labels.

## src/ui/hud/ResourceBar.tsx

- **VERIFIED:** * Implement resource formatting, tooltips, and performance handling for many resource types.

## src/ui/hud/TopHud.tsx

- **VERIFIED:** * Implement Top HUD layout and keyboard navigation for production.

## src/ui/hud/TransportIndicator.tsx

- **VERIFIED:** * Implement transport indicator states with accessible text/labels.

## src/ui/hud/WorldPulseBar.tsx

- **VERIFIED:** * Implement pulse animation bounds and ensure runtime performance.

## src/ui/panels/BuildingInspector.tsx

- **VERIFIED:** * Implement building inspector data-driven rendering and keyboard navigation.

## src/ui/panels/BuildingMenu.tsx

- **VERIFIED:** * Implement building menu interactions, previews, and keyboard navigation.

## src/ui/panels/EconomyPanel.tsx

- **VERIFIED:** * Implement economy panel rendering and ensure displayed values match simulation.

## src/ui/panels/EventLogPanel.tsx

- **VERIFIED:** * Implement log append/filter/clear behavior and stable scroll for large logs.

## src/ui/panels/InspectorPanel.tsx

- **VERIFIED:** * Implement inspector rendering and ensure it responds to selection changes.

## src/ui/panels/MapDebugPanel.tsx

- **VERIFIED:** * Implement toggleable debug layers and ensure no runtime errors when toggling.

## src/ui/panels/MilitaryPanel.tsx

- **VERIFIED:** * Implement military panel UI with proper aria labels and disabled states.

## src/ui/panels/WorkerInspector.tsx

- **VERIFIED:** * Implement worker inspector UI to reflect state and job assignments.

## src/ui/shared/HotkeyHint.tsx

- **VERIFIED:** * Implement hotkey hint rendering with accessible text.

## src/ui/shared/Icon.tsx

- **VERIFIED:** * Implement icon rendering with sizes and `aria-hidden`/roles handling.

## src/ui/shared/Panel.tsx

- **VERIFIED:** * Implement panel wrapper with aria landmarks and usage examples.

## src/ui/shared/SectionTitle.tsx

- **VERIFIED:** * Implement section title rendering preserving heading semantics.

## src/ui/shared/StatRow.tsx

- **VERIFIED:** * Implement stat row rendering for different stat types and edge values.

## src/ui/shared/Tooltip.tsx

- **VERIFIED:** * Implement tooltip show/hide triggers, hover/focus flows, and ARIA attributes.

## symbols.json

- **VERIFIED:** * Provide a regeneration script for the symbol index and document how to refresh it.

## code for/pixi/textureRegistry.code for.ts

- **VERIFIED:** * Promote texture registry fallback handling into production utilities and ensure loader error modes are surfaced.

## tsconfig.json

- **VERIFIED:** * Verify TypeScript flags required for production and document any non-default settings.

## vite.config.ts

- **VERIFIED:** * Verify Vite build/dev flags for production and document non-default options.

