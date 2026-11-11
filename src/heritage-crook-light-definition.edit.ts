import type { HandleDescriptor, NodeDefinition } from '@pascal-app/core'
import { heritageCrookLightParametrics } from './heritage-crook-light-parametrics'
import type { HeritageCrookLightNode } from './schema'

const rotateHandle: HandleDescriptor<HeritageCrookLightNode> = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial, delta) => {
    const rotation = initial.rotation ?? [0, 0, 0]
    return { rotation: [rotation[0], rotation[1] - delta, rotation[2]] }
  },
  placement: {
    position: () => [0.43, 0.25, 0.43],
    rotationY: () => -Math.PI / 4,
  },
  decoration: { kind: 'ring', radius: () => 0.62, y: () => 0.25 },
}

const heightHandle: HandleDescriptor<HeritageCrookLightNode> = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  min: 0.5,
  currentValue: (node) => node.height,
  apply: (_initial, height) => ({ height: Math.max(0.5, Math.min(30, height)) }),
  placement: { position: (node) => [0, node.height + 0.25, 0] },
}

const armReachHandle: HandleDescriptor<HeritageCrookLightNode> = {
  kind: 'linear-resize',
  axis: 'x',
  anchor: 'min',
  min: 0.5,
  currentValue: (node) => node.armReach,
  apply: (_initial, armReach) => ({
    armReach: Math.max(0.5, Math.min(1.5, armReach)),
  }),
  placement: {
    position: (node) => [node.armReach + 0.22, node.height - 0.48, 0],
  },
}

export const heritageCrookLightEditContribution: Pick<
  NodeDefinition<typeof HeritageCrookLightNode>,
  'snapProfile' | 'parametrics' | 'handles' | 'preview' | 'tool' | 'toolHints'
> = {
  snapProfile: 'item',
  parametrics: heritageCrookLightParametrics,
  handles: [heightHandle, armReachHandle, rotateHandle],
  preview: () => import('./heritage-crook-light-preview'),
  tool: () => import('./heritage-crook-light-tool'),
  toolHints: [
    { key: 'Left click', label: "Place Bishop's Crook light" },
    { key: 'R', label: 'Rotate 45°' },
    { key: 'Esc', label: 'Stop' },
  ],
}
