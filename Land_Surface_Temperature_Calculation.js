// 1. IMPORT AND LOAD THE IMAGE

var Dar_Es_Salaam = ee.FeatureCollection('projects/vital-reef-420708/assets/Dar_Es_Salaam_Wards');

Map.addLayer(Dar_Es_Salaam);
Map.centerObject(Dar_Es_Salaam, 10);

var image = ee.ImageCollection('LANDSAT/LC08/C02/T1')
      .filterBounds(Dar_Es_Salaam)
      .filterDate('2022-06-03', '2022-06-04')
      .mean()
      .clip(Dar_Es_Salaam)

print(image, 'Landsat 8 image 03 June 2022')

Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 7000, max: 25000}, 'Landsat 8 image')


// 2. CALCULATE NDVI

var red = image.select('B4')
var nir = image.select('B5')

// Convert DN to reflectance

var red_reflectance = red.multiply(0.0000275).add(-0.2)
var nir_reflectance = nir.multiply(0.0000275).add(-0.2)

var ndvi = nir_reflectance.subtract(red_reflectance)
          .divide(nir_reflectance.add(red_reflectance))
          .rename('NDVI')

Map.addLayer(ndvi, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'NDVI')

print(ndvi, 'NDVI')


// 3. CALCULATE FRACTIONAL VEGETATION COVER

var ndvi_min = ndvi.reduceRegion({
  reducer: ee.Reducer.min(),
  geometry: Dar_Es_Salaam,
  scale: 30,
  bestEffort: true
}).get('NDVI')

var ndvi_max = ndvi.reduceRegion({
  reducer: ee.Reducer.max(),
  geometry: Dar_Es_Salaam,
  scale: 30,
  bestEffort: true
}).get('NDVI')

print(ndvi_min, 'NDVI minimum')
print(ndvi_max, 'NDVI maximum')

var fv = ndvi.subtract(ee.Number(ndvi_min))
          .divide(ee.Number(ndvi_max).subtract(ee.Number(ndvi_min)))
          .pow(2)
          .rename('Fractional_Vegetation')

Map.addLayer(fv, {min: 0, max: 1}, 'Fractional Vegetation')

print(fv, 'Fractional Vegetation')


// 4. CALCULATE LAND SURFACE EMISSIVITY

var emissivity = fv.multiply(0.004)
                   .add(0.986)
                   .rename('Emissivity')

Map.addLayer(emissivity, {min: 0.986, max: 0.990}, 'Land Surface Emissivity')

print(emissivity, 'Land Surface Emissivity')


// 5. CALCULATE TOA SPECTRAL RADIANCE

var thermal = image.select('B10')

var radiance_mult = ee.Number(image.get('RADIANCE_MULT_BAND_10'))
var radiance_add = ee.Number(image.get('RADIANCE_ADD_BAND_10'))

var radiance = thermal.multiply(radiance_mult)
                  .add(radiance_add)
                  .rename('Radiance')

print(radiance, 'TOA Spectral Radiance')


// 6. CALCULATE BRIGHTNESS TEMPERATURE

var K1 = ee.Number(image.get('K1_CONSTANT_BAND_10'))
var K2 = ee.Number(image.get('K2_CONSTANT_BAND_10'))

var brightness_temperature = ee.Image.constant(K2).divide(
  ee.Image.constant(K1).divide(radiance).add(1).log()
).rename('Brightness_Temperature')

Map.addLayer(brightness_temperature, {
  min: 290,
  max: 330,
  palette: ['blue', 'cyan', 'yellow', 'orange', 'red']
}, 'Brightness Temperature')

print(brightness_temperature, 'Brightness Temperature')

// 7. CALCULATE LAND SURFACE TEMPERATURE

var wavelength = 10.895e-6
var rho = 1.438e-2

var lst = brightness_temperature.divide(
  ee.Image(1).add(
    ee.Image(wavelength)
      .multiply(brightness_temperature)
      .divide(rho)
      .multiply(emissivity.log())
  )
).rename('LST')

var LST_Celsius = lst.subtract(273.15).rename('LST_Celsius')

Map.addLayer(LST_Celsius, {
  min: 20,
  max: 40,
  palette: ['blue', 'cyan', 'green', 'yellow', 'orange', 'red']
}, 'Land Surface Temperature')

print(LST_Celsius, 'Land Surface Temperature Celsius')


// 8. CALCULATE LST STATISTICS

var lst_statistics = LST_Celsius.reduceRegion({
  reducer: ee.Reducer.minMax()
            .combine({
              reducer2: ee.Reducer.mean(),
              sharedInputs: true
            }),
  geometry: Dar_Es_Salaam,
  scale: 30,
  bestEffort: true
})

print(lst_statistics, 'LST statistics')


// 9. EXPORT LST TO GOOGLE DRIVE

Export.image.toDrive({
  image: LST_Celsius,
  description: 'LST_Dar_Es_Salaam_2022',
  fileNamePrefix: 'LST_Dar_Es_Salaam_2022',
  region: Dar_Es_Salaam,
  scale: 30,
  maxPixels: 1000000000000
})
