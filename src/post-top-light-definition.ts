import { composeDefinition } from './definition-compose'
import { postTopLightEditContribution } from './post-top-light-definition.edit'
import { postTopLightRenderDefinition } from './post-top-light-definition.render'

export const postTopLightDefinition = composeDefinition(postTopLightRenderDefinition, postTopLightEditContribution)
