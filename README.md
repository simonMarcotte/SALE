# SALE

A fullscreen Three.js relationship timeline, built with React, TypeScript and React Three Fiber. Two photo-inspired cartoon characters walk through 19 memories, from university in August 2021 through the fifth anniversary in October 2026 and a jobs epilogue. All activities stay in the scene.

## Run

```sh
npm install
npm run dev
```

`npm run build` type-checks and builds `dist/`. `npm run preview` serves the production build. `npm test` runs the game and scenery checks (Node 22.6+).

## Controls

- Arrow keys / A and D, or hold the corner arrows, to walk. Click the ground to walk there.
- Portraits or C switch the leader; the other character follows.
- Click a landmark or press E nearby to interact. Escape / × leaves an activity.
- Continue walks to the next memory. Activities are replayable.
- The small bottom timeline follows your position. Click a dot to fast travel; hover/focus previews the date and memory. Arrow keys move between focused stops, Home/End reach either end, and Enter/Space jumps. On narrow screens the strip scrolls. Fast travel exits the current activity and brings both characters.
- Focus a corner arrow and press Enter for discrete keyboard steps, including in steering activities.

## Activities

- **Ping-pong:** A left / L right. Return when the receiving zone and matching button turn gold. Infinite alternating returns; travel time decreases gently with every return, without a speed plateau. Continue exits whenever you want. A miss resets the rally. Touch paddle buttons also work.
- **Mini golf:** click / E when the moving marker reaches gold. Poorly timed putts miss and reset; a successful putt completes the hole.
- **Burger:** five clicks / E to share it. Completion restores the exploration camera.
- **Skating:** free roam with arrows / WASD and four touch arrows. Acceleration, coasting drag and rebounds keep movement on the ice; Continue exits.
- **Skiing:** start at the summit and descend through five stationary gates on a textured incline with ski tracks and chairlift scenery. The characters face downhill.
- **Concert:** optionally cross the lit stage with the movement controls.
- **Road trip!:** click / E to throw each of three stones; each animated throw finishes before scoring; the memory combines the road trip and first long-distance internships.
- **Moving in:** take the elevator to the upper-floor apartment; once the doors open, click boxes / E to unpack a cream couch, TV and lamp.
- **Korean BBQ:** click the grill / E to turn four pieces.
- **Flowers:** click / E to pass the bouquet from the active character to their companion.
- **Graduation:** cross the stage to collect diplomas and continue. Both characters wear caps and gowns with their reference hood colors.
- **Regal Princess:** walk up the left gangway, across the raised deck, and down the right gangway.
- **Five years:** 9 October 2026, NYC skyline with 1 WTC, Empire State Building, Times Square billboards and four pizza slices.
- **New jobs:** plant a sapling between the Augustana and 3 WTC landmarks.
- Italy, the woods, two years, second internships, Dubai are scenic pauses. The two-year memory plays quiet synthesized cricket chirps only when activated; leaving stops the audio.

See [TIMELINE.md](TIMELINE.md) for the complete chronological checklist and photo mapping. Short dates/context appear near each memory; a compact travel timeline is the only persistent navigation, with no modal.

## Scene and models

The original couple photo guides the height difference, hair, sunglasses, everyday clothes, watch and tote. Additional references guide charcoal/navy skating coats, navy ski gear and orange goggles, teal snowboard gear, graduation caps/gowns and green/lavender hoods. Work outfits are black trousers, a T-shirt for him and a sleeveless top for her.

Scenery includes a pastel Italian harbor, autumn birch boardwalk, concert lights, balloons/crickets, lakeside car and luggage, an office for internships, flowers, a sandstone Dubai courtyard and a cruise pool deck. The ending uses stylized Augustana Founders’ Hall and 3 World Trade Center. These are procedural cartoon interpretations, not exact architectural replicas or scanned models. Original photos are not bundled or uploaded. The university crest is modeled relief geometry, not a PNG. Sign lettering is depth-tested planar geometry; anniversary signs have one tulip per year. Permanently planted foreground trees at outfit boundaries hide clothing changes with broad crowns aligned to the camera. The final jobs section follows the October anniversary intentionally and retains August 2026 in its context.

Building references:
- [Augustana tours — University of Alberta](https://www.ualberta.ca/en/augustana/campus-info/visit-us/index.html)
- [3 World Trade Center — RSHP architects](https://rshp.com/projects/office/3-world-trade-center/)

## Performance

NYC landmarks use reference-based faceted 1 WTC geometry, detailed Empire State setbacks/windows, and illuminated Times Square billboards. Taller decorative trees frame the sides and rear of attractions. Smaller foreground trees project below sign boards, alongside low shrubs, flowers, fallen logs and stones.

Only the current memory and its two neighbors mount. Shared primitive geometries/materials, instanced architectural details/trees/grass/pebbles, contact shadows, one 1024px sunlight shadow map and a pixel-ratio cap of 1.25 keep rendering inexpensive. Motion uses delta time and damped interpolation. React updates for interaction cues and chapter changes, not walking frames.

Grass uses seven narrow curved blades per tuft, shaded from root to tip, with wind bending only the tips. Seeded random clusters have varied scale, angle, lean and hue, irregular path verges, gaps between patches, and exclusions around scenery/water. Seeds keep layouts stable when revisiting. Trees sway, water ripples, leaves drift, winter snow falls and spring drizzle appears selectively. Reduced-motion preferences disable decorative weather/tree/water motion and walking bob/swing. Seasonal transitions are artistic blends between memories.

`?perf=1` prints a short 240-frame performance sample after warmup. `?memory=graduation` (or another ID from `src/story.ts`) opens directly at a memory; parameters can be combined. In development only, `?position=60` previews an exact point between memories for checking transition coverage. FPS is device-specific. The production build currently reports Vite’s standard large-bundle warning because Three.js is included.

## Files and saved progress

- `src/story.ts`: chronological data, dates, context, goals, outfits and spacing.
- `src/App.tsx`: inputs, compact controls, progress and interaction state.
- `src/Timeline.tsx`: position marker, memory previews and accessible fast travel.
- `src/World.tsx`: camera, movement, characters and original three activities.
- `src/Memories.tsx`: added landmarks and in-scene activities.
- `src/Apartment.tsx`: elevator and upper-floor unpacking.
- `src/PolishModels.tsx`, `src/ScenicModels.tsx`: rink, office, ship, university relief, NYC and snowy incline.
- `src/Landscape.tsx`: instanced trees, bushes, rocks and permanent transition trees.
- `src/Primitives.tsx`: shared meshes, materials, signs and trees.
- `src/Environment.tsx`, `src/scatter.ts`: terrain, random grass and weather.
- `src/activities.ts`, `src/pingpong.ts`: testable gameplay logic.
- `artifacts/`: browser verification screenshots.

Progress saves by stable memory IDs under `five-years-memories-v3`. The original v2 numeric progress is mapped to university/burger/home/future on first load; older entries remain untouched. No account, backend or network assets are needed at runtime.
