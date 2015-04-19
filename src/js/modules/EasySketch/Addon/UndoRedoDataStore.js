/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

define(["../EasySketch", "./AbstractAddon"], function (EasySketch, AbstractAddon) {

    /**
     * Data store manager for the undo/redo addons
     *
     * @constructor
     */
    AbstractAddon.UndoRedoDataStore = function () {
        /**
         * The lines that are visible on the workspace
         *
         * @type {Array}
         * @private
         */
        this._lines = [];

        /**
         * The redo queue
         *
         * @type {Array}
         * @private
         */
        this._stashedLines = [];
    };

    AbstractAddon.UndoRedoDataStore.prototype = {
        /**
         *
         * @returns {Array}
         */
        getVisibleLines: function()
        {
            return this._lines;
        },

        /**
         *
         * @param {Object} line
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        pushLine: function(line)
        {
            this._lines.push(line);

            return this;
        },

        /**
         *
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        undo: function () {
            this._stashedLines.push(this._lines.pop());

            var lines = [];
            for(var idx in this._lines) {
                if(this._lines.hasOwnProperty(idx) && typeof this._lines[idx] !== "undefined") {
                    lines.push(this._lines[idx]);
                }
            }

            this._lines = lines;

            return this;
        },

        /**
         *
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        redo: function () {
            this._lines.push(this._stashedLines.pop());

            var lines = [];
            for(var idx in this._stashedLines) {
                if(this._stashedLines.hasOwnProperty(idx) && typeof this._stashedLines[idx] !== "undefined") {
                    lines.push(this._stashedLines[idx]);
                }
            }

            this._stashedLines = lines;

            return this;
        },

        /**
         *
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        reset: function()
        {
            this._lines = [];
            this._stashedLines = [];

            return this;
        }
    };

    return AbstractAddon.UndoRedoDataStore;
});
