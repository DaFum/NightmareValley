## FILE_RULES (implementation-focused TODOs)

Note: These TODOs are implementation tasks that should result in production code changes in the referenced source files (implementations, runtime behavior, and docs/examples). They are intentionally focused on producing or fixing code in the prod files rather than creating test scaffolding.

## src/App.tsx

- **TODO:** Implement provider wiring and route mounting in `src/App.tsx`: ensure providers and routes initialize at runtime and export an easy-to-mount `App` component. Add a short usage example in `README.md`.

## src/app/layout/GameLayout.tsx

- **TODO:** Implement responsive layout logic and runtime props handling in `src/app/layout/GameLayout.tsx` for desktop and mobile breakpoints.

## src/app/layout/HudLayout.tsx

- **TODO:** Implement HUD placement and layout rules in `src/app/layout/HudLayout.tsx` so HUD elements are positioned correctly across viewports.

## src/app/layout/RootLayout.tsx

- **TODO:** Implement root composition in `src/app/layout/RootLayout.tsx`: wire providers and `ErrorBoundary` for production usage.

## src/app/providers/AppProviders.tsx

- **TODO:** Implement `AppProviders` to register stores, theme, and error handling at runtime; export the provider component and document its public API.

## src/app/providers/ErrorBoundary.tsx

- **TODO:** Implement a production `ErrorBoundary` rendering a fallback UI and logging errors to the configured logger/telemetry.

## src/app/providers/ThemeProvider.tsx

- **TODO:** Implement theme provider behavior: toggle API, `localStorage` persistence, and injection of CSS variables.

## src/app/routes/DebugRoute.tsx

- **TODO:** Implement `DebugRoute` feature-flagging so it is excluded from production bundles when appropriate.

## src/app/routes/GameRoute.tsx

- **TODO:** Implement `GameRoute` startup and bootstrap `GameCanvas` for runtime initialization.

## src/app/routes/NotFoundRoute.tsx

- **TODO:** Implement a user-facing Not Found UI with navigation actions and suggested recovery.

## src/assets/maps/nightmare_valley.json

- **TODO:** Implement map validation in the loader and add runtime checks with clear errors for malformed maps.

## src/assets/maps/nightmare_valley.tmx

- **TODO:** Implement TMX ingestion and preserve source/editor metadata when converting to internal map format.

## src/assets/maps/code for_iso_map.json

- **TODO:** Treat this fixture as a production example used by the loader and projection code; ensure it remains runnable.

## src/assets/spritesheets/buildings-sheet.json

- **TODO:** Validate spritesheet frames at build/runtime and ensure `manifest.json` points to correct assets; add licensing metadata if needed.

## src/env.d.ts

- **TODO:** Ensure ambient module declarations cover runtime usage (`import.meta.env` etc.) and adjust typings as necessary.

## src/game/ai/ai.economy.ts

- **TODO:** Implement production AI economy logic: decisions, resource allocation, and seeded-RNG compatibility; document invariants.

## src/game/ai/ai.expansion.ts

- **TODO:** Implement expansion heuristics and placement decisions used by the production AI.

## src/game/ai/ai.military.ts

- **TODO:** Implement military decision-making and threat evaluation for runtime; document edge-case behavior.

## src/game/ai/ai.priority.ts

- **TODO:** Implement priority calculation utilities and document weight semantics for production use.

## src/game/ai/ai.state.ts

- **TODO:** Implement AI state machine and persistence behavior required for runtime ticks.

## src/game/ai/ai.tick.ts

- **TODO:** Implement AI tick orchestration (ordering, idempotency) in production code.

## src/game/ai/ai.types.ts

- **TODO:** Define and refine AI types/interfaces used across production modules.

## src/game/camera/camera.clamp.ts

- **TODO:** Implement camera clamp logic to enforce world bounds at various zoom and viewport sizes.

## src/game/camera/camera.logic.ts

