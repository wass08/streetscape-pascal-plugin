import type { NodeDefinition } from '@pascal-app/core'
import { buildMultiHeadAreaLightFloorplan } from './multi-head-area-light-floorplan'
import { resolveMultiHeadAreaLightLayout } from './multi-head-area-light-geometry'
import { MultiHeadAreaLightNode } from './schema'

type MultiHeadAreaLightRenderDefinition = NodeDefinition<typeof MultiHeadAreaLightNode> &
  Record<string, unknown>

const multiHeadAreaLightFloorPlacement = {
  footprint: (node: unknown) => {
    const areaLight = node as MultiHeadAreaLightNode
    const layout = resolveMultiHeadAreaLightLayout(areaLight)
    return {
      dimensions: [
        (layout.fixtureStartX + layout.fixtureLength) * 2,
        layout.height,
        (layout.fixtureStartX + layout.fixtureLength) * 2,
      ] as [number, number, number],
      rotation: areaLight.rotation,
    }
  },
  collides: false,
}

export const multiHeadAreaLightRenderDefinition: MultiHeadAreaLightRenderDefinition = {
  kind: 'streetscape:multi-head-area-light',
  schemaVersion: 1,
  schema: MultiHeadAreaLightNode,
  category: 'furnish',
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    height: 6,
    armLength: 1.2,
    headCount: 4,
    poleColor: '#363b40',
    lightOn: false,
    lightColor: '#ffd39a',
    intensity: 1200,
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
    floorPlaced: multiHeadAreaLightFloorPlacement,
  },
  floorplan: buildMultiHeadAreaLightFloorplan,
  renderer: { kind: 'parametric', module: () => import('./multi-head-area-light-renderer') },
  presentation: {
    label: 'Triple/four-way area pole',
    description: 'A radial three- or four-head pole for junctions and parking areas.',
    icon: { kind: 'iconify', name: 'lucide:lamp-ceiling' },
    paletteSection: 'furnish',
    hidden: true,
  },
  mcp: {
    description:
      'A three- or four-head radial roadway area pole with adjustable height, arm length, head count, colors, intensity, orientation, and on/off state.',
  },
}
