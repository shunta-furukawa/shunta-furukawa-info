# Playable portfolio world

The intended metaphor is now a third-person exploration game: the visitor controls a volumetric, logo-inspired black-haired hoodie avatar, walks to a sign, and explicitly inspects it. Scroll travel and destination-camera switching are no longer the primary interaction.

## Controls
- Desktop: WASD / arrows move relative to the camera; Shift runs; F / Enter / Space inspect a nearby sign. Drag or Q/E rotates the camera.
- Mobile: a captured-pointer virtual joystick moves the avatar, a button toggles running, the inspect button reads the nearby sign, and dragging the world rotates the camera.
- Opening content clears movement input. Native dialog focus management and Escape / close return to exploration at the same location.
- A reset control returns to the entrance. Header navigation and the content list allow direct reading without game controls.

## World and identity
A single walkable island contains 10 signs: philosophy/demo, five chronological career stops, work, skills, knowledge, and future questions. Paths, volumetric landmarks, a live map and highlighted nearby signs help orientation. The player has real head, hair, face, hood, torso, arms and legs, with procedural walking animation; it is not an image sprite. The original supplied logo remains in the header. Geometry uses discrete flat colors without gradients, outlines or glow.

The third-person camera follows the player and shortens its distance around scenery. Circle collisions and substeps keep the player out of solid objects and inside the island. Interaction is limited to signs within 3.5 world units. Reduced motion disables ambient animation and camera easing without disabling user-controlled walking. Lost focus clears held input; pointer cancellation releases the virtual stick.

All original career/work/skill records remain available in the reading panels, along with the existing conversation model and links to the knowledge articles. Existing hashes and /story/ continue opening the relevant content. Without WebGL, the content list remains available. Without JavaScript, the original server-rendered content stays readable.

## Validation
- Production Hugo build.
- `node tests/explorer-physics.mjs`: normalized diagonals, camera-relative direction, zero input, collision tunneling, sliding, world boundary, and interaction distances for all ten signs.
- Generated HTML local asset/link and content-count checks.
- Browser/device visual and end-to-end input testing has not been performed.

## Publishing preference
The owner explicitly authorized future changes to this portfolio to proceed through validation, merge and production deployment without waiting for a user review. Keep ordinary repository checks; report deployment results.

## Avatar and path refinement
The avatar keeps its 2.85-unit overall height and the same walking pivots. Smooth high-resolution spheres, capsules, a curved hoodie profile and a beveled curved fringe replace visibly faceted character surfaces. Unlit solid colors preserve the logo palette. The character remains a real articulated 3D mesh (24 meshes, approximately 42k triangles).

`explorer-paths.js` supplies rounded centerline samples to both the 3D ground ribbon and the minimap. Ground paths share one opaque surface material, with continuous curved edges and round end caps instead of overlapping rectangular slabs. The minimap draws the same routes in faint white behind the signs and player marker.

Validation: geometry is finite, original character height and foot position are retained, road sample continuity passes, existing movement/interaction checks pass, and the production Hugo build succeeds. No browser/device visual check was performed.

## Larger world and sign-to-panel transition
The island diameter and landmark spacing are now 1.6x the original, with character, sign and landmark geometry sizes preserved. Roads are 15% wider. Walking speed increases from 5 to 8 units/s and running from 8 to 13, so the larger distances do not add substantial travel time. Spawn, reset, collision positions, interaction coordinates, moving demonstration elements and minimap projection use the same world scale.

Inspecting a sign projects its actual board corners into screen coordinates. The native dialog expands from that rectangle over 440ms while the content fades in slightly later; closing returns to the source over 260ms. Direct navigation and offscreen signs use a short offset/fade fallback. Escape follows the same close transition. Animation cancellation, resizing and reduced-motion controls retain focus and movement handling; motion-off opens and closes immediately.

Validation: production build and movement/boundary/interaction tests, including the new scale/speed constants. Actual browser/device transition appearance is not visually verified.

## Camera and sign approach refinement

While walking, the camera gently rotates behind the avatar (maximum 0.8 rad/s, exponential settling). A continuous movement input retains its world heading so automatic orbit does not bend a straight walk into a circle. Releasing or changing input reanchors to the camera; manual drag, Q/E and camera buttons take priority and suspend follow for 1.4 seconds. Standing still, reading and reduced-motion mode disable automatic orbit. Reset restores both camera and avatar heading.

