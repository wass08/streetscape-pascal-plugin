import type { NodeDefinition } from '@pascal-app/core'
import { buildTrussRoadwayLightFloorplan } from './truss-roadway-light-floorplan'
import { resolveTrussRoadwayLightLayout } from './truss-roadway-light-geometry'
import { TrussRoadwayLightNode } from './schema'

type TrussRoadwayLightRenderDefinition = NodeDefinition<typeof TrussRoadwayLightNode> &
  Record<string, unknown>

const trussRoadwayLightFloorPlacement = {
  footprint: (node: unknown) => {
    const trussLight = node as TrussRoadwayLightNode
    const layout = resolveTrussRoadwayLightLayout(trussLight)
    return {
      dimensions: [
        layout.fixtureStartX + layout.fixtureLength,
        layout.height,
        layout.fixtureWidth,
      ] as [number, number, number],
      rotation: trussLight.rotation,
    }
  },
  collides: false,
}

export const trussRoadwayLightRenderDefinition: TrussRoadwayLightRenderDefinition = {
  kind: 'streetscape:truss-roadway-light',
  schemaVersion: 1,
  schema: TrussRoadwayLightNode,
  category: 'furnish',
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    height: 6,
    armLength: 2,
    braceDepth: 0.75,
    poleColor: '#596166',
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
    floorPlaced: trussRoadwayLightFloorPlacement,
  },
  floorplan: buildTrussRoadwayLightFloorplan,
  renderer: { kind: 'parametric', module: () => import('./truss-roadway-light-renderer') },
  presentation: {
    label: 'Truss Roadway Light',
    description: 'A fitted pipe-truss roadway pole with a full-cutoff LED luminaire.',
    icon: { kind: 'iconify', name: 'lucide:construction' },
    paletteSection: 'furnish',
    hidden: true,
  },
  mcp: {
    description:
      'A fitted pipe-truss roadway light with separate pole brackets, rising upper arm, diagonal lower chord, vertical web, full-cutoff LED optics, and adjustable dimensions, finish, intensity, orientation, and on/off state.',
  },
}
