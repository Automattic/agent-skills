---
name: wp-dataviews
description: Use when building, configuring, or debugging @wordpress/dataviews (DataViews, DataViewsPicker, DataForm) including fields, view config (filters/search/sort/pagination), actions, selection, and free-composition layouts in WordPress plugins/themes.
compatibility: Targets WordPress 6.9+ (PHP 7.2.24+). Filesystem-based agent with bash + node.
---

# WP DataViews

## When to use

- Build or integrate DataViews, DataViewsPicker, or DataForm in a plugin or theme.
- Configure fields, filters, sorting, pagination, actions, or selection.
- Debug view config syncing, layout switching, or DataForm validation.
- Compose custom layouts with free composition subcomponents.

## Inputs required

- Component choice: DataViews, DataViewsPicker, or DataForm.
- Data shape and unique id strategy (`id` field or `getItemId`).
- Desired layouts (table, grid, list, activity) and defaults.
- Fields config (types, labels, filters, elements, Edit controls).
- Data source and whether view changes should query server or filter locally.
- Build setup (`@wordpress/scripts` or custom bundler) to choose import path.
- For pickers/forms: selection state and validation requirements.

## Procedure

1) Identify the component and import path.
   - Use `@wordpress/dataviews/wp` when building with `@wordpress/scripts`; otherwise use `@wordpress/dataviews`.
   - Choose DataViews for browsing, DataViewsPicker for selection, DataForm for editing.

2) Define data and identity.
   - Provide `data` as an array of records (or a single record for DataForm).
   - Ensure each record has a stable id; supply `getItemId` when it does not.
   - Provide `getItemLevel` and set `view.showLevels` when hierarchical display is required.

3) Build fields and form layout.
   - Define fields with `id`, `type`, `label`, and optional `render`, `Edit`, `getValue`, `elements`, `filterBy`.
   - For DataForm, define `form.layout` and `form.fields` to control grouping.
   - Use `useFormValidity` to produce `validity` when you need validation messaging.

4) Configure the view.
   - Populate `view` with `type`, `search`, `filters`, `sort`, `page`, `perPage`, `fields`, and layout options.
   - Use `defaultLayouts` to restrict layouts and set defaults (show media/title, density, etc.).
   - If data is fetched remotely, translate `view` into query args; if client-side, use `filterSortAndPaginate`.

5) Add actions and selection.
   - Provide actions with `id`, `label`, and `callback` or `RenderModal`; set `supportsBulk` for bulk selection.
   - Provide `selection` and `onChangeSelection` when controlling selection explicitly.
   - Remember: DataViews requires at least one bulk action to enable selection.

6) Handle DataViewsPicker differences.
   - Use `pickerGrid` or `pickerTable` layouts only.
   - Treat selection as controlled (always pass `selection` and `onChangeSelection`).
   - Use callback actions only (no `RenderModal` or `isEligible`).
   - Provide `itemListLabel` if there is no visible heading.

7) Use free composition when needed.
   - Pass children to `DataViews` and compose with subcomponents like `DataViews.Search`, `DataViews.Filters`, `DataViews.Layout`, and `DataViews.Pagination`.
   - Always pair `DataViews.FiltersToggle` with `DataViews.Filters`.

8) Style and accessibility.
   - Use `--wp-dataviews-color-background` for theming.
   - Preserve semantic structure; DataViewsPicker already uses listbox/option roles.

Reference detailed APIs in `skills/wp-dataviews/references/dataviews.md`.

## Verification

- View state updates reflect user actions (search, filters, sort, pagination).
- Actions fire with correct item selection (single vs bulk).
- Picker selection persists across pages and respects `supportsBulk`.
- DataForm edits and validity messages behave as expected.
- Layout switching honors `defaultLayouts` and layout-specific options.

## Failure modes / debugging

- Items not selectable: missing bulk action or `supportsBulk` not set.
- Sorting/filtering does nothing: `field` ids mismatch between `view` and `fields`.
- Wrong import path under `@wordpress/scripts`: should be `@wordpress/dataviews/wp`.
- Picker errors: using unsupported props (`RenderModal`, `isEligible`, item click props).
- Unexpected display: missing `titleField`, `mediaField`, or `descriptionField` in view.

## Escalation

- Ask for the data source and expected server query mapping if view changes require API calls.
- Ask which layout(s) should be supported and whether selection is single or bulk.
- Ask for validation rules or field formats if DataForm is involved.
