/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license Creative Commons Attribution-ShareAlike 3.0
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
        this._object = null;
    };

    EasySketch.Addon.AbstractAddon.prototype = {
        /**
         *
         * @param {EasySketch.Sketch} object
         * @returns {EasySketch.Addon.AbstractAddon}
         */
        attachSketchObject: function (object) {
            this._object = object;

            return this;
        }
    };

    return EasySketch.Addon.AbstractAddon;
});
