# Gesamtüberblick

```text
settlers-nightmare/
├── Root-Konfiguration
├── public/
├── src/
│   ├── app/
│   ├── game/
│   ├── pixi/
│   ├── ui/
│   ├── store/
│   ├── assets/
│   ├── styles/
│   ├── lib/
│   └── tests/
└── README.md
```

---

# Root

```text
settlers-nightmare/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── .gitignore
└── README.md
```

* `package.json` — Abhängigkeiten, Scripts und Projekt-Metadaten.
* `tsconfig.json` — TypeScript-Konfiguration.
* `vite.config.ts` — Build- und Dev-Server-Konfiguration.
* `index.html` — Einstiegspunkt für die Web-App.
* `.gitignore` — Dateien und Ordner, die Git ignorieren soll.
* `README.md` — Projektbeschreibung, Setup und Architekturhinweise.

---

# public

```text
public/
├── favicon.ico
└── preview.png
```

* `favicon.ico` — Browser-Icon.
* `preview.png` — Vorschaubild für Repo, Landing oder Sharing.

---

# src Root

```text
src/
├── main.tsx
├── App.tsx
└── env.d.ts
```

* `main.tsx` — React-Bootstrap und Mount auf den DOM-Root.
* `App.tsx` — Haupt-App-Komponente.
* `env.d.ts` — Typdefinitionen für Vite/Umgebungsvariabablen.

---

# app

```text
src/app/
├── providers/
├── layout/
└── routes/
```

## app/providers

```text
src/app/providers/
├── AppProviders.tsx
├── ThemeProvider.tsx
└── ErrorBoundary.tsx
```

* `AppProviders.tsx` — bündelt globale Provider wie Stores, Theme, ErrorBoundary.
* `ThemeProvider.tsx` — verwaltet UI-Themes oder globale Design-Tokens.
* `ErrorBoundary.tsx` — fängt React-Renderfehler ab.

## app/layout

```text
src/app/layout/
├── RootLayout.tsx
├── GameLayout.tsx
└── HudLayout.tsx
```

* `RootLayout.tsx` — globaler Layout-Rahmen der App.
* `GameLayout.tsx` — Layout für Spielfläche plus Sidepanels.
* `HudLayout.tsx` — organisiert HUD, Overlays und UI-Bereiche.

## app/routes

```text
src/app/routes/
├── GameRoute.tsx
├── DebugRoute.tsx
└── NotFoundRoute.tsx
```

* `GameRoute.tsx` — Hauptspielansicht.
* `DebugRoute.tsx` — Debug-/Entwicklungsansicht.
* `NotFoundRoute.tsx` — Fallback-Seite für ungültige Routen.

---

# game

```text
src/game/
├── core/
├── world/
├── map/
├── iso/
├── entities/
├── economy/
├── transport/
├── pathing/
├── selection/
├── camera/
├── render/
├── events/
└── ai/
```

---

## game/core

```text
src/game/core/
├── economy.types.ts
├── economy.data.ts
├── economy.simulation.ts
├── game.types.ts
├── game.constants.ts
├── entity.ids.ts
├── random.ts
└── victory.rules.ts
```

* `economy.types.ts` — zentrale Typen für Ressourcen, Gebäude, Arbeiter, Spielzustand.
* `economy.data.ts` — statische Definitionsdaten für Rezepte, Gebäude, Worker.
* `economy.simulation.ts` — Tick-Logik für Produktion, Transport, Arbeiter, Gebäude.
* `game.types.ts` — allgemeine Spieltypen, die nicht nur Wirtschaft betreffen.
* `game.constants.ts` — globale Konstanten wie Tickrate, Tilegröße, Limits.
* `entity.ids.ts` — ID-Erzeugung und Entity-Identifier-Utilities.
* `random.ts` — deterministische oder allgemeine Zufallsfunktionen.
* `victory.rules.ts` — Sieg- und Niederlagenbedingungen.

---

## game/world

```text
src/game/world/
├── world.types.ts
├── world.state.ts
├── world.generator.ts
├── world.metrics.ts
└── world.tick.ts
```

* `world.types.ts` — Typen für die Gesamtwelt.
* `world.state.ts` — Initialisierung und Struktur des globalen World-State.
* `world.generator.ts` — Erzeugung von Startwelt oder Testwelten.
* `world.metrics.ts` — Kennzahlen wie Population, Transportlast, Produktion.
* `world.tick.ts` — orchestriert einen vollständigen Welt-Tick.