The minimap triangle now uses the avatar's actual rotation, independently of camera orbit. Each catalog exhibit has an explicit road approach point; its fixed board front faces that approach. Existing projected sign-to-dialog transitions use the rotated world matrix, and interaction collision ranges remain unchanged.

Validation: camera tests at 30/60/120 fps cover convergence, turn bounds, stable straight movement, manual override, angle wrapping, cardinal minimap headings and all 13 sign approaches. Movement/collision tests and Hugo production build pass. Local browser/device appearance was not tested.

## Start screen and compact interface

Home opens a native start dialog over the 3D scene. 探索する becomes つづきから when collection/inspection data exists; 内容を見る opens the content index directly. Deep content links and the career route remain directly readable. Movement is paused while start, content or menu is open. The first movement hint advances after walking, then disappears after an on-site inspection. Returning collectors do not see the hint.

The shared header keeps avatar/name and two expandable controls: icon-based メニュー and リンク. Menu labels are 人物・経歴・仕事・技術・思想・発信・資料, with 操作 and 設定 available in the playable world. Infrequent camera/reset-to-entry/motion/index controls move into settings. The minimap collection count remains visible; redundant legends move into help. Inventory uses item images, accessible names and owned check marks, with details on selection.

Settings → 最初から requires an explicit confirmation. It clears this site's collection, inspection and tutorial keys, resets position/run state and returns to start. It does not clear unrelated browser storage. Persistence failure leaves the current session reset and explains that storage could not be updated. Tests cover saved reset, blocked writes and reacquisition; Hugo build and controller target integrity pass. Browser/device visual testing was not performed.

## Three save slots, portable URLs and actions

Start now offers explicit new/continue flows with three slot buttons; overwriting and importing ask for confirmation. Local autosave stores items, visits, paid unlocks, unique coin IDs, color and pose. Legacy items migrate to slot 1 without removing the old storage. Settings can switch slots, change the accent, reset the active slot, or export all three slots. URL import remains a preview action until explicitly accepted.

A/B/C use version-1 binary bitsets (34 bytes / 46 base64url characters each). Item and coin IDs map to fixed catalog indices. Position is stored at centimeter precision and heading at milliradian precision. Invalid version, oversized input, out-of-range data and negative balances are rejected. This is reversible compression, not encryption; no personal or authentication data is included. Changing catalog/coin indexing requires a new codec version. Clipboard failure exposes a selectable URL; local save failure leaves URL export available.

101 unique coins follow roads. Three coins unlock one exhibit permanently; existing collected legacy exhibits remain accessible. Reading via navigation is free and grants no exploration items. On-site unlocked exhibits grant items after reaching the reading area's end, opening a technology detail, or interacting with the philosophy demo. End visibility is not proof of reading. Collected objects retain the existing lift-to-inventory animation.

Dash is held, not toggled (touch pointer capture or Shift). Pointer cancel/release, blur and UI pause clear the action. Space/touch jump uses anticipation, airborne leg/arm pose and landing compression; ground collisions remain enforced. Save restoration rejects scenery-overlapping positions in favor of the entrance. Accent is applied to UI, map, live 3D materials, sign textures and collectible thumbnails; original raster illustrations/portrait remain unchanged.

Validation: all prior movement/camera/collection tests; 3-slot codec round trip and malformed input; one-time coin expenditure; jump phases at 30/60/120 fps; Hugo production build and HTML controller targets. Browser/device interaction and rendered appearance were not tested locally.

## Exhibit puzzles

Profile retains its end-of-content goal. The other twelve exhibits now require a solved puzzle on site, after the existing coin unlock. Reading to the end, toggling an unrelated technology detail, or using the old philosophy demo no longer grants those items. A solve callback is checked against the active exhibit and physical proximity before collection.

The twelve scenarios use switches, two-tap permutation swaps, relationship connections, condition sorting, physically connected rotating pipes, capacity-aware load routing, conversation controls and antenna alignment. Every puzzle includes its fictional model rules, two hint levels, feedback and a retry action. There are no timers or failure charges. Keyboard buttons and tap interactions are available throughout; reduced motion suppresses running animations.

Each solved item's collection bit also represents its completed puzzle state, preserving the existing three-slot URL format. Completed puzzles reopen in their solved state and can be replayed without another item or coin cost. Existing collected items remain completed. In-progress arrangements last within the page session and are cleared on slot change/reset; partial arrangements are not exported.

Each non-profile location now has a physical miniature device. Before completion it is static with a gray status lamp. Completion lights the lamp in the slot accent, animates the device and changes the sign to 稼働中. Reset or slot restoration updates these states from the saved collection.