- **TODO:** Implement camera centering and smoothing behavior for production usage.

## src/game/camera/camera.pan.ts

- **TODO:** Implement pan behavior (inertia, drag thresholds, multi-touch) as production features.

## src/game/camera/camera.types.ts

- **TODO:** Define production camera types and document units/expected ranges.

## src/game/camera/camera.zoom.ts

- **TODO:** Implement zoom-to-cursor, clamping and smoothing used by production camera controls.

## src/game/core/economy.data.ts

- **TODO:** Implement and validate production economy data (recipes/resources) with clear defaults.

## src/game/core/economy.simulation.ts

- **TODO:** Implement production economy simulation functions and document conservation/rounding invariants.

## src/game/core/economy.types.ts

- **TODO:** Define economy types used by production simulation and UI.

## src/game/core/entity.ids.ts

- **TODO:** Implement a production-safe ID generator ensuring uniqueness and optional seeding behavior.

## src/game/core/game.constants.ts

- **TODO:** Centralize and document production constants (tick rates, tile sizes).

## src/game/core/game.types.ts

- **TODO:** Define core game types for production usage with examples.

## src/game/core/random.ts

- **TODO:** Implement RNG utilities with seeding/reproducibility guarantees for production.

## src/game/core/victory.rules.ts

- **TODO:** Implement victory condition logic and document evaluation triggers.

## src/game/economy/balancing.constants.ts

- **TODO:** Publish balancing constants and document impact on gameplay; provide guardrails for changes.

## src/game/economy/economy.snapshot.ts

- **TODO:** Implement snapshot generation for production debugging and state restore.

## src/game/economy/extraction.logic.ts

- **TODO:** Implement extraction/depletion logic for production resource deposits.

## src/game/economy/production.logic.ts

- **TODO:** Implement production recipe consumption/production logic and document shortage behavior.

## src/game/economy/recipes.data.ts

- **TODO:** Implement validated recipe data and conversion helpers for production.

## src/game/economy/recipes.types.ts

- **TODO:** Define production recipe types and examples.

## src/game/economy/stockpile.logic.ts

- **TODO:** Implement stockpile semantics (add/remove/reserve) with capacity and overflow handling.

## src/game/economy/transport.logic.ts

- **TODO:** Implement transport job lifecycle and assignment logic for runtime.

## src/game/entities/buildings/building.data.ts

- **TODO:** Ensure production building data matches manifest and runtime expectations.

## src/game/entities/buildings/building.footprints.ts

- **TODO:** Implement footprint calculations and placement masks used by building placement.

## src/game/entities/buildings/building.logic.ts

- **TODO:** Implement building lifecycle transitions and production triggers in runtime code.

## src/game/entities/buildings/building.placement.ts

- **TODO:** Implement placement acceptance/rejection logic and document constraints.

## src/game/entities/buildings/building.status.ts

- **TODO:** Implement building status derivation from inputs and world snapshots.

## src/game/entities/buildings/building.types.ts

- **TODO:** Define building types and example fixtures for production.

## src/game/entities/buildings/building.upgrades.ts

- **TODO:** Implement upgrade cost/effect application and validation in production code.

## src/game/entities/roads/road.connections.ts

- **TODO:** Implement road connectivity updates and handle junction edge-cases.

## src/game/entities/roads/road.logic.ts

- **TODO:** Implement road creation/removal logic and automatic connection stitching.

## src/game/entities/roads/road.render-shape.ts

- **TODO:** Implement mapping from road topology to sprite choices in the renderer.

## src/game/entities/roads/road.types.ts

- **TODO:** Define road types and example topologies.

## src/game/entities/roads/road.validation.ts

- **TODO:** Implement production validation for road placement with clear messages.

## src/game/entities/workers/worker.animation.ts

- **TODO:** Implement animation selection mapping for worker states and document fallbacks.

## src/game/entities/workers/worker.data.ts

