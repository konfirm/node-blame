'use strict';

/**
 *  Create an immutable trace item
 *  @package    blame
 *  @copyright  Konfirm ⓒ 2015
 *  @author     Rogier Spieker (rogier+npm@konfirm.eu)
 *  @license    GPLv2
 */
function BlameItem(error, data) {
	var item = this;

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

	init();
}

module.exports = BlameItem;