---

## game/map

```text
src/game/map/
├── map.types.ts
├── map.constants.ts
├── map.loader.ts
├── map.generator.ts
├── map.query.ts
├── map.chunks.ts
├── map.occupancy.ts
├── map.territory.ts
├── map.building-slots.ts
└── tiled.adapter.ts
```

* `map.types.ts` — Typen für Tiles, Layer, Deposits, Chunkdaten.
* `map.constants.ts` — Kartenspezifische Konstanten.
* `map.loader.ts` — lädt Karten aus JSON oder generiert Laufzeitstrukturen.
* `map.generator.ts` — prozedurale Testkarten oder einfache Generatoren.
* `map.query.ts` — Abfragen wie `getTileAt`, `isBuildable`, `getNeighbors`.
* `map.chunks.ts` — chunkt die Karte für Rendering und Culling.
* `map.occupancy.ts` — verwaltet Belegung von Tiles durch Gebäude, Wege, Einheiten.
* `map.territory.ts` — Logik für Gebietszuweisung und Expansion.
* `map.building-slots.ts` — prüft Bauflächen, Footprints und belegte Tiles.
* `tiled.adapter.ts` — wandelt Tiled-JSON in interne Datenstrukturen um.

---

## game/iso

```text
src/game/iso/
├── iso.types.ts
├── iso.constants.ts
├── iso.project.ts
├── iso.inverse.ts
├── iso.depth.ts
├── iso.bounds.ts
├── iso.hit-test.ts
├── iso.snap.ts
└── iso.selection.ts
```

* `iso.types.ts` — Typen für isometrische Koordinaten und Footpoints.
* `iso.constants.ts` — Tilebreite, Tilehöhe, Projektionseinstellungen.
* `iso.project.ts` — rechnet Tile-/World-Koordinaten in Screen-Koordinaten um.
* `iso.inverse.ts` — inverse Projektion von Screen zurück auf Tile/Grid.
* `iso.depth.ts` — Z-Sortierung und Footpoint-basierte Tiefenlogik.
* `iso.bounds.ts` — Bounding- und Sichtbarkeitsberechnungen in Iso.
* `iso.hit-test.ts` — Diamond-/Tile-Hit-Tests für Mausinteraktion.
* `iso.snap.ts` — Snap-Regeln für Platzierung, Auswahl und Ghost-Buildings.
* `iso.selection.ts` — Hilfslogik für Tile- und Entity-Selektion im Iso-Raum.

---

## game/entities/buildings

```text
src/game/entities/buildings/
├── building.types.ts
├── building.data.ts
├── building.logic.ts
├── building.footprints.ts
├── building.upgrades.ts
├── building.placement.ts
└── building.status.ts
```

* `building.types.ts` — Gebäudetypen und Gebäudestatus.
* `building.data.ts` — konkrete Gebäudedaten wie Kosten, Slots, Größe.
* `building.logic.ts` — allgemeine Gebäudelogik.
* `building.footprints.ts` — Footprints und Tile-Belegung pro Gebäudetyp.
* `building.upgrades.ts` — Upgradekosten, Regeln und Effekte.
* `building.placement.ts` — Platzierungsregeln auf der Karte.
* `building.status.ts` — Ableitung von States wie idle, working, blocked.

## game/entities/workers

```text
src/game/entities/workers/
├── worker.types.ts
├── worker.data.ts
├── worker.logic.ts
├── worker.jobs.ts
├── worker.pathing.ts
├── worker.animation.ts
└── worker.status.ts
```

* `worker.types.ts` — Typen für Arbeiter und Rollen.
* `worker.data.ts` — Bewegungswerte, Kapazitäten, visuelle Defaults.
* `worker.logic.ts` — generelle Worker-Logik.
* `worker.jobs.ts` — Jobzuweisung und Arbeitszustände.
* `worker.pathing.ts` — Wegpunkt- und Bewegungslogik.
* `worker.animation.ts` — Zuordnung von Worker-State zu Animation.
* `worker.status.ts` — abgeleitete Zustände wie idle, carrying, blocked.

## game/entities/roads

```text
src/game/entities/roads/
├── road.types.ts
├── road.logic.ts
├── road.connections.ts
├── road.render-shape.ts
└── road.validation.ts
```