Validation: all twelve puzzles start incomplete and have reachable solutions; alternate valid load allocation; exhaustive 256 pipe arrangements; completed-item URL round trip; save/jump tests; Hugo production build and HTML controller targets. Browser/device rendering and interaction have not been checked locally.

## SVG direct manipulation and river route

Puzzle controls now render as SVG machines: swappable illustrated command discs, rotary pipe fittings with connected water paths, cable plugs and sockets, request bundles in server bays, sorting bins, circuit levers, radio dials and conversation sliders. All share the original puzzle predicates. Pointer capture supports mouse and touch dragging, drop target selection and cancel rollback; taps and Enter/Space/arrow keys remain alternatives. Cable dragging previews the wire, and working circuits/pipe flows use SVG motion with reduced-motion support.

A curved river now occupies the eastern optional route, with a bridge and stepping stone. Water blocks ground movement; airborne avatars can cross. A failed landing restores the last safe shore without deducting coins. Saved poses update only on safe ground, and old water-overlapping poses restore at the entrance. The minimap includes the river and bridge.

Coin IDs and count remain 0–100 for existing save/URL compatibility. The last 24 coins relocate to the optional river route; twelve are airborne and require jumping to collect. Old road coins that intersect water move to a nearby bank. Existing collected IDs remain collected. Enough ground coins remain to unlock all exhibits using the bridge route.

Validation: SVG swap/drop/dial mapping, all prior puzzle predicates, stable coin IDs and URL round trip, grounded versus airborne pickup, bridge/water collision, and successful river crossings at walking/dash speeds across 30/60/120 fps. Hugo build, camera/movement tests and HTML controller integrity pass. Local browser/device visual or pointer-interaction testing was not performed.

## Deeper exhibits, twelve reworked puzzles and the last letter

Exhibit panels had been reduced to three or four bullet points. They now restore the material of the original portfolio from the existing data files: each career stop shows its summary facts, the full narrative (`data/stories/*.descriptions`), the illustration, the "いまにつながること" link to the present (`connection`) and the skills of that period. Work cases include the original highlight summaries. The tool shelf shows every skill with its years and description without opening anything. Profile carries the original ABOUT lead, body, tags and stats plus a short orientation of the town. The archive describes the RTB article and its vocabulary; the communication station lists the planned series from `data/series.yaml`. No new career facts or figures were added.

On-site panels now read top to bottom as exhibit heading → record → puzzle, so the puzzle follows the reading it is based on. The pickup bar's 謎解きへ button still jumps straight to it.

The twelve puzzles were replaced. The previous set could be solved by reading the answer out of the instruction (four steps in the obvious order, two or three switches). Each new puzzle is a small logic problem themed on its exhibit:

| Exhibit | Type | Problem |
| --- | --- | --- |
| career-0 | toggle | Six patches each flip several regression tests; find the combination that turns all six green. |
| career-1 | program | Five looping commands (forward, turn, jump) must collect a star and reach the flag on a 6×4 stage. |
| career-2 | deduce | Order five stakeholders under five clues. |
| career-3 | rule | Build `(A op B) op C` so that exactly the four starred users are targeted. |
| career-4 | matrix | Assign 3 roles × 4 permissions under eight separation-of-duty rules. |
| work-0 | pipe | Rotate a 4×3 pipe board so the route passes two checkpoints before the screen; decoy pipes included. |
| work-1 | plan | Choose server counts for eight time slots: cover demand, scale up by at most one per slot, stay in budget. |
| work-2 | stage | Schedule seven release tasks into four stages of two, respecting prerequisites. |
| skills | match | Connect six skills to the era they were acquired in; the answers are in the career exhibits. |
| philosophy | slots | Place ads in seven programme breaks under relevance, timing, frequency and "do not deliver now" rules. |
| knowledge | auction | Bid on five second-price auctions within a budget; the highest-value slot is a trap. |
| connect | relay | Aim seven relay antennas so the signal visits every relay once and reaches the receiver. |

`puzzle-logic.js` holds the DOM-free rules (`evaluate` returns `ok`, human-readable `issues` and per-rule `marks`); `exhibit-puzzles.js` holds the data and the panel; `puzzle-svg.js` renders eight SVG boards and four HTML table boards. Failed attempts explain what went wrong (which slot fell into a hole, which time slot ran short, how many rules are unmet). Rule-based puzzles mark each rule met or unmet only after 確かめる. Hints have three levels, the third close to the answer. Solving shows a short debrief relating the model to the exhibit. There are still no timers or penalties, all models are labelled fictional, and every control works by tap and keyboard (arrow keys cycle or step values; ordering, staging and cabling also support dragging).

