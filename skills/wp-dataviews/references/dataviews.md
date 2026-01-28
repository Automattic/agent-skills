# @wordpress/dataviews reference

## Table of contents

- Installation
- Components overview
- DataViews
  - Usage
  - Props
  - View object
  - Layout types and layout props
  - Composition modes
  - Accessibility notes
- DataViewsPicker
  - Usage
  - Differences vs DataViews
  - Props
- DataForm
  - Usage
  - Props
  - validity
- Utilities
  - filterSortAndPaginate
  - useFormValidity
- Actions API
- Fields API
- Form Field API

## Installation

Install the module:

```bash
npm install @wordpress/dataviews --save
```

If you are building scripts with `@wordpress/scripts` (plugin or theme), import from `@wordpress/dataviews/wp` instead of `@wordpress/dataviews`.

## Components overview

This package provides three React components and a few utilities for working with datasets:

- DataViews: render lists with layouts (table, grid, list), search, filters, sorting, and pagination.
- DataViewsPicker: render datasets optimized for selection or picking items.
- DataForm: edit the items of a dataset.

## DataViews

### Usage

```jsx
import { DataViews } from '@wordpress/dataviews';

const Example = () => {
    const onChangeView = () => {
        /* React to user changes. */
    };

    return (
        <DataViews
            data={ data }
            fields={ fields }
            view={ view }
            onChangeView={ onChangeView }
            defaultLayouts={ defaultLayouts }
            actions={ actions }
            paginationInfo={ paginationInfo }
        />
    );
};
```

DataViews calls `onChangeView` whenever the user interacts (search, filters, sort, pagination, layout switch). You must react to the new view by updating the data source (server-side query or client-side filtering).

### Props

- `data: Object[]` - One-dimensional array of items. Each item should have a unique id.
- `getItemId: function` - Optional. Return a unique id when items do not have `id`.
- `getItemLevel: function` - Optional. Return hierarchical level when `view.showLevels` is true.
- `fields: Object[]` - Field definitions. See Fields API.
- `view: Object` - View configuration. See View object.
- `onChangeView: function` - Receives the new view config.
- `actions: Object[]` - Action definitions. See Actions API.
- `paginationInfo: Object` - Contains `totalItems`, `totalPages`, and optional `infiniteScrollHandler`.
- `search: boolean` - Enable search input. Default true.
- `searchLabel: string` - Text for search input. Default "Search".
- `isLoading: boolean` - Loading flag. Default false.
- `defaultLayouts: Record<string, view>` - Limit layouts and apply defaults. See Layout types.
- `selection: string[]` - Selected item ids (controlled).
- `onChangeSelection: function` - Called with updated selection (controlled).
- `isItemClickable: function` - Determine if primary/media field is clickable.
- `onClickItem: function` - Called when an item is clicked.
- `renderItemLink: React.ComponentType` - Render clickable items; integrates with routers.
- `header: React component` - Rendered next to view config button.
- `config: { perPageSizes: number[] }` - Control per-page sizes (2-6 values).
- `empty: React node` - Render when `data` is empty.
- `children: React node` - Enable free composition mode.

### View object

Example:

```js
const view = {
    type: 'table',
    search: '',
    filters: [
        { field: 'author', operator: 'is', value: 2 },
        { field: 'status', operator: 'isAny', value: [ 'publish', 'draft' ] },
    ],
    page: 1,
    perPage: 5,
    sort: {
        field: 'date',
        direction: 'desc',
    },
    titleField: 'title',
    fields: [ 'author', 'status' ],
    layout: {},
};
```

Properties:

- `type`: layout type, one of `table`, `grid`, `list`, `activity`.
- `search`: text search applied to the dataset.
- `filters`: list of filter objects `{ field, operator, value, isLocked? }`.
- `perPage`: number of records per page.
- `page`: current page number.
- `sort`: `{ field, direction }`, with `direction` as `asc` or `desc`.
- `titleField`: field id for title display.
- `mediaField`: field id for media display.
- `descriptionField`: field id for description display.
- `showTitle`, `showMedia`, `showDescription`: booleans, default true.
- `showLevels`: boolean to display hierarchical levels (requires `getItemLevel`).
- `groupBy`: `{ field, direction }`, direction default `asc`.
- `fields`: list of visible field ids in order.
- `layout`: layout-specific config (see Layout types).

