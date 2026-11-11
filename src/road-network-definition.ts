import { composeDefinition } from "./definition-compose";
import { roadNetworkEditContribution } from "./road-network-definition.edit";
import { roadNetworkRenderDefinition } from "./road-network-definition.render";

export const roadNetworkDefinition = composeDefinition(
	roadNetworkRenderDefinition,
	roadNetworkEditContribution,
);
