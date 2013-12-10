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
         * @param {Array=null} params
         */
        trigger: function (eventType, params) {
            params = params || [];

            if (params instanceof Array) {
                // The last parameter will let the listener know it was called via the event manager
                params.push(true);

                $this.manager.trigger(eventType, params);
            }
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
    var $this = this;

    this.listeners = [];
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

    if (options) {
        this.setOptions(options);
    }

    // This has nothing to do with the attaching of the listeners
    this.__registerListeners();

    if (this.options.autoBind === true) {
        this.attachListeners();
    }
};

// Listened events
EasySketch.Sketch.START_DRAW_EVENT = 'sketch.start';
EasySketch.Sketch.DRAW_EVENT = 'sketch.draw';
EasySketch.Sketch.STOP_DRAWING_EVENT = 'sketch.stop';

// Triggered events
EasySketch.Sketch.NOTIFY_START_EVENT = 'notify.start';
EasySketch.Sketch.NOTIFY_DRAW_EVENT = 'notify.draw';
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
 * @private
 */
EasySketch.Sketch.prototype.__registerListeners = function () {
    this.listeners.push({
        type: 'start',
        callback: this.__startDrawing.bind(this)
    });

    this.listeners.push({
        type: 'draw',
        callback: this.__draw.bind(this)
    });

    this.listeners.push({
        type: 'stop',
        callback: this.__stopDrawing.bind(this)
    });

    return this;
};

/**
 *
 * @returns {Object}
 * @private
 */
EasySketch.Sketch.prototype.__getBindObject = function () {
    // Selecting the object to bind on
    var bindingObject;
    if (this.getOption("bindingObject") !== null) {
        bindingObject = this.options["bindingObject"];
    } else {
        bindingObject = this.canvas;
    }

    return bindingObject;
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
    var bindingObject = this.__getBindObject();

    // Attaching the listeners
    var specs;
    for (var idx in this.listeners) {
        specs = this.listeners[idx];
        switch (specs.type) {
            case "start":
                bindingObject.on('mousedown touchstart', specs.callback);
                this.events.attach(EasySketch.Sketch.START_DRAW_EVENT, specs.callback);
                break;

            case "draw":
                bindingObject.on('mousemove touchmove', specs.callback);
                this.events.attach(EasySketch.Sketch.DRAW_EVENT, specs.callback);
                break;

            case "stop":
                bindingObject.on('mouseup mouseleave mouseout touchend touchcancel', specs.callback);
                this.events.attach(EasySketch.Sketch.STOP_DRAWING_EVENT, specs.callback);
                break;
        }
    }

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

    // Selecting the object to bind off
    var bindingObject = this.__getBindObject();

    // Detaching the listeners
    var specs;
    for (var idx in this.listeners) {
        specs = this.listeners[idx];
        switch (specs.type) {
            case "start":
                bindingObject.off('mousedown touchstart', specs.callback);
                this.events.detach(EasySketch.Sketch.START_DRAW_EVENT, specs.callback);
                break;

            case "draw":
                bindingObject.off('mousemove touchmove', specs.callback);
                this.events.detach(EasySketch.Sketch.DRAW_EVENT, specs.callback);
                break;

            case "stop":
                bindingObject.off('mouseup mouseleave mouseout touchend touchcancel', specs.callback);
                this.events.detach(EasySketch.Sketch.STOP_DRAWING_EVENT, specs.callback);
                break;
        }
    }

    return this;
};

/**
 *
 * @param {Event} e
 * @returns {{x: Number, y: Number}}
 */
EasySketch.Sketch.prototype.getPointerPosition = function (e) {
    "use strict";
    var $this = this;

    return {
        x: e.pageX - $this.canvas.offset().left,
        y: e.pageY - $this.canvas.offset().top
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
    var color = this.options.color;

    // Saving first to avoid changing other stuff
    this.context.save();

    // Converting the pencil to an eraser
    if (this.eraser) {
        color = "#000000";
        // We do a save first to keep the previous globalCompositionOperation
        this.context.save();
        this.context.globalCompositeOperation = "destination-out";
    }

    // Applying our requirements
    this.context.strokeStyle = color;
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
    // First call is to restore colors and other stuff
    this.context.restore();

    // Restore is called twice to also restore the globalCompositionOperation (when the eraser is active)
    if (this.eraser) {
        this.context.restore();
    }

    return this;
};

/**
 *
 * @param {Event=null} e
 * @param {Object=null} pos This is like a virtual mouse position when triggering this using the event manager
 * @param {Boolean=null} viaEventManager
 * @returns {EasySketch.Sketch}
 * @private
 */
EasySketch.Sketch.prototype.__startDrawing = function (e, pos, viaEventManager) {
    "use strict";
    viaEventManager = viaEventManager || null;

    if (this.drawing === true || this.disabled === true) {
        return this;
    }

    // Adding some CSS in the mix
    this.canvas.css('cursor', 'pointer');

    // Getting some information
    var mouse = pos || this.getPointerPosition(e);

    // Setting the flag first
    this.drawing = true;

    // Setting up the context with our requirements
    this.__contextSetup();

    // Storing the current mouse position so we can draw later
    this.lastMouse = mouse;

    // Sending a notification
    if (viaEventManager === null) {
        this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_START_EVENT, [mouse]);
    }

    return this;
};

/**
 *
 * @param {Event=null} e
 * @param {Object=null} pos This is like a virtual mouse position when triggering this using the event manager
 * @param {Boolean=null} viaEventManager
 * @returns {EasySketch.Sketch}
 * @private
 */
EasySketch.Sketch.prototype.__draw = function (e, pos, viaEventManager) {
    "use strict";
    viaEventManager = viaEventManager || null;

    if (this.drawing === false || this.disabled === true) {
        return this;
    }

    // Getting some information
    var mouse = pos || this.getPointerPosition(e);

    // Adding a new point to the path
    this.context.beginPath();
    this.context.moveTo(this.lastMouse.x, this.lastMouse.y);
    this.context.lineTo(mouse.x, mouse.y);
    this.context.closePath();
    this.context.stroke();

    // Updating the last mouse position
    this.lastMouse = mouse;

    // Sending a notification
    if (viaEventManager === null) {
        this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_DRAW_EVENT, [mouse]);
    }

    return this;
};

/**
 *
 * @param {Boolean=null} viaEventManager
 * @returns {EasySketch.Sketch}
 * @private
 */
EasySketch.Sketch.prototype.__stopDrawing = function (viaEventManager) {
    "use strict";
    viaEventManager = viaEventManager || null;

    if (this.drawing === false) {
        return this;
    }

    this.drawing = false;

    // Adding some CSS in the mix
    this.canvas.css('cursor', 'auto');

    // Restoring
    this.__contextRestore();

    // Sending a notification
    if (viaEventManager === null) {
        this.getEventManager().trigger(EasySketch.Sketch.NOTIFY_STOP_EVENT);
    }

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
    this.context.beginPath();
    this.context.moveTo(coordinates.x, coordinates.y);
    while (points.length > 0) {
        coordinates = points.shift();
        this.context.lineTo(coordinates.x, coordinates.y);
    }
    this.context.stroke();
    this.__contextRestore();

    return this;
};
