[![Build Status](https://travis-ci.org/ghettovoice/ol-rotate-feature.svg?branch=master)](https://travis-ci.org/ghettovoice/ol-rotate-feature)
[![Coverage Status](https://coveralls.io/repos/github/ghettovoice/ol-rotate-feature/badge.svg?branch=master)](https://coveralls.io/github/ghettovoice/ol-rotate-feature?branch=master)
[![GitHub tag](https://img.shields.io/github/tag/ghettovoice/ol-rotate-feature.svg)](https://github.com/ghettovoice/ol-rotate-feature/releases)
[![view on npm](http://img.shields.io/npm/v/ol-rotate-feature.svg)](https://www.npmjs.org/package/ol-rotate-feature)
[![License](https://img.shields.io/github/license/ghettovoice/ol-rotate-feature.svg)](https://github.com/ghettovoice/ol-rotate-feature/blob/master/LICENSE)

# Rescale feature interaction for OpenLayers

Plugin adds interaction that allows to rescale vector features around some anchor.

**NOTE**: `ol-rescale-feature` version **12.x** supports `ol` **v5.x**. 

## Installation

Install it thought NPM (**recommended**):

```shell
# ES6 version for bundling with Webpack, Rollup or etc.
npm install ol ol-rescale-feature

# to use UMD version 'openlayers' package should be installed (not recommended)
npm install openlayers
```

Or add from CDN:

```html
<script src="https://unpkg.com/openlayers@latest/dist/ol.js"></script>
<script src="https://unpkg.com/ol-rescale-feature@latest/dist/bundle.min.js"></script>
```

### Note
**Plugin is available in 2 versions: as UMD module and as ES2015 module:**
- **RECOMMENDED: ES2015 version (`dist/bundle.es.js`) should be used with [ol](https://www.npmjs.com/package/ol) package (you should
  install it manually).**
- **UMD version (`dist/bundle[.min].js`) should be used with [openlayers](https://www.npmjs.com/package/openlayers) package.
  You can install `ol` package as dev dependency to suppress NPM warning about required peer dependencies.**

## Usage

Plugin may be used as **ES2015** module and **`ol` v5.x** (**recommended**):

```js
import Map from 'ol/Map'
...
import RescaleFeatureInteraction from 'ol-rescale-feature'
```

Use **UMD** bundle with deprecated **`openlayers` v4.x** package (**not recommended but supported**)

```js
const ol = require('openlayers')
...
const RescaleFeatureInteraction = require('ol-rescale-feature')
```

In Browser environment you should add **script** tag pointing to **UMD** module after OpenLayers js files.
```html
<script src="https://unpkg.com/openlayers@latest/dist/ol.js"></script>
<script src="https://unpkg.com/ol-rescale-feature@latest/dist/bundle.min.js"></script>
<script>
  // plugin exports global variable RescaleFeatureInteraction
  // in addition it also exported to `ol.interaction.RescaleFeature` field (for backward compatibility).
</script>
```

### Options

| Option    | Type                                                                                               | Description                                                                                                                                                                                 |
| :-------- | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| features  | _ol.Collection<ol.Feature>_                                                                        | The features the interaction works on. **Required**.                                                                                                                                        |
| style     | _ol.style.Style &#124; Array&lt;ol.style.Style&gt; &#124; ol.style.StyleFunction &#124; undefined_ | Style of the overlay with interaction helper features.                                                                                                                                      |
| factor    | _number &#124; undefined_                                                                          | Initial scaling factor, applied for features already added to collection. Default is `1`.                                                                                                   |
| anchor    | _number[] &#124; ol.Coordinate &#124; undefined_                                                   | Initial anchor coordinate. Default is center of features extent.                                                                                                                            |
| condition | _module:ol/events/condition~Condition_                                                             | A function that takes an `module:ol/MapBrowserEvent~MapBrowserEvent` and returns a boolean to indicate whether that event should be handled. Default is `module:ol/events/condition~always` |

### Methods

```js
// Set current scaling factor of interaction features.
RescaleFeatureInteraction.prototype.setFactor(factor : number)
```

```js
// Returns current scaling factor of interaction features.
RescaleFeatureInteraction.prototype.getFactor() : number
```

```js
// Set current anchor position.
RescaleFeatureInteraction.prototype.setAnchor(anchor? : number[] | ol.Coordinate)
```

```js
// Returns current anchor position.
RescaleFeatureInteraction.prototype.getAnchor() : number[] | ol.Coordinate | undefined 
```

### Events

All events triggered by the interaction are instances of `RescaleFeatureEvent`.

##### Members

- **features**    _ol.Collection_     The features being rescaled.
- **factor**      _number_            Current scaling factor.
- **anchor**      _ol.Coordinate_     Current anchor position.

| Event       | Arguments            | Description                          |
| :---------- | :------------------- | :----------------------------------- |
| rescalestart | _RescaleFeatureEvent_ | Triggered upon feature rescale start. |
| rescaling    | _RescaleFeatureEvent_ | Triggered upon feature rescaling.     |
| rescaleend   | _RescaleFeatureEvent_ | Triggered upon feature rescaling end. |

### Example usage:

```js
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSMSource from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import Polygon from 'ol/geom/Polygon'
import Select from 'ol/interaction/Select'
import RescaleFeatureInteraction from 'ol-rescale-feature'

const point = new Feature({
  name: 'point',
  geometry: new Point([ 2384267.0573564973, 7557371.884852641 ])
})
const line = new Feature({
  name: 'line',
  geometry: new LineString([ [ -603697.2100018249, -239432.60826165066 ], [ 4190433.20404443, 2930563.8287811787 ] ])
})
const polygon = new Feature({
  name: 'polygon',
  geometry: new Polygon([ [
    [ -14482348.171434438, 6661491.741627443 ],
    [ -9541458.663080638, 6221214.458704827 ],
    [ -11473786.738129886, 3300708.4819848104 ],
    [ -14482348.171434438, 6661491.741627443 ]
  ] ])
})

const map = new Map({
  view: new View({
    center: [ 0, 0 ],
    zoom: 2
  }),
  layers: [
    new TileLayer({
      source: new OSMSource()
    }),
    new VectorLayer({
      source: new VectorSource({
        projection: 'EPSG:33857',
        features: [ point, line, polygon ]
      })
    })
  ],
  target: 'map',
  projection: 'EPSG:3857'
})

const select = new Select()
select.getFeatures().extend([ point, line, polygon ])

const rescale = new RescaleFeatureInteraction({
  features: select.getFeatures(),
  anchor: [ 0, 0 ],
  factor: -90 * Math.PI / 180
})

rescale.on('rescalestart', evt => console.log('rescale start', evt))
rescale.on('rescaling', evt => console.log('rescaling', evt))
rescale.on('rescaleend', evt => console.log('rescale end', evt))

map.addInteraction(select)
map.addInteraction(rescale)
```


Getting total scaling factor or last anchor coordinates after rescaling:

```js
rescale.on('rescaleend', evt => {
    // get total scaling factor in degrees
    console.log(evt.factor + ' is '+ (-1 * evt.factor * 180 / Math.PI ) + '°')
    // get last anchor coordinates
    console.log(evt.anchor)
})
```

## License

MIT (c) 2016-2018, Vladimir Vershinin
