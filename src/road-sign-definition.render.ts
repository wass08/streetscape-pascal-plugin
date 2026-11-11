import type { NodeDefinition } from '@pascal-app/core'
import { buildRoadSignFloorplan } from './road-sign-floorplan'
import { resolveRoadSignLayout } from './road-sign-geometry'
import { RoadSignNode } from './schema'

type RoadSignRenderDefinition = NodeDefinition<typeof RoadSignNode> & Record<string, unknown>

const roadSignFloorPlacement = {
  footprint: (node: unknown) => {
    const sign = node as RoadSignNode
    const layout = resolveRoadSignLayout(sign)
    return {
      dimensions: [layout.width, layout.postTopY, layout.plateThickness] as [number, number, number],
      rotation: sign.rotation,
    }
  },
  collides: false,
}

export const roadSignRenderDefinition: RoadSignRenderDefinition = {
  kind: 'streetscape:road-sign',
  schemaVersion: 1,
  schema: RoadSignNode,
  category: 'furnish',
  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    signId: 'stop',
    postHeight: 2.1,
    scale: 1,
    mounting: 'single-post',
    text: '',
    postColor: '#687177',
    backColor: '#747d83',
  }),
  capabilities: {
    movable: { axes: ['x', 'z'], gridSnap: true },
    rotatable: {
      axes: ['y'],
      snapAngles: Array.from({ length: 8 }, (_, index) => (index * Math.PI) / 4),
    },
    selectable: { hitVolume: 'bbox' },
    duplicable: true,
    deletable: true,
    groupable: true,
    snappable: {},
    floorPlaced: roadSignFloorPlacement,
  },
  floorplan: buildRoadSignFloorplan,
  renderer: { kind: 'parametric', module: () => import('./road-sign-renderer') },
  presentation: {
    label: 'Road sign',
    description: 'A reusable catalog-driven roadside sign with a procedural post and vector face graphic.',
    icon: { kind: 'iconify', name: 'lucide:signpost' },
    paletteSection: 'furnish',
    hidden: true,
  },
  mcp: {
    description:
      'A catalog-driven road sign with selectable sign type, scale, post height, single or double mounting, editable display text, colors, orientation, preview, and floorplan support.',
  },
}
