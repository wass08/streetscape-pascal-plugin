import type { NodeDefinition } from '@pascal-app/core'
import { buildCobraHeadLightFloorplan } from './cobra-head-light-floorplan'
import { resolveCobraHeadLightLayout } from './cobra-head-light-geometry'
import { CobraHeadLightNode } from './schema'

type CobraHeadLightRenderDefinition = NodeDefinition<typeof CobraHeadLightNode> &
  Record<string, unknown>

const cobraHeadLightFloorPlacement = {
  footprint: (node: unknown) => {
    const cobraHead = node as CobraHeadLightNode
    const layout = resolveCobraHeadLightLayout(cobraHead)
    return {
      dimensions: [
        layout.fixtureStartX + layout.fixtureLength,
        layout.height,
        layout.fixtureWidth,
      ] as [number, number, number],
      rotation: cobraHead.rotation,
    }
  },
  collides: false,
}

export const cobraHeadLightRenderDefinition: CobraHeadLightRenderDefinition = {
  kind: 'streetscape:cobra-head-light',
  schemaVersion: 1,
  schema: CobraHeadLightNode,
  category: 'furnish',
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    height: 6,
    armLength: 1.25,
    poleColor: '#363b40',
    lightOn: false,
    lightColor: '#ffd39a',
    intensity: 1400,
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
    floorPlaced: cobraHeadLightFloorPlacement,
  },
  floorplan: buildCobraHeadLightFloorplan,
  renderer: { kind: 'parametric', module: () => import('./cobra-head-light-renderer') },
  presentation: {
    label: 'Cobra-head',
    description: 'A classic roadway light with a swept mast arm and prismatic cobra-head optic.',
    icon: { kind: 'iconify', name: 'lucide:lightbulb' },
    paletteSection: 'furnish',
    hidden: true,
  },
  mcp: {
    description:
      'A classic swept-arm cobra-head roadway light with a die-cast housing, prismatic optic, and adjustable height, arm length, finish, lamp color, intensity, orientation, and on/off state.',
  },
}