* `road.types.ts` — Straßentypen und Knotentypen.
* `road.logic.ts` — Erzeugen, Entfernen und Aktualisieren von Straßen.
* `road.connections.ts` — Nachbarschafts- und Verbindungslogik.
* `road.render-shape.ts` — bestimmt, welches Straßensprite gerendert werden soll.
* `road.validation.ts` — prüft erlaubte/ungültige Straßenplatzierung.

---

## game/economy

```text
src/game/economy/
├── recipes.types.ts
├── recipes.data.ts
├── stockpile.logic.ts
├── production.logic.ts
├── extraction.logic.ts
├── transport.logic.ts
├── balancing.constants.ts
└── economy.snapshot.ts
```

* `recipes.types.ts` — Typen für Produktionsrezepte.
* `recipes.data.ts` — Rezeptdefinitionen.
* `stockpile.logic.ts` — Lager- und Bestandslogik.
* `production.logic.ts` — Verarbeitung von Inputs zu Outputs.
* `extraction.logic.ts` — Rohstoffförderung aus Natur oder Deposits.
* `transport.logic.ts` — wirtschaftlicher Transportfluss auf hoher Ebene.
* `balancing.constants.ts` — Balancing-Werte für Wirtschaft und Produktion.
* `economy.snapshot.ts` — generiert Debug-/UI-Snapshots der Ökonomie.

---

## game/transport

```text
src/game/transport/
├── transport.types.ts
├── transport.jobs.ts
├── transport.reservation.ts
├── transport.assignment.ts
├── transport.delivery.ts
├── transport.metrics.ts
└── carrier.routing.ts
```

* `transport.types.ts` — Typen für Jobs, CarrierTasks und Transportmetriken.
* `transport.jobs.ts` — Erzeugt und verwaltet Transportjobs.
* `transport.reservation.ts` — reserviert Waren für bestimmte Jobs.
* `transport.assignment.ts` — weist Carrier Jobs zu.
* `transport.delivery.ts` — Übergabe von Waren an Zielgebäude oder Lager.
* `transport.metrics.ts` — misst Netzwerkstress, Latenz und Engpässe.
* `carrier.routing.ts` — Routinglogik speziell für Träger.

---

## game/pathing

```text
src/game/pathing/
├── path.types.ts
├── path.grid.ts
├── path.a-star.ts
├── path.flowfield.ts
├── path.cache.ts
└── path.debug.ts
```

* `path.types.ts` — Typen für Wege, Knoten, Kosten.
* `path.grid.ts` — walkable/unwalkable Grid-Daten.
* `path.a-star.ts` — A*-Pfadsuche.
* `path.flowfield.ts` — optionale Flowfield-/Massentransport-Navigation.
* `path.cache.ts` — Pfad-Caching.
* `path.debug.ts` — Debug-Ausgaben für Wege und Kosten.

---

## game/selection

```text
src/game/selection/
├── selection.types.ts
├── selection.logic.ts
├── selection.queries.ts
└── selection.actions.ts
```

* `selection.types.ts` — Typen für Hover, Auswahl und Platzierungsmodus.
* `selection.logic.ts` — zentrale Auswahllogik.
* `selection.queries.ts` — Hilfsabfragen zu selektierbaren Entities.
* `selection.actions.ts` — Aktionen wie select, clear, place, confirm.

---

## game/camera

```text
src/game/camera/
├── camera.types.ts
├── camera.logic.ts
├── camera.clamp.ts
├── camera.zoom.ts
└── camera.pan.ts
```

* `camera.types.ts` — Kameratypen und Viewport.
* `camera.logic.ts` — zentrale Kameralogik.
* `camera.clamp.ts` — begrenzt die Kamera auf Weltgrenzen.
* `camera.zoom.ts` — Zoomlogik inklusive Zoom-zu-Cursor.
* `camera.pan.ts` — Drag/Pan-Bewegung.

---

## game/render

```text
src/game/render/
├── render.types.ts
├── render.adapter.ts
├── render.culling.ts
├── render.sort.ts
├── render.interpolation.ts
├── render.textures.ts
├── render.animations.ts
├── render.overlays.ts
└── render.debug.ts
```

