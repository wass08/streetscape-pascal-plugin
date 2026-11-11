import type { NodeDefinition } from "@pascal-app/core";
import { buildRoadNetworkFloorplan } from "./road-network-floorplan";
import {
	createDefaultRoadStyle,
	reconcileRoadJunctions,
} from "./road-network-topology";
import { DEFAULT_ROAD_STYLE_PRESETS } from "./road-style-presets";
import { RoadNetworkNode } from "./schema";

const defaultStyle = createDefaultRoadStyle();

type RoadNetworkRenderDefinition = NodeDefinition<typeof RoadNetworkNode> &
	Record<string, unknown>;

export const roadNetworkRenderDefinition: RoadNetworkRenderDefinition = {
	kind: "streetscape:road-network",
	schemaVersion: 33,
	schema: RoadNetworkNode,
	category: "structure",
	migrate: {
		1: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			const previousStyles =
				previous.stylePresets && typeof previous.stylePresets === "object"
					? (previous.stylePresets as Record<string, unknown>)
					: {};
			return {
				...previous,
				stylePresets: { ...DEFAULT_ROAD_STYLE_PRESETS, ...previousStyles },
				applyStyleToAll:
					typeof previous.applyStyleToAll === "boolean"
						? previous.applyStyleToAll
						: true,
			};
		},
		2: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			const previousStyles =
				previous.stylePresets && typeof previous.stylePresets === "object"
					? (previous.stylePresets as Record<string, unknown>)
					: {};
			const stylePresets = { ...previousStyles };
			for (const [id, nextDefault] of Object.entries(
				DEFAULT_ROAD_STYLE_PRESETS,
			)) {
				const current = previousStyles[id];
				stylePresets[id] =
					current && typeof current === "object"
						? {
								...(current as Record<string, unknown>),
								sidewalkWidth: nextDefault.sidewalkWidth,
							}
						: { ...nextDefault };
			}
			return { ...previous, stylePresets };
		},
		3: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			const previousEdges =
				previous.edges && typeof previous.edges === "object"
					? (previous.edges as Record<string, unknown>)
					: {};
			const edges = Object.fromEntries(
				Object.entries(previousEdges).map(([id, edge]) => [
					id,
					edge && typeof edge === "object"
						? {
								joinMode: "auto",
								stackLevel: 0,
								...(edge as Record<string, unknown>),
							}
						: edge,
				]),
			);
			return { ...previous, edges };
		},
		4: (old: unknown) => old,
		5: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			const legacyTreatments =
				previous.junctionOverrides &&
				typeof previous.junctionOverrides === "object"
					? (previous.junctionOverrides as Record<string, unknown>)
					: {};
			const parsed = RoadNetworkNode.parse({ ...previous, junctions: {} });
			reconcileRoadJunctions(parsed);
			for (const [nodeId, treatment] of Object.entries(legacyTreatments)) {
				const junction = parsed.junctions[nodeId];
				if (!junction) continue;
				if (
					treatment === "auto" ||
					treatment === "stop" ||
					treatment === "yield" ||
					treatment === "signal" ||
					treatment === "roundabout"
				) {
					parsed.junctions[nodeId] = { ...junction, treatment };
				}
			}
			const { junctionOverrides: _legacy, ...rest } = previous;
			return { ...rest, junctions: parsed.junctions };
		},
		6: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			return {
				...previous,
				attachments:
					previous.attachments && typeof previous.attachments === "object"
						? previous.attachments
						: {},
			};
		},
		7: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			const previousStyles =
				previous.stylePresets && typeof previous.stylePresets === "object"
					? (previous.stylePresets as Record<string, unknown>)
					: {};
			const stylePresets = { ...previousStyles };
			for (const [id, nextDefault] of Object.entries(
				DEFAULT_ROAD_STYLE_PRESETS,
			)) {
				const current = previousStyles[id];
				if (!(current && typeof current === "object")) {
					stylePresets[id] = { ...nextDefault };
					continue;
				}
				const style = current as Record<string, unknown>;
				stylePresets[id] = {
					...style,
					leftSide: style.leftSide ?? { ...nextDefault.leftSide },
					rightSide: style.rightSide ?? { ...nextDefault.rightSide },
				};
			}
			return { ...previous, stylePresets };
		},
		8: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			return {
				...previous,
				terrainOffset:
					typeof previous.terrainOffset === "number"
						? previous.terrainOffset
						: 0.05,
				terrainFalloff:
					typeof previous.terrainFalloff === "number"
						? previous.terrainFalloff
						: 2.5,
			};
		},
		9: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			const previousEdges =
				previous.edges && typeof previous.edges === "object"
					? (previous.edges as Record<string, unknown>)
					: {};
			const edges = Object.fromEntries(
				Object.entries(previousEdges).map(([id, edge]) => [
					id,
					edge && typeof edge === "object"
						? {
								...(edge as Record<string, unknown>),
								profileMode: "legacy",
								verticalProfile: [],
							}
						: edge,
				]),
			);
			return {
				...previous,
				edges,
				maxRoadGrade:
					typeof previous.maxRoadGrade === "number"
						? previous.maxRoadGrade
						: 0.12,
			};
		},
		10: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			return {
				...previous,
				bridgeDeckThickness:
					typeof previous.bridgeDeckThickness === "number"
						? previous.bridgeDeckThickness
						: 0.65,
				bridgeBarrierHeight:
					typeof previous.bridgeBarrierHeight === "number"
						? previous.bridgeBarrierHeight
						: 1.05,
				bridgePierSpacing:
					typeof previous.bridgePierSpacing === "number"
						? previous.bridgePierSpacing
						: 18,
				bridgePierDiameter:
					typeof previous.bridgePierDiameter === "number"
						? previous.bridgePierDiameter
						: 1.1,
				bridgeMinimumClearance:
					typeof previous.bridgeMinimumClearance === "number"
						? previous.bridgeMinimumClearance
						: 4.5,
			};
		},
		11: (old: unknown) => old,
		12: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			return {
				...previous,
				embankmentSlope:
					typeof previous.embankmentSlope === "number"
						? previous.embankmentSlope
						: 2,
				excavationSlope:
					typeof previous.excavationSlope === "number"
						? previous.excavationSlope
						: 1.5,
			};
		},
		13: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			return {
				...previous,
				regionalPack:
					previous.regionalPack === "left-driving"
						? "left-driving"
						: "right-driving",
			};
		},
		14: (old: unknown) => old,
		15: (old: unknown) => old,
		16: (old: unknown) => old,
		17: (old: unknown) => old,
		18: (old: unknown) => old,
		19: (old: unknown) => old,
		20: (old: unknown) => old,
		21: (old: unknown) => old,
		22: (old: unknown) => old,
		23: (old: unknown) => old,
		24: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			return {
				...(old as Record<string, unknown>),
				roadsideDecorations: {},
				roadsideDecorationSpacing: 30,
				showRoadsideDecorations: false,
			};
		},
		25: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			const previousJunctions =
				previous.junctions && typeof previous.junctions === "object"
					? (previous.junctions as Record<string, unknown>)
					: {};
			return {
				...previous,
				junctions: Object.fromEntries(
					Object.entries(previousJunctions).map(([id, junction]) => [
						id,
						junction && typeof junction === "object"
							? {
									...(junction as Record<string, unknown>),
									manualBoundaryEnabled: false,
									manualBoundaryPoints: [],
								}
							: junction,
					]),
				),
			};
		},
		26: (old: unknown) => old,
		27: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = { ...(old as Record<string, unknown>) };
			for (const key of [
				"tunnelClearHeight",
				"tunnelSideClearance",
				"tunnelLiningThickness",
				"tunnelPortalCutLength",
				"tunnelCutSlope",
			] as const) {
				delete previous[key];
			}
			const graphNodes =
				previous.graphNodes && typeof previous.graphNodes === "object"
					? (previous.graphNodes as Record<string, unknown>)
					: {};
			const retiredTunnelNodeIds = new Set(
				Object.entries(graphNodes).flatMap(([id, graphNode]) =>
					graphNode && typeof graphNode === "object" &&
					(graphNode as { elevationMode?: unknown }).elevationMode === "tunnel"
						? [id]
						: [],
				),
			);
			const edges =
				previous.edges && typeof previous.edges === "object"
					? (previous.edges as Record<string, unknown>)
					: {};
			return {
				...previous,
				graphNodes: Object.fromEntries(
					Object.entries(graphNodes).map(([id, graphNode]) => [
						id,
						graphNode && typeof graphNode === "object" &&
						(graphNode as { elevationMode?: unknown }).elevationMode === "tunnel"
							? { ...(graphNode as Record<string, unknown>), elevationMode: "ground" }
							: graphNode,
					]),
				),
				edges: Object.fromEntries(
					Object.entries(edges).map(([id, edge]) => {
						if (!(edge && typeof edge === "object")) return [id, edge];
						const value = edge as Record<string, unknown>;
						return [
							id,
							retiredTunnelNodeIds.has(String(value.startNodeId)) &&
							retiredTunnelNodeIds.has(String(value.endNodeId))
								? { ...value, stackLevel: 0 }
								: edge,
						];
					}),
				),
			};
		},
		28: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = { ...(old as Record<string, unknown>) };
			const density = previous.roadsideDecorationDensity;
			delete previous.roadsideDecorationDensity;
			delete previous.roadsideDecorationRules;
			return {
				...previous,
				roadsideDecorationSpacing:
					typeof previous.roadsideDecorationSpacing === "number"
						? previous.roadsideDecorationSpacing
						: density === "sparse"
							? 45
							: density === "dense"
								? 20
								: 30,
			};
		},
		29: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			const previous = old as Record<string, unknown>;
			return {
				...previous,
				roadsideLampsBothSides:
					typeof previous.roadsideLampsBothSides === "boolean"
						? previous.roadsideLampsBothSides
						: false,
			};
		},
		30: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			return {
				...(old as Record<string, unknown>),
				roadsideItemVisibility: {},
			};
		},
		31: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			return {
				...(old as Record<string, unknown>),
				roadsideDecorationSuppressed: {},
			};
		},
		32: (old: unknown) => {
			if (!(old && typeof old === "object")) return old;
			return {
				...(old as Record<string, unknown>),
				roadsideAutoFillEnabled: false,
				roadsideItemSuppressed: {},
			};
		},
	},
	defaults: () => ({
		object: "node",
		parentId: null,
		visible: true,
		metadata: {},
		graphNodes: {},
		edges: {},
		roadsideDecorations: {},
		roadsideDecorationSpacing: 30,
		roadsideLampsBothSides: false,
		showRoadsideDecorations: false,
		roadsideItemVisibility: {},
		roadsideDecorationSuppressed: {},
		roadsideAutoFillEnabled: false,
		roadsideItemSuppressed: {},
		attachments: {},
		junctions: {},
		stylePresets: { ...DEFAULT_ROAD_STYLE_PRESETS },
		activeStyleId: defaultStyle.id,
		applyStyleToAll: true,
		regionalPack: "right-driving",
		snapTolerance: 0.5,
		terrainOffset: 0.05,
		terrainFalloff: 2.5,
		embankmentSlope: 2,
		excavationSlope: 1.5,
		maxRoadGrade: 0.12,
		bridgeDeckThickness: 0.65,
		bridgeBarrierHeight: 1.05,
		bridgePierSpacing: 18,
		bridgePierDiameter: 1.1,
		bridgeMinimumClearance: 4.5,
	}),
	capabilities: {
		selectable: { hitVolume: "bbox" },
		deletable: true,
		duplicable: false,
		groupable: false,
		presettable: false,
		drawTool: true,
	},
	floorplan: buildRoadNetworkFloorplan,
	renderer: {
		kind: "parametric",
		module: () => import("./road-network-renderer"),
	},
	presentation: {
		label: "Road",
		description:
			"Draw independently selectable connected roads with automatic junction topology.",
		icon: { kind: "iconify", name: "lucide:route" },
		paletteSection: "structure",
		paletteOrder: 15,
	},
	mcp: {
		description:
			"One connected road centerline component whose surface and junction shapes are generated automatically.",
	},
};