- **TODO:** Ensure worker data defaults/constraints are implemented and documented.

## src/game/entities/workers/worker.jobs.ts

- **TODO:** Implement job assignment and priority handling for workers in production.

## src/game/entities/workers/worker.logic.ts

- **TODO:** Implement worker state transitions, pickups/dropoffs, and movement logic integrated with pathing.

## src/game/entities/workers/worker.pathing.ts

- **TODO:** Implement production pathing utilities and cache invalidation rules.

## src/game/entities/workers/worker.status.ts

- **TODO:** Implement worker status derivation and document transient states.

## src/game/entities/workers/worker.types.ts

- **TODO:** Define worker types and provide example fixtures.

## src/game/events/disaster.logic.ts

- **TODO:** Implement disaster trigger/propagation/recovery logic for runtime with seeded RNG support.

## src/game/events/events.data.ts

- **TODO:** Implement production event definitions and schema.

## src/game/events/events.logic.ts

- **TODO:** Implement production event evaluation and ordering.

## src/game/events/events.types.ts

- **TODO:** Define event types used in production and include examples.

## src/game/events/random-events.ts

- **TODO:** Implement production random-event scheduling with seeded RNG reproducibility.

## src/game/iso/iso.bounds.ts

- **TODO:** Implement iso bounds and viewport clipping utilities used by renderer and camera.

## src/game/iso/iso.constants.ts

- **TODO:** Centralize iso constants and document their effect on projection math.

## src/game/iso/iso.depth.ts

- **TODO:** Implement production depth sorting utilities for renderer.

## src/game/iso/iso.hit-code for.ts

- **TODO:** Implement hit-testing math for diamond hit areas used by tiles and sprites.

## src/game/iso/iso.inverse.ts

- **TODO:** Implement inverse projection (screen -> tile) used by input handling.

## src/game/iso/iso.project.ts

- **TODO:** Implement projection utilities for canonical tile coordinates and rotated views.

## src/game/iso/iso.selection.ts

- **TODO:** Implement selection algorithms (single/tile/area) used by production input flows.

## src/game/iso/iso.snap.ts

- **TODO:** Implement snapping rules for building placement with documented tolerance.

## src/game/iso/iso.types.ts

- **TODO:** Define iso-related types and conversion helpers.

## src/game/map/map.building-slots.ts

- **TODO:** Implement building slot detection logic used by placement code.

## src/game/map/map.chunks.ts

- **TODO:** Implement chunking and culling logic for production rendering and map management.

## src/game/map/map.constants.ts

- **TODO:** Ensure map constants are defined and documented with safe defaults.

## src/game/map/map.generator.ts

- **TODO:** Implement seeded world generator for production and document parameters.

## src/game/map/map.loader.ts

- **TODO:** Implement robust map loader for JSON/TMX with clear error handling.

## src/game/map/map.occupancy.ts

- **TODO:** Implement occupancy tracking and reservation semantics with eviction rules.

## src/game/map/map.query.ts

- **TODO:** Implement `getTileAt`, neighbor queries, and buildability checks used by production logic.

## src/game/map/map.territory.ts

- **TODO:** Implement territory assignment and ownership propagation logic for runtime.

## src/game/map/map.types.ts

- **TODO:** Define map types used in production and provide examples.

## src/game/map/tiled.adapter.ts

- **TODO:** Implement a Tiled -> internal map adapter and document supported features/limitations.

## src/game/pathing/path.a-star.ts

- **TODO:** Implement A* algorithm for production pathfinding with correct heuristics and tie-breakers.

## src/game/pathing/path.cache.ts

- **TODO:** Implement a path cache with invalidation and memory constraints for production use.

## src/game/pathing/path.debug.ts

- **TODO:** Implement non-invasive debug helpers for pathing that do not modify runtime state.

## src/game/pathing/path.flowfield.ts

