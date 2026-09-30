# Urban_Heat_Island_Dar_es_Salaam
Assessment of UHI in Dar es Salaam, Tanzania
Dar es Salaam LST and Urban Heat Island Analysis

This repository contains the Google Earth Engine scripts, maps and selected results from my analysis of Land Surface Temperature (LST), Land Use/Land Cover (LULC) and Urban Heat Island (UHI) patterns in Dar es Salaam, Tanzania.

The main objective of the analysis is to understand how land use and land cover changes are related to the spatial distribution of land surface temperature and the development of urban heat islands.

The analysis combines Google Earth Engine (GEE) and ArcGIS Pro. GEE is mainly used for satellite image processing and calculation of LULC and LST, while ArcGIS Pro is used for some of the spatial analysis, map production and visualization.

Data and tools

The main datasets and tools used in the analysis include:

Landsat 8 satellite imagery for LST calculation
Landsat imagery for the analysis of LST variations over time
Google Earth Engine for satellite image processing
ArcGIS Pro for spatial analysis and map production
Google Drive for exporting processed raster layers

The study area is Dar es Salaam, Tanzania. The administrative boundaries used in Google Earth Engine are stored in my GEE Assets as Dar_Es_Salaam_Wards.

1. Land Surface Temperature calculation

LST was derived from the thermal infrared band of Landsat imagery. Instead of using the ready-made Landsat surface temperature product, the LST was calculated from the thermal band using the radiance, brightness temperature, vegetation fraction and emissivity approach.

The main steps were:

Convert the thermal band Digital Numbers (DN) to TOA spectral radiance.
Calculate at-satellite brightness temperature.
Calculate NDVI.
Calculate fractional vegetation cover.
Calculate land surface emissivity.
Calculate LST.
Convert LST from Kelvin to Celsius.
1.1 TOA spectral radiance

The Digital Numbers from the thermal band were first converted to spectral radiance:

$$ L_\lambda = M_L \times Q_{cal} + A_L $$

where:

$L_\lambda$ = TOA spectral radiance
$M_L$ = band-specific multiplicative rescaling factor
$A_L$ = band-specific additive rescaling factor
$Q_{cal}$ = calibrated digital number (DN)

The radiometric rescaling factors were retrieved from the Landsat image metadata.

1.2 Brightness temperature

The spectral radiance was then converted to at-satellite brightness temperature:

$$ T_B = \frac{K_2}{\ln\left(\frac{K_1}{L_\lambda}+1\right)} $$

where $K_1$ and $K_2$ are the thermal calibration constants provided in the Landsat metadata.

1.3 NDVI

NDVI was calculated using the red and near-infrared bands:

$$ NDVI = \frac{\rho_{NIR}-\rho_{RED}} {\rho_{NIR}+\rho_{RED}} $$

where $\rho_{NIR}$ and $\rho_{RED}$ are the spectral reflectance values in the near-infrared and red bands.

1.4 Fractional vegetation cover

Fractional vegetation cover was calculated from the normalized NDVI:

$$ F_v = \left( \frac{NDVI-NDVI_{min}} {NDVI_{max}-NDVI_{min}} \right)^2 $$

This was then used to estimate land surface emissivity.

1.5 Land surface emissivity

Land surface emissivity was calculated as:

$$ \varepsilon = 0.004F_v + 0.986 $$

where $\varepsilon$ is land surface emissivity and $F_v$ is fractional vegetation cover.

1.6 Land Surface Temperature

The final LST was calculated by correcting brightness temperature using surface emissivity:

$$ LST = \frac{T_B} {1+ \left( \frac{\lambda T_B}{\rho} \right) \ln(\varepsilon)} $$

where:

$T_B$ = brightness temperature
$\lambda$ = central wavelength of the thermal band
$\varepsilon$ = land surface emissivity
$\rho$ = $1.438\times10^{-2}$ m K

The resulting temperature was converted from Kelvin to Celsius by subtracting 273.15.

2. Temporal analysis of LST

To examine the temporal variation of land surface temperature, Landsat scenes available during the selected periods were processed and an average LST was calculated for each study year.

The analysis focuses on 2005, 2015 and 2025 in order to examine changes in the thermal environment of Dar es Salaam over time.

The averaging of available scenes helps reduce the influence of individual image acquisition conditions and the temporal variability of the urban environment.

3. Urban Heat Island analysis

The Urban Thermal Field Variance Index (UTFVI) was used to characterize the spatial variation of the urban heat island effect.

UTFVI was calculated using:

$$ UTFVI = \frac{LST-LST_{mean}} {LST} $$

where:

$LST$ = LST of each pixel
$LST_{mean}$ = mean LST of the study area

The resulting UTFVI values were classified into six categories:

UTFVI	UHI effect
< 0	None
0 – 0.005	Weak
0.005 – 0.010	Moderate
0.010 – 0.015	Strong
0.015 – 0.020	Stronger
> 0.020	Strongest

These thresholds are commonly used in UTFVI-based assessments of surface urban heat island conditions.

The UTFVI maps were then used to visualize the spatial distribution of different levels of urban thermal conditions across Dar es Salaam.
