/**
 * This file is part of ol-rescale-feature package.
 * @module ol-rescale-feature
 * @license MIT
 * @author Vladimir Vershinin
 */
/**
 * @enum {string}
 */
export const RescaleFeatureEventType = {
  /**
   * Triggered upon feature rescale start.
   * @event RescaleFeatureEvent#rescalestart
   */
  START: 'rescalestart',
  /**
   * Triggered upon feature rescaling.
   * @event RescaleFeatureEvent#rescaling
   */
  RESCALING: 'rescaling',
  /**
   * Triggered upon feature rescaling end.
   * @event RescaleFeatureEvent#rescaleend
   */
  END: 'rescaleend'
}

/**
 * Events emitted by RescaleFeatureInteraction instances are instances of this type.
 *
 * @class
 * @author Vladimir Vershinin
 */
export default class RescaleFeatureEvent {
  /**
   * @param {string} type Type.
   * @param {ol.Collection<ol.Feature>} features Rescaled features.
   * @param {number} angle Angle in radians.
   * @param {ol.Coordinate} anchor Anchor position.
   */
  constructor (type, features, angle, anchor) {
    /**
     * @type {boolean}
     * @private
     */
    this.propagationStopped_ = false

    /**
     * The event type.
     * @type {string}
     * @private
     */
    this.type_ = type

    /**
     * The features being rescaled.
     * @type {ol.Collection<ol.Feature>}
     * @private
     */
    this.features_ = features
    /**
     * Current angle in radians.
     * @type {number}
     * @private
     */
    this.angle_ = angle
    /**
     * Current rescaling anchor.
     * @type {ol.Coordinate}
     * @private
     */
    this.anchor_ = anchor
  }

  /**
   * @type {boolean}
   */
  get propagationStopped () {
    return this.propagationStopped_
  }

  /**
   * @type {RescaleFeatureEventType}
   */
  get type () {
    return this.type_
  }

  /**
   * @type {ol.Collection<ol.Feature>}
   */
  get features () {
    return this.features_
  }

  /**
   * @type {number}
   */
  get angle () {
    return this.angle_
  }

  /**
   * @type {ol.Coordinate}
   */
  get anchor () {
    return this.anchor_
  }

  /**
   * Prevent event propagation.
   */
  preventDefault () {
    this.propagationStopped_ = true
  }

  /**
   * Stop event propagation.
   */
  stopPropagation () {
    this.propagationStopped_ = true
  }
}
