import { composeDefinition } from './definition-compose'
import { multiHeadAreaLightEditContribution } from './multi-head-area-light-definition.edit'
import { multiHeadAreaLightRenderDefinition } from './multi-head-area-light-definition.render'

export const multiHeadAreaLightDefinition = composeDefinition(multiHeadAreaLightRenderDefinition, multiHeadAreaLightEditContribution)
