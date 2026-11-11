import { STREET_INFRASTRUCTURE_VARIANTS } from './street-infrastructure-config'
import { composeDefinition } from './definition-compose'
import { makeStreetInfrastructureEditContribution } from './street-infrastructure-definition.edit'
import { makeStreetInfrastructureRenderDefinition } from './street-infrastructure-definition.render'

const DEFINITIONS = new Map(
  STREET_INFRASTRUCTURE_VARIANTS.map((variant) => [
    variant.kind,
    composeDefinition(
      makeStreetInfrastructureRenderDefinition(variant),
      makeStreetInfrastructureEditContribution(variant),
    ),
  ]),
)

export const trafficSignalDefinition = DEFINITIONS.get('streetscape:traffic-signal')!
export const drainageInletDefinition = DEFINITIONS.get('streetscape:drainage-inlet')!
export const manholeCoverDefinition = DEFINITIONS.get('streetscape:manhole-cover')!
export const fireHydrantDefinition = DEFINITIONS.get('streetscape:fire-hydrant')!
export const trafficBollardDefinition = DEFINITIONS.get('streetscape:traffic-bollard')!
export const roadBarrierDefinition = DEFINITIONS.get('streetscape:road-barrier')!
export const drivewayDefinition = DEFINITIONS.get('streetscape:driveway')!
export const mailboxDefinition = DEFINITIONS.get('streetscape:mailbox')!
export const parcelBoxDefinition = DEFINITIONS.get('streetscape:parcel-box')!
export const trashBinDefinition = DEFINITIONS.get('streetscape:trash-bin')!
export const recyclingBinDefinition = DEFINITIONS.get('streetscape:recycling-bin')!
export const residentialGateDefinition = DEFINITIONS.get('streetscape:residential-gate')!
export const speedHumpDefinition = DEFINITIONS.get('streetscape:speed-hump')!
