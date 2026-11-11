import type { AnyNodeDefinition, Plugin } from '@pascal-app/core'
import { roadNetworkRenderDefinition } from './road-network-definition.render'
import { streetLightRenderDefinition } from './street-light-definition.render'
import { postTopLightRenderDefinition } from './post-top-light-definition.render'
import { heritageCrookLightRenderDefinition } from './heritage-crook-light-definition.render'
import { cobraHeadLightRenderDefinition } from './cobra-head-light-definition.render'
import { twinArmMedianLightRenderDefinition } from './twin-arm-median-light-definition.render'
import { multiHeadAreaLightRenderDefinition } from './multi-head-area-light-definition.render'
import { trussRoadwayLightRenderDefinition } from './truss-roadway-light-definition.render'
import {
  bollardLightRenderDefinition,
  canopySoffitLightRenderDefinition,
  catenaryStreetLightRenderDefinition,
  decorativeCandelabraLightRenderDefinition,
  floodlightPoleRenderDefinition,
  globePostTopLightRenderDefinition,
  highMastCrownLightRenderDefinition,
  pathGardenLightRenderDefinition,
  shoeboxAreaLightRenderDefinition,
  solarStreetLightRenderDefinition,
  traditionalPostTopLanternRenderDefinition,
  tunnelLuminaireRenderDefinition,
  wallArmLightRenderDefinition,
  wallPackLightRenderDefinition,
} from './catalog-lamp-definition.render'
import { utilityPoleRenderDefinition } from './utility-pole-definition.render'
import { utilityWireRenderDefinition } from './utility-wire-definition.render'
import {
  drainageInletRenderDefinition,
  drivewayRenderDefinition,
  fireHydrantRenderDefinition,
  mailboxRenderDefinition,
  manholeCoverRenderDefinition,
  parcelBoxRenderDefinition,
  recyclingBinRenderDefinition,
  residentialGateRenderDefinition,
  roadBarrierRenderDefinition,
  speedHumpRenderDefinition,
  trafficBollardRenderDefinition,
  trafficSignalRenderDefinition,
  trashBinRenderDefinition,
} from './street-infrastructure-definition.render'
import { roadSignRenderDefinition } from './road-sign-definition.render'

/**
 * Render-only Streetscape plugin for read-only viewers. It registers the same kinds,
 * schemas, versions, defaults and migrations as the root `streetscapeLabPlugin`, with
 * their renderers, geometry, materials and read-only floor plans, and none of the
 * editing contributions (placement, previews, handles, parameters, plan editing,
 * quick actions, the host panel or document-normalization side effects), so it
 * never loads `@pascal-app/editor`. Load one or the other, not both.
 */
export const streetscapeLabRenderPlugin: Plugin = {
  id: 'pascal:streetscape-lab',
  apiVersion: 1,
  nodes: [
    roadNetworkRenderDefinition as unknown as AnyNodeDefinition,
    streetLightRenderDefinition as unknown as AnyNodeDefinition,
    postTopLightRenderDefinition as unknown as AnyNodeDefinition,
    heritageCrookLightRenderDefinition as unknown as AnyNodeDefinition,
    cobraHeadLightRenderDefinition as unknown as AnyNodeDefinition,
    twinArmMedianLightRenderDefinition as unknown as AnyNodeDefinition,
    multiHeadAreaLightRenderDefinition as unknown as AnyNodeDefinition,
    trussRoadwayLightRenderDefinition as unknown as AnyNodeDefinition,
    highMastCrownLightRenderDefinition as unknown as AnyNodeDefinition,
    shoeboxAreaLightRenderDefinition as unknown as AnyNodeDefinition,
    floodlightPoleRenderDefinition as unknown as AnyNodeDefinition,
    traditionalPostTopLanternRenderDefinition as unknown as AnyNodeDefinition,
    globePostTopLightRenderDefinition as unknown as AnyNodeDefinition,
    decorativeCandelabraLightRenderDefinition as unknown as AnyNodeDefinition,
    pathGardenLightRenderDefinition as unknown as AnyNodeDefinition,
    bollardLightRenderDefinition as unknown as AnyNodeDefinition,
    catenaryStreetLightRenderDefinition as unknown as AnyNodeDefinition,
    wallArmLightRenderDefinition as unknown as AnyNodeDefinition,
    wallPackLightRenderDefinition as unknown as AnyNodeDefinition,
    tunnelLuminaireRenderDefinition as unknown as AnyNodeDefinition,
    canopySoffitLightRenderDefinition as unknown as AnyNodeDefinition,
    solarStreetLightRenderDefinition as unknown as AnyNodeDefinition,
    utilityPoleRenderDefinition as unknown as AnyNodeDefinition,
    utilityWireRenderDefinition as unknown as AnyNodeDefinition,
    trafficSignalRenderDefinition as unknown as AnyNodeDefinition,
    drainageInletRenderDefinition as unknown as AnyNodeDefinition,
    manholeCoverRenderDefinition as unknown as AnyNodeDefinition,
    fireHydrantRenderDefinition as unknown as AnyNodeDefinition,
    trafficBollardRenderDefinition as unknown as AnyNodeDefinition,
    roadBarrierRenderDefinition as unknown as AnyNodeDefinition,
    drivewayRenderDefinition as unknown as AnyNodeDefinition,
    mailboxRenderDefinition as unknown as AnyNodeDefinition,
    parcelBoxRenderDefinition as unknown as AnyNodeDefinition,
    trashBinRenderDefinition as unknown as AnyNodeDefinition,
    recyclingBinRenderDefinition as unknown as AnyNodeDefinition,
    residentialGateRenderDefinition as unknown as AnyNodeDefinition,
    speedHumpRenderDefinition as unknown as AnyNodeDefinition,
    roadSignRenderDefinition as unknown as AnyNodeDefinition,
  ],
}

// Mirrors the root's original-name alias (`streetscapePlugin`).
export const streetscapeRenderPlugin = streetscapeLabRenderPlugin