- **TODO:** Implement flowfield generation and update logic for multi-destination routing.

## src/game/pathing/path.grid.ts

- **TODO:** Implement grid walkability, neighbor enumeration, and bounds handling used by pathing.

## src/game/pathing/path.types.ts

- **TODO:** Define pathing types and example payloads for production callers.

## src/game/render/render.adapter.ts

- **TODO:** Implement the production adapter converting simulation entities into renderer-friendly shapes.

## src/game/render/render.animations.ts

- **TODO:** Implement animation mapping and transitions used by the renderer.

## src/game/render/render.culling.ts

- **TODO:** Implement culling logic for production renderer to skip off-screen entities.

## src/game/render/render.debug.ts

- **TODO:** Implement debug render utilities safe for production debug builds.

## src/game/render/render.interpolation.ts

- **TODO:** Implement interpolation utilities to smooth positions between ticks.

## src/game/render/render.overlays.ts

- **TODO:** Implement overlay rendering and ordering logic.

## src/game/render/render.sort.ts

- **TODO:** Implement stable sorting keys and tie-breakers for render ordering.

## src/game/render/render.textures.ts

- **TODO:** Implement texture lookup mapping and robust fallback behavior for production.

## src/game/render/render.types.ts

- **TODO:** Define renderer-facing types and examples.

## src/game/selection/selection.actions.ts

- **TODO:** Implement selection action creators used by production state updates.

## src/game/selection/selection.logic.ts

- **TODO:** Implement selection resolution logic that integrates with UI overlays and placement mode.

## src/game/selection/selection.queries.ts

- **TODO:** Implement queries returning selection candidates and handle overlap edge-cases.

## src/game/selection/selection.types.ts

- **TODO:** Define selection types for production use.

## src/game/transport/carrier.routing.ts

- **TODO:** Implement carrier routing selection and document routing heuristics.

## src/game/transport/transport.assignment.ts

- **TODO:** Implement production transport assignment logic and document starvation/preemption behaviors.

## src/game/transport/transport.delivery.ts

- **TODO:** Implement delivery handoff, success/failure handling, and retries.

## src/game/transport/transport.jobs.ts

- **TODO:** Implement job creation and lifecycle for transport flow in production code.

## src/game/transport/transport.metrics.ts

- **TODO:** Implement metric aggregation and definitions for production traces.

## src/game/transport/transport.reservation.ts

- **TODO:** Implement reservation semantics and conflict resolution rules.

## src/game/transport/transport.types.ts

- **TODO:** Define transport types and sample fixtures.

## src/game/world/world.generator.ts

- **TODO:** Implement a seeded world generator and ensure repeatable outputs in production.

## src/game/world/world.metrics.ts

- **TODO:** Implement production metric collection over ticks and document edge cases.

## src/game/world/world.state.ts

- **TODO:** Implement world state initialization, snapshot/restore and tick replay in production code.

## src/game/world/world.tick.ts

- **TODO:** Implement full world tick orchestration ensuring correct ordering of subsystems.

## src/game/world/world.types.ts

- **TODO:** Define world types and provide serialization examples.

## src/lib/array.ts

- **TODO:** Implement array helper utilities for production and ensure they do not mutate inputs.

## src/lib/asserts.ts

- **TODO:** Implement runtime assertion helpers and document expected behaviors.

## src/lib/deep-clone.ts

- **TODO:** Implement a robust deep clone utility suitable for production use.

## src/lib/logger.ts

- **TODO:** Implement or refine logger APIs for production (levels, formatting, mockability).

## src/lib/math.ts

- **TODO:** Implement math helpers with explicit handling for NaN/Infinity and rounding semantics.

## src/lib/object.ts

- **TODO:** Implement object utilities (merge/clone/pick/omit) with documented behavior for null/undefined.

## src/lib/profiler.ts

- **TODO:** Implement a production-friendly profiler that is no-op unless enabled.

