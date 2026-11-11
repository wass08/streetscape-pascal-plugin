import type { AnyNode, AnyNodeId, HandleDescriptor, NodeDefinition } from '@pascal-app/core'
import type { DrivewayNode, SpeedHumpNode } from './schema'
import type { StreetInfrastructureNode } from './street-infrastructure-config'
import {
  isResidentialRoadAssetKind,
  type StreetInfrastructureVariant,
} from './street-infrastructure-config'
import {
  buildDrivewayPlan,
  resolveDrainageInletLayout,
  resolveFireHydrantLayout,
  resolveManholeCoverLayout,
  resolveTrafficSignalLayout,
  resolveTrafficBollardLayout,
  resolveRoadBarrierLayout,
  resolveResidentialRoadAssetLayout,
} from './street-infrastructure-geometry'
import { getStreetInfrastructureParametrics } from './street-infrastructure-parametrics'
import { toggleParcelBoxOperationState } from './parcel-box-interaction'
import { toggleDrivewayGateOperationState } from './driveway-gate-interaction'
import { toggleMailboxOperationState } from './mailbox-interaction'

type GenericContribution = Partial<NodeDefinition<any>> & Record<string, unknown>

const rotateHandle: HandleDescriptor<any> = {
  kind: 'arc-resize',
  axis: 'angular',
  shape: 'rotate',
  apply: (initial, delta) => {
    const rotation = initial.rotation ?? [0, 0, 0]
    return { rotation: [rotation[0], rotation[1] - delta, rotation[2]] }
  },
  placement: { position: () => [0.4, 0.15, 0.4], rotationY: () => -Math.PI / 4 },
  decoration: { kind: 'ring', radius: () => 0.48, y: () => 0.15 },
}

function modelHeight(node: StreetInfrastructureNode): number {
  if (isResidentialRoadAssetKind(node.type)) {
    return resolveResidentialRoadAssetLayout(node as never).height
  }
  if (node.type === 'streetscape:traffic-signal') {
    return resolveTrafficSignalLayout(node).supportHeight
  }
  if (node.type === 'streetscape:drainage-inlet') {
    const layout = resolveDrainageInletLayout(node)
    return Math.max(node.curbHeight, layout.barCenterY + layout.barHeight / 2)
  }
  if (node.type === 'streetscape:manhole-cover') {
    const layout = resolveManholeCoverLayout(node)
    return layout.treadY + layout.treadHeight / 2
  }
  if (node.type === 'streetscape:traffic-bollard') {
    return resolveTrafficBollardLayout(node).height
  }
  if (node.type === 'streetscape:road-barrier') {
    return resolveRoadBarrierLayout(node).height
  }
  return resolveFireHydrantLayout(node as Extract<StreetInfrastructureNode, { type: 'streetscape:fire-hydrant' }>).height
}

const elevationHandle: HandleDescriptor<any> = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  currentValue: (node: StreetInfrastructureNode) => node.position?.[1] ?? 0,
  apply: (node: StreetInfrastructureNode, elevation: number) => ({
    position: [node.position?.[0] ?? 0, elevation, node.position?.[2] ?? 0],
    roadAttachment: undefined,
  }),
  placement: {
    position: (node: StreetInfrastructureNode) => [0, modelHeight(node) + 0.3, 0],
  },
  measureLabel: 'Elevation',
  shape: 'tracker',
}

const drivewayElevationHandle: HandleDescriptor<DrivewayNode> = {
  kind: 'linear-resize',
  axis: 'y',
  anchor: 'min',
  currentValue: (node) => node.position[1],
  apply: (node, elevation) => ({
    position: [node.position[0], elevation, node.position[2]],
    roadAttachment: undefined,
  }),
  placement: {
    position: (node) => [0, resolveResidentialRoadAssetLayout(node).height + 0.3, 0],
  },
  measureLabel: 'Elevation',
  shape: 'tracker',
}

function applyDrivewayLength(
  node: DrivewayNode,
  requestedLength: number,
  end: 'start' | 'end',
): Partial<DrivewayNode> {
  const length = Math.max(0.1, Math.min(20, requestedLength))
  const plan = buildDrivewayPlan(node)
  const startPoint = plan.centerline[0]!
  const endPoint = plan.centerline.at(-1)!
  const previousLength = endPoint[1] - startPoint[1]
  const previousCurveOffset = endPoint[0] - startPoint[0]
  const lengthDelta = length - previousLength
  const followsCurve = end === 'end' && node.drivewayShape !== 'straight'
  const requestedCurveOffset = followsCurve
    ? previousCurveOffset * (1 + 2 * lengthDelta / previousLength)
    : previousCurveOffset
  const curveSign = previousCurveOffset < 0 ? -1 : 1
  const curveOffset = followsCurve
    ? curveSign * Math.max(0.25, Math.min(20, Math.abs(requestedCurveOffset)))
    : previousCurveOffset
  const localCenterShiftX = end === 'end'
    ? (curveOffset - previousCurveOffset) / 2
    : 0
  const localCenterShiftZ = (end === 'end' ? 1 : -1) * lengthDelta / 2
  const yaw = node.rotation[1]
  return {
    curveAmount: node.drivewayShape === 'straight'
      ? node.curveAmount
      : Math.abs(curveOffset),
    length,
    position: [
      node.position[0]
        + Math.cos(yaw) * localCenterShiftX
        + Math.sin(yaw) * localCenterShiftZ,
      node.position[1],
      node.position[2]
        - Math.sin(yaw) * localCenterShiftX
        + Math.cos(yaw) * localCenterShiftZ,
    ],
    roadAttachment: undefined,
  }
}