Save format, collection bits and coin IDs are unchanged, so existing saves and transfer URLs keep working. A collected item still reopens its puzzle in the solved state.

Collecting all thirteen items now unlocks 最後の手紙 (`#ending`), reachable from the inventory. Before completion the same address shows the current count. The letter text is assembled from the existing ABOUT and story statements with short connecting sentences.

Validation: `node tests/exhibit-puzzles.mjs` enumerates every arrangement of every puzzle (up to 1.7 million) and asserts that each starts unsolved, that the stored answer is accepted, that the nine puzzles promising a single answer have exactly one, that the pipe puzzle accepts only the checkpoint route, that the auction accepts only the A/D/E winning set, and that failed attempts produce an explanation. All other existing tests and the Hugo production build pass. Each puzzle was additionally played in headless Chromium through the real page: one failed attempt, the answer entered with keyboard or clicks, then the item collected and the debrief shown.

## ON AIR: the interface as a broadcast overlay

Two earlier restyles were set aside by the owner: a bright multi-colour "pop sticker" theme (the dark base with one pink accent is the identity to keep) and a tidier dark theme that still looked like the old boxes and cards. The brief then became: keep dark plus pink, otherwise start over.

The concept ties the UI to the subject. This is the portfolio of someone who builds video ad delivery, so the interface is treated as a broadcast overlay on the night plaza rather than as panels of buttons and cards.

- **Title card**: full-screen, left-aligned. The name is set large in Unbounded with the second line outlined in pink, a blinking ON AIR line, a small pink test-bar strip and a scrolling ticker. The start options are a text menu with a line that extends on hover or focus, not buttons.
- **Overlay**: viewfinder corner marks, a station bug (avatar, name, blinking dot), text-only menu and link triggers, and a numbered channel list for the menu.
- **Status**: collection count as a timecode-style numeral with a thirteen-bar signal meter (white for inspected, pink for collected), and a lower-third bar for the nearby exhibit.
- **Controls**: one large round 調べる key with a radar ping and two round satellites for dash and jump; a thin-ring joystick with a pink knob.
- **Exhibit**: a sheet docked to the right (a bottom sheet on phones) so the world stays visible. Each exhibit opens with a channel header: a large outlined number, the floating item, scan lines. Content is laid out as hairline rows, numbered facts, a year rail for the career stops, pull quotes for "いまにつながること" and hash-tag lists. There are no card boxes.
- **Puzzles**: a control-room block under a pink rule, numbered conditions with a check or cross at the right, one pink pill for the primary action and text actions for the rest. Solving sweeps a tilted pink CLEAR band across the sheet and the item arrives as a GET lower-third.
- **Inventory**: a channel wall. Collected items show their channel number and name; missing ones show NO SIGNAL.

`assets/css/world-theme.css` holds all of this, loaded after `avatar-world.css` and scoped to `.game-ready`. Body text uses Zen Kaku Gothic New inside the game; Unbounded is used for Latin display text and numerals. Small supporting changes: the start title marks its second line, a ticker element was added to the start dialog, the exhibit heading carries its number as `data-no`, the minimap canvas uses a flat black palette, and the CLEAR band is not inserted when motion is reduced. The 3D scene is unchanged.

Checked in headless Chromium at 1280×800 and 390×800: title card, overlay, menu, exhibit sheet, a puzzle in its initial, failed and solved states, and the inventory. Not checked on physical devices.

### The district, monitors and props

The 3D scene now follows the same concept; layout, collision footprints, coins and save data are unchanged.

- **Exhibit signs** are broadcast monitors on a slim stand. The screen shows the channel number as a large outline, the exhibit name, and a lower third that reports its state: STANDBY (not inspected), REC (inspected) or a full pink ON AIR bar (collected). A tally lamp on top lights when the exhibit is on air. The floating check mark was removed.
- **Collectibles** were remodelled as white studio props with one pink accent so they read on the black interface: staff pass, clipboard, phone, compass, chart panel, vision mixer, studio monitor, server rack, wrench, toolbox, book and radio. Each sits on a round stage with a ring light under a spot beam, which turns pink once the item is collected.
- **Buildings** are black studios with lit corner fins, a stage door, a roof dish and a marquee rail. The scene hangs neon zone names on the rails (PROFILE, CAREER, WORK, THINK, ARCHIVE, CONNECT) and an ON AIR gate over the entrance. The communication station has a transmission tower with signal arcs; the work studio carries a mast. Ground markers read CH and the exhibit number.

