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
     * @param {EasySketch.Addon.UndoRedoDataStore} dataStore
     * @returns {void}
     */
    AbstractAddon.Redo = function(dataStore) {
        /**
         *
         * @type {EasySketch.Addon.UndoRedoDataStore}
         * @private
         */
        this._dataStore = dataStore;
    };

    AbstractAddon.Redo.prototype = {
        /**
         * Executes the redo functionality
         *
         * @returns {AbstractAddon.Redo}
         */
        execute: function()
        {
            // Storing the drawing options so we can restore them after the redraw
            var options = this._object.getDrawingOptions();

            // Redrawing the lines
            var line = this._dataStore.redo();

            this._object.setOptions(line.options);
            this._object.drawLine(line.points);

            // Restore
            this._object.setOptions(options);

            return this;
        }
    };

    Util.extend(AbstractAddon, AbstractAddon.Redo);

    return AbstractAddon.Redo;
});
