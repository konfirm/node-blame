'use strict';

/**
 *  Simple utilities to be used by Blame
 *  @package    blame
 *  @copyright  Konfirm ⓒ 2015
 *  @author     Rogier Spieker (rogier+npm@konfirm.eu)
 *  @license    GPLv2
 */
function Util() {
	var util = this;

	/**
	 *  Provide a property configuration object for use with Object.defineProperty/defineProperties
	 *  @name    define
	 *  @aacess  public
	 *  @param   bool   hidden
	 *  @param   mixed  collection [one of: object from which key will provide the value, or value]
	 *  @param   string key        [optional, if ommited the given collection itself will act as value]
	 *  @return  void
	 */
	util.define = function(hidden, collection, key) {
		return {
			enumerable: !hidden,
			value: key ? collection[key] : collection
		};
	};

	/**
	 *  Apply (simple) logic and replace variables within given template string
	 *  @name    template
	 *  @access  public
	 *  @param   string template
	 *  @param   Object data
	 *  @return  string
	 *  @note    The template syntax is very crude:
	 *           {variable} = simple replacement of '{variable}' with the value of data['variable']
	 *           {@variable:condition@} = if 'variable' exists in data and is not null, the contents will be
	 *                                    preserved ('condition'), this may contain additional variables/logic
	 *           {%variable:{name}%} = if data['variable'] is an array, apply the contents to the toString function
	 *                                 of each value.
	 *                                 If not an array, apply to contents to the toString of data['variable'].
	 */
	util.template = function(template, data) {
		return template

			//  first prepare all template logic
			.replace(/{([@%])([a-z]+):([\s\S]*?)\1}/g, function(match, symbol, key, content) {
				switch (symbol) {
					//  at valid key (key exists and not null)
					case '@':
						return data && key in data & data[key] !== null ? content : '';

					//  sub-template (key exists)
					case '%':
						if (data && key in data) {
							//  if data[key] is an Array, we map it using the contents and the assumption the contents
							//  will accept the template
							if (data[key] instanceof Array)
								return data[key].map(function(item) {
									return item.toString.apply(item, typeof item === 'object' ? [content] : []);
								}).join('');

							return data[key] !== null ? data[key].toString(content) : '';
						}

						break;
				}

				return '';
			})

			//  replace all variables
			.replace(/{([a-z]+)}/g, function(match, key) {
				return data && key in data && data[key] !== null ? data[key] : '';
			});
	};
}

module.exports = new Util();
