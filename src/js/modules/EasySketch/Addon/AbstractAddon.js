/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license https://github.com/brian978/easy-sketch.js/blob/master/LICENSE New BSD License
 */

define(["../EasySketch", "./Addon"], function (EasySketch, Addon) {
    /**
     * Interface for the addons
     *
     * @constructor
     * @interface
     */
    EasySketch.Addon.AbstractAddon = function () {
        /**
         * @type {EasySketch.Sketch}
         * @protected
         */
        this.object = null;
    };

    EasySketch.Addon.AbstractAddon.prototype = {
        /**
         *
         * @param {EasySketch.Sketch} object
         * @returns {EasySketch.Addon.AbstractAddon}
         */
        attachSketchObject: function (object) {
            this.object = object;

            return this;
        }
    };

    return EasySketch.Addon.AbstractAddon;
});
