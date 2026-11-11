import type { HandleDescriptor, NodeDefinition } from '@pascal-app/core'
import { resolveRoadSignLayout } from './road-sign-geometry'
import { roadSignParametrics } from './road-sign-parametrics'
import type { RoadSignNode } from './schema'

const rotateHandle: HandleDescriptor<RoadSignNode> = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial, delta) => {
    const rotation = initial.rotation ?? [0, 0, 0]
    return { rotation: [rotation[0], rotation[1] - delta, rotation[2]] }
  },
  placement: { position: () => [0.55, 0.65, 0.55], rotationY: () => -Math.PI / 4 },
  decoration: { kind: 'ring', radius: () => 0.5, y: () => 0.65 },
}

const postHeightHandle: HandleDescriptor<RoadSignNode> = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  min: 1.2,
  currentValue: (node) => node.postHeight,
  apply: (_initial, postHeight) => ({ postHeight: Math.max(1.2, Math.min(4.5, postHeight)) }),
  placement: {
    position: (node) => {
      const layout = resolveRoadSignLayout(node)
      return [0, layout.postTopY + 0.2, 0]
    },
  },
}

const scaleHandle: HandleDescriptor<RoadSignNode> = {
  kind: 'linear-resize',
  axis: 'x',
  anchor: 'center',
  min: 0.5,
  currentValue: (node) => node.scale,
  apply: (_initial, scale) => ({ scale: Math.max(0.5, Math.min(2.5, scale)) }),
  placement: {
    position: (node) => {
      const layout = resolveRoadSignLayout(node)
      return [layout.width / 2 + 0.2, layout.signCenterY, 0]
    },
  },
}

export const roadSignEditContribution: Pick<
  NodeDefinition<typeof RoadSignNode>,
  'snapProfile' | 'parametrics' | 'handles' | 'preview' | 'tool' | 'toolHints'
> = {
  snapProfile: 'item',
  parametrics: roadSignParametrics,
  handles: [postHeightHandle, scaleHandle, rotateHandle],
  preview: () => import('./road-sign-preview'),
  tool: () => import('./road-sign-tool'),
  toolHints: [
    { key: 'Left click', label: 'Place road sign' },
    { key: 'R', label: 'Rotate 45°' },
    { key: 'Esc', label: 'Stop' },
  ],
}
