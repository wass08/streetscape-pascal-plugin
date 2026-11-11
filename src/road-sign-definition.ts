import { composeDefinition } from './definition-compose'
import { roadSignEditContribution } from './road-sign-definition.edit'
import { roadSignRenderDefinition } from './road-sign-definition.render'

export const roadSignDefinition = composeDefinition(roadSignRenderDefinition, roadSignEditContribution)
