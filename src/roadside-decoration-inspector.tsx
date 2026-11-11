"use client";

import { type AnyNode, type AnyNodeId, useScene } from "@pascal-app/core";
import { SliderControl, ToggleControl } from "@pascal-app/editor";
import {
	ROAD_AUTO_INFRASTRUCTURE_OPTIONS,
	FULL_ROAD_AUTO_INFRASTRUCTURE_SETTINGS,
} from "./road-auto-infrastructure-settings";
import { buildRoadAutoInfrastructurePlan } from "./road-auto-infrastructure";
import { applyRoadAutoInfrastructureClearances } from "./road-auto-infrastructure-style";
import {
	ensureRoadsideLampVerge,
	resolvedRoadsideDecorationSpacing,
} from "./roadside-decoration-rules";
import { RoadNetworkNode as RoadNetworkNodeSchema, type RoadNetworkNode } from "./schema";

export function RoadsideDecorationInspector({
	node,
	onUpdate,
}: {
	node: RoadNetworkNode;
	onUpdate: (patch: Partial<RoadNetworkNode>) => void;
}) {
	const spacing = resolvedRoadsideDecorationSpacing(node.roadsideDecorationSpacing);
	const itemVisibility = node.roadsideItemVisibility ?? {};
	const generatedCount = useScene((state) => Object.values(state.nodes).filter((candidate) => {
		const metadata = candidate.metadata;
		return metadata && typeof metadata === "object" && !Array.isArray(metadata)
			&& (metadata as Record<string, unknown>).generatedBy === "road-auto-infrastructure"
			&& (metadata as Record<string, unknown>).roadNetworkId === node.id;
	}).length);
	const visibilityOptions = [
		{ key: "lamp", label: "Roadside lamps" },
		{ key: "sign", label: "Roadside signs" },
		...ROAD_AUTO_INFRASTRUCTURE_OPTIONS.map((option) => ({
			key: option.kind,
			label: option.label,
		})),
	];
	const autoFill = () => {
		const scene = useScene.getState();
		const allEnabled = FULL_ROAD_AUTO_INFRASTRUCTURE_SETTINGS;
		const roadsideItemVisibility = Object.fromEntries(
			visibilityOptions.map((option) => [
				option.key,
				itemVisibility[option.key] ?? true,
			]),
		);
		const stylePresets = Object.fromEntries(
			Object.entries(node.stylePresets).map(([id, style]) => [
				id,
				applyRoadAutoInfrastructureClearances(style, allEnabled),
			]),
		);
		const network = RoadNetworkNodeSchema.parse({
			...node,
			roadsideAutoFillEnabled: true,
			roadsideItemVisibility,
			stylePresets,
		});
		const plan = buildRoadAutoInfrastructurePlan({
			edgeIds: Object.keys(network.edges),
			existingNodes: Object.values(scene.nodes),
			network,
			settings: allEnabled,
		});
		scene.applyNodeChanges({
			update: [{
				id: node.id as AnyNodeId,
				data: {
					attachments: { ...network.attachments, ...plan.attachments },
					roadsideAutoFillEnabled: true,
					roadsideItemVisibility,
					stylePresets,
				} as Partial<AnyNode>,
			}],
			create: plan.nodes.map((generated) => ({
				node: generated as unknown as AnyNode,
				parentId: node.parentId as AnyNodeId,
			})),
		});
	};
	return (
		<div aria-label="Roadside decorations" className="flex flex-col gap-2">
			<button
				aria-label="Auto-fill roadside"
				className="rounded-md border border-sidebar-border bg-sidebar-accent px-2.5 py-2 font-medium text-sidebar-foreground text-xs transition-colors hover:bg-sidebar-accent/70"
				onClick={autoFill}
				type="button"
			>
				{generatedCount > 0 ? "Refresh auto-fill" : "Auto-fill roadside"}
			</button>
			<span className="text-[10px] leading-snug text-sidebar-foreground/50">
				{generatedCount > 0
					? `${generatedCount} generated items stay aligned with this road.`
					: "Generate roadside items and keep them aligned as the road changes."}
			</span>
			<div aria-label="Roadside item visibility" className="flex flex-col gap-1">
				{visibilityOptions.map((option) => (
					<ToggleControl
						checked={itemVisibility[option.key] === true}
						key={option.key}
						label={option.label}
						onChange={(visible) => {
							const stylePresets = visible && (option.key === "lamp" || option.key === "sign")
								? ensureRoadsideLampVerge(node)
								: null;
							onUpdate({
								roadsideItemVisibility: {
									...itemVisibility,
									[option.key]: visible,
								},
								...(stylePresets ? { stylePresets } : {}),
							});
						}}
					/>
				))}
			</div>
			<div aria-label="Roadside lamp sides">
				<ToggleControl
					checked={node.roadsideLampsBothSides ?? false}
					label="Lamps on both sides"
					onChange={(roadsideLampsBothSides) => onUpdate({ roadsideLampsBothSides })}
				/>
			</div>
			<div aria-label="Roadside decoration spacing">
				<SliderControl
					label="Spacing"
					max={100}
					min={10}
					onChange={(roadsideDecorationSpacing) => onUpdate({ roadsideDecorationSpacing })}
					precision={0}
					step={1}
					unit="m"
					value={spacing}
				/>
			</div>
		</div>
	);
}
