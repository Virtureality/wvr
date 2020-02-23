# source-map-fixtures

Simple test fixtures backed by inline source maps and source map files. Can be
used to test code that needs to resolve or apply source maps.

## Requirements

The fixtures should work in Node.js 0.10 and up. Generating fixtures requires
some ES2015 features, Node.js 5 or up is recommended.

## Installation

```
npm install --save-dev source-map-fixtures
```

Source maps will only change between major versions. New fixtures or other
features may be added in minor releases.

## Available fixtures

### `branching`

See `src/branching.js`. Exports a `run(value)` function which returns `true` if
`value === 42`, else returns `undefined`.

### `simple`

See `src/simple.js`. Exports a `run()` function which returns `42`.

### `throws`

See `src/throws.js`. Exports a `run()` function which returns throws an error.

### `bundle`

See `src/bundle.js`. Bundled version of the above fixtures, exports
`branching(value)`, `simple()` etc.

## Available source map types

### `inline`

The source map is included inside the fixture source.

### `map-file`

The source map is provided as a separate file, referenced by the fixture source.

### `none`

No source map is provided.

## API

```js
const fixtures = require('source-map-fixtures')
```

Use `fixtures.inline(name)`, `fixtures.mapFile(name)` and `fixtures.none(name)`,
where `name` is one of `branching`, `simple`, etc. This returns a `fixture`
object:


```js
const fixture = require('source-map-fixtures').inline('simple')
```

### `fixture.name`

Provides the name of the fixture.

### `fixture.type`

Provides the source map type of the fixture (`inline`, `map-file`, `none`).

### `fixture.file`

Provides the full path to the fixture file.

### `fixture.sourceFile`

Provides the full path to the fixture's source file.

### `fixture.require()`

Requires the fixture file (returns it as a module).

### `fixture.contentSync()`

Synchronously reads the fixture file's content from disk.

### `fixture.sourceContentSync()`

Synchronously reads the fixture's source's content from disk.

## Generating fixtures

Edit or add new source files in the `src/` directory. Please update this readme
as appropriate. Then run the following to generate the fixtures:

```
npm run generate
```

Commit changes and open a PR!

Please note that any changes to the source maps are considered breaking.
