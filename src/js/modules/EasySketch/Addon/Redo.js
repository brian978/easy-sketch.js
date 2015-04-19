/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

define(["./AbstractAddon", "../Util"], function (AbstractAddon, Util) {
    
    /**
     * Constructor for the undo addon
     *
     * @constructor
     * @extends {EasySketch.Addon.AbstractAddon}
     * @returns {void}
     */
    AbstractAddon.Redo = function() {
    };

    AbstractAddon.Redo.prototype = {
    };

    Util.extend(AbstractAddon, AbstractAddon.Redo);

    return AbstractAddon.Redo;
});