### Layout types and layout props

The `layout` object supports different properties depending on layout type:

| Prop            | table | pickerTable | grid | pickerGrid | list | activity |
|----------------|:-----:|:-----------:|:----:|:----------:|:----:|:--------:|
| density        |   x   |      x      |      |            |  x   |    x     |
| enableMoving   |   x   |      x      |      |            |      |          |
| styles         |   x   |      x      |      |            |      |          |
| badgeFields    |       |             |  x   |     x      |      |          |
| previewSize    |       |             |  x   |     x      |      |          |

Table and pickerTable:

- `density`: `comfortable`, `balanced`, or `compact`.
- `enableMoving`: show controls to move columns.
- `styles`: width, maxWidth, minWidth, align for each field.

Alignment guideline:
- Right-align quantitative values (numbers, currency, percentages).
- Left-align text, labels, and dates.

Grid and pickerGrid:

- `badgeFields`: list of field ids rendered as badges without labels.
- `previewSize`: number representing preview size.

List:

- No layout-specific options.

Activity:

- `density`: `comfortable`, `balanced`, or `compact`.

### Composition modes

- Controlled (default): DataViews renders search, filters, layout, actions, pagination.
- Free composition: if `children` are provided, DataViews only provides context; use subcomponents to build a custom layout.

Available subcomponents:

- `DataViews.Search`
- `DataViews.FiltersToggle`
- `DataViews.FiltersToggled`
- `DataViews.Filters`
- `DataViews.Layout`
- `DataViews.LayoutSwitcher`
- `DataViews.Pagination`
- `DataViews.BulkActionToolbar`
- `DataViews.ViewConfig`

Example:

```jsx
import DataViews from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';

const CustomLayout = () => {
    return (
        <DataViews
            data={ data }
            fields={ fields }
            view={ view }
            onChangeView={ onChangeView }
            paginationInfo={ paginationInfo }
            defaultLayouts={ { table: {} } }
        >
            <h1>{ __( 'Free composition' ) }</h1>
            <DataViews.Search />
            <DataViews.FiltersToggle />
            <DataViews.FiltersToggled />
            <DataViews.Layout />
            <DataViews.Pagination />
        </DataViews>
    );
};
```

### Accessibility notes

- Subcomponents handle keyboard/focus/roles internally.
- Use `FiltersToggle` and `Filters` together for accessible filter controls.
- Custom layout structure affects overall accessibility; be deliberate about headings and grouping.

## DataViewsPicker

### Usage

```jsx
const Example = () => {
    const [ selection, setSelection ] = useState( [] );

    const actions = [
        {
            id: 'confirm',
            label: 'Confirm',
            isPrimary: true,
            supportsBulk: true,
            callback() {
                window.alert( selection.join( ', ' ) );
            },
        },
        {
            id: 'cancel',
            label: 'Cancel',
            supportsBulk: true,
            callback() {
                setSelection( [] );
            },
        },
    ];

    return (
        <DataViewsPicker
            actions={ actions }
            data={ data }
            fields={ fields }
            view={ view }
            onChangeView={ onChangeView }
            defaultLayouts={ defaultLayouts }
            paginationInfo={ paginationInfo }
            selection={ selection }
            onChangeSelection={ setSelection }
        />
    );
};
```

### Differences vs DataViews

- Uses listbox/option roles.
- Multi-selection does not require ctrl/cmd; click toggles selection.
- Actions render in footer as text buttons.
- Selection persists across paginated pages.
- Only `pickerGrid` and `pickerTable` layouts are supported.
- Requires controlled selection (`selection` + `onChangeSelection`).
- Only callback actions are supported (no `RenderModal`).
- `isEligible` is unsupported.
- Item click props (`isItemClickable`, `renderItemLink`, `onClickItem`) are unsupported.

### Props

Most props match DataViews, with differences:

- `defaultLayouts`: only `pickerGrid` and `pickerTable`.
- `selection` and `onChangeSelection`: required.
- `itemListLabel`: optional aria-label for listbox when there is no heading.

