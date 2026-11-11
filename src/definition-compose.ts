/**
 * A kind's full definition is its render half (`*-definition.render.ts`: schema,
 * migrations, geometry, renderer, read-only floor plan) plus its edit contribution
 * (`*-definition.edit.ts`: placement, preview, handles, parameters, plan editing).
 * `./render` registers the render halves alone; the root export composes both.
 *
 * Top-level fields of the edit half replace the render half's (an editor renderer
 * wrapper replaces the read-only renderer); capabilities merge once.
 */
export function composeDefinition<Render extends object, Edit extends object>(
  render: Render,
  edit: Edit,
): Render & Edit {
  const composed = { ...render, ...edit }
  const renderCapabilities = (render as { capabilities?: object }).capabilities
  const editCapabilities = (edit as { capabilities?: object }).capabilities
  if (renderCapabilities && editCapabilities) {
    ;(composed as { capabilities?: object }).capabilities = {
      ...renderCapabilities,
      ...editCapabilities,
    }
  }
  return composed
}
