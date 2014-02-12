/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2013
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

var EasySketch = EasySketch || {};

EasySketch.EventManager = function (binding) {
    var $this = this;

    this.manager = $(binding);

    return {
        /**
         *
         * @param {String} eventType
         * @param {Array|Object=null} params
         */
        trigger: function (eventType, params) {
            $this.manager.trigger(eventType, params || null);
        },
        /**
         *
         * @param {String} eventType
         * @param {Function} handler
         * @param {Array=null} data Some data that can be passed to the function call
         */
        attach: function (eventType, handler, data) {
            $this.manager.on(eventType, data || null, handler);
        },
        /**
         *
         * @param {String} eventType
         * @param {Function} handler
         */
        detach: function (eventType, handler) {
            $this.manager.unbind(eventType, handler);
        }
    };
};

/**
 *
 * @param {*} element
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
    this.events = new EasySketch.EventManager(this);

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
        doubleBuffering: true
    };

    /**
     *
     * @type {{start: (function(this:EasySketch.Sketch)), draw: (function(this:EasySketch.Sketch)), stop: (function(this:EasySketch.Sketch))}}
     * @protected
     */
    this.listeners = {
        start: this._startDrawing.bind(this),
        draw: this._draw.bind(this),
        stop: this._stopDrawing.bind(this)
    };

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
};

// Listened events
EasySketch.Sketch.START_PAINTING_EVENT = 'sketch.start';
EasySketch.Sketch.PAINT_EVENT = 'sketch.paint';
EasySketch.Sketch.STOP_PAINTING_EVENT = 'sketch.stop';

// Triggered events
EasySketch.Sketch.NOTIFY_START_EVENT = 'notify.start';
EasySketch.Sketch.NOTIFY_PAINT_EVENT = 'notify.paint';
EasySketch.Sketch.NOTIFY_STOP_EVENT = 'notify.stop';

