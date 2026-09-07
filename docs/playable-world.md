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
