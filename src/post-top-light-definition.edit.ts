import type { HandleDescriptor, NodeDefinition } from '@pascal-app/core'
import { postTopLightParametrics } from './post-top-light-parametrics'
import type { PedestrianPostLightNode } from './schema'

const rotateHandle: HandleDescriptor<PedestrianPostLightNode> = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial, delta) => {
    const rotation = initial.rotation ?? [0, 0, 0]
    return { rotation: [rotation[0], rotation[1] - delta, rotation[2]] }
  },
  placement: {
    position: () => [0.4, 0.24, 0.4],
    rotationY: () => -Math.PI / 4,
  },
  decoration: { kind: 'ring', radius: () => 0.56, y: () => 0.24 },
}

const heightHandle: HandleDescriptor<PedestrianPostLightNode> = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  min: 0.5,
  currentValue: (node) => node.height,
  apply: (_initial, height) => ({ height: Math.max(0.5, Math.min(30, height)) }),
  placement: { position: (node) => [0, node.height + 0.24, 0] },
}

export const postTopLightEditContribution: Pick<
  NodeDefinition<typeof PedestrianPostLightNode>,
  'snapProfile' | 'parametrics' | 'handles' | 'preview' | 'tool' | 'toolHints'
> = {
  snapProfile: 'item',
  parametrics: postTopLightParametrics,
  handles: [heightHandle, rotateHandle],
  preview: () => import('./post-top-light-preview'),
  tool: () => import('./post-top-light-tool'),
  toolHints: [
    { key: 'Left click', label: 'Place pedestrian post-top light' },
    { key: 'R', label: 'Rotate 45°' },
    { key: 'Esc', label: 'Stop' },
  ],
}
