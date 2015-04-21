var blame = require('../lib/blame'),  //  you'd use require('blame')
	stack = blame.stack('Hello world');

//  the full trace, from the line which triggered the blame.trace to the end of the call stack
console.log('' + stack);
/*
Message: Hello world
	* Object.<anonymous> [/path/to/example/simple.js @2:16]
	* Module._compile [module.js @456:26]
	* Object.Module._extensions..js [module.js @474:10]
	* Module.load [module.js @356:32]
	* Function.Module._load [module.js @312:12]
	* Function.Module.runMain [module.js @497:10]
	* startup [node.js @119:16]
	* node.js @906:3
*/


//  only the line which triggered the blame.trace
console.log('' + stack.first());
/*
Message: Hello world
	* Object.<anonymous> [/path/to/example/simple.js @2:16]
*/

//  like above but now with a reduced stack trace
console.log('' + stack.first(2));
/*
Message: Hello world
	* Object.<anonymous> [/path/to/example/simple.js @2:16]
	* Module._compile [module.js @456:26]
*/
