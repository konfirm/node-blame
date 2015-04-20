'use strict';

var Code = require('code'),
	Lab = require('lab'),
	fs = require('fs'),
	blame = require('../lib/blame'),
	lab = exports.lab = Lab.script();

//  create a module to be invoked
function LabExperiment() {
	var experiment = this;

	experiment.first = function(callback) {
		return experiment.second(callback);
	};

	experiment.second = function(callback) {
		return experiment.third(callback);
	};

	experiment.second = function(callback) {
		return callback();
	};
}

lab.experiment('Stacked', function() {
	var callList = [null, 'LabExperiment.experiment.second', 'LabExperiment.experiment.first'];

	lab.test('No argument', function(done) {
		var experiment = new LabExperiment();

		experiment.first(function() {
			var result = blame.stack();

			//  there should be an empty string as message
			Code.expect(result.message).to.equal('');

			callList.forEach(function(name, index) {
				//  the item should refer to the current file
				Code.expect(result.stack[index].file).to.equal(module.filename);

				//  call should be null
				Code.expect(result.stack[index].call).to.equal(name);
			});

			done();
		});
	});

	lab.test('String argument', function(done) {
		var experiment = new LabExperiment();

		experiment.first(function() {
			var result = blame.stack('String Invocation');

			//  the result message should read 'String Invocation'
			Code.expect(result.message).to.equal('String Invocation');

			callList.forEach(function(name, index) {
				//  the item should refer to the current file
				Code.expect(result.stack[index].file).to.equal(module.filename);

				//  call should be null
				Code.expect(result.stack[index].call).to.equal(name);
			});

			done();
		});
	});

	lab.test('Error argument', function(done) {
		var experiment = new LabExperiment();

		experiment.first(function() {
			var result = blame.stack(new Error('Error Invocation'));

			//  the result message should read 'Error Invocation'
			Code.expect(result.message).to.equal('Error Invocation');

			callList.forEach(function(name, index) {
				//  the item should refer to the current file
				Code.expect(result.stack[index].file).to.equal(module.filename);

				//  call should be null
				Code.expect(result.stack[index].call).to.equal(name);
			});

			done();
		});
	});

	lab.test('Boolean argument', function(done) {
		var experiment = new LabExperiment();

		experiment.first(function() {
			var result = blame.stack(true);

			//  the result message should read 'true' (a string)
			Code.expect(result.message).to.equal('true');

			callList.forEach(function(name, index) {
				//  the item should refer to the current file
				Code.expect(result.stack[index].file).to.equal(module.filename);

				//  call should be null
				Code.expect(result.stack[index].call).to.equal(name);
			});

			done();
		});
	});

	lab.test('Number argument', function(done) {
		var experiment = new LabExperiment();

		experiment.first(function() {
			var result = blame.stack(1000);

			//  the result message should read '1000' (a string)
			Code.expect(result.message).to.equal('1000');

			callList.forEach(function(name, index) {
				//  the item should refer to the current file
				Code.expect(result.stack[index].file).to.equal(module.filename);

				//  call should be null
				Code.expect(result.stack[index].call).to.equal(name);
			});

			done();
		});
	});
});
