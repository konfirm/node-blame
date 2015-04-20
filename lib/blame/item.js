'use strict';

/**
 *  Create an immutable trace item
 *  @package    blame
 *  @copyright  Konfirm ⓒ 2015
 *  @author     Rogier Spieker (rogier+npm@konfirm.eu)
 *  @license    GPLv2
 */
function BlameItem(message, data) {
	var item = this,
		util = require('./util'),
		toString = '{@message:{message}\n\t@}{@call:{call} [@}{file} @{line}:{column}{@call:]@}';

	/**
	 *  Initialize the BlameItem object, decorating immutable properties
	 *  @name    init
	 *  @access  internal
	 *  @return  void
	 */
	function init() {
		var define = {
				//  message, index and toString hidden
				message: util.define(true, message),
				index: util.define(true, data, 'index'),
				toString: util.define(true, function(template) {
					return util.template(template || toString, item);
				})
			};

		//  create exposed but immutable properties
		['file', 'line', 'column', 'call'].forEach(function(key) {
			define[key] = util.define(false, data, key);
		});

		//  define the properties
		Object.defineProperties(item, define);
	}

	function sourceLine(code, line) {
		var result = {
				code: code,
				line: line,
				marker: line === data.line - 1 ? code.replace(/[^\s]/g, ' ').substr(0, data.column - 1) + '^' : null
			};

		result.toString = function(template) {
			return util.template(template, result);
		};

		return result;
	}

	/**
	 *  Extract an excerpt from the sourcefile and add line numbers and a pointer to indicate from where
	 *  the call originated
	 *  @name    excerpt
	 *  @access  internal
	 *  @return  string excerpt
	 */
	function excerpt(before, after) {
		var fs = require('fs'),
			contents = fs.readFileSync(data.file).toString().split(/\n/),
			start = Math.max(data.line - ((+before || 3) + 1), 0),
			end = Math.min(data.line + (+after || +before || 3), contents.length),
			length = String(end).length,
			pad = new Array(length + 1).join(' '),
			result = contents.slice(start, end).map(function(value, index) {
				return sourceLine(value, index + start);
			});

		return util.template('{#-:80#}\nFile: {file} (line: {start}-{end})\n{%lines:\n{line} | {code}{@marker:\n{line} | {marker}@}%}\n{#-:80#}', {
			file: data.file.replace(process.cwd(), ''),
			start: start,
			end: end,
			lines: result
		});
	}

	item.context = excerpt;

	init();
}

module.exports = BlameItem;
