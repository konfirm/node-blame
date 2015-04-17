'use strict';

var Code = require('code'),
	Lab = require('lab'),
	fs = require('fs'),
	blame = require('../lib/blame'),
	lab = exports.lab = Lab.script();

//  create a module to be invoked
function LabExperiment() {
	var experiment = this;

	'abcdefghijklmnopqrstuvwxyz'.split('').forEach(function(char, index, list) {
		var next = index < list.length - 1 ? list[index + 1] : 'final';

		experiment[char] = function(callback) {
			return experiment[next](callback);
		};
	});

	experiment.start = function(callback) {
		return experiment.a(callback);
	};

	experiment.final = function(callback) {
		return callback();
	};
}

lab.experiment('Result Manipulation', function() {
	var experiment = new LabExperiment();

	experiment.start(function() {
		var result = blame.trace(),
			length = result.trace.length,
			string = 'LabExperiment.experiment',
			pattern = /labexperiment\.experiment/i,
			begin, end;

		result.trace.forEach(function(item, index) {
			if (!begin)
				begin = pattern.test(item.call) ? index : null;
			else if (pattern.test(item.call))
				end = index;
		});

		lab.experiment('After', function() {
			lab.test('String', function(done) {
				Code.expect(result.after(string).trace.length).to.equal(length - (end + 1));
				Code.expect(result.after(string, 1).trace.length).to.equal(1);

				done();
			});

			lab.test('RegExp', function(done) {
				Code.expect(result.after(pattern).trace.length).to.equal(length - (end + 1));
				Code.expect(result.after(pattern, 1).trace.length).to.equal(1);

				done();
			});
		});

		lab.experiment('From', function() {
			lab.test('String', function(done) {
				Code.expect(result.from(string).trace.length).to.equal(length - begin);
				Code.expect(result.from(string, 1).trace.length).to.equal(1);

				done();
			});

			lab.test('RegExp', function(done) {
				Code.expect(result.from(pattern).trace.length).to.equal(length - begin);
				Code.expect(result.from(pattern, 1).trace.length).to.equal(1);

				done();
			});
		});

		lab.experiment('Before', function() {
			lab.test('String', function(done) {
				Code.expect(result.before(string).trace.length).to.equal(begin);
				Code.expect(result.before(string, 1).trace.length).to.equal(1);

				done();
			});

			lab.test('RegExp', function(done) {
				Code.expect(result.before(pattern).trace.length).to.equal(begin);
				Code.expect(result.before(pattern, 1).trace.length).to.equal(1);

				done();
			});
		});

		lab.experiment('Until', function() {
			lab.test('String', function(done) {
				Code.expect(result.until(string).trace.length).to.equal(end + 1);
				Code.expect(result.until(string, 1).trace.length).to.equal(1);

				done();
			});

			lab.test('RegExp', function(done) {
				Code.expect(result.until(pattern).trace.length).to.equal(end + 1);
				Code.expect(result.until(pattern, 1).trace.length).to.equal(1);

				done();
			});
		});

		lab.test('First', function(done) {
			Code.expect(result.first().trace.length).to.equal(1);
			Code.expect(result.first(5).trace.length).to.equal(5);

			done();
		});

		lab.test('Last', function(done) {
			Code.expect(result.last().trace.length).to.equal(1);
			Code.expect(result.last(5).trace.length).to.equal(5);

			done();
		});

		lab.test('Only matching items', function(done) {
			var only = result.from(string).until(pattern);

			Code.expect(only.trace.length).to.equal(end - (begin - 1));
			only.trace.forEach(function(item) {
				Code.expect(pattern.test(item.call)).to.equal(true);
			});

			done();
		});

		lab.test('After matches contain matching values if non-matching items intersect', function(done) {
			var still = result.after('anonymous'),
				exist = false;

			still.trace.forEach(function(item) {
				if (item.call && item.call.indexOf('anonymous') >= 0)
					exist = true;
			});

			Code.expect(exist).to.equal(true);

			done();
		});

		lab.test('Obtain items', function(done) {
			var first = result.first(),
				last = result.last();

			Code.expect(first.item()).to.equal(result.trace[0]);
			Code.expect(result.item(0)).to.equal(first.trace[0]);

			Code.expect(result.item(3)).to.equal(result.trace[3]);

			Code.expect(last.item(true)).to.equal(result.trace[result.trace.length - 1]);

			Code.expect(last.item(-1)).to.equal(null);
			Code.expect(last.item(result.trace.length)).to.equal(null);

			done();
		});

	});
});
