import type { HandleDescriptor, NodeDefinition } from '@pascal-app/core'
import type { StreetLightNode } from './schema'
import { streetLightParametrics } from './street-light-parametrics'

const rotateHandle: HandleDescriptor<StreetLightNode> = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial, delta) => {
    const rotation = initial.rotation ?? [0, 0, 0]
    return { rotation: [rotation[0], rotation[1] - delta, rotation[2]] }
  },
  placement: {
    position: () => [0.42, 0.25, 0.42],
    rotationY: () => -Math.PI / 4,
  },
  decoration: { kind: 'ring', radius: () => 0.6, y: () => 0.25 },
}

const heightHandle: HandleDescriptor<StreetLightNode> = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  min: 0.5,
  currentValue: (node) => node.height,
  apply: (_initial, height) => ({ height: Math.max(0.5, Math.min(30, height)) }),
  placement: { position: (node) => [0, node.height + 0.25, 0] },
}

const armHandle: HandleDescriptor<StreetLightNode> = {
  kind: 'linear-resize',
  axis: 'x',
  anchor: 'min',
  min: 0.3,
  currentValue: (node) => node.armLength,
  apply: (_initial, armLength) => ({ armLength: Math.max(0.3, Math.min(3, armLength)) }),
  placement: { position: (node) => [node.armLength + 0.25, node.height, 0] },
}

export const streetLightEditContribution: Pick<
  NodeDefinition<typeof StreetLightNode>,
  'snapProfile' | 'parametrics' | 'handles' | 'preview' | 'tool' | 'toolHints'
> = {
  snapProfile: 'item',
  parametrics: streetLightParametrics,
  handles: [heightHandle, armHandle, rotateHandle],
  preview: () => import('./street-light-preview'),
  tool: () => import('./street-light-tool'),
  toolHints: [
    { key: 'Left click', label: 'Place roadway light' },
    { key: 'R', label: 'Rotate 45°' },
    { key: 'Esc', label: 'Stop' },
  ],
}
