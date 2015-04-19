'use strict';

var Code = require('code'),
	Lab = require('lab'),
	util = require('../lib/blame/util'),
	lab = exports.lab = Lab.script();

function Stringify(name) {
	var stringify = this;

	stringify.name = name;

	stringify.toString = function(template) {
		return util.template(template, stringify);
	};
}

lab.experiment('Util', function() {

	lab.experiment('Template', function() {
		lab.test('empty', function(done) {
			Code.expect(util.template('void')).to.equal('void');

			done();
		});

		lab.test('conditional', function(done) {
			Code.expect(util.template('{@foo:bar@}', {})).to.equal('');
			Code.expect(util.template('{@foo:bar@}', {foo: null})).to.equal('');

			Code.expect(util.template('{@foo:bar@}', {foo: ''})).to.equal('bar');
			Code.expect(util.template('{@foo:bar@}', {foo:['A', 'B', 'C']})).to.equal('bar');

			done();
		});

		lab.test('sub-template', function(done) {
			Code.expect(util.template('{%foo:bar%}', {})).to.equal('');
			Code.expect(util.template('{%foo:bar%}', {foo:null})).to.equal('');

			Code.expect(util.template('{%foo:bar%}', {foo:''})).to.equal('');
			Code.expect(util.template('{%foo:bar%}', {foo:['A', 'B', 'C']})).to.equal('ABC');

			done();
		});

		lab.test('replacements', function(done) {
			var template = '{@example:Example {example}@}{%list:\n - {name}%}',
				names = [new Stringify('Albert'), new Stringify('Nikola')];

			Code.expect(util.template('[{foo}]')).to.equal('[]');
			Code.expect(util.template('[{foo}]', {})).to.equal('[]');

			Code.expect(util.template(template)).to.equal('');
			Code.expect(util.template(template, '')).to.equal('');
			Code.expect(util.template(template, {})).to.equal('');
			Code.expect(util.template(template, {none: true})).to.equal('');
			Code.expect(util.template(template, {example: 'ok'})).to.equal('Example ok');

			Code.expect(util.template(template, {list: names})).to.equal('\n - Albert\n - Nikola');

			done();
		});
	});

});
