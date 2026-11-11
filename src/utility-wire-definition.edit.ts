import type { NodeDefinition } from '@pascal-app/core'
import type { UtilityWireSpanNode } from './schema'

export const utilityWireEditContribution: Pick<
  NodeDefinition<typeof UtilityWireSpanNode>,
  'snapProfile'
> = {
  snapProfile: 'item',
}
