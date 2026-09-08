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
