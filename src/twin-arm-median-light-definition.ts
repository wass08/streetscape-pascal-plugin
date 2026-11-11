import { composeDefinition } from './definition-compose'
import { twinArmMedianLightEditContribution } from './twin-arm-median-light-definition.edit'
import { twinArmMedianLightRenderDefinition } from './twin-arm-median-light-definition.render'

export const twinArmMedianLightDefinition = composeDefinition(twinArmMedianLightRenderDefinition, twinArmMedianLightEditContribution)
