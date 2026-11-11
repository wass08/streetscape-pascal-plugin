import type { NodeDefinition } from '@pascal-app/core'
import { StreetLightNode } from './schema'
import { buildStreetLightFloorplan } from './street-light-floorplan'

type StreetLightRenderDefinition = NodeDefinition<typeof StreetLightNode> & Record<string, unknown>

const BASE_RADIUS = 0.25

const streetLightFloorPlacement = {
  footprint: (node: unknown) => {
    const streetLight = node as StreetLightNode
    return {
      dimensions: [BASE_RADIUS * 2, streetLight.height, BASE_RADIUS * 2] as [
        number,
        number,
        number,
      ],
      rotation: streetLight.rotation,
    }
  },
  collides: false,
}

export const streetLightRenderDefinition: StreetLightRenderDefinition = {
  kind: 'streetscape:street-light',
  schemaVersion: 1,
  schema: StreetLightNode,
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
    poleColor: '#48535b',
    lightOn: false,
    lightColor: '#ffd9a3',
    intensity: 1200,
    roadAttachment: undefined,
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
    floorPlaced: streetLightFloorPlacement,
  },
  floorplan: buildStreetLightFloorplan,
  renderer: { kind: 'parametric', module: () => import('./street-light-renderer') },
  presentation: {
    label: 'Roadway Light',
    description: 'A swept-arm roadway pole with a low-profile full-cutoff LED luminaire.',
    icon: { kind: 'iconify', name: 'lucide:lightbulb' },
    paletteSection: 'furnish',
    hidden: true,
  },
  mcp: {
    description:
      'A swept-arm roadway light with an integrated spigot, die-cast service housing, multi-cell full-cutoff optic, adjustable finish, intensity, orientation, and on/off state.',
  },
}
