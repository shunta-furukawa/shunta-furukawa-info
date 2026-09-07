# Avatar world

## Intent
Preserve the spatial scroll transitions while restoring the supplied black/white/pink avatar identity. Flat unlit geometry replaces cinematic backdrops. Persistent navigation provides direct access without requiring game controls.

- Map: four selectable destinations, mirrored in the shared header.
- Think & try: contextual interest, timing and frequency form one philosophy/demo. Waiting is a valid result; relevance does not guarantee satisfaction or advertiser outcomes.
- History: five existing career records, a moving mascot, clickable stops and arrow keys. `/story/` opens this same experience at history.
- Studio: three existing achievement records paired with conceptual topology; a separate accessible tab exposes every skill description.
- Knowledge and remaining document routes: the same avatar header and flat palette.

All work and career claims come from existing Hugo data. Diagrams are explanatory, not internal architecture or performance measurements. AI and matching research remain future interests, not invented production achievements.

## Implementation
`avatar-world.js` handles native scroll, deep links, tabs and the explanation model independently of WebGL. `avatar-scene.js` lazily loads bundled Three.js and uses perspective camera travel, discrete face-colored materials and local sprites. No new remote runtime dependencies. Reduced motion preserves a rendered 3D view while stopping animation; navigation and state changes render immediately. A visible control pauses animation without replacing the scene with an image. All spatial choices have DOM equivalents. Without JavaScript, the full content stays in document order.

## Checks
Hugo production build; generated HTML asset/link checks; all 12 explanation-model combinations and unknown-input rejection. No browser or device visual verification performed in this revision.

## Assets
`images/world/avatar.png` is the user's supplied image, unchanged. The two WebP illustrations are generated from this avatar reference and encoded for the site. Exact prompts follow.

### mascot-walk.webp
Use case: illustration-story. Asset type: transparent website companion sprite. Input image 1 is the identity and graphic style reference. Create exactly one full-body chibi-ish adult mascot based on this avatar, gently walking facing right in three-quarter view. Preserve its recognizable black side-swept hair, friendly simple white face, black hoodie, black pants, white shoes. Flat filled silhouettes and very few contour strokes. Clean crisp black/white shapes, extremely simple details, no tonal modeling. The full figure is visible and centered with a little breathing room. Genuine transparent alpha background, no ground, no shadow. No text, lettering, border, badge, circle backdrop, gradients, glow, textures, realistic lighting, or 3D shading.

### conversation.webp
Use case: illustration-story. Asset type: landscape editorial website illustration. Input image 1 is an identity reference only: preserve the recognizable black side-swept hair, black hoodie and friendly simple white face. Create a very flat minimalist editorial illustration on a perfectly uniform solid #111116 background. The avatar adult on the left offers exactly one blank hot-pink #ff3b8d card to a different simple white/gray adult on the right, whose open hand reaches towards the card. Show friendly mutual non-romantic communication. Leave generous clear space between the two figures; their hands and the card bridge this space. Waist-up or three-quarter figures. Black hoodie on left, solid light gray clothing on right. Very simple large solid filled silhouettes, very few contour strokes, graphic paper-cut appearance, only black, white, neutral gray, hot pink #ff3b8d and background #111116. Color areas must be absolutely uniform with no highlights or tones. No gradients, lighting effects, glow, shadows, texture, dimension, words, lettering, UI, speech bubbles, extra cards, decoration, border or frame. Landscape composition.


## Spatial depth correction
The first revision made every face the same color, used orthographic projection and let the large illustration cover the scene. It also replaced 3D entirely when reduced motion was active. These choices did not meet the intended combination of flat graphic color and an immersive 3D world.

The correction uses perspective projection, discrete top/front/side colors (MeshBasicMaterial, no outlines, lighting gradients or glow), thick faceted islands, volumetric gateways, staggered server clusters and an ascending career path. Camera travel changes viewing angle and passes continuous bridges. Desktop drag can inspect depth. The supplied avatar remains in the header; the generated mascot is a small guide in the scene, and the conversation image becomes a supporting thumbnail.

The renderer has a dedicated responsive viewport beside the desktop content or above the mobile content. Reduced motion stops animation, not rendering, including when switching careers or demo states. Texture loading cannot block the 3D geometry. Native DOM choices remain available without WebGL.

Validation: production Hugo build and CPU projection checks for desktop/mobile map anchors. Browser visual/interaction testing remains unperformed.
