import type { NodeDefinition } from '@pascal-app/core'
import { buildTwinArmMedianLightFloorplan } from './twin-arm-median-light-floorplan'
import { resolveTwinArmMedianLightLayout } from './twin-arm-median-light-geometry'
import { TwinArmMedianLightNode } from './schema'

type TwinArmMedianLightRenderDefinition = NodeDefinition<typeof TwinArmMedianLightNode> &
  Record<string, unknown>

const twinArmMedianLightFloorPlacement = {
  footprint: (node: unknown) => {
    const twinArm = node as TwinArmMedianLightNode
    const layout = resolveTwinArmMedianLightLayout(twinArm)
    return {
      dimensions: [
        (layout.fixtureStartX + layout.fixtureLength) * 2,
        layout.height,
        layout.fixtureWidth,
      ] as [number, number, number],
      rotation: twinArm.rotation,
    }
  },
  collides: false,
}

export const twinArmMedianLightRenderDefinition: TwinArmMedianLightRenderDefinition = {
  kind: 'streetscape:twin-arm-median-light',
  schemaVersion: 1,
  schema: TwinArmMedianLightNode,
  category: 'furnish',
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    height: 6,
    armLength: 1.35,
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
    floorPlaced: twinArmMedianLightFloorPlacement,
  },
  floorplan: buildTwinArmMedianLightFloorplan,
  renderer: {
    kind: 'parametric',
    module: () => import('./twin-arm-median-light-renderer'),
  },
  presentation: {
    label: 'Twin-arm median',
    description: 'A balanced wishbone median pole with opposing full-cutoff LED heads.',
    icon: { kind: 'iconify', name: 'lucide:git-branch' },
    paletteSection: 'furnish',
    hidden: true,
  },
  mcp: {
    description:
      'A twin-arm median roadway light with a tapered mast, balanced wishbone crown, opposing full-cutoff LED heads, and adjustable height, arm length, finish, lamp color, intensity, orientation, and on/off state.',
  },
}
