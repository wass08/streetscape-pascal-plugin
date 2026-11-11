import { composeDefinition } from './definition-compose'
import { cobraHeadLightEditContribution } from './cobra-head-light-definition.edit'
import { cobraHeadLightRenderDefinition } from './cobra-head-light-definition.render'

export const cobraHeadLightDefinition = composeDefinition(cobraHeadLightRenderDefinition, cobraHeadLightEditContribution)
