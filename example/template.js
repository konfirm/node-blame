var blame = require('../lib/blame'),  //  you'd use require('blame')
	colors = require('colors'),
	trace = blame.trace('Hello world'),
	template;

/*
 The default template for results looks like this:
  {@message:Message: {message}@}{%trace:\n\t* {@call:{call} [@}{file} @{line}:{column}{@call:]@}%}
 Basically there are three possible types of replacements
  {var} - a replacement, look for a property named 'var' in the result/item and replace the placeholder with its value
  {@var:content@} - a conditional block, should 'var' be a property in the result/item and not be `null`,
                    keep the 'content', otherwise remove it
  {%var:\n-{value}%} - a subtemplate, should 'var' be a property in the result/item and be:
                       an array: apply the template ('\n-{value}') to every item in the array
                       anything else: apply the template ('\n-{value}') to the value of the 'var' property
*/

//  If you'd like to color the template:
template = '{@message:Message: ' + '{message}'.red + '@}{%trace:\n\t* {@call:' + '{call}'.yellow + ' [@}' + '{file}'.cyan + ' @{line}:{column}{@call:]@}%}';
console.log(trace.toString(template));
/* (some imagination required for this "colorized" comment)
Message: Hello world
Object.<anonymous> [/path/to/example/template.js @3:16]
	* Module._compile [module.js @456:26]
	* Object.Module._extensions..js [module.js @474:10]
	* Module.load [module.js @356:32]
	* Function.Module._load [module.js @312:12]
	* Function.Module.runMain [module.js @497:10]
	* startup [node.js @119:16]
	* node.js @906:3
*/

//  If you'd like to skip the message and remove the indentation + * for the call stack
template = '{%trace:\n{@call:{call} [@}{file} @{line}:{column}{@call:]@}%}';
console.log(trace.first(3).toString(template));
/*
Object.<anonymous> [/path/to/example/template.js @3:16]
Module._compile [module.js @456:26]
Object.Module._extensions..js [module.js @474:10]
*/

//  or, the same style but colored
template = '{%trace:\n{@call:' + '{call}'.green + ' [@}' + '{file}'.yellow + ' @' + '{line}'.cyan + ':' + '{column}'.blue + '{@call:]@}%}';
console.log(trace.first(3).toString(template));
/* (some imagination required for this "colorized" comment)
Object.<anonymous> [/path/to/example/template.js @3:16]
Module._compile [module.js @456:26]
Object.Module._extensions..js [module.js @474:10]
*/
