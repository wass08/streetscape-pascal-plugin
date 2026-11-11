import { composeDefinition } from './definition-compose'
import { trussRoadwayLightEditContribution } from './truss-roadway-light-definition.edit'
import { trussRoadwayLightRenderDefinition } from './truss-roadway-light-definition.render'

export const trussRoadwayLightDefinition = composeDefinition(trussRoadwayLightRenderDefinition, trussRoadwayLightEditContribution)
