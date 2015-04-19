/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

define(["../EasySketch", "./AbstractAddon", "../Util"], function (EasySketch, AbstractAddon, Util) {

    /**
     * Constructor for the undo addon
     *
     * @constructor
     * @extends {EasySketch.Addon.AbstractAddon}
     * @returns {void}
     */
    AbstractAddon.Undo = function () {
        /**
         * The lines the can be undone
         *
         * @type {Array}
         * @private
         */
        this._lines = [];

        /**
         * The current line is populated with the points that the user currently draws
         *
         * @type {Array}
         * @private
         */
        this._currentLine = [];
    };

    AbstractAddon.Undo.prototype = {
        /**
         *
         * @param {EasySketch.Sketch} object
         * @returns {EasySketch.Addon.AbstractAddon}
         */
        attachSketchObject: function (object) {
            AbstractAddon.prototype.attachSketchObject.call(this, object);

            object.getEventManager().attach(EasySketch.Sketch.NOTIFY_START_EVENT, this.onPaint.bind(this));
            object.getEventManager().attach(EasySketch.Sketch.NOTIFY_PAINT_EVENT, this.onPaint.bind(this));
            object.getEventManager().attach(EasySketch.Sketch.NOTIFY_STOP_EVENT, this.onStopPaint.bind(this));

            return this;
        },

        /**
         * Pushes the lines that are drawn to the array that identifies the current line
         *
         * @param {EasySketch.Event} event
         * @returns {AbstractAddon.Undo}
         */
        onPaint: function (event) {
            this._currentLine.push(event.getParam(0));

            return this;
        },

        /**
         * Transfers the current line to the lines array
         *
         * @returns {AbstractAddon.Undo}
         */
        onStopPaint: function () {
            this._lines.push({
                options: this._object.getDrawingOptions(),
                points: this._currentLine
            });

            this._currentLine = [];

            return this;
        },

        /**
         * Executes the undo functionality
         *
         * @returns {AbstractAddon.Undo}
         */
        execute: function()
        {
            this._object.clear();

            // Storing the drawing options so we can restore them after the redraw
            var options = this._object.getDrawingOptions();

            // Redrawing the lines
            for(var idx in this._lines) {
                if(this._lines.hasOwnProperty(idx)) {
                    if(idx == (this._lines.length - 1)) {
                        // Removing the last line so we can undo further
                        this._lines.pop();

                        break;
                    }

                    this._object.setOptions(this._lines[idx].options);
                    this._object.drawLine(this._lines[idx].points);
                }
            }

            // Restore
            this._object.setOptions(options);

            return this;
        }
    };

    Util.extend(AbstractAddon, AbstractAddon.Undo);

    return AbstractAddon.Undo;
});
