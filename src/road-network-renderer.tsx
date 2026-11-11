'use client'

import {
  type AnyNode,
  type AnyNodeId,
  useLiveNodeOverrides,
  useRegistry,
  useScene,
} from '@pascal-app/core'
import { useNodeEvents } from '@pascal-app/viewer'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { buildRoadsideDecorations, ensureRoadsideLampVerge } from './roadside-decoration-rules'
import { RoadNetworkModel } from './road-network-model'
import { RoadNetworkNode } from './schema'
import { decodeTerrainField } from './terrain-field-compat'

/**
 * What a road network draws, derived from the stored node without writing to the
 * scene: live overrides, schema defaults, terrain, neighbouring roads and the
 * generated roadside lamps and signs. The editor renderer persists the parts of
 * this derivation that belong in the document; a read-only viewer only draws it.
 */
export function useRoadNetworkRenderState(storeNode: RoadNetworkNode) {
  const ref = useRef<Group>(null!)
  useRegistry(storeNode.id as AnyNodeId, storeNode.type, ref)
  const sceneNodes = useScene((state) => state.nodes)
  const clearancePeers = useMemo(
    () =>
      Object.values(sceneNodes).flatMap((candidate) =>
        (candidate.id as string) !== storeNode.id &&
        (candidate.type as string) === 'streetscape:road-network'
          ? [candidate as unknown as RoadNetworkNode]
          : [],
      ),
    [sceneNodes, storeNode.id],
  )
  const terrain = useMemo(() => {
    const site = Object.values(sceneNodes).find(
      (candidate) => (candidate.type as string) === 'site',
    ) as (AnyNode & { terrain?: unknown }) | undefined
    return decodeTerrainField(site?.terrain)
  }, [sceneNodes])
  const override = useLiveNodeOverrides(
    (state) => state.get(storeNode.id as AnyNodeId) as Partial<RoadNetworkNode> | undefined,
  )
  // Local editor scenes can retain an already-mounted node while a plugin schema
  // advances. Parse at the renderer boundary so every derived subsystem receives
  // the same defaults even before the host persists its migration patch.
  const node = useMemo(
    () => RoadNetworkNode.parse(override ? { ...storeNode, ...override } : storeNode),
    [override, storeNode],
  )
  const roadsideLampStylePresets = useMemo(
    () =>
      node.showRoadsideDecorations ||
      node.roadsideItemVisibility?.lamp === true ||
      node.roadsideItemVisibility?.sign === true
        ? ensureRoadsideLampVerge(node)
        : null,
    [node],
  )
  const roadsideNode = useMemo(
    () => (roadsideLampStylePresets ? { ...node, stylePresets: roadsideLampStylePresets } : node),
    [node, roadsideLampStylePresets],
  )
  const generatedRoadsideDecorations = useMemo(
    () =>
      node.showRoadsideDecorations ||
      node.roadsideItemVisibility?.lamp === true ||
      node.roadsideItemVisibility?.sign === true
        ? buildRoadsideDecorations(roadsideNode)
        : {},
    [node.roadsideItemVisibility, node.showRoadsideDecorations, roadsideNode],
  )
  const renderedNode = useMemo(
    () => ({
      ...roadsideNode,
      roadsideDecorations: generatedRoadsideDecorations,
    }),
    [generatedRoadsideDecorations, roadsideNode],
  )
  return {
    ref,
    sceneNodes,
    clearancePeers,
    terrain,
    node,
    roadsideLampStylePresets,
    generatedRoadsideDecorations,
    renderedNode,
  }
}

/** Read-only road network: draws the derived road and never edits the scene. */
export default function RoadNetworkRenderer({ node: storeNode }: { node: RoadNetworkNode }) {
  const handlers = useNodeEvents(storeNode as never, 'streetscape:road-network' as never)
  const { ref, clearancePeers, terrain, node, renderedNode } = useRoadNetworkRenderState(storeNode)
  return (
    <group ref={ref} visible={node.visible !== false} {...handlers}>
      <RoadNetworkModel clearancePeers={clearancePeers} node={renderedNode} terrain={terrain} />
    </group>
  )
}
