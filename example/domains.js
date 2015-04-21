'use strict';

var blame = require('../lib/blame'),  //  you'd use require('blame')
	domain = require('domain'),
	isolated = domain.create();

//  register a listener for errors
isolated.on('error', function(error) {
	console.log('' + blame.stack(error).first(4));

	/*
	Message: Oops!
		* /path/to/example/domains.js @12:8
		* b [domain.js @183:18]
		* Domain.run [domain.js @123:23]
		* Object.<anonymous> [/path/to/example/domains.js @11:10]
	*/
});

//  make sure an Error is thrown from within the domain.
isolated.run(function() {
	throw new Error('Oops!');
});
