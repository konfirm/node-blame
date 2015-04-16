# node-blame
Easy stack traces

## Install

```
$ npm install --save blame
```

## Usage
```js
var blame = require('blame'),
	stack = blame.stack();

//  stack contains the full stack-trace leading up to the invocation of `blame.stack()`
```

## API
### `blame.stack([Error])`
Create a JSON-like structure from a given or created error-stack and wraps it inside a `BlameResult` object.


### `BlameResult`

#### `.message` (`string`)
The message taken from the Error, if no Error was provided to `blame.stack` this will contain an empty string.

#### `.trace` (`array`)
The stack-trace of the error/backtrace, the format is:
```json
[{
	"file": "/path/to/file.js",
	"line": 1234,
	"column": 12,
	"call": "Object.functionName"
},
...
]
```
(`call` may be null if the trace was not called from within a function scope)

#### `.after(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items after given pattern (like `from` but *excluding* the match(es)).
- `pattern` must be one of: `string`, `RegExp` (will be case to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.from(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items from given pattern (like `after` but *including* the match(es)).
- `pattern` must be one of: `string`, `RegExp` (will be case to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.before(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items before given pattern (like `until` but *excluding* the match(es)).
- `pattern` must be one of: `string`, `RegExp` (will be case to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.until(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items until given pattern (like `before` but *including* the match(es)).
- `pattern` must be one of: `string`, `RegExp` (will be case to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.first([max])` (`BlameResult`)
Create a new `BlameResult` containing only the first N items
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.last([max])` (`BlameResult`)
Create a new `BlameResult` containing only the last N items
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.steps` (`array`)
This (excluded from enumeration) property contains all the steps taken to have the `.trace`-items, every time one of the `BlameResult` methods are called as new `BlameResult` is created with a new step containing the arguments used to create the new result.
Each step is in the format:
```json
{"<after|from|before|until>": <pattern>, "max": <max>}
// or
{"<first|last>: <max>}"}
```

## License
GPLv2 © [Konfirm](https://konfirm.eu)
