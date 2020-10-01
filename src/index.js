/**
 * This file is part of ol-rescale-feature package.
 * @module ol-rescale-feature
 * @license MIT
 * @author Vladimir Vershinin
 */
import RescaleFeatureInteraction from "./interaction"

// for backward compatibility
if (typeof window !== 'undefined' && window.ol) {
  window.ol.interaction.RescaleFeature = RescaleFeatureInteraction
}

export default RescaleFeatureInteraction
