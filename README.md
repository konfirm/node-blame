[![npm version](https://badge.fury.io/js/blame.svg)](http://badge.fury.io/js/blame)
[![travis ci](https://api.travis-ci.org/konfirm/node-blame.svg)](https://travis-ci.org/konfirm/node-blame)
[![Coverage Status](https://coveralls.io/repos/konfirm/node-blame/badge.svg)](https://coveralls.io/r/konfirm/node-blame)
[![dependencies](https://david-dm.org/konfirm/node-blame.svg)](https://david-dm.org/konfirm/node-blame#info=dependencies)
[![dev-dependencies](https://david-dm.org/konfirm/node-blame/dev-status.svg)](https://david-dm.org/konfirm/node-blame#info=devDependencies)
[![Codacy Badge](https://www.codacy.com/project/badge/a5861841f2ad4b70af6e72273f08064c)](https://www.codacy.com/app/rogier/node-blame)

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

### `Error.stackTraceLimit`
By default there is a 10 line cap on the stack traces within node.js and io.js, `Blame` does not meddle with this setting by itself as it is widely considered a good default setting (and it truly is).
If you feel this is getting in the way of your debugging/reporting, feel free to set the limit to your liking, for example `Error.stackTraceLimit = Infinity` will never cap the stack trace.

**Note** that changing this setting has to be done very early on in your application.

## API
### `blame.stack([Error])`
Create a JSON-like structure from a given or created error-stack and wraps it inside a `BlameResult` object.


### `BlameResult`
The `BlameResult` contains all of the data found in the error stack and provides several methods to quickly reduce the stack trace, _note that all of these methods work with the obtained stack trace order_, this means that the items are sorted top down, e.g. `first` refers to the first item on the list of items in the stack trace (meaning this was the final call) before the Error was created and/or `blame.trace()` was invoked.

#### `.message` (`string`)
The message taken from the Error, if no Error was provided to `blame.stack` this will contain an empty string.

#### `.trace` (`array`)
As of version 1.5.0 The `trace` method is deprecated (you'll receive a proper notice for this), please use the `.stack` method.

#### `.stack` (`array`)
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

#### `.filter(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items which match given pattern
- `pattern` must be one of: `string`, `RegExp` (will be cast to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.after(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items after given pattern (like `from` but *excluding* the match(es)).
- `pattern` must be one of: `string`, `RegExp` (will be cast to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.from(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items from given pattern (like `after` but *including* the match(es)).
- `pattern` must be one of: `string`, `RegExp` (will be cast to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.before(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items before given pattern (like `until` but *excluding* the match(es)).
- `pattern` must be one of: `string`, `RegExp` (will be cast to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.until(pattern [, max])` (`BlameResult`)
Create a new `BlameResult` containing only the items until given pattern (like `before` but *including* the match(es)).
- `pattern` must be one of: `string`, `RegExp` (will be cast to `RegExp` if it is not)
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.first([max])` (`BlameResult`)
Create a new `BlameResult` containing only the first N items
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.last([max])` (`BlameResult`)
Create a new `BlameResult` containing only the last N items
- `max` is an _optional_ limit of the number of items in the returned BlameResult

#### `.item([index])` (`ResultItem`)
Obtain a single item from the `BlameResult` trace.
The argument may be any valid index of the stack trace `array`, but also:
- `false`, `null`, `0` (and ommitting) > first item (top stack trace entry)
- `true` > last item (bottom stack trace entry)

#### `.steps` (`array`)
This (excluded from enumeration) property contains all the steps taken to have the `.trace`-items, every time one of the `BlameResult` methods are called as new `BlameResult` is created with a new step containing the arguments used to create the new result.
Each step is in the format:
```json
{"<after|from|before|until>": <pattern>, "max": <max>}
// or
{"<first|last>: <max>}"}
```

#### `.toString` (`string`)
Both `BlameResult` and `BlameItem` now support the `toString` method, the format is slightly more compact than a `new Error().stack` call.

`BlameResult`
```
console.log(String(blame.trace()));

Message: <message>
	* <file> @<line>:<column>
	* <call> [<file> @<line>:<column>]
```

`BlameItem`
```
console.log(String(blame.trace().item()));

<message>
	<file> @<line>:<column>
or
<message>
	<call> [<file> @<line>:<column>]
```

If you would like to add some flair to the stack traces, all of the templates used are fully customizable, please refer to the [templating tutorial](docs/templating.md) and the [templating example](example/template.js).


### `BlameItem`
#### `.context([before [, after]])` (`string`)
Provide a excerpt from the file with a simple pointer to the line which was responsible for the invocation of the stack item
- if `before` is ommited or its numeric value resolves as `false`-ish, it will default to 3
- if `after` is ommited or its numeric value resolves as `false`-ish, it will default to the numeric value of `before` or else 3

(Yes, this does mean that there is a minimum of 3 lines total)


## License
GPLv2 © [Konfirm](https://konfirm.eu)