## src/main.tsx

- **TODO:** Ensure the production mount/hydration path registers global error handlers and documents startup steps.

## src/pixi/GameCanvas.tsx

- **TODO:** Implement `GameCanvas` initialization with `PixiAppProvider` and ensure texture fallback behavior.

## src/pixi/GameStage.tsx

- **TODO:** Ensure correct `eventMode` defaults and robust stage initialization for runtime.

## src/pixi/PixiAppProvider.tsx

- **TODO:** Implement `PixiAppProvider` readiness checks and graceful fallback for missing textures.

## src/pixi/entities/buildings/BloodSmelteryGlow.tsx

- **TODO:** Implement production glow rendering and ensure texture fallbacks.

## src/pixi/entities/buildings/BloodSmelteryShadow.tsx

- **TODO:** Implement production shadow rendering with fallback handling.

## src/pixi/entities/buildings/BloodSmelterySmoke.tsx

- **TODO:** Implement smoke effects and ensure robust resource handling.

## src/pixi/entities/buildings/BloodSmelterySparks.tsx

- **TODO:** Implement spark effects with performance safeguards.

## src/pixi/entities/buildings/BloodSmelteryStatus.tsx

- **TODO:** Implement status visuals and ensure stable rendering.

## src/pixi/entities/buildings/BloodSmelteryStorage.tsx

- **TODO:** Implement storage visuals and resilience to missing textures.

## src/pixi/entities/buildings/IsoBloodSmeltery.tsx

- **TODO:** Implement combined building component with eventMode and texture fallbacks.

## src/pixi/entities/buildings/IsoBuildingLabel.tsx

- **TODO:** Implement building label rendering with accessibility considerations.

## src/pixi/entities/buildings/IsoBuildingSelectionRing.tsx

- **TODO:** Implement selection ring visuals responsive to props.

## src/pixi/entities/buildings/IsoBuildingShadow.tsx

- **TODO:** Implement building shadow rendering and fallback behavior.

## src/pixi/entities/buildings/IsoBuildingSprite.tsx

- **TODO:** Implement building sprite selection and robust fallback logic.

## src/pixi/entities/buildings/IsoBuildingStatusIcon.tsx

- **TODO:** Implement building status icon selection and rendering.

## src/pixi/entities/buildings/IsoConstructionOverlay.tsx

- **TODO:** Implement construction overlay rendering for production UX.

## src/pixi/entities/roads/IsoRoadNodeMarker.tsx

- **TODO:** Implement road node marker rendering used by runtime tools.

## src/pixi/entities/roads/IsoRoadSegment.tsx

- **TODO:** Implement road segment rendering and correct variant selection.

## src/pixi/entities/roads/IsoRoadSprite.tsx

- **TODO:** Implement road sprite logic for renderer.

## src/pixi/entities/shared/IsoAnimatedIcon.tsx

- **TODO:** Implement animated icon rendering with frame selection and performance constraints.

## src/pixi/entities/shared/IsoFootprintPreview.tsx

- **TODO:** Implement footprint preview used by placement UX.

## src/pixi/entities/shared/IsoHoverMarker.tsx

- **TODO:** Implement hover marker visuals used by input handling.

## src/pixi/entities/shared/IsoSelectionDiamond.tsx

- **TODO:** Implement selection diamond rendering for production.

## src/pixi/entities/shared/IsoTextLabel.tsx

- **TODO:** Implement accessible text label rendering for runtime.

## src/pixi/entities/terrain/IsoAutotileSprite.tsx

- **TODO:** Implement autotile sprite variant logic.

## src/pixi/entities/terrain/IsoChunkSprite.tsx

- **TODO:** Implement chunk sprite rendering with texture readiness checks.

## src/pixi/entities/terrain/IsoTileSprite.tsx

- **TODO:** Ensure production code checks `useTextures().ready` and provide graceful fallbacks for tile sprites.

