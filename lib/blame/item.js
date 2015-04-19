'use strict';

/**
 *  Create an immutable trace item
 *  @package    blame
 *  @copyright  Konfirm ⓒ 2015
 *  @author     Rogier Spieker (rogier+npm@konfirm.eu)
 *  @license    GPLv2
 */
function BlameItem(error, data) {
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
				message: property(false, error)
			};

		//  create exposed but immutable properties
		['file', 'line', 'column', 'call'].forEach(function(key) {
			define[key] = property(false, data, key);
		});

		//  define the properties
		Object.defineProperties(item, define);
	}

	/**
	 *  Provide a property configuration object for use with Object.defineProperty/defineProperties
	 *  @name    property
	 *  @aacess  internal
	 *  @param   bool   hidden
	 *  @param   mixed  collection [one of: object from which key will provide the value, or value]
	 *  @param   string key        [optional, if ommited the given collection itself will act as value]
	 *  @return  void
	 */
	function property(hidden, collection, key) {
		return {
			enumerable: !hidden,
			value: key ? collection[key] : collection
		};
	}

	/**
	 *  Create a string representing the BlameItem
	 *  @name    toString
	 *  @access  public
	 *  @param   string template [optional, default undefined - use the default template]
	 *  @return  string
	 */
	item.toString = function(template) {
		return util.template(template || toString, item);
	};

	init();
}

module.exports = BlameItem;
