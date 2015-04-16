/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

define(["./Addon"], function (EasySketchAddon) {
    
    /**
     * Constructor for the undo addon
     * 
     * @param {EasySketch.Sketch} object The sketch object
     * @returns {void}
     */
    EasySketchAddon.Undo = function(object) {
        
        /**
         * @type EasySketch.Sketch
         * @private
         */
        this._object = object;
    };
    
    EasySketchAddon.Undo.prototype = {
        
    };

    return EasySketchAddon.Undo;
});