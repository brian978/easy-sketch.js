/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

define(["./AbstractAddon"], function (AbstractAddon) {
    
    /**
     * Constructor for the undo addon
     *
     * @constructor
     * @extends {EasySketch.Addon.AbstractAddon}
     * @param {EasySketch.Sketch} object The sketch object
     * @returns {void}
     */
    AbstractAddon.Undo = function(object) {
    };

    AbstractAddon.Undo.prototype = {
    };

    return AbstractAddon.Undo;
});
