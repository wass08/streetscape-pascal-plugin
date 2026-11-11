import { composeDefinition } from './definition-compose'
import { utilityWireEditContribution } from './utility-wire-definition.edit'
import { utilityWireRenderDefinition } from './utility-wire-definition.render'

export const utilityWireDefinition = composeDefinition(
  utilityWireRenderDefinition,
  utilityWireEditContribution,
)
