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
		template = {
			item: '{@message:{message}\n\t@}{@call:{call} [@}{file} @{line}:{column}{@call:]@}',
			context: '{#-:78#}\nFile: {file} (line: {start}-{end})\n{%lines:\n{line} | {source}%}\n{#-:78#}'
		};

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
				toString: util.define(true, function(tpl) {
					return util.template(tpl || template.item, item);
				})
			};

		//  create hidden and immutable properties
		['index', 'order'].forEach(function(key) {
			define[key] = util.define(true, data, key);
		});

		//  create exposed but immutable properties
		['file', 'line', 'column', 'call'].forEach(function(key) {
			define[key] = util.define(false, data, key);
		});

		//  provide a short filename (strip out the current working directory of the process)
		define.short = util.define(false, data.file.replace(process.cwd(), ''));

		//  define the properties
		Object.defineProperties(item, define);
	}

	/**
	 *  Create a small object to represent a single line of code and its linenumber
	 *  @name    sourceLine
	 *  @access  internal
	 *  @param   string  source
	 *  @param   number  line
	 *  @return  Object  sourceline
	 */
	function sourceLine(source, line) {
		var result = {
				line: line,
				source: source
			};

		if (line === data.line)
			result.source += new Array(source.length - data.column + 2).join(String.fromCharCode(8)) + String.fromCharCode(11) + '^';

		result.toString = function(tpl) {
			return util.template(tpl, result);
		};

		return result;
	}

	/**
	 *  Extract an excerpt from the sourcefile and add line numbers and a pointer to indicate from where
	 *  the call originated
	 *  @name    excerpt
	 *  @access  internal
	 *  @param   number  lines before the calling line
	 *  @param   number  lines after the calling line
	 *  @return  string context
	 */
	function context(before, after) {
		var fs = require('fs'),
			contents = data.file.indexOf(process.cwd()) >= 0 ? fs.readFileSync(data.file).toString().split(/\n/) : [],
			start = Math.max(data.line - (before + 1), 0),
			end = Math.min(data.line + after, contents.length),
			result = contents.slice(start, end).map(function(value, index) {
				return sourceLine(value, (index + start) + 1);
			});

		//  return the default format
		return {
			file: data.file,
			short: data.file.replace(process.cwd(), ''),
			start: start + 1,
			end: end,
			lines: result
		};
	}

	/**
	 *  Extract an excerpt from the sourcefile and add line numbers and a pointer to indicate from where
	 *  the call originated
	 *  @name    excerpt
	 *  @access  public
	 *  @param   string  template                      [optional, default undefined - the default template]
	 *  @param   number  lines before the calling line [optional, default undefined - 3]
	 *  @param   number  lines after the calling line  [optional, default undefined - before or 3 otherwise]
	 *  @return  string context
	 *  @note    any number of arguments may be provided, if the first argument is non numeric it is considered a template
	 *           if it is numeric it is considered to be before and after (in that order)
	 */
	item.context = function() {
		var arg = Array.prototype.slice.call(arguments),
			number = /^[0-9]+$/,
			tpl = arg.length && !number.test(arg[0]) ? arg.shift() : template.context,
			before = arg.length && number.test(arg[0]) ? arg.shift() : 3,
			after = arg.length && number.test(arg[0]) ? arg.shift() : before;

		return util.template(tpl, context(before, after));
	};

	init();
}

module.exports = BlameItem;
