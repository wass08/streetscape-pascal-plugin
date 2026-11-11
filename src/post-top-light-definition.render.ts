import type { NodeDefinition } from '@pascal-app/core'
import { buildPostTopLightFloorplan } from './post-top-light-floorplan'
import { resolvePostTopLightLayout } from './post-top-light-geometry'
import { PedestrianPostLightNode } from './schema'

type PostTopLightRenderDefinition = NodeDefinition<typeof PedestrianPostLightNode> &
  Record<string, unknown>

const postTopLightFloorPlacement = {
  footprint: (node: unknown) => {
    const postTopLight = node as PedestrianPostLightNode
    const layout = resolvePostTopLightLayout(postTopLight)
    return {
      dimensions: [layout.headRadius * 2, layout.height, layout.headRadius * 2] as [
        number,
        number,
        number,
      ],
      rotation: postTopLight.rotation,
    }
  },
  collides: false,
}

export const postTopLightRenderDefinition: PostTopLightRenderDefinition = {
  kind: 'streetscape:pedestrian-post-light',
  schemaVersion: 1,
  schema: PedestrianPostLightNode,
  category: 'furnish',
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    height: 6,
    poleColor: '#30343b',
    lightOn: false,
    lightColor: '#ffd9a3',
    intensity: 650,
  }),
  capabilities: {
    movable: { axes: ['x', 'z'], gridSnap: true },
    rotatable: {
      axes: ['y'],
      snapAngles: Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4),
    },
    selectable: { hitVolume: 'bbox' },
    duplicable: true,
    deletable: true,
    groupable: true,
    snappable: {},
    floorPlaced: postTopLightFloorPlacement,
  },
  floorplan: buildPostTopLightFloorplan,
  renderer: { kind: 'parametric', module: () => import('./post-top-light-renderer') },
  presentation: {
    label: 'Pedestrian Post-top',
    description: 'A modern pedestrian-scale post-top lamp with symmetric downward light.',
    icon: { kind: 'iconify', name: 'lucide:lamp-ceiling' },
    paletteSection: 'furnish',
    hidden: true,
  },
  mcp: {
    description:
      'A modern pedestrian-scale post-top lamp with adjustable height, pole color, lamp color, intensity, position, and on/off state.',
  },
}