## src/pixi/entities/workers/IsoWorkerCarryIcon.tsx

- **TODO:** Implement worker carry icon rendering and ensure presence in UI.

## src/pixi/entities/workers/IsoWorkerPathPreview.tsx

- **TODO:** Implement path preview rendering for worker UX.

## src/pixi/entities/workers/IsoWorkerSelectionMarker.tsx

- **TODO:** Implement worker selection marker rendering and ensure stable runtime.

## src/pixi/entities/workers/IsoWorkerShadow.tsx

- **TODO:** Implement worker shadow rendering with performance considerations.

## src/pixi/entities/workers/IsoWorkerSprite.tsx

- **TODO:** Implement worker sprite rendering with animation and fallback handling.

## src/pixi/hooks/useGameLoop.ts

- **TODO:** Implement `useGameLoop` hook for production tick progression and cleanup.

## src/pixi/hooks/useIsoCamera.ts

- **TODO:** Implement `useIsoCamera` transform math used by renderer and camera systems.

## src/pixi/hooks/useIsoPointer.ts

- **TODO:** Implement pointer->tile conversion utilities for production input handling.

## src/pixi/hooks/useRenderWorld.ts

- **TODO:** Implement `useRenderWorld` subscription/update behavior so world changes drive renderer updates.

## src/pixi/hooks/useSelectionInput.ts

- **TODO:** Implement selection input handling (click/drag/keyboard modifiers) integrated with production selection logic.

## src/pixi/hooks/useVisibleChunks.ts

- **TODO:** Implement visible chunk calculation used by production rendering.

## src/pixi/layers/IsoBuildingLayer.tsx

- **TODO:** Implement building layer with readiness checks and chunk culling.

## src/pixi/layers/IsoDebugLayer.tsx

- **TODO:** Implement debug overlay utilities safe for production debug builds.

## src/pixi/layers/IsoGhostPlacementLayer.tsx

- **TODO:** Implement ghost placement visuals and snapping behavior for placement UX.

## src/pixi/layers/IsoOverlayLayer.tsx

- **TODO:** Implement overlay ordering and rendering correctness.

## src/pixi/layers/IsoRoadLayer.tsx

- **TODO:** Implement road network rendering and sprite selection for runtime.

## src/pixi/layers/IsoSelectionLayer.tsx

- **TODO:** Implement selection visuals and hit-testing integration for production.

## src/pixi/layers/IsoTerrainLayer.tsx

- **TODO:** Implement terrain layer rendering with texture readiness checks and fallbacks.

## src/pixi/layers/IsoTerritoryLayer.tsx

- **TODO:** Implement territory rendering used by production tools.

## src/pixi/layers/IsoWaterLayer.tsx

- **TODO:** Implement water tile rendering and animations with performance considerations.

## src/pixi/layers/IsoWorkerEntity.tsx

- **TODO:** Implement worker entity rendering and ensure runtime props are handled.

## src/pixi/layers/IsoWorkerLayer.tsx

- **TODO:** Implement worker layer rendering with z-order correctness and readiness checks.

## src/pixi/systems/animation.system.ts

- **TODO:** Implement animation system frame advancement and cleanup for runtime.

## src/pixi/systems/culling.system.ts

- **TODO:** Implement culling system that un/mounts renderables based on viewport transforms.

## src/pixi/systems/debug.system.ts

- **TODO:** Implement debug system that produces traces without modifying runtime state.

## src/pixi/systems/sorting.system.ts

- **TODO:** Implement sorting system used by renderer and document its tie-breakers.

## src/pixi/systems/texture.system.ts

- **TODO:** Implement texture allocation/release and ensure fallback insertion on load error.

## src/pixi/utils/pixi.cache.ts

- **TODO:** Implement pixi cache behavior with hits/misses and invalidation.

## src/pixi/utils/pixi.coordinates.ts

