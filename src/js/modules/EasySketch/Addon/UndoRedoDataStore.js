/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license https://github.com/brian978/easy-sketch.js/blob/master/LICENSE New BSD License
 */

define(["../EasySketch", "./AbstractAddon"], function (EasySketch, AbstractAddon) {

    /**
     * Data store manager for the undo/redo addons
     *
     * @constructor
     * @param {EasySketch.Sketch} object The Sketch object
     */
    AbstractAddon.UndoRedoDataStore = function (object) {

        /**
         *
         * @type {EasySketch.Sketch}
         * @private
         */
        this._object = object;

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

        /**
         *
         * @type {Array}
         * @private
         */
        this._currentLine = [];

        // Attaching some listeners to the Sketch object so we can store the line data
        var eventManager = this._object.getEventManager();
        eventManager.attach(EasySketch.Sketch.NOTIFY_START_EVENT, this.onPaint.bind(this))
            .attach(EasySketch.Sketch.NOTIFY_PAINT_EVENT, this.onPaint.bind(this))
            .attach(EasySketch.Sketch.NOTIFY_STOP_EVENT, this.onStopPaint.bind(this))
            .attach(EasySketch.Sketch.NOTIFY_LINE_DRAWN, this.onLineDrawn.bind(this));
    };

    AbstractAddon.UndoRedoDataStore.prototype = {
        /**
         * Pushes the lines that are drawn to the array that identifies the current line
         *
         * @param {EasySketch.Event} event
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        onPaint: function (event) {
            this._currentLine.push(event.getParam(0));

            return this;
        },

        /**
         * Transfers the current line to the lines array
         *
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        onStopPaint: function () {
            this._lines.push({
                points: this._currentLine,
                options: this._object.getDrawingOptions()
            });

            this._currentLine = [];
            this._stashedLines = [];

            return this;
        },

        /**
         *
         * @returns {Array}
         */
        getVisibleLines: function () {
            return this._lines;
        },

        /**
         * The data store needs to register the change when the drawLine() method from the Sketch object is called
         *
         * @param {EasySketch.Event} event
         * @returns {AbstractAddon.UndoRedoDataStore}
         */
        onLineDrawn: function (event) {
            this._lines.push({
                points: event.getParam(0),
                options: event.getParam(1)
            });

            return this;
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
         * Extracts the line that needs to be redone, pushes it to the visible lines array and returns the line data
         *
         * @returns {Array}
         */
        redo: function () {
            if (this._stashedLines.length <= 0) {
                return [];
            }

            var redoLine = this._stashedLines.pop();

            this._lines.push(redoLine);

            return redoLine;
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
