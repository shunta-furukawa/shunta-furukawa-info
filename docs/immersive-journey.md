# Immersive journey (second design iteration)

The homepage is a fullscreen, native-scroll-driven spatial experience rather than a stack of content sections. Five camera keyframes travel through floating media screens, a viewer's context, a travel encounter, an infrastructure topology and a final connection. Short captions remain in the viewport; work, philosophy, the deterministic matching demo and exploration are available in native dialog panels. The separate career and knowledge pages remain available. The technical skill descriptions are retained inside the work panel.

Generated artwork: three 1536×1024 original assets produced with the built-in image generation tool, inspected and encoded as WebP for same-origin delivery. Final project paths:
- themes/shunta-furukawa-info/static/images/journey/signal-city.webp
- themes/shunta-furukawa-info/static/images/journey/viewer-context.webp
- themes/shunta-furukawa-info/static/images/journey/meaningful-journey.webp
Exact prompts are recorded in journey-image-prompts.txt. Total image payload is approximately 532KB before HTTP compression. These are fictional visual metaphors, not actual audience images or private platform data.

One Three.js renderer draws the full-screen scene. Normal browser scroll offsets drive camera position and look direction; wheel and touch gestures are never intercepted. Chapter navigation and URL fragments allow direct access. A single render loop pauses when the tab is hidden or a dialog is open. Motion-off and OS reduced-motion use cinematic stills and instantaneous caption changes. The static images and HTML also work when WebGL or its module is unavailable; no-JS retains readable scene sections and a direct career link. Mobile uses a wider field of view, lower pixel ratio and fewer particles.

The inherited content evidence and distinction between completed work and future exploration remain those documented in portfolio-redesign.md. No conversion, revenue or production performance claims were added.

Validation: production Hugo build, local link/fragment/asset checks on home, career and knowledge routes, HTML dialog target checks, JavaScript bundling and diff whitespace checks. Browser rendering and device-specific interaction QA have not been performed in this change.
