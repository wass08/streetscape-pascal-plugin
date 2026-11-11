import { composeDefinition } from './definition-compose'
import { streetLightEditContribution } from './street-light-definition.edit'
import { streetLightRenderDefinition } from './street-light-definition.render'

export const streetLightDefinition = composeDefinition(streetLightRenderDefinition, streetLightEditContribution)
