'use strict';

var Code = require('code'),
	Lab = require('lab'),
	fs = require('fs'),
	blame = require('../lib/blame'),
	lab = exports.lab = Lab.script();

function interceptDeprecation(done) {
	var version = process.version.match(/^v([0-9]+)/),
		original;

	//  as of node 6 any deprecation message is send through process.emitWarning instead
	//  of written to console.error
	if (version && +version[1] >= 6) {
		process.once('warning', function(warning) {
			done(warning.message);
		});
	}
	else {
		original = console.error.bind(console);
		console.error = function(warning) {
			console.error = original;

			setImmediate(function() {
				done(warning);
			});
		};
	}
}

lab.experiment('Direct', function() {
	lab.test('.trace() is deprecated', function(done) {
		var output;

		interceptDeprecation(function(warning) {
			Code.expect(output.message).to.equal('No more trace');
			Code.expect(warning).to.equal('blame.trace is deprecated: use blame.stack instead');

			interceptDeprecation(function(warning) {
				Code.expect(warning).to.equal('.trace is deprecated: use .stack instead');
				Code.expect(output.trace instanceof Array).to.equal(true);

				done();
			});

			Code.expect(typeof output.trace).to.equal('object');
		});

		output = blame.trace('No more trace');
	});

	lab.test('No argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.stack(),
				item = result.stack[0];

			//  there should be an empty string as message
			Code.expect(result.message).to.equal('');

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.stack was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.stack\(\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});

	lab.test('String argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.stack('String Invocation'),
				item = result.stack[0];

			//  the result message should read 'String Invocation'
			Code.expect(result.message).to.equal('String Invocation');

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.stack was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.stack\('String Invocation'\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});

	lab.test('Error argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.stack(new Error('Error Invocation')),
				item = result.stack[0];

			//  the result message should read 'Error Invocation'
			Code.expect(result.message).to.equal('Error Invocation');

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.stack was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.stack\(new Error\('Error Invocation'\)\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});

	lab.test('Boolean argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.stack(true),
				item = result.stack[0];

			//  the result message should read 'true'
			Code.expect(result.message).to.equal('true');

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.stack was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.stack\(true\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});

	lab.test('Numeric argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.stack(1000),
				item = result.stack[0];

			//  the result message should read '1000'
			Code.expect(result.message).to.equal('1000');
			Code.expect(result.message).to.not.equal(1000);

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.stack was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.stack\(1000\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});
});
