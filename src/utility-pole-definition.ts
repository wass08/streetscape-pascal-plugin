import { composeDefinition } from './definition-compose'
import { utilityPoleEditContribution } from './utility-pole-definition.edit'
import { utilityPoleRenderDefinition } from './utility-pole-definition.render'

export const utilityPoleDefinition = composeDefinition(utilityPoleRenderDefinition, utilityPoleEditContribution)
