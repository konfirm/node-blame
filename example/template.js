var blame = require('../lib/blame'),  //  you'd use require('blame')
	colors = require('colors'),
	stack = blame.stack('Hello world'),
	template;

/*
 The default template for results looks like this:
  {@message:Message: {message}@}{%stack:\n\t* {@call:{call} [@}{file} @{line}:{column}{@call:]@}%}
 Basically there are four possible types of replacements
  {var} - a replacement, look for a property named 'var' in the result/item and replace the placeholder with its value
  {@var:content@} - a conditional block, should 'var' be a property in the result/item and not be `null`,
                    keep the 'content', otherwise remove it
  {%var:\n-{value}%} - a subtemplate, should 'var' be a property in the result/item and be:
                       an array: apply the template ('\n-{value}') to every item in the array
                       anything else: apply the template ('\n-{value}') to the value of the 'var' property
  {#repeat:amount#} - a simple repeater, it displays the value of 'repeat' 'amount' times
                      e.g. '{#-:10#}' produces '----------'
*/

//  If you'd like to color the template:
template = '{@message:Message: ' + colors.red('{message}') + '@}{%stack:\n\t* {@call:' + colors.yellow('{call}') + ' [@}' + colors.cyan('{file}') + ' @{line}:{column}{@call:]@}%}';
console.log(stack.toString(template));
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
template = '{%stack:\n{@call:{call} [@}{file} @{line}:{column}{@call:]@}%}';
console.log(stack.first(3).toString(template));
/*
Object.<anonymous> [/path/to/example/template.js @3:16]
Module._compile [module.js @456:26]
Object.Module._extensions..js [module.js @474:10]
*/

//  or, the same style but colored
template = '{%stack:\n{@call:' + colors.green('{call}') + ' [@}' + colors.yellow('{file}') + ' @' + colors.cyan('{line}') + ':' + '{column}'.blue + '{@call:]@}%}';
console.log(stack.first(3).toString(template));
/* (some imagination required for this "colorized" comment)
Object.<anonymous> [/path/to/example/template.js @3:16]
Module._compile [module.js @456:26]
Object.Module._extensions..js [module.js @474:10]
*/