* `render.types.ts` — Typen für alle renderbaren Daten.
* `render.adapter.ts` — wandelt Simulationsdaten in Renderdaten um.
* `render.culling.ts` — filtert unsichtbare Chunks und Entities.
* `render.sort.ts` — Sortierung nach Footpoint/Y.
* `render.interpolation.ts` — glättet Bewegungen zwischen Ticks.
* `render.textures.ts` — Zuordnung von Typen zu Texturen/Spritesheets.
* `render.animations.ts` — Zuordnung von Logik-Zuständen zu Animationen.
* `render.overlays.ts` — Statusicons, Selektion, Warnungen.
* `render.debug.ts` — Hilfsdaten für Debug-Layer.

---

## game/events

```text
src/game/events/
├── events.types.ts
├── events.data.ts
├── events.logic.ts
├── disaster.logic.ts
└── random-events.ts
```

* `events.types.ts` — Typen für Ereignisse und Katastrophen.
* `events.data.ts` — Definitionen für konkrete Events.
* `events.logic.ts` — Eventauswertung und Trigger.
* `disaster.logic.ts` — Speziallogik für harte Störungen.
* `random-events.ts` — zufällige oder zeitabhängige Ereignisse.

---

## game/ai

```text
src/game/ai/
├── ai.types.ts
├── ai.state.ts
├── ai.economy.ts
├── ai.expansion.ts
├── ai.military.ts
├── ai.priority.ts
└── ai.tick.ts
```

* `ai.types.ts` — Typen für AI-State und Entscheidungen.
* `ai.state.ts` — interne AI-Zustände.
* `ai.economy.ts` — Wirtschaftsentscheidungen der KI.
* `ai.expansion.ts` — Territoriums- und Baulogik der KI.
* `ai.military.ts` — militärische KI-Entscheidungen.
* `ai.priority.ts` — Prioritätssystem für Ziele.
* `ai.tick.ts` — AI-Hauptausführung pro Tick.

---

# pixi

```text
src/pixi/
├── GameCanvas.tsx
├── GameStage.tsx
├── PixiAppProvider.tsx
├── world/
├── layers/
├── entities/
├── hooks/
├── systems/
└── utils/
```

* `GameCanvas.tsx` — erstellt und mountet die Pixi-Oberfläche.
* `GameStage.tsx` — baut den Renderbaum der Spielwelt auf.
* `PixiAppProvider.tsx` — stellt Pixi-App-Kontext und globale Ressourcen bereit.

## pixi/world

```text
src/pixi/world/
├── WorldRoot.tsx
├── WorldViewport.tsx
├── WorldChunks.tsx
├── ChunkContainer.tsx
└── SortableWorldContainer.tsx
```

* `WorldRoot.tsx` — Wurzelcontainer der Welt.
* `WorldViewport.tsx` — übernimmt Kamera-Transformationen.
* `WorldChunks.tsx` — rendert nur sichtbare Chunks.
* `ChunkContainer.tsx` — Container für einen Chunk.
* `SortableWorldContainer.tsx` — Container mit Z-/Y-Sortierung.

## pixi/layers

```text
src/pixi/layers/
├── IsoTerrainLayer.tsx
├── IsoWaterLayer.tsx
├── IsoTerritoryLayer.tsx
├── IsoRoadLayer.tsx
├── IsoBuildingLayer.tsx
├── IsoWorkerLayer.tsx
├── IsoOverlayLayer.tsx
├── IsoSelectionLayer.tsx
├── IsoGhostPlacementLayer.tsx
└── IsoDebugLayer.tsx
```

* `IsoTerrainLayer.tsx` — Boden- und Terrainsprites.
* `IsoWaterLayer.tsx` — Wasser- und Flüssigkeitsdarstellung.
* `IsoTerritoryLayer.tsx` — Gebietstönung und Besitzanzeige.
* `IsoRoadLayer.tsx` — Straßen und Verbindungen.
* `IsoBuildingLayer.tsx` — Gebäude.
* `IsoWorkerLayer.tsx` — Arbeiter und bewegte Einheiten.
* `IsoOverlayLayer.tsx` — Rauch, Statusicons, Produktionseffekte.
* `IsoSelectionLayer.tsx` — Hover, Auswahl und Marker.
* `IsoGhostPlacementLayer.tsx` — Bau-Vorschau und Platzierungsfeedback.
* `IsoDebugLayer.tsx` — Debug-Visualisierung.

## pixi/entities/terrain

