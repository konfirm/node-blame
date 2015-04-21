var blame = require('../lib/blame'),  //  you'd use require('blame')
	stack = blame.stack('Hello world'),
	template;

// first add the basics to the template, such as the message
//  using the format: 'Message: <your message here>' followed by a newline
template = 'Message: {message}\n';

//  next, we want to have a nice stack trace
//  using the logic: 'for all items in stack'
//   add the format: 'add a newline' followed by '#' and the index followed by a space
//   then the logic: 'if call exists and is not null' add '<name of call> ['
//      then format: '<filename>:<linenumber>:<columnnumber>'
//   then the logic: 'if call exists and is not null' add ']'
template += '{%stack:\n#{index} {@call:{call} [@}{file}:{line}:{column}{@call:]@}';

//  next, we add our default context formatting
//       add format: 'add a newline and the <context> and another newline'
//  note that we have to close the 'for each item in stack', which is what the '%}' is
template += '\n{context}\n%}';

// lets see what this does for us
console.log(stack.first().toString(template));

/*
#1 Object.<anonymous> [/Users/rogier/projects/versioned/git/node-blame/example/context.js:2:16]
------------------------------------------------------------------------------
File: /Users/rogier/projects/versioned/git/node-blame/example/context.js (line: 1-5)

1 | var blame = require('../lib/blame'),  //  you'd use require('blame')
2 | 	stack = blame.stack('Hello world'),
                      ^
3 | 	template = '';
4 |
5 | // first add the basics to the template, such as the message
------------------------------------------------------------------------------
*/

//  that was the default context format, now lets format it

// first add the basics to the template, such as the message
//  using the format: 'Message: <your message here>' followed by a newline
template = 'Message: {message}\n';

//  next, we want to have a nice stack trace
//  using the logic: 'for all items in stack'
//   add the format: 'add a newline' followed by '#' and the index followed by a space
//   then the logic: 'if call exists and is not null' add '<name of call> ['
//      then format: '<filename>:<linenumber>:<columnnumber>'
//   then the logic: 'if call exists and is not null' add ']'
template += '{%stack:\n#{index} {@call:{call} [@}{file}:{line}:{column}{@call:]@}';

//  next, we add our custom context formatting
//      then format: 'add a newline'
//   then the logic: 'for the context'
//   add the format: 'show the short version of the filename' followed by ':<from line>:<to line>' and a newline
//   then the logic: 'for all lines'
//   add the format: 'add a newline' followed by the linenumber, two space characters and finally the source code
//  note that we have to close the 'for item in context'
//  note that we have to close the 'for each item in stack', which is what the '%}' is
template += '\n{!%context:{short}:{start}-{end})\n{!!%lines:\n{line}  {source}%!!}%!}%}';

// lets see what this does for us
console.log(stack.first().toString(template));

/*
Message: Hello world

#1 Object.<anonymous> [/Users/rogier/projects/versioned/git/node-blame/example/context.js:2:16]
/Users/rogier/projects/versioned/git/node-blame/example/context.js:1-5)

1  var blame = require('../lib/blame'),  //  you'd use require('blame')
2  	stack = blame.stack('Hello world'),
                      ^
3  	template;
4
5  // first add the basics to the template, such as the message*/
