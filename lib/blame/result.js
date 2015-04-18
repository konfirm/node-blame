'use strict';

/**
 *  Gift-wrap parsed error traces from Blame and provide some easy manipulation methods
 *  @package    blame
 *  @copyright  Konfirm ⓒ 2015
 *  @author     Rogier Spieker (rogier+npm@konfirm.eu)
 *  @license    GPLv2
 */
function BlameResult(message, trace, steps) {
	var result = this;

	/**
	 *  Initialize the BlameResult, ensuring defaults and define properties
	 *  @name    init
	 *  @access  internal
	 *  @return  void
	 */
	function init() {
		//  ensure the steps is always an array
		steps = steps || [];

		//  define the `message`, `trace` and `steps` properties
		Object.defineProperties(result, {
			//  exposed (enumerable), immutable
			message: {
				enumerable: true,
				value: message
			},

			//  exposed (enumerable), immutable
			trace: {
				enumerable: true,
				value: trace
			},

			//  hidden (not enumerable), immutable
			steps: {
				enumerable: false,
				value: steps
			}
		});
	}

	/**
	 *  Create a result object divided into three parts:
	 *  - `before`: before the pattern matched
	 *  - `match` all sequential matching results (matching trace-items encountered once the `after` is started
	 *            are considered `after`)
	 *  - `after` all remaining results
	 *  @name    divide
	 *  @access  internal
	 *  @param   mixed  pattern  [one of: string, RegExp]
	 *  @return  Object result   [{before: [], match: [], after: []}]
	 */
	function divide(pattern) {
		var result = {before: [], match: [], after: []},
			current = 'before';

		//  if the pattern given is not a RegExp, make it into one
		if (!(pattern instanceof RegExp))
			pattern = new RegExp(String(pattern));

		//  iterate over the trace-items
		trace.forEach(function(item) {
			if (item) {
				//  if either the call or the file property matches..
				if (pattern.test(item.call) || pattern.test(item.file)) {
					//  and we are not currently processing the remainder, switch to the `match` buffer
					if (current !== 'after')
						current = 'match';
				}
				else if (current === 'match') {
					//  if there was no match and we are current in the `match` buffer, switch to `after`
					current = 'after';
				}

				//  add the item to the current buffer
				result[current].push(item);
			}
		});

		return result;
	}

	/**
	 *  Limit the given array to specified length (> 0 will return the first N items, < 0 will return the last N items)
	 *  @name    limit
	 *  @access  internal
	 *  @param   Array   items
	 *  @param   Number  count
	 *  @return  Array  result
	 */
	function limit(items, count) {
		return !count ? items : items.slice.apply(items, count > 0 ? [0, count] : [count]);
	}

	/**
	 *  Create a new BlameResult based on the same message, but with another trace-items list and added 'step'
	 *  @name    factory
	 *  @access  internal
	 *  @param   Array   items
	 *  @param   Object  step
	 *  @return  BlameResult
	 */
	function factory(items, step) {
		return new BlameResult(message, items, steps.concat([step]));
	}

	//  Public facing API

	/**
	 *  Create a new BlameResult containing only the items after given pattern (like `from` but excluding the match(es))
	 *  @name    after
	 *  @access  public
	 *  @param   mixed pattern [one of: string or RegExp]
	 *  @param   Number  max   [optional, default undefined - not limited]
	 *  @return  BlameResult
	 */
	result.after = function(pattern, max) {
		return factory(limit(divide(pattern).after, max), {after: pattern, max: max});
	};

	/**
	 *  Create a new BlameResult containing only the items before given pattern (like `until` but excluding the match(es))
	 *  @name    before
	 *  @access  public
	 *  @param   mixed pattern [one of: string or RegExp]
	 *  @param   Number  max   [optional, default undefined - not limited]
	 *  @return  BlameResult
	 */
	result.before = function(pattern, max) {
		return factory(limit(divide(pattern).before, max ? -max : null), {before: pattern, max: max});
	};

	/**
	 *  Create a new BlameResult containing only the items `from` given pattern (like `after` but including the match(es))
	 *  @name    from
	 *  @access  public
	 *  @param   mixed pattern [one of: string or RegExp]
	 *  @param   Number  max   [optional, default undefined - not limited]
	 *  @return  BlameResult
	 */
	result.from = function(pattern, max) {
		var div = divide(pattern);

		return factory(limit(div.match.concat(div.after), max), {from: pattern, max: max});
	};

	/**
	 *  Create a new BlameResult containing only the items until given pattern (like `before`` but including the match(es))
	 *  @name    until
	 *  @access  public
	 *  @param   mixed pattern [one of: string or RegExp]
	 *  @param   Number  max   [optional, default undefined - not limited]
	 *  @return  BlameResult
	 */
	result.until = function(pattern, max) {
		var div = divide(pattern);

		return factory(limit(div.before.concat(div.match), max ? -max : null), {until: pattern, max: max});
	};

	/**
	 *  Create a new BlameResult containing only the first N items
	 *  @name    first
	 *  @access  public
	 *  @param   Number  max [optional, default undefined - 1 item]
	 *  @return  BlameResult
	 */
	result.first = function(max) {
		return factory(limit(trace, max || 1), {first: max});
	};

	/**
	 *  Create a new BlameResult containing only the last N items
	 *  @name    last
	 *  @access  public
	 *  @param   Number  max [optional, default undefined - 1 item]
	 *  @return  BlameResult
	 */
	result.last = function(max) {
		return factory(limit(trace, -(max || 1)), {last: max});
	};

	/**
	 *  Itemize one item from the callstack into a single object for quick and easy access
	 *  @name    item
	 *  @access  public
	 *  @param   mixed index [optional, default undefined - the first item; one of bool (true: last, false: first), or int index],
	 *  @return  Object item
	 */
	result.item = function() {
		var index = arguments.length > 0 ? arguments[0] : null,
			item = {};

		if (!index)
			index = 0;
		else if (index === true)
			index = trace.length - 1;

		return index >= 0 && index < trace.length ? trace[index] : null;
	};

	/**
	 *  Create a string representing the BlameResult
	 *  @name    toString
	 *  @access  public
	 *  @return  string
	 */
	result.toString = function() {
		return ['Message: ', message].concat(trace.map(function(item) {
			return '\n\t* ' + item;
		})).join('');
	};

	//  start the init so the BlameResult becomes usable
	init();
}

module.exports = BlameResult;