```text
src/pixi/entities/terrain/
├── IsoTileSprite.tsx
├── IsoAutotileSprite.tsx
└── IsoChunkSprite.tsx
```

* `IsoTileSprite.tsx` — einzelnes Isotile.
* `IsoAutotileSprite.tsx` — Tiles mit Nachbarschaftslogik.
* `IsoChunkSprite.tsx` — zusammengesetzter Chunk-Sprite oder Chunk-Renderer.

## pixi/entities/buildings

```text
src/pixi/entities/buildings/
├── IsoBuildingSprite.tsx
├── IsoBuildingShadow.tsx
├── IsoConstructionOverlay.tsx
├── IsoBuildingStatusIcon.tsx
├── IsoBuildingLabel.tsx
└── IsoBuildingSelectionRing.tsx
```

* `IsoBuildingSprite.tsx` — Hauptsprite eines Gebäudes.
* `IsoBuildingShadow.tsx` — Schattenbasis.
* `IsoConstructionOverlay.tsx` — Fortschritt oder Baustellenstatus.
* `IsoBuildingStatusIcon.tsx` — blocked/working/warning-Icons.
* `IsoBuildingLabel.tsx` — Name oder kurze Textanzeige.
* `IsoBuildingSelectionRing.tsx` — Auswahlmarkierung.

## pixi/entities/workers

```text
src/pixi/entities/workers/
├── IsoWorkerSprite.tsx
├── IsoWorkerCarryIcon.tsx
├── IsoWorkerShadow.tsx
├── IsoWorkerPathPreview.tsx
└── IsoWorkerSelectionMarker.tsx
```

* `IsoWorkerSprite.tsx` — Hauptdarstellung eines Workers.
* `IsoWorkerCarryIcon.tsx` — zeigt getragene Ressource.
* `IsoWorkerShadow.tsx` — Schatten unter Worker.
* `IsoWorkerPathPreview.tsx` — optionaler Pfad-Overlay.
* `IsoWorkerSelectionMarker.tsx` — Selektion für Worker.

## pixi/entities/roads

```text
src/pixi/entities/roads/
├── IsoRoadSprite.tsx
├── IsoRoadSegment.tsx
└── IsoRoadNodeMarker.tsx
```

* `IsoRoadSprite.tsx` — zusammengesetzte Straßendarstellung.
* `IsoRoadSegment.tsx` — einzelnes Straßenstück.
* `IsoRoadNodeMarker.tsx` — Debug- oder Knotenmarker.

## pixi/entities/shared

```text
src/pixi/entities/shared/
├── IsoSelectionDiamond.tsx
├── IsoFootprintPreview.tsx
├── IsoHoverMarker.tsx
├── IsoTextLabel.tsx
└── IsoAnimatedIcon.tsx
```

* `IsoSelectionDiamond.tsx` — visuelles Auswahl-Diamond.
* `IsoFootprintPreview.tsx` — zeigt Gebäude-Footprint an.
* `IsoHoverMarker.tsx` — Hover-Hervorhebung.
* `IsoTextLabel.tsx` — Pixi-Text für Weltobjekte.
* `IsoAnimatedIcon.tsx` — allgemeine kleine Effekte und Symbole.

## pixi/hooks

```text
src/pixi/hooks/
├── useGameLoop.ts
├── useIsoCamera.ts
├── useIsoPointer.ts
├── useVisibleChunks.ts
├── useRenderWorld.ts
└── useSelectionInput.ts
```

* `useGameLoop.ts` — verbindet Frame-Loop mit Sim-Ticks.
* `useIsoCamera.ts` — Kamera-Input und Transformationslogik.
* `useIsoPointer.ts` — Maus-/Pointerumrechnung in Iso-Koordinaten.
* `useVisibleChunks.ts` — sichtbare Chunks aus Kamera ableiten.
* `useRenderWorld.ts` — Renderdaten aus Store/State ziehen.
* `useSelectionInput.ts` — Auswahlinteraktion verarbeiten.

## pixi/systems

```text
src/pixi/systems/
├── texture.system.ts
├── animation.system.ts
├── culling.system.ts
├── sorting.system.ts
└── debug.system.ts
```

* `texture.system.ts` — lädt und verwaltet Texturen.
* `animation.system.ts` — globale Animationsverwaltung.
* `culling.system.ts` — blendet unsichtbare Inhalte aus.
* `sorting.system.ts` — Z-/Y-Sortierung auf Pixi-Seite.
* `debug.system.ts` — Debug-Zeichnung und Flags.

