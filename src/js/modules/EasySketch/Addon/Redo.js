/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license https://github.com/brian978/easy-sketch.js/blob/master/LICENSE New BSD License
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
    AbstractAddon.Redo = function (dataStore) {
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
        execute: function () {
            // Moves the last line in the "undo" queue
            var line = this._dataStore.redo();

            if (line.length == 0) {
                return this;
            }

            // Storing the drawing options so we can restore them after the redraw
            var options = this.object.getDrawingOptions();

            // Redrawing the lines
            this.object.setOptions(line.options);
            this.object.drawLine(line.points, true);

            // Restore
            this.object.setOptions(options);

            return this;
        }
    };

    Util.extend(AbstractAddon, AbstractAddon.Redo);

    return AbstractAddon.Redo;
});
