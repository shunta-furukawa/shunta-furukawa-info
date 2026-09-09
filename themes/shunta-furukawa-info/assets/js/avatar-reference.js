// Refined against the supplied front-view black-hoodie reference crop.
// Approximate proportions allow for its perspective and low image resolution.
// Normalize by the skull's cheek/temple width, not the outside of the hair.
export const REFERENCE_FACE=Object.freeze({
 width:1.07,
 eyeCenterX:.245,
 eyeCenterY:.010,
 eyeWidth:.255,
 eyeHeight:.210,
 irisOffset:.012,
 // NORMAL eye close-up: the dark iris meets the lids, leaving white crescents
 // at the corners. One small upper-left catchlight, without a lower white dot.
 irisRadiusX:.094,
 irisRadiusY:.114,
 pupilRadiusX:.070,
 pupilRadiusY:.090,
 catchlightRadiusX:.009,
 catchlightRadiusY:.010,
 headScale:.92,
 hairWidthScale:1.45,
 hairCrownScale:1.34,
 hairDepthScale:1.08,
 hairline:.10
});

// Raise the crown while keeping the tips of the fringe at the eye/brow line.
export function referenceHairY(y){const {hairline,hairCrownScale}=REFERENCE_FACE;return y<=hairline?y:hairline+(y-hairline)*hairCrownScale;}