## pixi/utils

```text
src/pixi/utils/
├── pixi.iso.ts
├── pixi.coordinates.ts
├── pixi.depth.ts
├── pixi.hitareas.ts
├── pixi.textures.ts
├── pixi.spritesheet.ts
└── pixi.cache.ts
```

* `pixi.iso.ts` — Pixi-spezifische Iso-Helfer.
* `pixi.coordinates.ts` — allgemeine Koordinaten-Utilities.
* `pixi.depth.ts` — Sortierhilfen.
* `pixi.hitareas.ts` — HitAreas für Tiles und Entities.
* `pixi.textures.ts` — Texture-Lookups.
* `pixi.spritesheet.ts` — Spritesheet-Laden und Mapping.
* `pixi.cache.ts` — Caching-Utilities.

---

# ui

```text
src/ui/
├── hud/
├── panels/
├── dialogs/
└── shared/
```

## ui/hud

```text
src/ui/hud/
├── TopHud.tsx
├── ResourceBar.tsx
├── PopulationBar.tsx
├── TransportIndicator.tsx
├── WorldPulseBar.tsx
└── FpsCounter.tsx
```

* `TopHud.tsx` — oberer HUD-Rahmen.
* `ResourceBar.tsx` — Ressourcenanzeige.
* `PopulationBar.tsx` — Population, Worker, Limits.
* `TransportIndicator.tsx` — Transporteffizienz und Stau.
* `WorldPulseBar.tsx` — Spezialwert oder globale Stimmung.
* `FpsCounter.tsx` — FPS-Anzeige.

## ui/panels

```text
src/ui/panels/
├── BuildingMenu.tsx
├── InspectorPanel.tsx
├── BuildingInspector.tsx
├── WorkerInspector.tsx
├── EconomyPanel.tsx
├── MilitaryPanel.tsx
├── MapDebugPanel.tsx
└── EventLogPanel.tsx
```

* `BuildingMenu.tsx` — Auswahlmenü für Bauoptionen.
* `InspectorPanel.tsx` — Container für Detailansichten.
* `BuildingInspector.tsx` — Gebäudedetails.
* `WorkerInspector.tsx` — Workerdetails.
* `EconomyPanel.tsx` — Wirtschaft und Produktionsübersicht.
* `MilitaryPanel.tsx` — militärische Infos.
* `MapDebugPanel.tsx` — Debugdaten zur Karte.
* `EventLogPanel.tsx` — chronologisches Eventlog.

## ui/dialogs

```text
src/ui/dialogs/
├── PauseMenuDialog.tsx
├── SettingsDialog.tsx
└── VictoryDialog.tsx
```

* `PauseMenuDialog.tsx` — Pausemenü.
* `SettingsDialog.tsx` — Optionen und Konfiguration.
* `VictoryDialog.tsx` — Sieg/Niederlage/Endbildschirm.

## ui/shared

```text
src/ui/shared/
├── Panel.tsx
├── Icon.tsx
├── Tooltip.tsx
├── StatRow.tsx
├── SectionTitle.tsx
└── HotkeyHint.tsx
```

* `Panel.tsx` — wiederverwendbarer Panel-Container.
* `Icon.tsx` — Standard-Icon-Komponente.
* `Tooltip.tsx` — Tooltip-Komponente.
* `StatRow.tsx` — Zeile für Werte in Panels.
* `SectionTitle.tsx` — Abschnittsüberschrift.
* `HotkeyHint.tsx` — Anzeige für Tastenkürzel.

---

# store

```text
src/store/
├── game.store.ts
├── ui.store.ts
├── camera.store.ts
├── selection.store.ts
├── render.store.ts
└── debug.store.ts
```

* `game.store.ts` — zentraler Spiel-/Weltzustand.
* `ui.store.ts` — UI-Zustände wie offene Panels, Menüs, Dialoge.
* `camera.store.ts` — Kamera-Position und Zoom.
* `selection.store.ts` — Hover, Auswahl, Placement-Modus.
* `render.store.ts` — gecachte Renderdaten oder View-State.
* `debug.store.ts` — Debugflags und Entwicklungsoptionen.

---

# assets

```text
src/assets/
├── maps/
├── tiles/
├── buildings/
├── workers/
├── icons/
└── spritesheets/
```