Unsupported properties:

- `isItemClickable`
- `renderItemLink`
- `onClickItem`
- `getItemLevel`
- `header`

## DataForm

### Usage

```jsx
const Example = () => {
    return (
        <DataForm
            data={ data }
            fields={ fields }
            form={ form }
            onChange={ onChange }
        />
    );
};
```

### Props

- `data: Object` - Single item to edit.
- `fields: Object[]` - Field definitions. See Fields API.
- `form: Object` - Form layout and field grouping. See Form Field API.
- `onChange: function` - Receives partial edits.
- `validity: Object` - Validation status for fields (optional).

Example `form`:

```js
const form = {
    layout: {
        type: 'panel',
        labelPosition: 'side',
    },
    fields: [
        'title',
        'data',
        {
            id: 'status',
            label: 'Status & Visibility',
            children: [ 'status', 'password' ],
        },
        {
            id: 'featured_media',
            layout: 'regular',
        },
    ],
};
```

### validity

`validity` is an object keyed by field id. Each key can contain rule status for `required`, `elements`, or `custom`.

Example:

```json
{
    "title": {
        "required": {
            "type": "invalid"
        }
    },
    "author": {
        "elements": {
            "type": "invalid",
            "message": "Value must be one of the elements."
        }
    },
    "publisher": {
        "custom": {
            "type": "validating",
            "message": "Validating..."
        }
    },
    "isbn": {
        "custom": {
            "type": "valid",
            "message": "Valid."
        }
    }
}
```

Rule types:

- `validating`: value is being validated.
- `invalid`: value is invalid.
- `valid`: value became valid after being invalid.

## Utilities

### filterSortAndPaginate

Apply view config client-side.

Parameters:

- `data`: dataset array
- `view`: view config
- `fields`: fields config

Returns:

- `data`: filtered/sorted/paginated dataset
- `paginationInfo`: `{ totalItems, totalPages }`

### useFormValidity

Hook to determine form validity.

Parameters:

- `item`: item being edited
- `fields`: field config
- `form`: form config

Returns:

- `isValid: boolean`
- `validity: object` (see validity section)

## Actions API

- `id: string` - Required unique identifier.
- `label: string | function` - Required label or label generator.
- `isPrimary: boolean` - Optional; show inline as primary.
- `icon: SVG element` - Required for primary actions.
- `isEligible: function` - Optional; filter eligible items.
- `supportsBulk: boolean` - Optional; allow bulk actions.
- `disabled: boolean` - Optional; default false.
- `context: string` - Optional; `list` or `single`.
- `callback: function` - Optional; required if `RenderModal` is not used.
- `RenderModal: ReactElement` - Optional; modal UI instead of callback.
- `hideModalHeader: boolean` - Optional.
- `modalHeader: string | function` - Optional header text.
- `modalSize: string` - Optional: `small`, `medium`, `large`, `fill`.
- `modalFocusOnMount: boolean | string` - Optional: `true`, `false`, `firstElement`, `firstContentElement`.

Example (callback):

```jsx
{
    id: 'view',
    label: 'View',
    isPrimary: true,
    icon: <Icon icon={ view } />,
    isEligible: ( item ) => item.status === 'published',
    callback: ( items ) => {
        console.log( 'Viewing item:', items[ 0 ] );
    },
}
```

Example (RenderModal):

```jsx
{
    RenderModal: ( { items, closeModal, onActionPerformed } ) => (
        <div>
            <p>Are you sure you want to delete { items.length } item(s)?</p>
            <Button
                variant="primary"
                onClick={ () => {
                    console.log( 'Deleting items:', items );
                    onActionPerformed();
                    closeModal();
                } }
            >
                Confirm Delete
            </Button>
        </div>
    ),
}
```

## Fields API