- **TODO:** Implement coordinate conversion utilities and align with iso projection math.

## src/pixi/utils/pixi.depth.ts

- **TODO:** Implement depth helpers used for stable sorting keys.

## src/pixi/utils/pixi.hitareas.ts

- **TODO:** Implement hit-area calculations for diamond hit areas used by tiles and sprites.

## src/pixi/utils/pixi.iso.ts

- **TODO:** Implement iso-specific Pixi helpers ensuring transforms and projections are consistent.

## src/pixi/utils/pixi.spritesheet.ts

- **TODO:** Implement spritesheet parsing and frame lookup functions with representative manifest fixtures.

## src/pixi/utils/pixi.textures.ts

- **TODO:** Implement texture utilities for URI resolution, creation, and fallback handling.

## src/pixi/utils/spritesheetLoader.ts

- **TODO:** Surface loader errors clearly and ensure fallback textures are logged with context.

## src/pixi/utils/textureRegistry.ts

- **TODO:** Ensure `useTextures()` readiness is exposed and `initTextures()` is idempotent; implement concurrency handling.

## src/pixi/utils/vite-asset-loader.ts

- **TODO:** Implement asset globbing and URL resolution checks; ensure loader errors are surfaced with context.

## src/pixi/world/ChunkContainer.tsx

- **TODO:** Implement chunk mounting/unmounting and culling behavior for production chunk containers.

## src/pixi/world/SortableWorldContainer.tsx

- **TODO:** Implement container sorting and stable z-ordering for multiple children.

## src/pixi/world/WorldChunks.tsx

- **TODO:** Implement world chunk generation, culling, and texture usage for runtime rendering.

## src/pixi/world/WorldRoot.tsx

- **TODO:** Ensure world root initialization respects `eventMode` defaults and runtime constraints.

## src/pixi/world/WorldViewport.tsx

- **TODO:** Implement viewport handling and ensure eventMode and transforms are correct.

## src/store/camera.store.ts

- **TODO:** Ensure store is fully typed and implement selectors/actions for production.

## src/store/debug.store.ts

- **TODO:** Ensure debug store is typed and implement runtime toggles and selectors.

## src/store/game.store.ts

- **TODO:** Ensure game store types and actions are implemented for production flows.

## src/store/render.store.ts

- **TODO:** Ensure render store provides necessary selectors and immutable update patterns.

## src/store/selection.store.ts

- **TODO:** Implement selection store APIs and ensure immutability.

## src/store/ui.store.ts

- **TODO:** Implement UI store selectors and actions with proper typing.

## src/styles/globals.css

- **TODO:** Audit CSS variables and base styles; document theme tokens used across the app.

## src/styles/reset.css

- **TODO:** Verify reset rules and document source and cross-browser rationale.

## src/styles/theme.css

- **TODO:** Ensure theme tokens for dark/light modes are present and documented.

## src/styles/ui.css

- **TODO:** Ensure component classes are scoped and document responsive breakpoints.

## src/code for/core/building.placement.code for.ts

- **TODO:** Migrate known helper code into production files and ensure placement logic is implemented.

## src/code for/core/economy.simulation.code for.ts

- **TODO:** Move simulation helpers into production modules and ensure they integrate with economy code.

## src/code for/core/pathfinding.code for.ts

- **TODO:** Integrate proven pathfinding helpers into production pathing modules.

## src/code for/core/transport.logic.code for.ts

- **TODO:** Fold transport helper code into production transport modules and clean up interfaces.

## src/code for/iso/iso.depth.code for.ts

- **TODO:** Integrate depth sorting helpers into production `iso.depth` utilities.

## src/code for/iso/iso.hit-code for.code for.ts

- **TODO:** Integrate hit-testing helpers into production iso utilities and document math.

## src/code for/iso/iso.inverse.code for.ts

- **TODO:** Move inverse projection helpers into production iso utilities with docs.

