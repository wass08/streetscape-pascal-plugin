import { describe, expect, test } from 'bun:test'
import { streetscapeLabPlugin } from './index'
import { streetscapeLabRenderPlugin, streetscapeRenderPlugin } from './render'

// Editing contributions in the public node-definition contract. A read-only viewer
// registers none of them.
const EDIT_ONLY_FIELDS = [
  'extensions',
  'facingIndicator',
  'drafting',
  'connectedMove',
  'parametrics',
  'placementNotice',
  'quickActions',
  'quickActionNodeScope',
  'tool',
  'affordanceTools',
  'affordances',
  'toolHints',
  'affordanceHints',
  'toolOptions',
  'snapProfile',
  'snapDraftDirectional',
  'preview',
  'keyboardActions',
  'handles',
  'floorplanDependencies',
  'floorplanDependsOnSiblings',
  'floorplanAffectedIds',
  'floorplanSiblingOverrides',
  'floorplanAffordances',
  'floorplanMoveTarget',
] as const

type Definition = Record<string, unknown> & {
  kind: string
  schema: unknown
  schemaVersion: number
  defaults: () => unknown
  migrate?: Record<number, unknown>
  capabilities?: Record<string, unknown>
  renderer?: unknown
}

const rootNodes = (streetscapeLabPlugin.nodes ?? []) as unknown as Definition[]
const renderNodes = (streetscapeLabRenderPlugin.nodes ?? []) as unknown as Definition[]

describe('render-only plugin', () => {
  test('has the root plugin identity', () => {
    expect(streetscapeLabRenderPlugin.id).toBe(streetscapeLabPlugin.id)
    expect(streetscapeLabRenderPlugin.apiVersion).toBe(streetscapeLabPlugin.apiVersion)
    expect(streetscapeRenderPlugin).toBe(streetscapeLabRenderPlugin)
  })

  test('registers the same kinds, schemas, versions, defaults and migrations', () => {
    expect(renderNodes.map((definition) => definition.kind)).toEqual(
      rootNodes.map((definition) => definition.kind),
    )
    renderNodes.forEach((render, index) => {
      const root = rootNodes[index]!
      expect(render.schema).toBe(root.schema)
      expect(render.schemaVersion).toBe(root.schemaVersion)
      expect(render.defaults()).toEqual(root.defaults() as never)
      expect(Object.keys(render.migrate ?? {})).toEqual(Object.keys(root.migrate ?? {}))
      expect(Object.keys(render.capabilities ?? {})).toEqual(
        Object.keys(root.capabilities ?? {}),
      )
      expect(render.renderer).toBeDefined()
    })
  })

  test('carries no editing contributions', () => {
    for (const definition of renderNodes) {
      const present = EDIT_ONLY_FIELDS.filter((field) => field in definition)
      expect({ kind: definition.kind, present }).toEqual({ kind: definition.kind, present: [] })
      expect(definition.capabilities ?? {}).not.toHaveProperty('paint')
    }
  })

  test('the root definitions still carry their editing contributions', () => {
    for (const definition of rootNodes) {
      expect(definition.snapProfile).toBeDefined()
    }
    const road = rootNodes.find((definition) => definition.kind === 'streetscape:road-network')!
    expect(road.tool).toBeDefined()
    expect(road.quickActions).toBeDefined()
    expect(road.floorplanAffordances).toBeDefined()
  })
})
