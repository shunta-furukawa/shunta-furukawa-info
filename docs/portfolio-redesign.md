# Portfolio: meaningful encounters

## Direction

Dark surfaces and pink (#ff3b8d) remain the visual identity. The homepage introduces advertising as communication sensitive to context and repetition, with a Three.js flow from many possible requests to one connection. Readable content is always normal HTML; the 3D scene is supplementary.

The primary journey is now homepage → interactive selection → engineering strengths → selected work → career/contact. Zenn is retained as an optional social/archive destination. No publishing schedule or upcoming series is promised.

## Evidence and scope

- Reliability: data/highlights/_2_loadtest.yaml and data/stories/_201811.yaml (load testing, capacity planning).
- Operational engineering: data/highlights/_3_modernization.yaml (IaC, CI/CD, prevention of recurring incidents).
- Cross-functional delivery: data/highlights/_1_liveevent.yaml and data/stories/_201811.yaml (business requirements, APIs, authorization, reporting).
- User experience and marketing: data/stories/_200912.yaml and _201510.yaml.
- Matching, optimization and generative AI are explicitly described as exploration, not measured production accomplishments. No performance, revenue, availability or conversion figures have been invented.
- The current employer is identified as ABEMA on the homepage based on the owner's explicit description. No proprietary architecture or operational data is used.

## Interactive model

Three fictional contexts each contain three ordered candidates. With frequency limiting enabled, candidates already shown three or more times are excluded. With limiting disabled, the first candidate is selected even if it has appeared four times. Changes do not simulate new impressions: these are alternative decisions against the same fixed history. There is no personal profiling, network request, actual ad serving or AI inference.

## Rendering

Three.js 0.180.0 is vendored from its published npm package. Original MIT license is in assets/js/vendor/THREE-LICENSE.txt. Hugo bundles and fingerprints the scene with js.Build; visitors load it from the same origin, only on the homepage and after the initial HTML. There is no runtime CDN requirement or extra CI installation step.

The scene limits device pixel ratio to 1.5 and uses fewer particles on mobile. The render loop pauses offscreen and in hidden tabs. Visitors may pause motion; reduced-motion starts with a static SVG diagram without downloading Three.js. Static content remains usable on module/network/WebGL failures. WebGL context loss shows the fallback.

## Validation and review

Build using Hugo extended. Inspect homepage, /story/ and /knowledge/rtb-auction/ before production rollout; check desktop/mobile layout, context buttons, frequency toggle, reduced-motion and WebGL fallback. The existing master-push workflow deploys to the gh-pages branch in shunta-furukawa/shunta-furukawa.github.io, so this proposal belongs on a review branch until approved.
