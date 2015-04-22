/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license https://github.com/brian978/easy-sketch.js/blob/master/LICENSE New BSD License
 */

define(["./EasySketch", "./EventManager", "./Util"], function (EasySketch, EventManager, Util) {

    /**
     *
     * @param {Object} element
     * @param {Object=null} options
     * @constructor
     */
    EasySketch.Sketch = function (element, options) {

        /**
         *
         * @type {{x: number, y: number}}
         * @protected
         */
        this.lastMouse = {x: 0, y: 0};

        /**
         *
         * @type {boolean}
         * @protected
         */
        this.disabled = false;

        /**
         *
         * @type {boolean}
         * @protected
         */
        this.binded = false;

        /**
         *
         * @type {boolean}
         * @protected
         */
        this.drawing = false;

        /**
         *
         * @type {EasySketch.EventManager}
         * @protected
         */
        this.events = new EventManager();

        /**
         *
         * @type {boolean}
         * @protected
         */
        this.eraser = false;

        /**
         *
         * @type {jQuery}
         * @protected
         */
        this.canvas = this._createCanvas(element);

        /**
         *
         * @type {CanvasRenderingContext2D}
         * @protected
         */
        this.context = this.canvas.get(0).getContext("2d");

        /**
         *
         * @type {jQuery}
         * @protected
         */
        this.overlay = null;

        /**
         *
         * @type {CanvasRenderingContext2D}
         * @protected
         */
        this.overlayContext = null;

        /**
         *
         * @type {Array}
         * @protected
         */
        this.points = [];

        /**
         *
         * @type {{color: string, width: number, alpha: number, bindingObject: jQuery, autoBind: boolean, doubleBuffering: boolean}}
         * @protected
         */
        this.options = {
            color: "#000000",
            width: 5,
            alpha: 1,
            bindingObject: null,
            autoBind: true,
            doubleBuffering: false
        };

        /**
         *
         * @type {{start: (function(this:EasySketch.Sketch)), draw: (function(this:EasySketch.Sketch)), stop: (function(this:EasySketch.Sketch))}}
         * @protected
         */
        this.listeners = {
            start: this.startDrawing.bind(this),
            draw: this.makeDrawing.bind(this),
            stop: this.stopDrawing.bind(this)
        };

        /**
         * Contains the list of addons attached to the sketcher
         *
         * @type {Array}
         * @protected
         */
        this.addons = [];

        // Setting the options
        if (options) {
            this.setOptions(options);
        }

        // Creating the overlay
        if (this.options.doubleBuffering === true) {
            this._createOverlay();
        }

        if (this.options.autoBind === true) {
            this.attachListeners();
        }

        this._attachStandardListeners();
    };

    // Triggered events
    EasySketch.Sketch.NOTIFY_START_EVENT = 'notify.start';
    EasySketch.Sketch.NOTIFY_PAINT_EVENT = 'notify.paint';
    EasySketch.Sketch.NOTIFY_STOP_EVENT = 'notify.stop';
    EasySketch.Sketch.NOTIFY_LINE_DRAWN = 'notify.line.drawn';

    EasySketch.Sketch.prototype = {
        /**
         *
         * @returns {CanvasRenderingContext2D}
         * @protected
         */
        selectContext: function () {
            if (this.options.doubleBuffering === true && this.eraser === false) {
                return this.overlayContext;
            }

            return this.context;
        },

        /**
         *
         * @returns {jQuery}
         * @protected
         */
        selectCanvas: function () {
            if (this.options.doubleBuffering === true) {
                return this.overlay;
            }

            return this.canvas;
        },

        /**
         *
         * @param options
         * @returns {EasySketch.Sketch}
         */
        setOptions: function (options) {
            this.options = $.extend(this.options, options || {});

            return this;
        },

        /**
         *
         * @param {String} name
         * @param {String|Number|Object} value
         * @returns {EasySketch.Sketch}
         */
        setOption: function (name, value) {
            if (typeof name === "string" && this.options.hasOwnProperty(name)) {
                this.options[name] = value;
            }

            return this;
        },

        /**
         * Returns the value of an option if it exists and null (if this isn't changed) if it doesn't
         *
         * @param {String} name
         * @param {*=null} defaultValue
         * @returns {*}
         */
        getOption: function (name, defaultValue) {
            defaultValue = defaultValue || null;

            if (this.options.hasOwnProperty(name)) {
                return this.options[name];
            }

            return defaultValue;
        },

        /**
         * Returns the relevant options required to create a line
         *
         * @returns {{color: String, width: int, alpha: float}}
         */
        getDrawingOptions: function()
        {
            return {
                color: this.options.color,
                width: this.options.width,
                alpha: this.options.alpha
            };
        },

        /**
         *
         * @returns {EventManager|*}
         */
        getEventManager: function () {
            return this.events;
        },

        /**
         *
         * @param {Object} element
         * @returns {jQuery}
         * @private
         */
        _createCanvas: function (element) {
            var canvas;
            var elementType = typeof element;

            switch (elementType) {
                case "string":
                    if (element.indexOf('#') === 0) {
                        canvas = $(element);
                    } else if (element.indexOf('.') === -1) {
                        canvas = $("#" + element);
                    }
                    break;

                case "object":
                    if (element instanceof jQuery) {
                        canvas = element;
                    } else {
                        canvas = $(element);
                    }
                    break;
            }

            if (canvas.css("position").indexOf("absolute") === -1) {
                canvas.css("position", "absolute");
            }

            if (isNaN(parseInt(canvas.css("top")))) {
                canvas.css("top", 0);
            }

            if (isNaN(parseInt(canvas.css("left")))) {
                canvas.css("left", 0);
            }

            return canvas;
        },

        /**
         *
         * @returns {EasySketch.Sketch}
         * @private
         */
        _createOverlay: function () {
            // Making sure the overlay does not go out of the container
            this.canvas.parent().css("position", "relative");

            // Creating the overlay
            var overlay = $("<canvas></canvas>");
            overlay.addClass("drawing-overlay");
            overlay.attr("width", this.canvas.attr("width"));
            overlay.attr("height", this.canvas.attr("height"));
            overlay.css("position", "absolute");
            overlay.css("top", this.canvas.css("top"));
            overlay.css("left", this.canvas.css("top"));

            // Adding the overlay on top of our canvas
            this.canvas.after(overlay);

            // Replacing several object to make the overlay work
            this.options.bindingObject = overlay;
            this.overlayContext = overlay.get(0).getContext("2d");
            this.overlay = overlay;

            return this;
        },

        /**
         *
         * @returns {EasySketch.Sketch}
         * @private
         */
        _autoAdjustOverlay: function () {
            if (this.overlay !== null) {
                var scale = Util.getScale(this.canvas);

                this.overlay.attr("width", this.canvas.attr("width"));
                this.overlay.attr("height", this.canvas.attr("height"));
                this.overlay.css("position", "absolute");
                this.overlay.css("top", this.canvas.css("top"));
                this.overlay.css("left", this.canvas.css("top"));
                this.overlay.css(Util.getScalePropertyName(this.canvas), "scale(" + scale.x + ", " + scale.y + ")");
            }

            return this;
        },

        /**
         *
         * @returns {EasySketch.Sketch}
         * @private
         */
        _attachStandardListeners: function () {
            this.canvas.on("DOMAttrModified", this._autoAdjustOverlay.bind(this));

            return this;
        },

        /**
         *
         * @returns {EasySketch.Sketch}
         */
        attachListeners: function () {
            if (this.binded === true) {
                return this;
            }

            this.binded = true;

            // Selecting the object to bind on
            var bindingObject;
            if (this.getOption("bindingObject") !== null) {
                bindingObject = this.options["bindingObject"];
            } else {
                bindingObject = this.canvas;
            }

            // Canvas listeners
            bindingObject.on('mousedown touchstart', this.listeners.start);
            bindingObject.on('mousemove touchmove', this.listeners.draw);
            bindingObject.on('mouseup mouseleave mouseout touchend touchcancel', this.listeners.stop);

            return this;
        },

        /**
         * Listeners can also be detached if this is required
         *
         * @returns {EasySketch.Sketch}
         */
        detachListeners: function () {
            if (this.binded === false) {
                return this;
            }

            this.binded = false;

            // Selecting the object to bind on
            var bindingObject;
            if (this.getOption("bindingObject") !== null) {
                bindingObject = this.options["bindingObject"];
            } else {
                bindingObject = this.canvas;
            }

            // Canvas listeners
            bindingObject.off('mousedown touchstart', this.listeners.start);
            bindingObject.off('mousemove touchmove', this.listeners.draw);
            bindingObject.off('mouseup mouseleave mouseout touchend touchcancel', this.listeners.stop);

            return this;
        },

        /**
         *
         * @param {Event} e
         * @returns {{x: Number, y: Number}}
         */
        getPointerPosition: function (e) {
            var $this = this;
            var scale = Util.getScale(this.selectCanvas());

            if (e.hasOwnProperty("originalEvent") && e.originalEvent.hasOwnProperty("changedTouches") && e.originalEvent.changedTouches.length > 0) {
                e.pageX = e.originalEvent.changedTouches[0].pageX;
                e.pageY = e.originalEvent.changedTouches[0].pageY;
            }

            return {
                x: Math.ceil((e.pageX - $this.canvas.offset().left) / scale.x),
                y: Math.ceil((e.pageY - $this.canvas.offset().top) / scale.y)
            }
        },

        /**
         *
         * @param {Boolean} value
         * @returns {EasySketch.Sketch}
         */
        enableEraser: function (value) {
            this.eraser = value;

            return this;
        },

        /**
         *
         * @param {CanvasRenderingContext2D=CanvasRenderingContext2D} context
         * @returns {EasySketch.Sketch}
         * @protected
         */
        contextSetup: function (context) {
            context = context || this.selectContext();

            // Saving first to avoid changing other stuff
            context.save();

            // Applying our requirements
            context.strokeStyle = this.options.color;
            context.lineWidth = this.options.width;
            context.globalAlpha = this.options.alpha;
            context.lineCap = "round";
            context.lineJoin = "round";

            return this;
        },

        /**
         *
         * @param {CanvasRenderingContext2D=CanvasRenderingContext2D} context
         * @returns {EasySketch.Sketch}
         * @protected
         */
        contextRestore: function (context) {
            context = context || this.selectContext();
            context.restore();

            return this;
        },

        /**
         *
         * @param {Event} e
         * @returns {EasySketch.Sketch}
         * @protected
         */
        startDrawing: function (e) {
            if (this.drawing === true || this.disabled === true) {
                return this;
            }

            // To be able to handle touch events
            e.preventDefault();

            // Getting the pointer position if it was not provided
            var mouse = this.getPointerPosition(e);

            this.drawing = true;
            this.lastMouse = mouse;

            // Setting up the context with our requirements
            this.contextSetup();

            // Buffering the mouse position
            if (this.options.doubleBuffering === true && this.eraser === false) {
                this.points.push(mouse);
            }

            this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_START_EVENT, this, [mouse]);

            return this;
        },

        /**
         *
         * @param {Event} e
         * @returns {EasySketch.Sketch}
         * @protected
         */
        makeDrawing: function (e) {
            if (this.drawing === false || this.disabled === true) {
                return this;
            }

            // To be able to handle touch events
            e.preventDefault();

            var mouse = this.getPointerPosition(e);

            this.drawPoints([this.lastMouse, mouse], this.selectContext());

            // The last position MUST be updated after drawing the line
            this.lastMouse = mouse;

            // Redrawing the line on the overlay
            if (this.options.doubleBuffering === true && this.eraser === false) {
                this.points.push(mouse);
                this.redrawBuffer();
            }

            this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_PAINT_EVENT, this, [mouse]);

            return this;
        },

        /**
         *
         * @returns {EasySketch.Sketch}
         * @protected
         */
        stopDrawing: function () {
            if (this.drawing === false) {
                return this;
            }

            this.drawing = false;

            // Adding some CSS in the mix
            this.canvas.css('cursor', 'auto');

            // Restoring
            this.contextRestore();

            // Flushing the buffer
            if (this.options.doubleBuffering === true && this.eraser === false) {
                this.drawLine(this.points, true);
                this.points = [];
                this.clearOverlay();
            }

            // Triggering the stop event
            this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_STOP_EVENT, this);

            return this;
        },

        /**
         *
         * @returns {EasySketch.Sketch}
         * @protected
         */
        redrawBuffer: function () {
            this.clearOverlay();
            this.drawPoints(this.points, this.overlayContext);

            return this;
        },

        /**
         *
         * @param {Array} points
         * @param {CanvasRenderingContext2D} context
         * @returns {EasySketch.Sketch}
         * @protected
         */
        drawPoints: function (points, context) {
            points = points.slice();
            var coordinates = points.shift();

            // Configuring the pen
            if (this.eraser) {
                // We do a save first to keep the previous globalCompositionOperation
                context.save();
                context.strokeStyle = "rgba(0,0,0,1)";
                context.globalAlpha = 1;
                context.globalCompositeOperation = "destination-out";
            }

            context.beginPath();
            context.moveTo(coordinates.x, coordinates.y);
            while (points.length > 0) {
                coordinates = points.shift();
                context.lineTo(coordinates.x, coordinates.y);
            }
            context.stroke();
            context.closePath();

            // Restoring the globalCompositeOperation
            if (this.eraser) {
                context.restore();
            }

            return this;
        },

        /**
         *
         * @param {Array} pointsArray
         * @param {boolean=false} skipEvent
         * @returns {EasySketch.Sketch}
         */
        drawLine: function (pointsArray, skipEvent) {
            skipEvent = skipEvent || false;

            // Drawing a line MUST always be done on the master canvas
            var context = this.context;

            // Executing the drawing operations
            this.contextSetup(context);
            this.drawPoints(pointsArray, context);
            this.contextRestore(context);

            // This is used mostly by addons or components of addons
            if (!skipEvent) {
                this.getEventManager()
                    .trigger(EasySketch.Sketch.NOTIFY_LINE_DRAWN, this, [pointsArray, this.getDrawingOptions()]);
            }

            return this;
        },

        /**
         *
         * @returns {EasySketch.Sketch}
         */
        clear: function () {
            this.context.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);

            return this;
        },

        /**
         *
         * @returns {EasySketch.Sketch}
         */
        clearOverlay: function () {
            if (this.overlayContext instanceof CanvasRenderingContext2D) {
                this.overlayContext.clearRect(0, 0, this.overlay[0].width, this.overlay[0].height);
            }

            return this;
        },

        /**
         *
         * @param {EasySketch.Addon.AbstractAddon} addon
         * @returns {EasySketch.Sketch}
         */
        registerAddon: function (addon) {
            this.addons.push(addon);

            addon.attachSketchObject(this);

            return this;
        }
    };

    return EasySketch.Sketch;
});
