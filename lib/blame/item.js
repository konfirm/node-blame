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

	init();
}

module.exports = BlameItem;
