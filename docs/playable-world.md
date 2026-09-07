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
