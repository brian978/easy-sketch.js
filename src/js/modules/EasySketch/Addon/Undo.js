/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license https://github.com/brian978/easy-sketch.js/blob/master/LICENSE New BSD License
 */

define(["../EasySketch", "./AbstractAddon", "../Util"], function (EasySketch, AbstractAddon, Util) {

    /**
     * Constructor for the undo addon
     *
     * @constructor
     * @extends {EasySketch.Addon.AbstractAddon}
     * @param {EasySketch.Addon.UndoRedoDataStore} dataStore
     * @returns {void}
     */
    AbstractAddon.Undo = function (dataStore) {
        /**
         *
         * @type {EasySketch.Addon.UndoRedoDataStore}
         * @private
         */
        this._dataStore = dataStore;
    };

    AbstractAddon.Undo.prototype = {

        /**
         * Executes the undo functionality
         *
         * @returns {AbstractAddon.Undo}
         */
        execute: function () {
            this.object.clear();

            // Moves the last line in the redo queue
            this._dataStore.undo();

            // Storing the drawing options so we can restore them after the redraw
            var options = this.object.getDrawingOptions();

            // Redrawing the lines
            var lines = this._dataStore.getVisibleLines();
            for (var idx in lines) {
                if (lines.hasOwnProperty(idx)) {
                    this.object.setOptions(lines[idx].options);
                    this.object.drawLine(lines[idx].points, true);
                }
            }

            // Restore
            this.object.setOptions(options);

            return this;
        }
    };

    Util.extend(AbstractAddon, AbstractAddon.Undo);

    return AbstractAddon.Undo;
});
