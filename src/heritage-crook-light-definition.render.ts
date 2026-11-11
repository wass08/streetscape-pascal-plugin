import type { NodeDefinition } from '@pascal-app/core'
import { buildHeritageCrookLightFloorplan } from './heritage-crook-light-floorplan'
import { resolveHeritageCrookLightLayout } from './heritage-crook-light-geometry'
import { HeritageCrookLightNode } from './schema'

type HeritageCrookLightRenderDefinition = NodeDefinition<typeof HeritageCrookLightNode> &
  Record<string, unknown>

const heritageCrookLightFloorPlacement = {
  footprint: (node: unknown) => {
    const crookLight = node as HeritageCrookLightNode
    const layout = resolveHeritageCrookLightLayout(crookLight)
    return {
      dimensions: [
        layout.armReach + layout.lensRadius * 2,
        layout.height,
        layout.baseRadius * 2,
      ] as [number, number, number],
      rotation: crookLight.rotation,
    }
  },
  collides: false,
}

export const heritageCrookLightRenderDefinition: HeritageCrookLightRenderDefinition = {
  kind: 'streetscape:heritage-crook-light',
  schemaVersion: 1,
  schema: HeritageCrookLightNode,
  category: 'furnish',
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    height: 6,
    armReach: 0.9,
    poleColor: '#24272b',
    lightOn: false,
    lightColor: '#ffd5a0',
    intensity: 750,
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
    floorPlaced: heritageCrookLightFloorPlacement,
  },
  floorplan: buildHeritageCrookLightFloorplan,
  renderer: {
    kind: 'parametric',
    module: () => import('./heritage-crook-light-renderer'),
  },
  presentation: {
    label: "Bishop's Crook",
    description: 'A heritage curved pole with a pendant teardrop lamp.',
    icon: { kind: 'iconify', name: 'lucide:lamp-wall-up' },
    paletteSection: 'furnish',
    hidden: true,
  },
  mcp: {
    description:
      "A heritage Bishop's Crook street lamp with adjustable height, arm reach, pole color, lamp color, intensity, orientation, and on/off state.",
  },
}
