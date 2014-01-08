/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2013
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

var EasySketch = EasySketch || {};

EasySketch.EventManager = function (binding) {
    "use strict";
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
    "use strict";

    this.lastMouse = {x: 0, y: 0};
    this.disabled = false;
    this.binded = false;
    this.drawing = false;
    this.events = new EasySketch.EventManager(this);
    this.eraser = false;
    this.canvas = this.__createCanvas(element);
    this.context = this.canvas.get(0).getContext("2d");

    this.options = {
        color: "#000000",
        width: 5,
        bindingObject: null,
        autoBind: true
    };

    this.listeners = {
        start: this.__startDrawing.bind(this),
        draw: this.__draw.bind(this),
        stop: this.__stopDrawing.bind(this)
    };

    if (options) {
        this.setOptions(options);
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

/**
 *
 * @param options
 * @returns {EasySketch.Sketch}
 */
EasySketch.Sketch.prototype.setOptions = function (options) {
    "use strict";

    this.options = $.extend(this.options, options || {});

    return this;
};

/**
 * Returns the value of an option if it exists and null (if this isn't changed) if it doesn't
 *
 * @param {String} name
 * @param {*=null} defaultValue
 * @returns {*}
 */
EasySketch.Sketch.prototype.getOption = function (name, defaultValue) {
    defaultValue = defaultValue || null;

    if (this.options.hasOwnProperty(name)) {
        return this.options[name];
    }

    return defaultValue;
};

/**
 *
 * @returns {EventManager|*}
 */
EasySketch.Sketch.prototype.getEventManager = function () {
    "use strict";
    return this.events;
};

/**
 *
 * @param {*} element
 * @returns {*}
 * @private
 */
EasySketch.Sketch.prototype.__createCanvas = function (element) {
    "use strict";
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
};

/**
 *
 * @returns {EasySketch.Sketch}
 */
EasySketch.Sketch.prototype.attachListeners = function () {
    "use strict";

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
};

/**
 * Listeners can also be detached if this is required
 *
 * @returns {EasySketch.Sketch}
 */
EasySketch.Sketch.prototype.detachListeners = function () {
    "use strict";

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
};

/**
 *
 * @returns {number}
 */
EasySketch.Sketch.prototype.getScale = function () {
    var prefixes = ["-moz", "-webkit", "-o", "-ms"];
    var property = null;
    var propertyName = "";
    var canvasStyle = this.canvas[0].style;
    var scale = 1;

    // Determining the property to use
    for (var i = 0; i < prefixes.length; i++) {
        propertyName = prefixes[i] + "-transform";
        if (propertyName in canvasStyle) {
            property = propertyName;
            break;
        }
    }

    var matrix = String(this.canvas.css(property));
    if (matrix != "none") {
        var regex = new RegExp("([0-9.-]+)", "g");
        var matches = matrix.match(regex);
        scale = matches[0];
    }

    return scale;
};

/**
 *
 * @param {Event} e
 * @returns {{x: Number, y: Number}}
 */
EasySketch.Sketch.prototype.getPointerPosition = function (e) {
    "use strict";

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
};

/**
 *
 * @param {Boolean} value
 * @returns {EasySketch.Sketch}
 */
EasySketch.Sketch.prototype.enableEraser = function (value) {
    "use strict";
    this.eraser = value;

    return this;
};

/**
 *
 * @returns {EasySketch.Sketch}
 * @private
 */
EasySketch.Sketch.prototype.__contextSetup = function () {
    // Saving first to avoid changing other stuff
    this.context.save();

    // Applying our requirements
    this.context.strokeStyle = this.options.color;
    this.context.lineWidth = this.options.width;
    this.context.lineCap = "round";
    this.context.lineJoin = "round";

    return this;
};

/**
 *
 * @returns {EasySketch.Sketch}
 * @private
 */
EasySketch.Sketch.prototype.__contextRestore = function () {
    this.context.restore();

    return this;
};

/**
 *
 * @param {Event=null} e
 * @param {Object=null} pos This is like a virtual mouse position when triggering this using the event manager
 * @returns {EasySketch.Sketch}
 * @private
 */
EasySketch.Sketch.prototype.__startDrawing = function (e, pos) {
    "use strict";

    if (this.drawing === true || this.disabled === true) {
        return this;
    }

    // Adding some CSS in the mix
    this.canvas.css('cursor', 'pointer');

    // Getting to information
    var mouse = pos || this.getPointerPosition(e);

    this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_START_EVENT, [mouse]);

    // Setting the flag first
    this.drawing = true;

    // Setting up the context with our requirements
    this.__contextSetup();

    // Storing the current mouse position so we can draw later
    this.lastMouse = mouse;

    return this;
};

/**
 *
 * @param {Event=null} e
 * @param {Object=null} pos This is like a virtual mouse position when triggering this using the event manager
 * @returns {EasySketch.Sketch}
 * @private
 */
EasySketch.Sketch.prototype.__draw = function (e, pos) {
    "use strict";

    if (this.drawing === false || this.disabled === true) {
        return this;
    }

    var mouse = pos || this.getPointerPosition(e);

    this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_PAINT_EVENT, [mouse]);

    // Configuring the pen
    if (this.eraser) {
        // We do a save first to keep the previous globalCompositionOperation
        this.context.save();
        this.context.strokeStyle = "rgba(0,0,0,1)";
        this.context.globalCompositeOperation = "destination-out";
    }

    // Adding a new point to the path
    this.context.beginPath();
    this.context.moveTo(this.lastMouse.x, this.lastMouse.y);
    this.context.lineTo(mouse.x, mouse.y);
    this.context.closePath();
    this.context.stroke();

    // Restoring the globalCompositeOperation
    if (this.eraser) {
        this.context.restore();
    }

    // Updating the last mouse position
    this.lastMouse = mouse;

    return this;
};

/**
 *
 * @returns {EasySketch.Sketch}
 * @private
 */
EasySketch.Sketch.prototype.__stopDrawing = function () {
    "use strict";
    if (this.drawing === false) {
        return this;
    }

    this.drawing = false;

    // Adding some CSS in the mix
    this.canvas.css('cursor', 'auto');

    // Restoring
    this.__contextRestore();

    this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_STOP_EVENT);

    return this;
};

/**
 *
 * @param {Array} pointsArray
 * @returns {EasySketch.Sketch}
 */
EasySketch.Sketch.prototype.drawLine = function (pointsArray) {
    "use strict";

    var points = pointsArray.slice();
    var coordinates = points.shift();

    // Executing the drawing operations
    this.__contextSetup();

    // Configuring the pen
    if (this.eraser) {
        // We do a save first to keep the previous globalCompositionOperation
        this.context.save();
        this.context.strokeStyle = "rgba(0,0,0,1)";
        this.context.globalCompositeOperation = "destination-out";
    }

    this.context.beginPath();
    this.context.moveTo(coordinates.x, coordinates.y);
    while (points.length > 0) {
        coordinates = points.shift();
        this.context.lineTo(coordinates.x, coordinates.y);
    }
    this.context.stroke();

    // Restoring the globalCompositeOperation
    if (this.eraser) {
        this.context.restore();
    }

    this.__contextRestore();

    return this;
};
