# Templating
As of version 1.3.0 Blame has very basic support for string templating, it provides the implementer a convenient way to alter the display of errors with their tracing.

## Template syntax
There are three basic template basics, combined these let you craft pretty elaborate configuration of how Errors are displayed (or logged)

### Placeholder variables
The most basic of template options are the placeholder variables, using a familiar `{variable}` syntax.
```js
var blame = require('blame'),
	trace = blame.trace('Hello world');

console.log(trace.toString('{message}'));
```
This example will print `Hello world` to the console.

### Conditions
As some of the internal variables are not always available (looking at you '{call}'), you may choose to apply a different formatting when a variable is available (_available_ being *exists* and *not null*).
To facilitate this, there is the 'conditional', it has the following synatx:
`{@<variable>:<content>@}`

Where `<variable>` is the variable to exist and contain a value other than `null`. If `<variable>` is available, it gets replaced with its contents (`<content>` in the above example). The content provided may contains additional placeholders on its own.
```js
var blame = require('blame'),
	trace = blame.trace('Hello world'),
	item = trace.item();

console.log(item.toString('{message}\n\t#{index} {@call:{call} [@}{file}:{line}:{column}{@call:]@}'));
```
This example will print something like the following to the console:
```
Hello world
	#1 /path/to/file.js:43:21
```

### Subtemplates
Last but not least there is the option to provide templates to nested items, such as the individual items in the trace trace.
If a subtemplate encounters an array, the content of the subtemplate will be applied to each item in the array, for anything other than an array (and other than `null`) the subtemplate will be applied to its value.
The syntax is `{%<variable>:<content>%}`
```js
var blame = require('blame'),
	trace = blame.trace('Hello world');

console.log(trace.toString('Error: {message}{%trace:\n\tat {@call:{call} [@}{file}:{line}:{column}{@call:]@}%}'));
```
This example will print a very familiar format (pretty much like the normal Error stack trace), for example:
```
Error: Hello world
	- /path/to/file.js:43:21
	- Object.<anonymous> [/path/to/other/file.js:32:1]
	- etc..
```

If you ever need to use subtemplates within subtemplate (for example [when using context lines](#lines)) you need to indicate it being a nested subtemplate by using a syntax like `{!%...%!}`, the exclamation marks help us to keep the pattern matching within the template function to a minimum and helps to indicate something special is happening in the template.
(For those of you who recognize the `!` trick, yes we did the same thing for the original template engine in Konsolidate - our PHP framework)

## Available variables
### `BlameResult`
BlameResult objects (obtained via `blame.trace()`), have the follwing variables available for use in templates:
- `message` - The Error/Blame message (e.g. `'Message: {message}'`)
- `trace` - The stack trace array (e.g. `{%trace:\n- {file}:{line}%}`)

### `BlameItem`
BlameItem objects (a single item in the trace, for example obtained via `blame.trace().item()`) have the following variables available:
- `message` - The Error/Blame message (e.g. `'Message: {message}'`), *note* that this is the exact same message as provided by `BlameResult`
- `index` - The position of the item in the *original* stack trace, *note* that `index` does not change when the stack is reduced
- `order` - The position in the order of the chronological call stack of the item, *note* that `order` does not change when the stack is reduced
- `call` - The function/method of the item in the stack (e.g. `'{call}'`, *note* that `call` may be `null` and as such will be replaced with an empty value (tip: use the conditionals to render `{call}`)
- `file` - The filename of the item in the stack (e.g. `'{file}'`)
- `short` - The filename with the process' current working directory removed (e.g. `'{short}'`)
- `line` - The filename of the item in the stack (e.g. `'{line}'`)
- `column` - The filename of the item in the stack (e.g. `'{column}'`)
- `context` - An excerpt from the source code responsible for the invocation of the stack item (e.g. `'{context}'`)

#### `context`
Context by itself also uses a template, even though it was not originally intended to be included in a template you can still specify one. This does - however - require a wee bit more or your wit to implement, because in order to keep our mini-template really simple _and_ still prevent greedy pattern matching, you need to tell the template you will be using a substructure.

If you want to include the `context` in your output, you would use the `'{context}'` placeholder, but this will give you the default output, when you want to have a bit more control, you need to specify a subtemplate, in order to use this you would first need to know which variables are available inside the `context`, these are:
- `file` - The filename from which the context is show (e.g. `'{file}'`)
- `short` - The short filename from which the context is show (e.g. `'{short}'`)
- `start` - The starting linenumber of the context is show (e.g. `'{start}'`)
- `end` - The ending linenumber of the context is show (e.g. `'{end}'`)
- `lines` - An array containing the individual lines of source code and their line numbers

##### `lines`
Lines is where it may get a wee bit more complicated, as each line is represented by an object you'd want to iterate over this array using a subtemplate, but in order to define this subtemplate you'd need to define a subtemplate within a subtemplate using the `{%...%}`-syntax, this would add a level of complexity to the simple template engine we do not want.
We added `!` to ensure the matching is as easy a possible, so if you need a subtemplate within a subtemplate you use a syntax like: `{!%...%!}`, for example:
```js
var template = 'message: {message}\ncall: {call}\ncontext: {%context:{file}:{start}-{end})\n{!%lines:\n{line}  {source}%!}%}';
```

Here you can see the `{!%lines:\n{line}  {source}%!}` being a part of the `{%context:...%}`-subtemplate.
That leaves us with telling about the available variables withing the `context.lines` array:
- `line` - the line number (e.g. `'{line}'`)
- `source` - the actual source (e.g. `'{source}'`)


## Tips and tricks
### Colorizing output
The main reason to have the flexible templating is to provide a consistent and re-usable way of "personalizing" errors in your projects, it seems rather popular to colorize the output, this is now possible using templates.
Though colorized template will work with any color library (or adding the appropriate escape tokens yourself), we provide an example based on the popular `colors` (`npm install colors --save`).
```js
var blame = require('blame'),
	colors = require('colors'),
	template = [
		'{@message:Message: ',
		'{message}'.red, '@}',
		'{%trace:\n\t* {index}{@call:',
		'{call}'.yellow, ' [@}',
		'{file}'.cyan,
		' @{line}:{column}{@call:]@}%}'
	].join(''),
	trace = blame.trace('Hello world');

console.log(trace.toString(template));
```
