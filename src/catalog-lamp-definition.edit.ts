import { getCatalogLampConfig, type CatalogLampVariant } from './catalog-lamp-config'
import { catalogLampParametrics } from './catalog-lamp-parametrics'
import { resolveWallArmLightLayout, WALL_ARM_LIGHT_DIMENSIONS } from './wall-arm-light-geometry'
import { resolveWallPackLightLayout, WALL_PACK_LIGHT_DIMENSIONS } from './wall-pack-light-geometry'

type GenericContribution = Record<string, any>

const heightHandle = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  min: 0.08,
  currentValue: (node: any) => node.height,
  apply: (initial: any, height: number) => {
    const bounds = getCatalogLampConfig(initial.type)?.height ?? [0.1, 20, 4]
    return { height: Math.max(bounds[0], Math.min(bounds[1], height)) }
  },
  placement: { position: (node: any) => [0, node.height + 0.2, 0] },
}

const armHandle = {
  kind: 'linear-resize',
  axis: 'x',
  anchor: 'min',
  min: 0.15,
  currentValue: (node: any) => node.armLength,
  apply: (initial: any, armLength: number) => {
    const bounds = getCatalogLampConfig(initial.type)?.arm ?? [0.2, 3, 1]
    return { armLength: Math.max(bounds[0], Math.min(bounds[1], armLength)) }
  },
  placement: { position: (node: any) => [node.armLength + 0.35, node.height - 0.3, 0] },
}

const wallPackDepthHandle = {
  kind: 'linear-resize',
  axis: 'x',
  anchor: 'min',
  min: WALL_PACK_LIGHT_DIMENSIONS.minDepth,
  currentValue: (node: any) => resolveWallPackLightLayout(node.armLength).depth,
  apply: (initial: any, depth: number) => ({
    armLength: resolveWallPackLightLayout(depth).depth,
  }),
  placement: {
    position: (node: any) => [
      resolveWallPackLightLayout(node.armLength).depth + 0.14,
      0,
      0,
    ],
  },
}

const wallArmReachHandle = {
  ...armHandle,
  currentValue: (node: any) => resolveWallArmLightLayout(node.armLength).armLength,
  placement: {
    position: (node: any) => [
      resolveWallArmLightLayout(node.armLength).armLength + WALL_ARM_LIGHT_DIMENSIONS.headEndX,
      node.height + 0.05,
      0,
    ],
  },
}

const rotateHandle = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial: any, delta: number) => {
    const rotation = initial.rotation ?? [0, 0, 0]
    return { rotation: [rotation[0], rotation[1] - delta, rotation[2]] }
  },
  placement: { position: () => [0.35, 0.2, 0.35], rotationY: () => -Math.PI / 4 },
  decoration: { kind: 'ring', radius: () => 0.5, y: () => 0.2 },
}

export function makeCatalogLampEditContribution(variant: CatalogLampVariant): GenericContribution {
  const isWallHosted = variant.projection === 'wall-arm' || variant.projection === 'wall-pack'

  return {
    snapProfile: 'item',
    parametrics: catalogLampParametrics,
    handles: variant.projection === 'tunnel' || variant.projection === 'canopy'
      ? [armHandle, rotateHandle]
      : variant.projection === 'wall-pack'
        ? [wallPackDepthHandle]
        : variant.projection === 'wall-arm'
          ? [heightHandle, wallArmReachHandle]
          : [heightHandle, armHandle, rotateHandle],
    preview: () => import('./catalog-lamp-preview'),
    tool: () => import('./catalog-lamp-tool'),
    toolHints: [
      { key: 'Left click', label: `Place ${variant.label.toLowerCase()}` },
      ...(isWallHosted ? [] : [{ key: 'R', label: 'Rotate 45°' }]),
      { key: 'Esc', label: 'Stop' },
    ],
  }
}