- `id: string` - Required identifier.
- `type: string` - Optional: `text`, `integer`, `number`, `datetime`, `date`, `media`, `boolean`, `email`, `password`, `telephone`, `color`, `url`, `array`.
- `label: string` - Optional label (defaults to id).
- `header: React element` - Optional header element.
- `description: string` - Optional description for Edit mode.
- `placeholder: string` - Optional placeholder for Edit mode.
- `getValue: function` - Optional custom field getter.
- `setValue: function` - Optional custom field setter.
- `getValueFormatted: function` - Optional formatted getter.
- `render: React component` - Optional render override.
- `Edit: string | object | React component` - Optional edit control.
- `readOnly: boolean` - Optional. Default false.
- `sort: function` - Optional custom sorter.
- `isValid: object` - Optional validation rules (`required`, `elements`, `custom`).
- `isVisible: function` - Optional visibility function.
- `enableSorting: boolean` - Optional, default true.
- `enableHiding: boolean` - Optional, default true.
- `enableGlobalSearch: boolean` - Optional, default false.
- `elements: array` - Optional list of { value, label, description? }.
- `getElements: async function` - Optional lazy elements loader.
- `filterBy: object | boolean` - Optional filter configuration or false to disable.
- `format: object` - Optional display format for date/number/integer.

### getValue and setValue

Default behavior uses dot-notation ids for nested access. Custom getters/setters allow transformations.

Nested access example:

```js
{
    id: 'user.profile.name',
    type: 'text',
    label: 'User Name'
}
```

Custom transformation example:

```js
{
    id: 'notifications',
    type: 'boolean',
    label: 'Notifications',
    Edit: 'radio',
    elements: [
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled' }
    ],
    getValue: ( { item } ) =>
        item.user.preferences.notifications === true ? 'enabled' : 'disabled',
    setValue: ( { value } ) => ( {
        user: {
            preferences: { notifications: value === 'enabled' }
        }
    } )
}
```

### getValueFormatted

Format values for display; defaults are provided for types. Example:

```js
{
    id: 'price',
    type: 'number',
    label: 'Price',
    getValueFormatted: ( { item, field } ) => {
        const value = field.getValue( { item } );
        if ( value === null || value === undefined ) {
            return '';
        }

        return `$${ value.toFixed( field.format.decimals ) }`;
    }
}
```

### Edit

Provide a built-in control name, configuration object, or custom React component.

Built-in controls:

- array, checkbox, color, date, datetime, email, integer, number, password,
  radio, select, telephone, text, textarea, toggle, toggleGroup, url.

Text area config example:

```js
{
    id: 'description',
    type: 'text',
    label: 'Description',
    Edit: {
        control: 'textarea',
        rows: 5
    }
}
```

Text control config example:

```js
{
    id: 'title',
    type: 'text',
    label: 'Title',
    Edit: {
        control: 'text',
        prefix: ReactComponent,
        suffix: ReactComponent,
    }
}
```

Custom Edit example:

```jsx
{
    id: 'time',
    type: 'datetime',
    label: 'Time of day',
    Edit: ( {
        data,
        field,
        onChange,
        hideLabelFromVision,
        validity,
        config,
    } ) => {
        const value = field.getValue( { item: data } );

        return (
            <CustomTimePicker
                value={ value }
                onChange={ onChange }
                hideLabelFromVision
            />
        );
    }
}
```

### isValid

Validation rules:

- `required: boolean`
- `elements: boolean`
- `custom: function` returning string error or null

Example:

```js
{
    id: 'itemsSold',
    type: 'integer',
    label: 'Items sold',
    isValid: {
        required: true,
        custom: ( item, field ) => {
            if ( field.getValue( { item } ) % 2 !== 0 ) {
                return 'Integer must be an even number.';
            }

            return null;
        }
    }
}
```

### filterBy

Set to false to opt out of filtering. Otherwise configure operators and primary filters.

Example (primary filter):

```js
{
    id: 'title',
    type: 'text',
    label: 'Title',
    filterBy: {
        isPrimary: true
    }
}
```

Example operators:

- Single selection: `is`, `isNot`, `on`, `notOn`, `lessThan`, `greaterThan`, `lessThanOrEqual`,
  `greaterThanOrEqual`, `before`, `after`, `beforeInc`, `afterInc`, `contains`, `notContains`, `startsWith`.
- Multi-selection: `isAny`, `isNone`, `isAll`.

If any single-selection operator is present, multi-selection operators are discarded.

Operator table:

| Operator | Description | Example |
|---|---|---|
| after | Result is after a given date | Date is after: 2024-01-01 |
| afterInc | Result is after a date, including it | Date is on or after: 2024-01-01 |
| before | Result is before a date | Date is before: 2024-01-01 |
| beforeInc | Result is before a date, including it | Date is on or before: 2024-01-01 |
| between | Result is between two values | Count between (inc): 10 and 180 |
| contains | Result contains substring | Title contains: Mars |
| greaterThan | Result is numerically greater than | Age is greater than: 65 |
| greaterThanOrEqual | Result is numerically greater than or equal to | Age is greater than or equal to: 65 |
| inThePast | Result is within last N units | Orders in the past: 7 days |
| isAll | Result includes all values in list | Category includes all: Book, Review |
| isAny | Result includes some values in list | Author includes: Admin, Editor |
| isNone | Result excludes values in list | Author excludes: Admin, Editor |
| is | Result is equal to a single value | Author is: Admin |
| isNot | Result is not equal to a single value | Author is not: Admin |
| lessThan | Result is numerically less than | Age is less than: 18 |
| lessThanOrEqual | Result is numerically less than or equal to | Age is less than or equal to: 18 |
| notContains | Result does not contain substring | Description does not contain: photo |
| notOn | Result is not on date | Date is not: 2024-01-01 |
| on | Result is on date | Date is: 2024-01-01 |
| over | Result is older than N units | Orders over: 7 days ago |
| startsWith | Result starts with substring | Title starts with: Mar |

Valid operators per field type:

- array: `isAny`, `isNone`, `isAll`
- boolean: `is`, `isNot`
- color: `is`, `isNot`, `isAny`, `isNone`
- date: `on`, `notOn`, `before`, `beforeInc`, `after`, `afterInc`, `inThePast`, `over`, `between`
- datetime: `on`, `notOn`, `before`, `beforeInc`, `after`, `afterInc`, `inThePast`, `over`
- email: `is`, `isNot`, `contains`, `notContains`, `startsWith`, `isAny`, `isNone`, `isAll`
- integer: `is`, `isNot`, `lessThan`, `greaterThan`, `lessThanOrEqual`, `greaterThanOrEqual`, `between`, `isAny`, `isNone`, `isAll`
- media: none
- number: `is`, `isNot`, `lessThan`, `greaterThan`, `lessThanOrEqual`, `greaterThanOrEqual`, `between`, `isAny`, `isNone`, `isAll`
- password: none
- text: `is`, `isNot`, `contains`, `notContains`, `startsWith`, `isAny`, `isNone`, `isAll`
- url: `is`, `isNot`, `contains`, `notContains`, `startsWith`, `isAny`, `isNone`, `isAll`
- fields with no type: any operator

### format

Format config for date, number, integer types.

Date format:

```js
{
    id: 'publishDate',
    type: 'date',
    label: 'Publish Date',
    format: {
        date: 'F j, Y',
        weekStartsOn: 1,
    },
}
```

Number format:

```js
{
    id: 'price',
    type: 'number',
    label: 'Price',
    format: {
        separatorThousand: ',',
        separatorDecimal: '.',
        decimals: 2,
    },
}
```

Integer format:

```js
{
    id: 'quantity',
    type: 'integer',
    label: 'Quantity',
    format: {
        separatorThousand: ',',
    },
}
```

## Form Field API

Form field properties:

- `id: string` - Required.
- `layout: object` - One of `regular`, `panel`, `card`, `row`.
- `label: string` - Label for combined field.
- `children: Array<string | FormField>` - Group child fields.

Layout details:

Regular:

- `type: regular`
- `labelPosition: side | top | none`

Panel:

- `type: panel`
- `labelPosition: side | top | none`
- `summary`: string or string[] (or default selection behavior)

Card:

- `type: card`
- `isOpened: boolean` (default true)
- `withHeader: boolean` (default true)
- `summary`: string | string[] | array of { id, visibility }
- `isCollapsible: boolean` (default true)

Row:

- `type: row`
- `alignment: start | center | end`

Example:

```js
{
    id: 'status',
    layout: {
        type: 'panel',
    },
    label: 'Combined Field',
    children: [ 'field1', 'field2' ],
}
```
