/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license https://github.com/brian978/easy-sketch.js/blob/master/LICENSE New BSD License
 */

define(["./EasySketch"], function (EasySketch) {

    /**
     *
     * @param {String} name
     * @param {Object} target
     * @param {Object} params
     * @constructor
     */
    EasySketch.Event = function (name, target, params) {
        /**
         *
         * @type {String}
         * @protected
         */
        this.name = name;

        /**
         *
         * @type {Object}
         * @protected
         */
        this.target = target;

        /**
         *
         * @type {Object}
         * @protected
         */
        this.params = params;

        /**
         *
         * @type {boolean}
         * @private
         */
        this._propagationStopped = false;
    };

    EasySketch.Event.prototype = {
        /**
         *
         * @returns {String}
         */
        getName: function () {
            return this.name;
        },

        /**
         *
         * @returns {Object}
         */
        getTarget: function () {
            return this.target;
        },

        /**
         *
         * @param {String|Number} name
         * @param {Object|String=null} defaultValue
         * @returns {Object|String|null}
         */
        getParam: function (name, defaultValue) {
            defaultValue = defaultValue || null;
            if(this.params.hasOwnProperty(name)) {
                return this.params[name];
            }

            return defaultValue;
        },

        /**
         *
         * @returns {Object}
         */
        getParams: function () {
            return this.params;
        },

        /**
         *
         * @returns {EasySketch.Event}
         */
        stopPropagation: function()
        {
            this._propagationStopped = true;

            return this;
        },

        /**
         *
         * @returns {boolean}
         */
        isPropagationStopped: function()
        {
            return this._propagationStopped;
        }
    };

    return EasySketch.Event;
});
