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
     * @param dataStore {EasySketch.Addon.UndoRedoDataStore}
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
            this._object.clear();

            // Moves the last line in the redo queue
            this._dataStore.redo();

            // Storing the drawing options so we can restore them after the redraw
            var options = this._object.getDrawingOptions();

            // Redrawing the lines
            var lines = this._dataStore.getVisibleLines();
            for(var idx in lines) {
                if(lines.hasOwnProperty(idx)) {
                    this._object.setOptions(lines[idx].options);
                    this._object.drawLine(lines[idx].points);
                }
            }

            // Restore
            this._object.setOptions(options);

            return this;
        }
    };

    Util.extend(AbstractAddon, AbstractAddon.Redo);

    return AbstractAddon.Redo;
});
