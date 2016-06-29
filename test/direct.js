'use strict';

var Code = require('code'),
	Lab = require('lab'),
	fs = require('fs'),
	blame = require('../lib/blame'),
	lab = exports.lab = Lab.script();

lab.experiment('Direct', function() {

	lab.test('.trace() is deprecated', function(done) {
		var old = console.error,
			message;

		console.error = function(input) {
			message = input;
		}.bind(console);

		Code.expect(blame.trace('No more trace').message).to.equal('No more trace');
		Code.expect(message).to.equal('blame.trace is deprecated: use blame.stack instead');

		Code.expect(typeof blame.trace('No more trace').trace).to.equal('object');
		Code.expect(blame.trace('No more trace').trace instanceof Array).to.equal(true);
		Code.expect(message).to.equal('.trace is deprecated: use .stack instead');

		console.error = old;

		done();
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
