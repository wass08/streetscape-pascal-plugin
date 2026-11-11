# Pascal Streetscape Plugin

Procedural roads, street lighting, signs, utilities and roadside infrastructure
for the Pascal editor.

```bash
bun install
bun run check-types
bun test
bun run check:render
```

## Read-only viewers

A viewer that only displays saved scenes can load the render-only entry instead
of the root plugin. It registers the same kinds, schemas, versions, defaults and
migrations, with their renderers, geometry, materials and read-only floor plans,
and does not import `@pascal-app/editor`:

```ts
import { streetscapeLabRenderPlugin } from '@pascal-app/plugin-streetscape-lab/render'

await loadPlugin(streetscapeLabRenderPlugin)
```

Placement tools, previews, handles, parameters, plan editing, quick actions, the
host panel and the scene normalization the editor runs are only in the root
export. Load one entry or the other, not both. `bun run check:render` bundles
`./render` and fails if it reaches `@pascal-app/editor` or `next`.
