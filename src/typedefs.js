/**
 * This file is part of ol-rescale-feature package.
 * @module ol-rescale-feature
 * @license MIT
 * @author Vladimir Vershinin
 */

/**
 * @typedef {Object} InteractionOptions
 * @property {ol.Collection<ol.Feature>} features The features the interaction works on. Required.
 * @property {ol.style.Style | Array<ol.style.Style> | ol.style.StyleFunction | undefined} style  Style of the overlay.
 * @property {number | undefined} factor Initial scaling factor,
 *                                       applied for features already added to collection. Default is `0`.
 * @property {number[] | ol.Coordinate | undefined} anchor Initial anchor coordinate. Default is center of features extent.
 * @property {function} condition
 * @property {boolean | undefined} allowAnchorMovement Allow UI manipulaiton of the Rescaling Anchor
 */
