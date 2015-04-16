'use strict';

var Code = require('code'),
	Lab = require('lab'),
	fs = require('fs'),
	blame = require('../lib/blame'),
	lab = exports.lab = Lab.script();

lab.experiment('Direct', function() {

	lab.test('No argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.trace(),
				item = result.trace[0];

			//  there should be an empty string as message
			Code.expect(result.message).to.equal('');

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.trace was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.trace\(\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});

	lab.test('String argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.trace('String Invocation'),
				item = result.trace[0];

			//  the result message should read 'String Invocation'
			Code.expect(result.message).to.equal('String Invocation');

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.trace was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.trace\('String Invocation'\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});

	lab.test('Error argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.trace(new Error('Error Invocation')),
				item = result.trace[0];

			//  the result message should read 'Error Invocation'
			Code.expect(result.message).to.equal('Error Invocation');

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.trace was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.trace\(new Error\('Error Invocation'\)\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});

	lab.test('Boolean argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.trace(true),
				item = result.trace[0];

			//  the result message should read 'true'
			Code.expect(result.message).to.equal('true');

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.trace was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.trace\(true\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});

	lab.test('Numeric argument', function(done) {
		fs.readFile(module.filename, 'utf-8', function(error, data) {
			var content = data.toString().split(/\n/),
				result = blame.trace(1000),
				item = result.trace[0];

			//  the result message should read '1000'
			Code.expect(result.message).to.equal('1000');
			Code.expect(result.message).to.not.equal(1000);

			//  the item should refer to the current file
			Code.expect(item.file).to.equal(module.filename);

			//  the line on which the blame.trace was invoked should match
			Code.expect(content[item.line - 1]).to.match(/result = blame\.trace\(1000\)/);

			//  call should be null
			Code.expect(item.call).to.equal(null);

			done();
		});
	});
});
