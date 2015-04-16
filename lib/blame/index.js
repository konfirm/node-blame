'use strict';

/**
 *  Crate stack-traces as JSON and provide useful filtering to quickly determine the origin of a call
 *  @package    blame
 *  @copyright  Konfirm ⓒ 2015
 *  @author     Rogier Spieker (rogier+npm@konfirm.eu)
 *  @license    GPLv2
 */
function Blame() {
	var blame = this,
		BlameResult = require('./result'),
		pattern = {
			call: /\s*\((.*?):([0-9]+):([0-9]+)\)$/,
			file: /^(.*?):([0-9]+):([0-9]+)$/i
		},
		counter = 0;

	/**
	 *  Obtain the call-stack from given (or created) Error object in an easy to access manner
	 *  @name    stack
	 *  @access  internal
	 *  @param   Error error [optional, default undefined - empty error]
	 *  @return  BlameResult
	 */
	function stack(error) {
		var name = 'Blame#' + (++counter + Date.now() % 86400000).toString(36),
			trace = (error || new Error(name)).stack,
			lines = trace.split(/\s+at\s*/),
			self = true;

		//  return a new BlameResult containing the trace (up to the point where Blame was called)
		return new BlameResult(
			lines.shift().replace(new RegExp('^(?:Error:\\s*)(?:' + name + ')?'), ''),
			lines.map(function(line) {
				var match = line.match(pattern.call),
					call = match ? line.substr(0, line.length - match[0].length) : null;

				if (!match)
					match = line.match(pattern.file);

				return match ? {file: match[1], line: +match[2], column: +match[3], call: call} : null;
			})
		).after(module.file);
	}

	//  Public facing API

	/**
	 *  Process an Error instance (or create it if not provided) containing a JSON representation of the
	 *  "chain of events" leading to the invocation of this method. The returned object allows easy reduction
	 *  of the result set.
	 *  @name    trace
	 *  @access  public
	 *  @param   Error error [optional, default undefined - empty error]
	 *  @return  BlameResult
	 */
	blame.trace = function(error) {
		return stack(error).after(module.filename);
	};
}

module.exports = new Blame();