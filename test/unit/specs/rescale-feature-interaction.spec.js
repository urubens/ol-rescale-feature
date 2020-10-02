/* global describe, it, expect, sinon, beforeEach, afterEach */
import Map from 'ol/Map'
import View from 'ol/View'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Collection from 'ol/Collection'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import PointerEvent from 'ol/pointer/PointerEvent'
import MapBrowserPointerEvent from 'ol/MapBrowserPointerEvent'
import olEvent from 'ol/events/Event'
import RescaleFeatureInteraction from '../../../src'
import RescaleFeatureEvent from '../../../src/event'

Object.defineProperties(RescaleFeatureInteraction.prototype, /** @lends RescaleFeatureInteraction.prototype */{
  overlay: {
    get () {
      return this.overlay_
    }
  },
  anchorFeature: {
    get () {
      return this.anchorFeature_
    }
  },
  arrowFeature: {
    get () {
      return this.arrowFeature_
    }
  }
})

let map, features, width, height

width = height = 500

describe('rescale feature interaction', function () {
  beforeEach(done => {
    features = new Collection([
      new Feature(new Point([ 20, 20 ])),
      new Feature(new Point([ 0, 0 ]))
    ])
    map = new Map({
      target: createTargetElement(width, height),
      view: new View({
        center: [ 0, 0 ],
        zoom: 1,
        projection: 'EPSG:4326'
      }),
      layers: [
        new VectorLayer({
          source: new VectorSource({ features })
        })
      ]
    })

    map.once('postrender', () => done())
  })

  afterEach(() => {
    map.setTarget(undefined)
    map = features = undefined
  })

  /** @test RescaleFeatureInteraction */
  describe('constructor', () => {
    it('should throws on invalid options', () => {
      expect(() => new RescaleFeatureInteraction({
        features: 'wrong value'
      })).to.throw(Error, /features option should be an array or collection of features/i)
    })

    it('should initialize with empty collection', () => {
      const rescale = new RescaleFeatureInteraction()

      expect(rescale.features).to.be.instanceof(Collection)
      expect(rescale.features.getLength()).to.be.equal(0)
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.undefined
    })

    it('should initialize with features as array', () => {
      const features = [
        new Feature(new Point([ 10, 10 ])),
        new Feature(new Point([ 0, 0 ]))
      ]
      const rescale = new RescaleFeatureInteraction({ features })

      expect(rescale.features).to.be.instanceof(Collection)
      expect(rescale.features.getLength()).to.be.equal(2)
      expect(rescale.features.getArray().every((feature, i) => feature === features[ i ])).to.be.true
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.deep.equal([ 5, 5 ])
    })

    it('should initialize with features as collection', () => {
      const features = new Collection([
        new Feature(new Point([ -10, -10 ])),
        new Feature(new Point([ -5, -5 ]))
      ])
      const rescale = new RescaleFeatureInteraction({ features })

      expect(rescale.features).to.be.equal(features)
      expect(rescale.features.getLength()).to.be.equal(2)
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.deep.equal([ -7.5, -7.5 ])
    })

    it('should initialize with initial factor and anchor', () => {
      const factor = 2
      const anchor = [ 10, 10 ]
      const rescale = new RescaleFeatureInteraction({ factor, anchor })

      expect(rescale.factor).to.be.equal(factor)
      expect(rescale.anchor).to.be.deep.equal(anchor)
    })
  })

  /**
   * @test RescaleFeatureInteraction#setMap
   */
  describe('setMap', () => {
    describe('add to map', () => {
      it('should add internal features to map', done => {
        const rescale = new RescaleFeatureInteraction({ features })

        map.addInteraction(rescale)

        map.once('postrender', () => {
          let found = 0
          let internalFeatures = rescale.overlay.getSource().getFeatures()
          map.forEachFeatureAtPixel(map.getPixelFromCoordinate(rescale.anchor), feature => {
            if (internalFeatures.indexOf(feature) !== -1) {
              found++
            }
          })

          expect(found).to.be.equal(1)
          done()
        })
      })
    })

    describe('remove from map', () => {
      it('should remove internal features', done => {
        const rescale = new RescaleFeatureInteraction({ features })

        map.addInteraction(rescale)

        map.once('postrender', () => {
          map.removeInteraction(rescale)

          map.once('postrender', () => {
            let found = 0
            let internalFeatures = rescale.overlay.getSource().getFeatures()
            map.forEachFeatureAtPixel(map.getPixelFromCoordinate(rescale.anchor), feature => {
              if (internalFeatures.indexOf(feature) !== -1) {
                found++
              }
            })

            expect(found).to.be.equal(0)
            done()
          })
        })
      })
    })
  })

  /**
   * @test RescaleFeatureInteraction#setActive
   */
  describe('setActive', () => {
    describe('deactivate', () => {
      it('should remove internal features', done => {
        const rescale = new RescaleFeatureInteraction({ features })

        map.addInteraction(rescale)
        rescale.active = false

        map.once('postrender', () => {
          let found = 0
          let internalFeatures = rescale.overlay.getSource().getFeatures()
          map.forEachFeatureAtPixel(map.getPixelFromCoordinate(rescale.anchor), feature => {
            if (internalFeatures.indexOf(feature) !== -1) {
              found++
            }
          })

          expect(found).to.be.equal(0)
          done()
        })
      })
    })

    describe('reactivate', () => {
      it('should add internal features', done => {
        const rescale = new RescaleFeatureInteraction({ features })

        map.addInteraction(rescale)
        rescale.active = false

        map.once('postrender', () => {
          rescale.active = true

          map.once('postrender', () => {
            let found = 0
            let internalFeatures = rescale.overlay.getSource().getFeatures()
            map.forEachFeatureAtPixel(map.getPixelFromCoordinate(rescale.anchor), feature => {
              if (internalFeatures.indexOf(feature) !== -1) {
                found++
              }
            })

            expect(found).to.be.equal(1)
            done()
          })
        })
      })
    })
  })

  /**
   * @test RescaleFeatureInteraction#setFactor
   * @test RescaleFeatureInteraction#getFactor
   */
  describe('factor setter/getter', () => {
    it('should throw on invalid value', () => {
      expect(() => new RescaleFeatureInteraction({ factor: 'qwerty' })).to.throw(Error, /numeric value passed/i)

      const rescale = new RescaleFeatureInteraction()
      expect(() => { rescale.factor = 'qwerty' }).to.throw(Error, /numeric value passed/i)
    })

    it('should get/set through ES5 setter/getter', () => {
      const point = new Point([ 10, 10 ])
      sinon.spy(point, 'scale')

      const rescale = new RescaleFeatureInteraction({
        factor: 2,
        anchor: [ 0, 0 ],
        features: [ new Feature(point) ]
      })
      expect(rescale.factor).to.be.equal(2)
      expect(rescale.arrowFeature.get('factor')).to.be.equal(2)
      expect(point.getCoordinates()).to.be.deep.equal([ 10, 10 ])

      rescale.factor = 4
      expect(rescale.factor).to.be.equal(4)
      expect(rescale.arrowFeature.get('factor')).to.be.equal(4)
      expect(point.getCoordinates().map(x => parseFloat(x.toPrecision(6)))).to.be.deep.equal([ 20, 20 ])
      expect(point.scale).to.be.calledWith(2, 2, rescale.anchor)

      point.scale.restore()
    })
  })

  /**
   * @test RescaleFeatureInteraction#setAnchor
   * @test RescaleFeatureInteraction#getAnchor
   */
  describe('anchor setter/getter', () => {
    it('should throw on invalid value', () => {
      expect(() => new RescaleFeatureInteraction({ anchor: 'qwerty' })).to.throw(Error, /array of two elements passed/i)

      const rescale = new RescaleFeatureInteraction()
      expect(() => { rescale.anchor = 'qwerty' }).to.throw(Error, /array of two elements passed/i)
    })

    it('should get/set through ES5 setter/getter', () => {
      const rescale = new RescaleFeatureInteraction({
        anchor: [ 5, 10 ],
        features: [ new Feature(new Point([ 10, 10 ])) ]
      })
      expect(rescale.anchor).to.be.deep.equal([ 5, 10 ])
      expect(rescale.anchorFeature.getGeometry().getCoordinates()).to.be.deep.equal([ 5, 10 ])

      rescale.anchor = [ -5, 0 ]
      expect(rescale.anchor).to.be.deep.equal([ -5, 0 ])
      expect(rescale.anchorFeature.getGeometry().getCoordinates()).to.be.deep.equal([ -5, 0 ])
    })
  })

  describe('features collection listener', () => {
    it('should update anchor/factor/internal features on feature add', () => {
      const rescale = new RescaleFeatureInteraction()
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.undefined
      expect(rescale.arrowFeature).to.be.undefined
      expect(rescale.anchorFeature).to.be.undefined

      rescale.features.push(new Feature(new Point([ 10, 10 ])))
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.deep.equal([ 10, 10 ])
      expect(rescale.arrowFeature.get('factor')).to.be.equal(1)
      expect(rescale.anchorFeature.getGeometry().getCoordinates()).to.be.deep.equal([ 10, 10 ])

      rescale.factor = 2
      rescale.features.push(new Feature(new Point([ 5, 5 ])))
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.deep.equal([ 7.5, 7.5 ])
      expect(rescale.arrowFeature.get('factor')).to.be.equal(1)
      expect(rescale.anchorFeature.getGeometry().getCoordinates()).to.be.deep.equal([ 7.5, 7.5 ])
    })

    it('should update anchor/factor/internal features on feature remove', () => {
      const rescale = new RescaleFeatureInteraction({
        features: [
          new Feature(new Point([ 10, 10 ])),
          new Feature(new Point([ 5, 5 ]))
        ]
      })
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.deep.equal([ 7.5, 7.5 ])
      expect(rescale.arrowFeature.get('factor')).to.be.equal(1)
      expect(rescale.anchorFeature.getGeometry().getCoordinates()).to.be.deep.equal([ 7.5, 7.5 ])

      rescale.factor = 2
      rescale.features.pop()
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.deep.equal([ 10, 10 ])
      expect(rescale.arrowFeature.get('factor')).to.be.equal(1)
      expect(rescale.anchorFeature.getGeometry().getCoordinates()).to.be.deep.equal([ 10, 10 ])

      rescale.factor = 1
      rescale.features.pop()
      expect(rescale.factor).to.be.equal(1)
      expect(rescale.anchor).to.be.undefined
      expect(rescale.arrowFeature).to.be.undefined
      expect(rescale.anchorFeature).to.be.undefined
    })
  })

  describe('rescaling', () => {
    let rescale
    beforeEach(done => {
      rescale = new RescaleFeatureInteraction({ features })
      map.addInteraction(rescale)
      map.once('postrender', () => done())
    })
    afterEach(done => {
      map.removeInteraction(rescale)
      rescale = undefined
      map.once('postrender', () => done())
    })

    it('should rescale features from collection', () => {
      const listener = trackEvents(features.item(0).getGeometry(), rescale)

      expect(rescale.anchor).to.be.deep.equal([ 10, 10 ])
      expect(rescale.factor).to.be.equal(1)

      // simulate rescaling around [ 10, 10 ] anchor
      let startPixel = map.getPixelFromCoordinate(features.item(0).getGeometry().getCoordinates())
      let endPixel = map.getPixelFromCoordinate([ 0, 20 ])
      simulatePointerEvent('pointerdown', startPixel)
      simulatePointerEvent('pointerdrag', endPixel)
      simulatePointerEvent('pointerup', endPixel)

      expect(features.getArray().every(feature => (feature.getGeometry() instanceof Point))).to.be.true
      // const expectedCoords = [
      //   [ 0, 20 ],
      //   [ 20, 0 ]
      // ]
      // const errRes = features.getArray().every((feature, i) => coordSatisfyError(feature.getGeometry().getCoordinates(), expectedCoords[ i ]))
      // expect(errRes).to.be.true

      const calls = listener.getCalls()
      expect(calls).to.have.lengthOf(4)

      expect(calls[ 0 ].args[ 0 ]).to.be.an.instanceof(RescaleFeatureEvent)
      expect(calls[ 0 ].args[ 0 ].type).to.be.equal('rescalestart')
      expect(calls[ 0 ].args[ 0 ].factor).to.be.equal(1)
      expect(calls[ 0 ].args[ 0 ].anchor).to.be.deep.equal([ 10, 10 ])
      expect(calls[ 0 ].args[ 0 ].features).to.be.deep.equal(features)

      expect(calls[ 1 ].args[ 0 ]).to.be.an.instanceof(olEvent)
      expect(calls[ 1 ].args[ 0 ].type).to.be.equal('change')

      expect(calls[ 2 ].args[ 0 ]).to.be.an.instanceof(RescaleFeatureEvent)
      expect(calls[ 2 ].args[ 0 ].type).to.be.equal('rescaling')
      expect(satisfyError(calls[ 2 ].args[ 0 ].factor, 90 * Math.PI / 180)).to.be.true
      expect(calls[ 2 ].args[ 0 ].anchor).to.be.deep.equal([ 10, 10 ])
      expect(calls[ 2 ].args[ 0 ].features).to.be.deep.equal(features)

      expect(calls[ 3 ].args[ 0 ]).to.be.an.instanceof(RescaleFeatureEvent)
      expect(calls[ 3 ].args[ 0 ].type).to.be.equal('rescaleend')
      expect(satisfyError(calls[ 3 ].args[ 0 ].factor, 90 * Math.PI / 180)).to.be.true
      expect(calls[ 3 ].args[ 0 ].anchor).to.be.deep.equal([ 10, 10 ])
      expect(calls[ 3 ].args[ 0 ].features).to.be.deep.equal(features)
    })
  })

  // todo add test on anchor moving
  // todo add test on cursor changes
})

