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
		BlameItem = require('./item'),
		pattern = {
			call: /\s*\((.*?):([0-9]+):([0-9]+)\)$/,
			anon: /^\(.*?\) \[as ([^\]+])\]/,
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
			trace = (error instanceof Error ? error : new Error(error || name)).stack,
			lines = trace.split(/\s+at\s*/),
			message = lines.shift().replace(new RegExp('^(?:Error:\\s*)(?:' + name + ')?'), '');

		//  return a new BlameResult containing the trace (up to the point where Blame/Error was called)
		return new BlameResult(
			message,
			lines.map(function(line, index) {
				var match = line.match(pattern.call),
					call = match ? line.substr(0, line.length - match[0].length) : null,
					file, anon;

				if (match && (anon = match[0].match(pattern.anon))) {
					call = call + anon[1];
					file = match[1].substr(anon[0].length + 1);
				}

				//  if the call pattern did not match, it means the origin is not within a (detectable) function
				//  scope, we can determine the filename, line and column numbers
				if (!match)
					match = line.match(pattern.file);

				return match ? new BlameItem(message, {file: file || match[1], line: +match[2], column: +match[3], call: call, index: index}) : null;
			})

		);
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
		var result = stack(error);

		//  if the error object was created in this module, we want to remove those additional calls from the stack
		if (!(error instanceof Error))
			result = result.after(module.filename);

		return result;
	};
}

module.exports = new Blame();