`harbor-models.js` stays DOM-free (geometry only) for the node tests; canvas-drawn faces and neon live in `explorer-scene.js` and are redrawn once the web fonts load and whenever the accent colour changes. Static architecture is still batched within the existing draw-call and triangle budgets (7 meshes, about 210k triangles).

Checked in headless Chromium at 1280×800: the entrance, the career street and the work district with collected and uncollected exhibits, and the item images in the inventory. Not checked on physical devices.

### Coins worth collecting

The coin was a pink ring worth one, every exhibit cost a flat three, and the balance was a small figure under the signal meter. The economy and its presentation were rebuilt.

- **Three denominations.** 128 coins worth 1, 5 or 10 (364 in total). IDs 0–100 keep their original positions; 27 new coins (101–127) are scattered off the roads: beside each studio, along the runway behind the start, around and on top of the transmission tower, on the bridge, in the air over the main crossing and along the far edge. Jumping always pays at least 5. A 10 stands in a thin column of light and is marked on the radar until collected.
- **Minted coins.** Each coin is a disc with a milled rim and a struck face on both sides: a play mark on the 1, the numeral on the 5 and 10. The 10 is white with a pink numeral. They bob and spin; faces are redrawn with the accent colour.
- **Prices.** Each exhibit has its own price in `harbor-catalog.json` (`cost`): 5 for the profile, 15 for each career stop, 20 for work, tools, thinking and archive, 30 for the communication station; 230 in total. Road coins alone (117) are not enough, so some exploring is required, but about a third of the coins can be left behind. The three coins at the start are 1, 1 and 5, which pays for the first monitor and introduces the denominations.
- **Wallet.** The balance is a large numeral with a coin mark at the top left, always in view. Picking a coin up shows its value next to the wallet and above the avatar, larger for 5 and 10.
- **Locked monitors** show LOCKED and their price, so the cost is visible before walking up.
- **Opening a channel.** The offer shows the channel number, the item to be won (dimmed), the price, the balance and what will be left, with a meter. When the balance is short it says by how much and where larger coins are. Paying is a short ceremony: coins drop into the monitor, the numbers count down, the screen turns ON AIR, then the exhibit opens. With reduced motion the exhibit opens immediately.

Save compatibility: the transfer URL is now version 2 and uses the two previously unused bytes for a bonus balance; version 1 links still load. A save that opened exhibits at the old flat price keeps them and is credited the difference, so no existing balance goes down. `normalizeSave` still rejects a save that claims exhibits it could not have paid for.

Validation: `tests/explorer-save.mjs` covers coin values, total price and affordability, the starting coins, the legacy migration (applied once, preserved through the URL) and rejection of unpaid claims; `tests/svg-river.mjs` covers the new coin count, stable IDs, airborne values and that no ground coin sits in water. In headless Chromium at 1280×800 a new game was played from the start: the three starting coins were collected (balance 7), the first monitor was opened for 5 (balance 2) and its exhibit opened. The short-of-coins offer, a 10 with its light column, and the phone layout of the wallet and offer (390×800) were also checked. Not checked on physical devices.

### Overhead coins

Report after release: the 10 at the central crossing "does not disappear when taken". It was an airborne coin at height 2.4, which is inside the avatar's silhouette (about 2.85 tall), and it was only taken when the avatar's base was at least 0.95 up, so walking through it did nothing and a jump only counted near its peak. The pickup itself worked; the coin was placed and judged so that touching it looked like a failed pickup. The twelve river coins had the same flaw.

All fourteen airborne coins now float at 3.7, clear of a standing avatar's head. A coin is taken when it is anywhere between the avatar's feet and just above its head (`AVATAR_REACH`), so a jump collects it for most of its arc (over 60% at 30, 60 and 120 fps) instead of only at the top. Walking under one shows "頭上のコインは、ジャンプで取れます" in the lower third, at most once every five seconds. Coin IDs, values and horizontal positions are unchanged, so saves are unaffected.

Validation: `tests/svg-river.mjs` asserts that every airborne coin clears the head, is reported as overhead from the ground, is not reachable without jumping, and is within reach for most of a jump at each frame rate, and that ground coins are still taken by walking. In headless Chromium the avatar walked under the central 10 (not taken, hint shown), then jumped in place (taken, balance 14 → 24, coin gone).