## src/code for/iso/iso.project.code for.ts

- **TODO:** Promote projection helper code to production utilities and document usage.

## src/code for/render/render.adapter.code for.ts

- **TODO:** Move adapter helpers into production render adapter and ensure interface compatibility.

## src/code for/render/render.culling.code for.ts

- **TODO:** Integrate culling helpers into production render culling utilities.

## src/code for/render/render.sort.code for.ts

- **TODO:** Integrate sorting helpers into production render ordering utilities.

## src/ui/dialogs/PauseMenuDialog.tsx

- **TODO:** Implement keyboard shortcuts, focus trap, and accessibility in the production dialog.

## src/ui/dialogs/SettingsDialog.tsx

- **TODO:** Implement settings persistence and ARIA labels for production controls.

## src/ui/dialogs/VictoryDialog.tsx

- **TODO:** Implement production callbacks for continue/restart and final-state visuals.

## src/ui/hud/FpsCounter.tsx

- **TODO:** Implement FPS counter updates with throttling and production-safe performance.

## src/ui/hud/PopulationBar.tsx

- **TODO:** Implement dynamic population updates and accessibility labels.

## src/ui/hud/ResourceBar.tsx

- **TODO:** Implement resource formatting, tooltips, and performance handling for many resource types.

## src/ui/hud/TopHud.tsx

- **TODO:** Implement Top HUD layout and keyboard navigation for production.

## src/ui/hud/TransportIndicator.tsx

- **TODO:** Implement transport indicator states with accessible text/labels.

## src/ui/hud/WorldPulseBar.tsx

- **TODO:** Implement pulse animation bounds and ensure runtime performance.

## src/ui/panels/BuildingInspector.tsx

- **TODO:** Implement building inspector data-driven rendering and keyboard navigation.

## src/ui/panels/BuildingMenu.tsx

- **TODO:** Implement building menu interactions, previews, and keyboard navigation.

## src/ui/panels/EconomyPanel.tsx

- **TODO:** Implement economy panel rendering and ensure displayed values match simulation.

## src/ui/panels/EventLogPanel.tsx

- **TODO:** Implement log append/filter/clear behavior and stable scroll for large logs.

## src/ui/panels/InspectorPanel.tsx

- **TODO:** Implement inspector rendering and ensure it responds to selection changes.

## src/ui/panels/MapDebugPanel.tsx

- **TODO:** Implement toggleable debug layers and ensure no runtime errors when toggling.

## src/ui/panels/MilitaryPanel.tsx

- **TODO:** Implement military panel UI with proper aria labels and disabled states.

## src/ui/panels/WorkerInspector.tsx

- **TODO:** Implement worker inspector UI to reflect state and job assignments.

## src/ui/shared/HotkeyHint.tsx

- **TODO:** Implement hotkey hint rendering with accessible text.

## src/ui/shared/Icon.tsx

- **TODO:** Implement icon rendering with sizes and `aria-hidden`/roles handling.

## src/ui/shared/Panel.tsx

- **TODO:** Implement panel wrapper with aria landmarks and usage examples.

## src/ui/shared/SectionTitle.tsx

- **TODO:** Implement section title rendering preserving heading semantics.

## src/ui/shared/StatRow.tsx

- **TODO:** Implement stat row rendering for different stat types and edge values.

## src/ui/shared/Tooltip.tsx

- **TODO:** Implement tooltip show/hide triggers, hover/focus flows, and ARIA attributes.

## symbols.json

- **TODO:** Provide a regeneration script for the symbol index and document how to refresh it.

## code for/pixi/textureRegistry.code for.ts

- **TODO:** Promote texture registry fallback handling into production utilities and ensure loader error modes are surfaced.

## tsconfig.json

- **TODO:** Verify TypeScript flags required for production and document any non-default settings.

## vite.config.ts

- **TODO:** Verify Vite build/dev flags for production and document non-default options.

