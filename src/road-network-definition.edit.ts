import {
	type AnyNode,
	type AnyNodeId,
	type NodeDefinition,
} from "@pascal-app/core";
import {
	roadControlPointAffordance,
	roadCurbCornerAffordance,
	roadExtendEndpointAffordance,
	roadInsertPointAffordance,
	roadNodePointAffordance,
} from "./road-network-affordances";
import { roadNetworkParametrics } from "./road-network-parametrics";
import { deleteRoadSplinePoints } from "./road-network-spline-handles";
import {
	incidentRoadEdges,
	roadJunctionPrimaryCandidates,
} from "./road-network-topology";
import { buildSignalJunctionPlacements } from "./road-edge-attachments";
import { type RoadNetworkNode, TrafficSignalNode } from "./schema";
import { useStreetscapeStore } from "./store";

type RoadNetworkEditContribution = Partial<NodeDefinition<typeof RoadNetworkNode>> &
	Record<string, unknown>;

export const roadNetworkEditContribution: RoadNetworkEditContribution = {
	snapProfile: "structural",
	extensions: {
		"pascal:editor/floorplan": {
			tool: () => import("./road-network-floorplan-tool"),
			availableModes: ["default", "expert"],
			preferredView: "3d",
		},
	},
	parametrics: roadNetworkParametrics,
	floorplanAffordances: {
		"road-control-point": roadControlPointAffordance,
		"road-insert-point": roadInsertPointAffordance,
		"road-curb-corner": roadCurbCornerAffordance,
		"road-extend-endpoint": roadExtendEndpointAffordance,
		"road-node-point": roadNodePointAffordance,
	},
	quickActions: ({ node }: { node: RoadNetworkNode }) => {
		const junctions = node.junctions ?? {};
		const selected = useStreetscapeStore.getState().roadElementSelection;
		const hasSplineAlignment = Object.values(node.edges).some(
			(edge) => edge.alignment.length > 0,
		);
		const splineEditing =
			selected?.networkId === node.id &&
			(selected.kind === "spline" ||
				selected.kind === "control" ||
				selected.kind === "endpoint");
		const splineAction = hasSplineAlignment
			? {
					id: "road:edit-spline",
					label: splineEditing ? "Finish spline edit" : "Edit spline",
					title: splineEditing
						? "Hide the spline reshape handles"
						: "Show draggable controls for reshaping this spline road",
					icon: { kind: "iconify" as const, name: "lucide:move" },
					run: () => {
						useStreetscapeStore
							.getState()
							.setRoadElementSelection(
								splineEditing
									? null
									: { networkId: node.id, kind: "spline", id: node.id },
							);
						return { selectedIds: [node.id as AnyNodeId] };
					},
				}
			: null;
		const selectedControl = selected?.networkId === node.id && selected.kind === "control" ? selected : null;
		const controlIndices = selectedControl?.indices ??
			(selectedControl?.index === undefined ? [] : [selectedControl.index]);
		const removeControlAction = selectedControl &&
			deleteRoadSplinePoints(node, selectedControl.id, controlIndices)
			? {
					id: "road:remove-spline-points",
					label: controlIndices.length > 1 ? "Remove selected points" : "Remove selected point",
					title: "Remove selected spline control points while keeping the road endpoints",
					icon: { kind: "iconify" as const, name: "lucide:minus-circle" },
					history: "single" as const,
					run: ({ sceneApi }: { sceneApi: { update: (id: AnyNodeId, patch: Partial<AnyNode>) => void } }) => {
						const patch = deleteRoadSplinePoints(node, selectedControl.id, controlIndices);
						if (patch) sceneApi.update(node.id as AnyNodeId, patch as Partial<AnyNode>);
						useStreetscapeStore.getState().setRoadElementSelection({ networkId: node.id, kind: "spline", id: node.id });
						return { selectedIds: [node.id as AnyNodeId] };
					},
				}
			: null;
		const editingActions = [splineAction, removeControlAction].filter(
			(action): action is NonNullable<typeof action> => Boolean(action),
		);
		const selectedJunctionId =
			selected?.networkId === node.id &&
			(selected.kind === "junction" || selected.kind === "corner") &&
			junctions[selected.id]
				? selected.id
				: null;
		const selectedCornerKey =
			selected?.networkId === node.id &&
			selected.kind === "corner" &&
			selected.cornerKey &&
			junctions[selected.id]?.cornerRadii[selected.cornerKey] !== undefined
				? selected.cornerKey
				: null;
		const junctionNode = Object.values(node.graphNodes)
			.map((graphNode) => ({
				graphNode,
				degree: incidentRoadEdges(node, graphNode.id).length,
			}))
			.filter(
				(candidate) =>
					candidate.degree >= 3 && junctions[candidate.graphNode.id],
			)
			.sort((left, right) => right.degree - left.degree)[0];
		const junctionId = selectedJunctionId ?? junctionNode?.graphNode.id;
		if (!junctionId) return editingActions;
		const junctionRecord = junctions[junctionId]!;
		const roundabout = junctionRecord?.treatment === "roundabout";
		const primaryCandidates = roadJunctionPrimaryCandidates(node, junctionId);
		const primaryKey = [...junctionRecord.primaryEdgeIds].sort().join(":");
		const currentPrimaryIndex = primaryCandidates.findIndex(
			(pair) => [...pair].sort().join(":") === primaryKey,
		);
		const nextPrimary =
			primaryCandidates[(currentPrimaryIndex + 1) % primaryCandidates.length];
		const updateJunction = (
			sceneApi: { update: (id: AnyNodeId, patch: Partial<AnyNode>) => void },
			patch: Partial<typeof junctionRecord>,
		) => {
			sceneApi.update(
				node.id as AnyNodeId,
				{
					junctions: {
						...junctions,
						[junctionId]: { ...junctionRecord, ...patch },
					},
				} as Partial<AnyNode>,
			);
			return { selectedIds: [node.id as AnyNodeId] };
		};
		const signalized =
			junctionRecord.treatment === "signal" ||
			Object.values(junctionRecord.approachControls ?? {}).some(
				(control) => control === "signal",
			);
		const signalAttachments = Object.values(node.attachments ?? {}).filter(
			(attachment) => attachment.junctionId === junctionId,
		);
		const placeSignalAssetsAction = signalized
			? {
					id: "road:place-signal-assets",
					label: signalAttachments.length > 0 ? "Refresh signal assets" : "Place signal assets",
					title: "Create a sparse pair of editable roadside mast-arm signals",
					icon: { kind: "iconify" as const, name: "lucide:traffic-cone" },
					history: "single" as const,
					run: ({
						sceneApi,
					}: {
						sceneApi: {
							nodes: () => Record<AnyNodeId, AnyNode>;
							upsert: (node: AnyNode, parentId?: AnyNodeId) => AnyNodeId;
							update: (id: AnyNodeId, patch: Partial<AnyNode>) => void;
						};
					}) => {
						const placements = buildSignalJunctionPlacements(node, junctionId);
						const occupiedIds = new Set(Object.keys(sceneApi.nodes()));
						const nextAttachments = { ...node.attachments };
						const existingByEdge = new Set(
							signalAttachments.map((attachment) => attachment.edgeId),
						);
						const createdIds: AnyNodeId[] = [];
						const createdSignals: TrafficSignalNode[] = [];
						for (const placement of placements) {
							if (existingByEdge.has(placement.edgeId)) continue;
							let signal = TrafficSignalNode.parse({
								parentId: node.parentId,
								position: placement.position,
								rotation: [0, placement.rotationY, 0],
								mount: "mast-arm",
								headCount: "two",
								signalState: "red",
								cabinet: false,
								streetNameSign: false,
							});
							while (occupiedIds.has(signal.id)) {
								signal = TrafficSignalNode.parse({
									...signal,
									id: undefined,
								});
							}
							const attachmentId = `${signal.id}:junction:${junctionId}`;
							const attachment = {
								id: attachmentId,
								edgeId: placement.edgeId,
								assetNodeId: signal.id,
								kind: "asset" as const,
								station: placement.station,
								lateralOffset: placement.lateralOffset,
								verticalOffset: 0,
								alignment: "junction" as const,
								side: placement.side,
								junctionId,
							};
							signal = TrafficSignalNode.parse({
								...signal,
								roadAttachment: {
									networkNodeId: node.id,
									attachmentId,
									side: placement.side,
								},
							});
							nextAttachments[attachmentId] = attachment;
							occupiedIds.add(signal.id);
							createdIds.push(signal.id as AnyNodeId);
							createdSignals.push(signal);
						}
						if (createdIds.length > 0) {
							sceneApi.update(node.id as AnyNodeId, {
								attachments: nextAttachments,
							} as Partial<AnyNode>);
							for (const signal of createdSignals) {
								sceneApi.upsert(signal as unknown as AnyNode, node.parentId as AnyNodeId);
							}
						}
						return { selectedIds: createdIds.length > 0 ? createdIds : [node.id as AnyNodeId] };
					},
				}
			: null;
		return [
			...editingActions,
			...(placeSignalAssetsAction ? [placeSignalAssetsAction] : []),
			{
				id: "road:toggle-roundabout",
				label: roundabout ? "Standard junction" : "Roundabout",
				title: roundabout
					? "Convert the selected junction back to automatic"
					: "Convert the selected junction to a roundabout",
				icon: { kind: "iconify" as const, name: "lucide:circle-dot" },
				history: "single" as const,
				run: ({
					sceneApi,
				}: {
					sceneApi: {
						update: (id: AnyNodeId, patch: Partial<AnyNode>) => void;
					};
				}) => {
					return updateJunction(sceneApi, {
						treatment: roundabout ? "auto" : "roundabout",
					});
				},
			},
			{
				id: "road:cycle-primary",
				label: "Change primary road",
				title: "Cycle the through-road pair for the selected junction",
				icon: { kind: "iconify" as const, name: "lucide:route" },
				history: "single" as const,
				run: ({
					sceneApi,
				}: {
					sceneApi: {
						update: (id: AnyNodeId, patch: Partial<AnyNode>) => void;
					};
				}) =>
					updateJunction(sceneApi, {
						primaryMode: "manual",
						primaryEdgeIds: nextPrimary
							? [...nextPrimary]
							: junctionRecord.primaryEdgeIds,
					}),
			},
			...(selectedCornerKey
				? [
						{
							id: "road:tighten-corner",
							label: "Tighter corner",
							title: "Reduce only the selected curb-return radius by 1 metre",
							icon: { kind: "iconify" as const, name: "lucide:shrink" },
							history: "single" as const,
							run: ({
								sceneApi,
							}: {
								sceneApi: {
									update: (id: AnyNodeId, patch: Partial<AnyNode>) => void;
								};
							}) =>
								updateJunction(sceneApi, {
									cornerRadii: {
										...junctionRecord.cornerRadii,
										[selectedCornerKey]: Math.max(
											0.5,
											junctionRecord.cornerRadii[selectedCornerKey]! - 1,
										),
									},
									solverStatus: "manual",
								}),
						},
						{
							id: "road:widen-corner",
							label: "Wider corner",
							title: "Increase only the selected curb-return radius by 1 metre",
							icon: { kind: "iconify" as const, name: "lucide:expand" },
							history: "single" as const,
							run: ({
								sceneApi,
							}: {
								sceneApi: {
									update: (id: AnyNodeId, patch: Partial<AnyNode>) => void;
								};
							}) =>
								updateJunction(sceneApi, {
									cornerRadii: {
										...junctionRecord.cornerRadii,
										[selectedCornerKey]: Math.min(
											100,
											junctionRecord.cornerRadii[selectedCornerKey]! + 1,
										),
									},
									solverStatus: "manual",
								}),
						},
					]
				: []),
		];
	},
	preview: () => import("./road-network-preview"),
	tool: () => import("./road-network-tool"),
	toolHints: [
		{ key: "Left click", label: "Add road or spline point" },
		{ key: "Enter", label: "Finish current road" },
		{ key: "Double click", label: "Finish current road" },
		{ key: "Backspace", label: "Remove last draft point" },
		{
			key: "C",
			label: "Alignment",
			chip: {
				subscribe: (onChange: () => void) =>
					useStreetscapeStore.subscribe(onChange),
				value: () => useStreetscapeStore.getState().roadAlignmentMode,
				cycle: () => {
					const store = useStreetscapeStore.getState();
					store.setRoadAlignmentMode(
						store.roadAlignmentMode === "straight" ? "spline" : "straight",
					);
				},
				labels: {
					straight: "Alignment: Straight",
					spline: "Alignment: Smooth curve",
				},
				icons: {
					straight: "lucide:minus",
					spline: "lucide:spline",
				},
				tooltip: "Road alignment — click or press C to cycle",
			},
		},
		{
			key: "B",
			label: "Elevation",
			chip: {
				subscribe: (onChange: () => void) =>
					useStreetscapeStore.subscribe(onChange),
				value: () => useStreetscapeStore.getState().roadElevationMode,
				cycle: () => {
					const store = useStreetscapeStore.getState();
					store.setRoadElevationMode(
						store.roadElevationMode === "ground" ? "bridge" : "ground",
					);
				},
				labels: {
					ground: "Elevation: Ground",
					bridge: "Elevation: Bridge",
				},
				icons: {
					ground: "lucide:land-plot",
					bridge: "lucide:construction",
				},
				tooltip: "Road elevation — click or press B to cycle",
			},
		},
		{ key: "L", label: "Enter exact road length" },
		{ key: "A", label: "Enter exact bearing" },
		{ key: "R", label: "Enter bend radius" },
		{ key: "T", label: "Enter bend tangent" },
		{ key: "J", label: "Toggle automatic junctions" },
		{ key: "Esc", label: "Stop road tool" },
	] as unknown as NonNullable<RoadNetworkEditContribution["toolHints"]>,
	// The editor renderer adds spline/length controls, road-tool gating, edge
	// deletion and the document normalization the read-only renderer leaves out.
	renderer: {
		kind: "parametric",
		module: () => import("./road-network-renderer.edit"),
	},
};
