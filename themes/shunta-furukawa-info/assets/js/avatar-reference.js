// Front/normal views in the supplied character sheet (1122 × 1402).
// Measurements are approximate because the sheet mixes perspective and poses.
// Normalize by the skull's cheek/temple width, not the outside of the hair.
export const REFERENCE_FACE=Object.freeze({
 width:1.07,
 eyeCenterX:.2675,
 eyeCenterY:.015,
 eyeWidth:.30,
 eyeHeight:.24,
 irisOffset:.014,
 // NORMAL eye close-up: the dark iris meets the lids, leaving white crescents
 // at the corners. One small upper-left catchlight, without a lower white dot.
 irisRadiusX:.111,
 irisRadiusY:.130,
 pupilRadiusX:.082,
 pupilRadiusY:.103,
 catchlightRadiusX:.010,
 catchlightRadiusY:.012,
 headScale:.92,
 hairWidthScale:1.45,
 hairCrownScale:1.34,
 hairDepthScale:1.08,
 hairline:.10
});

// Raise the crown while keeping the tips of the fringe at the eye/brow line.
export function referenceHairY(y){const {hairline,hairCrownScale}=REFERENCE_FACE;return y<=hairline?y:hairline+(y-hairline)*hairCrownScale;}