function createTargetElement (w, h) {
  let target = document.createElement('div')
  let style = target.style
  style.width = `${w}px`
  style.height = `${h}px`
  document.body.appendChild(target)

  return target
}

/**
 * Simulates a browser event on the map viewport.  The client x/y location
 * will be adjusted as if the map were centered at 0,0.
 *
 * @see https://github.com/openlayers/openlayers/blob/master/test/spec/ol/interaction/translate.test.js#L66
 *
 * @param {string} type Event type.
 * @param {number[]} pixelCoordinate Horizontal/vertical offset from bottom left corner.
 */
function simulatePointerEvent(type, [ x, y ]) {
  const viewport = map.getViewport()
  const position = viewport.getBoundingClientRect()
  const pointerEvt = new PointerEvent(type, {
    clientX: position.left + x,
    clientY: position.top + y,
    preventDefault () {}
  })
  pointerEvt.pointerType = 'mouse'
  const evt = new MapBrowserPointerEvent(type, map, pointerEvt)
  evt.originalEvent.button = 0

  map.handleMapBrowserEvent(evt)
}

/**
 * @param {ol.Feature} feature Translated feature.
 * @param {ol.interaction.Translate} interaction The interaction.
 * @return {Object} Listeners hash
 */
function trackEvents (geometry, interaction) {
  const spy = sinon.spy()

  geometry.on('change', spy)
  interaction.on('rescalestart', spy)
  interaction.on('rescaleend', spy)
  interaction.on('rescaling', spy)

  return spy
}

function coordSatisfyError (coord, expectedCoord, tolerance = 1e-6) {
  return satisfyError(coord[ 0 ], expectedCoord[ 0 ], tolerance) &&
         satisfyError(coord[ 1 ], expectedCoord[ 1 ], tolerance)
}

function satisfyError (val, expected, tolerance = 1e6) {
  return Math.abs(expected - val) < tolerance
}
