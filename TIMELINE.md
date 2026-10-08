# Five years — implementation checklist

## Direction
- Full-window world; minimal controls, short factual context, no activity modals.
- Two recognizable cartoon characters, selectable leader and following companion.
- Frame-rate-independent movement, nearby scenery only, instanced repeated details.
- Organic grass clusters with gaps, varied silhouettes, density and color; seasonal wind, leaves, rain and snow.
- Preserve ping-pong A/L acceleration, burger camera reset, cream couch/TV/lamp unpacking.

## Chronological build
- [x] Aug 2021 — university meeting; alternating A/L ping-pong.
- [x] Oct 9 2021 — first date; one-hole mini golf.
- [x] Nov 14 2021 — MrBeast Burger memory sign; BURGER shack; eat together.
- [x] Mar 27 2022 — first skating together; frozen lake and skating activity.
- [x] Aug 2022 — first travels, Italy; pastel harbor and terraces, no game.
- [x] Oct 9 2022 — one year; autumn woodland boardwalk.
- [x] Aug 30 2023 — first concert; optional walk across a lit stage.
- [x] Oct 9 2023 — two years; two balloons and quiet crickets.
- [x] May 18 2024 — Sylvan Lake road trip + first internships/long distance.
- [x] Aug 2024 — move in; unpack cream couch, TV and lamp.
- [x] Oct 9 2024 — Simon’s first Korean BBQ; tabletop grill.
- [x] Feb 2 2025 — ski/snowboard day; navy ski outfit and teal snowboard outfit.
- [x] May 2025 — second long distance + new internships.
- [x] Oct 9 2025 — four years; a big bouquet.
- [x] Dec 2025 — Dubai; sandstone buildings, lattice, pergola and palms.
- [x] May 2026 — graduation; caps, gowns, green/lavender hoods; cross stage.
- [x] Jun 2026 — first trip fully alone; Central American cruise deck.
- [x] Aug 2026 — new jobs and beyond; Augustana Camrose + 3 WTC, work clothes.

## Photo mapping
Photos remain local references, not published photo textures.
- E0324165: skating lake, charcoal jacket/black pants, navy puffer/jeans, skates.
- 7D778B8A: navy skiing shell, grey helmet, orange goggles and poles.
- 0616655E: teal jacket, black pants, snowboard with blue bindings.
- CD01DB0D: Italian harbor, pastel houses, terraced hills and curved breakwater.
- 7F5EF311: Dubai sandstone, dark timber/lattice and palms.
- 288D04DE: autumn birch woodland and wooden boardwalk/rails.
- 169A15BF: graduation caps, black gowns, light green and lavender hoods.
- 4A30891C: cruise pool deck, blue loungers, railings and sail-away stage.
- Earlier couple photo: height difference, hair, sunglasses, burgundy halter, cream trousers/tote; grey tee and striped shorts.
- Work: black trousers and T-shirt for him; black trousers and sleeveless work top for her.
- BBQ and bouquet: original stylized props; no exact venue or flowers specified.
- Buildings are neutral side-by-side destinations; no person-to-city assignment assumed.

