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

		//  find the first (begin) and last (end) occurence of the pattern (which matches the string as well)
		result.trace.forEach(function(item, index) {
			if (!begin)
				begin = pattern.test(item.call) ? index : null;
			else if (pattern.test(item.call))
				end = index;
		});

		lab.experiment('Filter', function() {
			lab.test('String', function(done) {
				Code.expect(result.filter(string).trace.length).to.equal(28);
				Code.expect(result.filter(string, 1).trace.length).to.equal(1);

				done();
			});

			lab.test('RegExp', function(done) {
				Code.expect(result.filter(pattern).trace.length).to.equal(28);
				Code.expect(result.filter(pattern, 1).trace.length).to.equal(1);

				done();
			});

			lab.test('Stringify', function(done) {
				Code.expect(String(result.filter(string, 1).item())).to.contain(string);
				Code.expect(String(result.filter(pattern, 1).item())).to.match(pattern);

				done();
			});
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

			lab.test('Stringify', function(done) {
				Code.expect(String(result.after(string, 1).item())).to.not.contain(string);
				Code.expect(String(result.after(pattern, 1).item())).to.not.match(pattern);

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

			lab.test('Stringify', function(done) {
				Code.expect(String(result.from(string, 1).item())).to.contain(string);
				Code.expect(String(result.from(pattern, 1).item())).to.match(pattern);

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

			lab.test('Stringify', function(done) {
				Code.expect(String(result.before(string, 1).item())).to.not.contain(string);
				Code.expect(String(result.before(pattern, 1).item())).to.not.match(pattern);

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

			lab.test('Stringify', function(done) {
				Code.expect(String(result.until(string, 1).item())).to.contain(string);
				Code.expect(String(result.until(pattern, 1).item())).to.match(pattern);

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

		lab.experiment('toString', function() {
			lab.test('Result', function(done) {
				//  expectation = <tab><asterisk>LabExperiment.experiment ... [... @<num>:<num>]
				var output = String(result.from(string).until(string)).split(/\n+/),
					expectation = new RegExp('\t\* ' + string + '.*?\[.*? @[0-9]+:[0-9]+\]');

				//  as each result reduction will actually leave the Message intact, we need to validate it first
				//  (and remove it from the mass-expectation below)
				Code.expect(output.shift()).to.equal('Message: ');

				//  test each remaing line (28)
				Code.expect(output.length).to.equal(28);
				output.forEach(function(line) {
					Code.expect(line).to.match(expectation);
				});

				Code.expect(result.toString('void')).to.equal('void');

				done();
			});

			lab.test('Item', function(done) {
				//  we expect a 'non-call' item
				//  start with '/' and end with ' @<num>:<num>' (e.g. not a call and using our format)
				Code.expect(String(result.item())).to.match(/^\s*\/.*? @[0-9]+:[0-9]+$/i);

				//  we expect a 'call' item
				//  start with the specified call (the string variant)
				Code.expect(String(result.until(pattern).item(true))).to.match(new RegExp('^\\s*' + string + '.*?\s+\[\/.*? @[0-9]+:[0-9]+\]$'));

				done();
			});
		});
	});
});