function makeDrivewayLengthHandle(
  end: 'start' | 'end',
): HandleDescriptor<DrivewayNode> {
  return {
    kind: 'linear-resize',
    axis: 'z',
    anchor: end === 'end' ? 'min' : 'max',
    min: 0.1,
    max: 20,
    gridSnap: true,
    currentValue: (node) => node.length,
    apply: (node, length) => applyDrivewayLength(node, length, end),
    placement: {
      position: (node) => {
        const plan = buildDrivewayPlan(node)
        const point = end === 'end'
          ? plan.centerline.at(-1)!
          : plan.centerline[0]!
        const tangent = end === 'end'
          ? plan.endTangent
          : [-plan.startTangent[0], -plan.startTangent[1]] as const
        return [
          point[0] + tangent[0] * 0.45,
          resolveResidentialRoadAssetLayout(node).height + 0.16,
          point[1] + tangent[1] * 0.45,
        ]
      },
      rotationY: (node) => {
        const plan = buildDrivewayPlan(node)
        const tangent = end === 'end'
          ? plan.endTangent
          : [-plan.startTangent[0], -plan.startTangent[1]] as const
        return Math.atan2(tangent[0], tangent[1])
      },
    },
    measureLabel: 'Length',
  }
}

const drivewayLengthHandles = [
  makeDrivewayLengthHandle('start'),
  makeDrivewayLengthHandle('end'),
]

function makeSpeedHumpWidthHandle(side: -1 | 1): HandleDescriptor<SpeedHumpNode> {
  return {
    kind: 'linear-resize',
    axis: 'x',
    anchor: side > 0 ? 'min' : 'max',
    min: 0.5,
    max: 20,
    gridSnap: true,
    currentValue: (node) => node.width,
    apply: (node, requestedWidth) => {
      const width = Math.max(0.5, Math.min(20, requestedWidth))
      const localShift = side * (width - node.width) / 2
      const yaw = node.rotation[1]
      return {
        width,
        position: [
          node.position[0] + Math.cos(yaw) * localShift,
          node.position[1],
          node.position[2] - Math.sin(yaw) * localShift,
        ],
        roadAttachment: undefined,
      }
    },
    placement: {
      position: (node) => [
        side * (resolveResidentialRoadAssetLayout(node).width / 2 + 0.42),
        resolveResidentialRoadAssetLayout(node).height / 2,
        0,
      ],
      rotationY: () => side > 0 ? 0 : Math.PI,
    },
    measureLabel: 'Width',
  }
}

const speedHumpWidthHandles = [
  makeSpeedHumpWidthHandle(-1),
  makeSpeedHumpWidthHandle(1),
]

export function makeStreetInfrastructureEditContribution(
  variant: StreetInfrastructureVariant,
): GenericContribution {
  return {
    snapProfile: 'item',
    parametrics: getStreetInfrastructureParametrics(variant.kind),
    ...(variant.kind === 'streetscape:mailbox'
      || variant.kind === 'streetscape:parcel-box'
      || variant.kind === 'streetscape:residential-gate'
      ? {
          keyboardActions: {
            e: {
              appliesTo: (node: AnyNode) => (node.type as string) === variant.kind,
              run: (node: AnyNode) => {
                if (variant.kind === 'streetscape:mailbox') {
                  toggleMailboxOperationState(node.id as AnyNodeId)
                } else if (variant.kind === 'streetscape:parcel-box') {
                  toggleParcelBoxOperationState(node.id as AnyNodeId)
                } else {
                  toggleDrivewayGateOperationState(node.id as AnyNodeId)
                }
              },
            },
          },
        }
      : null),
    handles: variant.kind === 'streetscape:driveway'
      ? [...drivewayLengthHandles, drivewayElevationHandle, rotateHandle]
      : variant.kind === 'streetscape:speed-hump'
        ? [...speedHumpWidthHandles, elevationHandle, rotateHandle]
      : [elevationHandle, rotateHandle],
    preview: () => import('./street-infrastructure-preview'),
    tool: () => import('./street-infrastructure-tool'),
    toolHints: [
      { key: 'Left click', label: `Place ${variant.label.toLowerCase()}` },
      { key: 'R', label: 'Rotate 45°' },
      { key: 'Esc', label: 'Stop' },
    ],
  }
}
