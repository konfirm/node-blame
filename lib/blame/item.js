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
				line: line,
				code: code
			};

		if (line === data.line - 1)
			result.code += new Array(code.length - data.column + 2).join(String.fromCharCode(8)) + String.fromCharCode(11) + '^';

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
	 *  @param   number  lines before the calling line [optional, default undefined - 3]
	 *  @param   number  lines after the calling line  [optional, default undefined - before or else 3]
	 *  @return  string context
	 */
	function context(before, after) {
		var fs = require('fs'),
			contents = fs.readFileSync(data.file).toString().split(/\n/),
			start = Math.max(data.line - ((+before || 3) + 1), 0),
			end = Math.min(data.line + (+after || +before || 3), contents.length),
			length = String(end).length,
			pad = new Array(length + 1).join(' '),
			result = contents.slice(start, end).map(function(value, index) {
				return sourceLine(value, index + start);
			});

		//  return the default format
		return util.template('{#-:78#}\nFile: {file} (line: {start}-{end})\n{%lines:\n{line} | {code}%}\n{#-:78#}', {
			file: data.file.replace(process.cwd(), ''),
			start: start,
			end: end,
			lines: result
		});
	}

	/**
	 *  Extract an excerpt from the sourcefile and add line numbers and a pointer to indicate from where
	 *  the call originated
	 *  @name    excerpt
	 *  @access  public
	 *  @param   number  lines before the calling line [optional, default undefined - 3]
	 *  @param   number  lines after the calling line  [optional, default undefined - before or else 3]
	 *  @return  string context
	 */
	item.context = context;

	init();
}

module.exports = BlameItem;
