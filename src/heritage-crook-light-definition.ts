import { composeDefinition } from './definition-compose'
import { heritageCrookLightEditContribution } from './heritage-crook-light-definition.edit'
import { heritageCrookLightRenderDefinition } from './heritage-crook-light-definition.render'

export const heritageCrookLightDefinition = composeDefinition(heritageCrookLightRenderDefinition, heritageCrookLightEditContribution)
