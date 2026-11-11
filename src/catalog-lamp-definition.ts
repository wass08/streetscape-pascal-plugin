import { getCatalogLampConfig, type CatalogLampVariant } from './catalog-lamp-config'
import { makeCatalogLampEditContribution } from './catalog-lamp-definition.edit'
import { makeCatalogLampRenderDefinition } from './catalog-lamp-definition.render'
import { composeDefinition } from './definition-compose'

export function makeCatalogLampDefinition(variant: CatalogLampVariant) {
  return composeDefinition(
    makeCatalogLampRenderDefinition(variant),
    makeCatalogLampEditContribution(variant),
  )
}

export const highMastCrownLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:high-mast-crown-light')!)
export const shoeboxAreaLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:shoebox-area-light')!)
export const floodlightPoleDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:floodlight-pole')!)
export const traditionalPostTopLanternDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:traditional-post-top-lantern')!)
export const globePostTopLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:globe-post-top-light')!)
export const decorativeCandelabraLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:decorative-candelabra-light')!)
export const pathGardenLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:path-garden-light')!)
export const bollardLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:bollard-light')!)
export const catenaryStreetLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:catenary-street-light')!)
export const wallArmLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:wall-arm-light')!)
export const wallPackLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:wall-pack-light')!)
export const tunnelLuminaireDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:tunnel-luminaire')!)
export const canopySoffitLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:canopy-soffit-light')!)
export const solarStreetLightDefinition = makeCatalogLampDefinition(getCatalogLampConfig('streetscape:solar-street-light')!)