## assets/maps

```text
src/assets/maps/
├── nightmare_valley.tmx
├── nightmare_valley.json
└── test_iso_map.json
```

* `nightmare_valley.tmx` — Tiled-Quelldatei.
* `nightmare_valley.json` — exportierte Spielkarte.
* `test_iso_map.json` — kleine Testkarte für Entwicklung.

## assets/tiles

```text
src/assets/tiles/
├── terrain/
├── water/
├── roads/
└── overlays/
````

* `terrain/` — Boden- und Naturtiles.
* `water/` — Wasser- und Flüssigkeitstiles.
* `roads/` — Straßentiles.
* `overlays/` — Dekoration und Spezialoverlays.

## assets/buildings

```text
src/assets/buildings/
├── huts/
├── industry/
├── military/
└── warehouses/
```

* `huts/` — kleine Gebäude.
* `industry/` — Produktionsgebäude.
* `military/` — militärische Gebäude.
* `warehouses/` — Lager- und Speichergebäude.

## assets/workers

```text
src/assets/workers/
├── burden-thrall/
├── miner/
├── builder/
└── soldier/
```

* `burden-thrall/` — Träger- und Transportanimationen.
* `miner/` — Bergarbeiter-Sprites.
* `builder/` — Bauarbeiter-Sprites.
* `soldier/` — Soldaten-Sprites.

## assets/icons

```text
src/assets/icons/
├── resources/
├── statuses/
└── ui/
```

* `resources/` — Ressourcensymbole.
* `statuses/` — Warnungen, Produktion, Blockierungen.
* `ui/` — allgemeine UI-Icons.

## assets/spritesheets

```text
src/assets/spritesheets/
├── terrain-sheet.json
├── buildings-sheet.json
├── workers-sheet.json
└── ui-sheet.json
```

* `terrain-sheet.json` — Spritesheet-Mapping für Terrain.
* `buildings-sheet.json` — Spritesheet-Mapping für Gebäude.
* `workers-sheet.json` — Spritesheet-Mapping für Arbeiter.
* `ui-sheet.json` — Spritesheet-Mapping für UI-Elemente.

## styles

```text
src/styles/
├── globals.css
├── reset.css
├── theme.css
└── ui.css
```

* `globals.css` — globale Styles.
* `reset.css` — CSS-Reset.
* `theme.css` — Farb- und Themevariablen.
* `ui.css` — UI-spezifische Styles.

## lib

```text
src/lib/
├── math.ts
├── array.ts
├── object.ts
├── asserts.ts
├── logger.ts
├── profiler.ts
└── deep-clone.ts
```

* `math.ts` — Mathe-Helfer.
* `array.ts` — Array-Utilities.
* `object.ts` — Objekt-Utilities.
* `asserts.ts` — Assertions und Guards.
* `logger.ts` — Logging-Helfer.
* `profiler.ts` — Performance-Messung.
* `deep-clone.ts` — tiefe Kopierfunktion oder Wrapper.

## tests

```text
src/tests/
├── core/
├── iso/
└── render/
```

## tests/core

```text
src/tests/core/
├── economy.simulation.test.ts
├── building.placement.test.ts
├── transport.logic.test.ts
└── pathfinding.test.ts
```

* `economy.simulation.test.ts` — testet Tick- und Wirtschaftssystem.
* `building.placement.test.ts` — testet Bauplatzlogik.
* `transport.logic.test.ts` — testet Transportfluss.
* `pathfinding.test.ts` — testet Pfadsuche.

## tests/iso

```text
src/tests/iso/
├── iso.project.test.ts
├── iso.inverse.test.ts
├── iso.depth.test.ts
└── iso.hit-test.test.ts
```

* `iso.project.test.ts` — testet Iso-Projektion.
* `iso.inverse.test.ts` — testet inverse Projektion.
* `iso.depth.test.ts` — testet Sortierung/Tiefe.
* `iso.hit-test.test.ts` — testet Tile- und Diamond-Hit-Erkennung.

## tests/render

```text
src/tests/render/
├── render.adapter.test.ts
├── render.sort.test.ts
└── render.culling.test.ts
```

* `render.adapter.test.ts` — testet Umwandlung von Sim- zu Renderdaten.
* `render.sort.test.ts` — testet Renderreihenfolge.
* `render.culling.test.ts` — testet Sichtbarkeitsfilter.
