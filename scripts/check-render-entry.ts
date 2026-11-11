// Fails when the `./render` entry can reach `@pascal-app/editor` or `next`.
//
// Bundles the entry with esbuild, following every static and lazy `import()` edge into
// node_modules, and reports each forbidden module with the import chain that reached it.
// As a self-test it first bundles the root entry, which must reach the editor; a guard
// that cannot see that import would pass anything.
//
//   bun run check:render              # self-test, then check src/render.ts
//   bun run check:render src/foo.ts   # report editor/next reach from any module

import { realpathSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, type Plugin } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const forbiddenSpecifier = /^(?:@pascal-app\/editor|next)(?:\/|$)/
const forbiddenPath = /\/node_modules\/(?:@pascal-app\/editor|next)\//

type Report = { modules: number; violations: string[] }

async function scan(entry: string): Promise<Report> {
  const importerOf = new Map<string, string>()
  const violations: string[] = []
  const display = (path: string) => relative(root, path) || path
  const chain = (importer: string) => {
    const steps: string[] = []
    for (let at: string | undefined = importer; at; at = importerOf.get(at)) {
      steps.unshift(display(at))
      if (steps.length > 40) break
    }
    return steps.join(' -> ')
  }

  const boundary: Plugin = {
    name: 'render-entry-boundary',
    setup(context) {
      context.onResolve({ filter: /.*/ }, async (args) => {
        if (args.pluginData?.checked) return undefined
        if (forbiddenSpecifier.test(args.path)) {
          violations.push(`${args.path}  (via ${chain(args.importer)})`)
          return { path: args.path, external: true }
        }
        const result = await context.resolve(args.path, {
          kind: args.kind,
          importer: args.importer,
          resolveDir: args.resolveDir,
          pluginData: { checked: true },
        })
        if (result.errors.length > 0 || result.namespace !== 'file' || !result.path) return result
        const real = realpathSync(result.path)
        if (forbiddenPath.test(real.replaceAll('\\', '/'))) {
          violations.push(`${display(real)}  (via ${chain(args.importer)})`)
          return { path: args.path, external: true }
        }
        if (args.importer && !importerOf.has(result.path)) importerOf.set(result.path, args.importer)
        return result
      })
    },
  }

  const result = await build({
    absWorkingDir: root,
    entryPoints: [resolve(root, entry)],
    bundle: true,
    write: false,
    metafile: true,
    splitting: true,
    outdir: resolve(root, '.render-check'),
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    loader: { '.webp': 'file', '.png': 'file', '.svg': 'file', '.css': 'empty' },
    logLevel: 'silent',
    plugins: [boundary],
  })
  return { modules: Object.keys(result.metafile.inputs).length, violations }
}

function print(label: string, report: Report) {
  console.log(`${label}: ${report.modules} modules, ${report.violations.length} forbidden imports`)
  for (const violation of report.violations) console.log(`  ${violation}`)
}

const probe = process.argv[2]
if (probe) {
  print(probe, await scan(probe))
  process.exit(0)
}

const rootReport = await scan('src/index.ts')
if (rootReport.violations.length === 0) {
  console.error('Self-test failed: the root entry should reach @pascal-app/editor, but no import was seen.')
  process.exit(1)
}
console.log(`Self-test: root entry reaches the editor (${rootReport.violations.length} imports), as expected.`)

const renderReport = await scan('src/render.ts')
print('src/render.ts', renderReport)
if (renderReport.violations.length > 0) {
  console.error('The ./render entry must not reach @pascal-app/editor or next.')
  process.exit(1)
}
