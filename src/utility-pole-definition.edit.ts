import type { HandleDescriptor, NodeDefinition } from '@pascal-app/core'
import type { UtilityPoleNode } from './schema'
import { utilityPoleParametrics } from './utility-pole-parametrics'
import { STANDARD_UTILITY_POLE_CROSSARM_LENGTH_M } from './utility-pole-geometry'

const rotateHandle: HandleDescriptor<UtilityPoleNode> = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial, delta) => {
    const rotation = initial.rotation ?? [0, 0, 0]
    return { rotation: [rotation[0], rotation[1] - delta, rotation[2]] }
  },
  placement: {
    position: () => [0.48, 0.3, 0.48],
    rotationY: () => -Math.PI / 4,
  },
  decoration: { kind: 'ring', radius: () => 0.68, y: () => 0.3 },
}

const heightHandle: HandleDescriptor<UtilityPoleNode> = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  min: 7.62,
  currentValue: (node) => node.height,
  apply: (_initial, height) => ({ height: Math.max(7.62, Math.min(15.85, height)) }),
  placement: { position: (node) => [0, node.height + 0.6, 0] },
}

const crossarmHandle: HandleDescriptor<UtilityPoleNode> = {
  kind: 'linear-resize',
  axis: 'x',
  anchor: 'center',
  min: STANDARD_UTILITY_POLE_CROSSARM_LENGTH_M,
  currentValue: (node) => node.crossarmLength,
  apply: (_initial, crossarmLength) => ({
    crossarmLength: Math.max(
      STANDARD_UTILITY_POLE_CROSSARM_LENGTH_M,
      Math.min(3.66, crossarmLength),
    ),
  }),
  placement: {
    position: (node) => [node.crossarmLength / 2 + 0.25, node.height - 0.48, 0],
  },
}

export const utilityPoleEditContribution: Pick<
  NodeDefinition<typeof UtilityPoleNode>,
  'snapProfile' | 'parametrics' | 'handles' | 'preview' | 'tool' | 'toolHints'
> = {
  snapProfile: 'item',
  parametrics: utilityPoleParametrics,
  handles: [heightHandle, crossarmHandle, rotateHandle],
  preview: () => import('./utility-pole-preview'),
  tool: () => import('./utility-pole-tool'),
  toolHints: [
    { key: 'Left click', label: 'Place utility pole' },
    { key: 'R', label: 'Rotate 45°' },
    { key: 'Esc', label: 'Stop' },
  ],
}
