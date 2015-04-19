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
        getVisibleLines: function () {
            return this._lines;
        },

        /**
         *
         * @param {Object} line
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        pushLine: function (line) {
            this._lines.push(line);

            return this;
        },

        /**
         *
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        undo: function () {
            if (this._lines.length <= 0) {
                return this;
            }

            this._stashedLines.push(this._lines.pop());

            return this;
        },

        /**
         *
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        redo: function () {
            if (this._stashedLines.length <= 0) {
                return this;
            }

            this._lines.push(this._stashedLines.pop());

            return this;
        },

        /**
         *
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        reset: function () {
            this._lines = [];
            this._stashedLines = [];

            return this;
        }
    };

    return AbstractAddon.UndoRedoDataStore;
});
