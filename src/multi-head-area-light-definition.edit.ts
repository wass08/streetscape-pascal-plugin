import type { HandleDescriptor, NodeDefinition } from '@pascal-app/core'
import { multiHeadAreaLightParametrics } from './multi-head-area-light-parametrics'
import type { MultiHeadAreaLightNode } from './schema'

const rotateHandle: HandleDescriptor<MultiHeadAreaLightNode> = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial, delta) => {
    const rotation = initial.rotation ?? [0, 0, 0]
    return { rotation: [rotation[0], rotation[1] - delta, rotation[2]] }
  },
  placement: {
    position: () => [0.45, 0.25, 0.45],
    rotationY: () => -Math.PI / 4,
  },
  decoration: { kind: 'ring', radius: () => 0.66, y: () => 0.25 },
}

const heightHandle: HandleDescriptor<MultiHeadAreaLightNode> = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  min: 0.5,
  currentValue: (node) => node.height,
  apply: (_initial, height) => ({ height: Math.max(0.5, Math.min(30, height)) }),
  placement: { position: (node) => [0, node.height + 0.3, 0] },
}

const armLengthHandle: HandleDescriptor<MultiHeadAreaLightNode> = {
  kind: 'linear-resize',
  axis: 'x',
  anchor: 'min',
  min: 0.5,
  currentValue: (node) => node.armLength,
  apply: (_initial, armLength) => ({
    armLength: Math.max(0.5, Math.min(3, armLength)),
  }),
  placement: { position: (node) => [node.armLength + 0.7, node.height - 0.42, 0] },
}

export const multiHeadAreaLightEditContribution: Pick<
  NodeDefinition<typeof MultiHeadAreaLightNode>,
  'snapProfile' | 'parametrics' | 'handles' | 'preview' | 'tool' | 'toolHints'
> = {
  snapProfile: 'item',
  parametrics: multiHeadAreaLightParametrics,
  handles: [heightHandle, armLengthHandle, rotateHandle],
  preview: () => import('./multi-head-area-light-preview'),
  tool: () => import('./multi-head-area-light-tool'),
  toolHints: [
    { key: 'Left click', label: 'Place multi-head area pole' },
    { key: 'R', label: 'Rotate 45°' },
    { key: 'Esc', label: 'Stop' },
  ],
}