## Architecture references
- [3 World Trade Center — Port Authority](https://wtcdev.panynj.gov/en/local/learn-about-wtc/3-world-trade-center.html): contemporary glass tower with exterior steel bracing.
- [Augustana Campus — University of Alberta](https://www.ualberta.ca/en/visitor-hub/augustana.html): Camrose campus.
- [Augustana conference services](https://www.ualberta.ca/en/augustana/campus-info/conference/index.html): Founders’ Hall and Forum reference.

## Verification (2026-10-05)
- [x] Build and game-logic checks.
- [x] Play each activity, including completion and leaving/restarting.
- [x] Walk through every stop and verify outfits, dates and scenery.
- [x] Desktop/mobile visual checks and frame-time sample.

### Verification notes
- All 18 stops implemented and opened in the browser. Scenery-only stops expose Continue immediately.
- Completed all eight ping-pong returns, a successful golf putt, five skating and five skiing gates, the concert and graduation crossings, five burger bites, three unpacked items, three stone skips, four grill turns, bouquet and sapling.
- Checked 390 × 844 phone layout and completed golf at that width; restored the desktop viewport.
- Nine automated checks cover paddle timing/acceleration/misses, frame-independent steering, gate hit detection, putting, repeatable scatter and timeline integrity.
- The short ending-scene sample measured 120 FPS / 10.3 ms p95 on this browser at DPR 1.25 (164 draw calls). This is a local sample, not a guarantee for other devices.
- Vite build passes with its standard large-bundle warning. No assets from the personal photos are published or uploaded.
- Architecture/photo models are stylized procedural interpretations; more detailed rigged models can replace them later without changing the timeline data.

Additional visual architecture sources: [Augustana tours](https://www.ualberta.ca/en/augustana/campus-info/visit-us/index.html), [3 WTC architect project page](https://rshp.com/projects/office/3-world-trade-center/).
- Final graduation sample: 120 FPS / 9.7 ms p95, 129 draw calls, 15,275 triangles. Automatic Continue was checked from graduation into the cruise.


## Polish checklist — 8 October 2026

- [x] Rename the site SALE.
- [x] Infinite A/L ping-pong with gradual acceleration on every return; manual Continue.
- [x] Depth-tested sign lettering aligned to sign geometry; beveled props and directional shadows.
- [x] Active golfer, held putter and timed swing; delayed ball launch.
- [x] Burger hearts, tulips and direct context for the first I love you.
- [x] Permanent landscape groves at outfit boundaries; independent character outfit timing.
- [x] Free skating with momentum, four-way controls, boards and hockey nets; rink moved behind the path.
- [x] Modeled maple leaves on Canadian flags.
- [x] Italian flag and second suitcase.
- [x] Road trip! title; explicit stone throws, bounces, ripples and delayed scoring.
- [x] Rectangular apartment with elevator boarding, upper-floor cutaway and cream couch/TV/lamp unpacking.
- [x] Red anniversary signs, modeled hearts and exactly 1/2/3/4/5 tulips.
- [x] Downhill ski orientation, sloped snow mesh, procedural snow texture, tracks, banks and chairlift.
- [x] Office setting for internships; long distance retained only in context.
- [x] Visible bouquet handoff, including replay after completion.
- [x] Dubai pergola rafters shortened to avoid tower intersections.
- [x] Green/gold graduation backdrop with modeled shield, book, mountains, river and wheat; remove slogan and copied PNG.
- [x] Larger Regal Princess with tiered decks, balcony windows, lifeboats and two walkable ramps.
- [x] Five years — 9 October 2026 — NYC stop before the jobs epilogue, with 1 WTC, Empire State, Times Square and pizza.
- [x] Plainer captions and aligned ending plaques.
- [x] Denser seeded grass with wind, layered tree crowns, bushes, rocks and scenery clearance.

The final jobs section is intentionally an epilogue after the fifth anniversary. Its caption retains the August 2026 start; the visible date reads “2026 & beyond”. Earlier verification notes above describe the previous version, including its old finite activities.

Current validation: production build and 11 automated checks pass. Browser checks cover pizza completion, elevator arrival and all three unpacked items, four-way free skating, graduation crossing, bouquet completion, all three stone throws and the full cruise ramp/deck crossing. A local skating sample after the shadow/vegetation upgrade measured 120 FPS / 10.4 ms p95 at DPR 1.25; results depend on hardware. Vite still reports its Three.js bundle-size warning.


## Reference-model and sightline corrections — 8 October 2026
- [x] Move decorative tree crowns to the rear landscape band and move biome accent trees behind the attractions. Keep permanent outfit groves between stops.
- [x] Start skiing at the summit and physically descend through five stationary flagged gates; retry a missed gate just uphill of it.
- [x] Rebuild 1 WTC from the supplied reference with eight glass facets, diagonal seams, fine mullions, podium and segmented spire.
- [x] Rebuild the Empire State Building with limestone piers, recessed windows, stepped setbacks, crown and antenna.
- [x] Denser, illuminated Times Square billboard stacks based on the supplied streetscape reference.
- [x] Remove protruding cheek/chin stubble meshes; tint the continuous face surface instead.
- [x] Correct initial camera projection and framing when opening a memory directly.

Validation: production build, 13 automated tests, browser completion of the full five-gate ski run, graduation sightline check, facial geometry and NYC visual inspection. NYC sample: 120 FPS / 9.7 ms p95 at DPR 1.25 on this browser. Architectural models remain stylized procedural interpretations of the supplied photographs.


## Pathside scenery and concealed outfit changes — 8 October 2026
- [x] Replace crossed triangular grass with narrow, curved, root-to-tip shaded blades and gentle tip movement.
- [x] Denser irregular verges and seeded meadow patches, preserving path and attraction clearances.
- [x] Bring trees back into the visible landscape: tall trees behind/beside attractions, small trees below the path.
- [x] Add low flowering shrubs, fallen logs, moss, smaller stones and seasonal snow colors along the foreground.
- [x] Replace paired transition bushes with one permanently planted, forked tree closer to the camera; canopy aligned to cover both walkers at each outfit boundary.
- [x] Check canopy occlusion against both walking lanes and camera angles; check foreground canopy projection below sign boards.

Validation: production build and 15 automated checks pass. Browser inspection covered summer planting, the burger-to-skating transition boundary (both characters concealed), and clear winter rink/sign sightlines. Winter sample: 120 FPS / 9.6 ms p95 at DPR 1.25 on this browser; performance varies by device. Vite's existing Three.js bundle-size warning remains.


## Compact fast-travel timeline — 8 October 2026
- [x] Small persistent timeline with year labels, memory dots, and a continuous walking-position marker.
- [x] Hover/focus previews dates and names; click or Enter/Space travels to a stop.
- [x] Travel moves both characters, resets camera framing immediately, and cancels active minigame/elevator movement.
- [x] Scrollable narrow-screen layout with current-stop visibility; keyboard arrows/Home/End select destinations.

Validation: browser checked apartment entry, travel from its active elevator to NYC, keyboard travel to the cruise and campus, live marker movement, and a 390px mobile layout. Production build and the existing 15 automated checks pass.
