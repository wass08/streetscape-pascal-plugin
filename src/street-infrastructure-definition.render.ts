import type { NodeDefinition } from '@pascal-app/core'
import type { StreetInfrastructureNode } from './street-infrastructure-config'
import {
  isResidentialRoadAssetKind,
  STREET_INFRASTRUCTURE_VARIANTS,
  type StreetInfrastructureVariant,
} from './street-infrastructure-config'
import { buildStreetInfrastructureFloorplan } from './street-infrastructure-floorplan'
import {
  resolveDrainageInletLayout,
  resolveFireHydrantLayout,
  resolveManholeCoverLayout,
  resolveTrafficSignalLayout,
  resolveTrafficBollardLayout,
  resolveRoadBarrierLayout,
  resolveResidentialRoadAssetLayout,
} from './street-infrastructure-geometry'

type GenericDefinition = NodeDefinition<any> & Record<string, unknown>

function footprint(input: unknown) {
  const node = input as StreetInfrastructureNode
  const kind = node.type as string
  if (isResidentialRoadAssetKind(kind)) {
    const layout = resolveResidentialRoadAssetLayout(node as never)
    return {
      dimensions: [layout.footprintWidth, layout.height, layout.footprintDepth] as [number, number, number],
      rotation: node.rotation,
    }
  }
  if (kind === 'streetscape:traffic-signal') {
    const layout = resolveTrafficSignalLayout(node as any)
    return {
      dimensions: [layout.footprintWidth, layout.supportHeight, layout.footprintDepth] as [number, number, number],
      rotation: node.rotation,
    }
  }
  if (kind === 'streetscape:drainage-inlet') {
    const layout = resolveDrainageInletLayout(node as any)
    const surfaceHalfLength = (layout.length + 0.16) / 2
    const surfaceHalfWidth = (layout.width + 0.16) / 2
    const curbHalfLength = layout.hasCurbOpening
      ? Math.abs(layout.curbOpeningOffsetX) + layout.curbOpeningLength / 2 + layout.curbDepth / 2
      : 0
    const curbHalfWidth = layout.hasCurbOpening ? layout.curbCenterZ + layout.curbDepth / 2 : 0
    return {
      dimensions: [
        2 * Math.max(surfaceHalfLength, curbHalfLength),
        Math.max(0.3, (node as any).curbHeight ?? 0),
        2 * Math.max(surfaceHalfWidth, curbHalfWidth),
      ] as [number, number, number],
      rotation: node.rotation,
    }
  }
  if (kind === 'streetscape:manhole-cover') {
    const layout = resolveManholeCoverLayout(node as any)
    return {
      dimensions: [layout.frameRadius * 2, 0.1, layout.frameRadius * 2] as [number, number, number],
      rotation: node.rotation,
    }
  }
  if (kind === 'streetscape:traffic-bollard') {
    const layout = resolveTrafficBollardLayout(node as any)
    return {
      dimensions: [layout.baseRadius * 2, layout.height, layout.baseRadius * 2] as [number, number, number],
      rotation: node.rotation,
    }
  }
  if (kind === 'streetscape:road-barrier') {
    const layout = resolveRoadBarrierLayout(node as any)
    return {
      dimensions: [layout.length, layout.height, layout.width] as [number, number, number],
      rotation: node.rotation,
    }
  }
  const layout = resolveFireHydrantLayout(node as any)
  return {
    dimensions: [layout.flangeRadius * 2, layout.height, layout.flangeRadius * 2] as [number, number, number],
    rotation: node.rotation,
  }
}

export function makeStreetInfrastructureRenderDefinition(
  variant: StreetInfrastructureVariant,
): GenericDefinition {
  return {
    kind: variant.kind,
    schemaVersion: 1,
    schema: variant.schema,
    category: 'furnish',
    defaults: () => {
      const parsed = variant.schema.parse({}) as Record<string, unknown>
      const { id: _id, ...defaults } = parsed
      return defaults
    },
    capabilities: {
      movable: { axes: ['x', 'y', 'z'], gridSnap: true },
      rotatable: {
        axes: ['y'],
        snapAngles: Array.from({ length: 8 }, (_, index) => (index * Math.PI) / 4),
      },
      selectable: { hitVolume: 'bbox' },
      duplicable: true,
      deletable: true,
      groupable: true,
      snappable: {},
      floorPlaced: { footprint, collides: false },
    },
    floorplan: buildStreetInfrastructureFloorplan,
    renderer: { kind: 'parametric', module: () => import('./street-infrastructure-renderer') },
    presentation: {
      label: variant.label,
      description: variant.description,
      icon: { kind: 'iconify', name: variant.icon },
      paletteSection: 'furnish',
      hidden: true,
    },
    mcp: { description: variant.description },
  }
}

const RENDER_DEFINITIONS = new Map(
  STREET_INFRASTRUCTURE_VARIANTS.map((variant) => [
    variant.kind,
    makeStreetInfrastructureRenderDefinition(variant),
  ]),
)

export const trafficSignalRenderDefinition = RENDER_DEFINITIONS.get('streetscape:traffic-signal')!
export const drainageInletRenderDefinition = RENDER_DEFINITIONS.get('streetscape:drainage-inlet')!
export const manholeCoverRenderDefinition = RENDER_DEFINITIONS.get('streetscape:manhole-cover')!
export const fireHydrantRenderDefinition = RENDER_DEFINITIONS.get('streetscape:fire-hydrant')!
export const trafficBollardRenderDefinition = RENDER_DEFINITIONS.get('streetscape:traffic-bollard')!
export const roadBarrierRenderDefinition = RENDER_DEFINITIONS.get('streetscape:road-barrier')!
export const drivewayRenderDefinition = RENDER_DEFINITIONS.get('streetscape:driveway')!
export const mailboxRenderDefinition = RENDER_DEFINITIONS.get('streetscape:mailbox')!
export const parcelBoxRenderDefinition = RENDER_DEFINITIONS.get('streetscape:parcel-box')!
export const trashBinRenderDefinition = RENDER_DEFINITIONS.get('streetscape:trash-bin')!
export const recyclingBinRenderDefinition = RENDER_DEFINITIONS.get('streetscape:recycling-bin')!
export const residentialGateRenderDefinition = RENDER_DEFINITIONS.get('streetscape:residential-gate')!
export const speedHumpRenderDefinition = RENDER_DEFINITIONS.get('streetscape:speed-hump')!