EasySketch.Sketch.prototype = {
    /**
     *
     * @returns {CanvasRenderingContext2D}
     * @private
     */
    _selectContext: function () {
        if (this.options.doubleBuffering === true) {
            return this.overlayContext;
        }

        return this.context;
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
     *
     * @returns {EventManager|*}
     */
    getEventManager: function () {
        return this.events;
    },

    /**
     *
     * @param {*} element
     * @returns {*}
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
        overlay.css("top", 0);
        overlay.css("left", 0);

        // Adding the overlay on top of our canvas
        this.canvas.after(overlay);

        // Replacing several object to make the overlay work
        this.options.bindingObject = overlay;
        this.overlayContext = overlay.get(0).getContext("2d");

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

        // Event manager listeners
        this.events.attach(EasySketch.Sketch.START_PAINTING_EVENT, this.listeners.start);
        this.events.attach(EasySketch.Sketch.PAINT_EVENT, this.listeners.draw);
        this.events.attach(EasySketch.Sketch.STOP_PAINTING_EVENT, this.listeners.stop);

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

        // Event manager listeners
        this.events.detach(EasySketch.Sketch.START_PAINTING_EVENT, this.listeners.start);
        this.events.detach(EasySketch.Sketch.PAINT_EVENT, this.listeners.draw);
        this.events.detach(EasySketch.Sketch.STOP_PAINTING_EVENT, this.listeners.stop);

        return this;
    },

    /**
     *
     * @returns {number}
     */
    getScale: function () {
        var property = null;
        var canvasStyle = this.canvas[0].style;
        var scale = 1;

        // Looking for the non-prefixed property first since it's easier
        if ("transform" in canvasStyle) {
            property = "transform";
        } else {
            // Determining the property to use
            var prefixes = ["-moz", "-webkit", "-o", "-ms"];
            var propertyName = "";
            for (var i = 0; i < prefixes.length; i++) {
                propertyName = prefixes[i] + "-transform";
                if (propertyName in canvasStyle) {
                    property = propertyName;
                    break;
                }
            }
        }

        if (property !== null) {
            var matrix = String(this.canvas.css(property));
            if (matrix != "none") {
                var regex = new RegExp("([0-9.-]+)", "g");
                var matches = matrix.match(regex);
                scale = matches[0];
            }
        }

        return scale;
    },

    /**
     *
     * @param {Event} e
     * @returns {{x: Number, y: Number}}
     */
    getPointerPosition: function (e) {
        var $this = this;
        var scale = this.getScale();

        if (e.hasOwnProperty("originalEvent") && e.originalEvent.hasOwnProperty("targetTouches")) {
            e.pageX = e.originalEvent.targetTouches[0].pageX;
            e.pageY = e.originalEvent.targetTouches[0].pageY;
        }

        return {
            x: Math.ceil((e.pageX - $this.canvas.offset().left) / scale),
            y: Math.ceil((e.pageY - $this.canvas.offset().top) / scale)
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
     * @private
     */
    _contextSetup: function (context) {
        context = context || this._selectContext();

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
     * @private
     */
    _contextRestore: function (context) {
        context = context || this._selectContext();
        context.restore();

        return this;
    },

    /**
     *
     * @param {Event=null} e
     * @param {Object=null} pos This is like a virtual mouse position when triggering this using the event manager
     * @returns {EasySketch.Sketch}
     * @private
     */
    _startDrawing: function (e, pos) {
        if (this.drawing === true || this.disabled === true) {
            return this;
        }

        // To be able to handle touch events
        e.preventDefault();

        // Getting the pointer position if it was not provided
        var mouse = pos || this.getPointerPosition(e);

        this.drawing = true;
        this.lastMouse = mouse;

        // Setting up the context with our requirements
        this._contextSetup();

        // Buffering the mouse position
        if (this.options.doubleBuffering === true) {
            this.points.push(mouse);
        }

        this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_START_EVENT, [mouse]);

        return this;
    },

    /**
     *
     * @param {Event=null} e
     * @param {Object=null} pos This is like a virtual mouse position when triggering this using the event manager
     * @returns {EasySketch.Sketch}
     * @private
     */
    _draw: function (e, pos) {
        if (this.drawing === false || this.disabled === true) {
            return this;
        }

        // To be able to handle touch events
        e.preventDefault();

        var mouse = pos || this.getPointerPosition(e);

        this._drawPoints([this.lastMouse, mouse], this._selectContext());

        // The last position MUST be updated after drawing the line
        this.lastMouse = mouse;

        // Redrawing the line on the overlay
        if (this.options.doubleBuffering === true) {
            this.points.push(mouse);
            this._redrawBuffer();
        }

        this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_PAINT_EVENT, [mouse]);

        return this;
    },

    /**
     *
     * @returns {EasySketch.Sketch}
     * @private
     */
    _stopDrawing: function () {
        if (this.drawing === false) {
            return this;
        }

        this.drawing = false;

        // Adding some CSS in the mix
        this.canvas.css('cursor', 'auto');

        // Restoring
        this._contextRestore();

        // Flushing the buffer
        if (this.options.doubleBuffering === true) {
            this.drawLine(this.points);
            this.points = [];
            this.overlayContext.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
        }

        // Triggering the stop event
        this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_STOP_EVENT);

        return this;
    },

    /**
     *
     * @returns {EasySketch.Sketch}
     * @private
     */
    _redrawBuffer: function () {
        this.overlayContext.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
        this._drawPoints(this.points, this.overlayContext);

        return this;
    },

    /**
     *
     * @param {Array} points
     * @param {CanvasRenderingContext2D} context
     * @returns {EasySketch.Sketch}
     * @private
     */
    _drawPoints: function (points, context) {
        points = points.slice();
        var coordinates = points.shift();

        // Configuring the pen
        if (this.eraser) {
            // We do a save first to keep the previous globalCompositionOperation
            context.save();
            context.strokeStyle = "rgba(0,0,0,1)";
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
     * @returns {EasySketch.Sketch}
     */
    drawLine: function (pointsArray) {
        // Drawing a line MUST always be done on the master canvas
        var context = this.context;

        // Executing the drawing operations
        this._contextSetup(context);
        this._drawPoints(pointsArray, context);
        this._contextRestore(context);

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
     * @returns {Object}
     */
    getBindObject: function () {
        return this.options.bindingObject;
    }
};
