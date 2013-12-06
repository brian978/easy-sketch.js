/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2013
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

var EasySketch = EasySketch || {};

/**
 *
 * @returns {{trigger: Function, attach: Function, detach: Function}}
 * @constructor
 */
EasySketch.EventManager = function (binding) {
    "use strict";

    this.manager = $(binding);
    var $this = this;

    return {
        /**
         *
         * @param {String} eventType
         * @param {Array=null} params
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
    var $this = this;

    this.painting = false;
    this.events = new EasySketch.EventManager(this);
    this.eraser = false;
    this.canvas = this.__createCanvas(element);
    this.context = this.canvas.get(0).getContext("2d");
    this.options = {
        color: "#000000",
        width: 5
    };

    this.__attachListeners();

    if (options) {
        this.setOptions(options);
    }
};

EasySketch.Sketch.START_PAINTING_EVENT = 'sketch.start';
EasySketch.Sketch.PAINT_EVENT = 'sketch.paint';
EasySketch.Sketch.STOP_PAINTING_EVENT = 'sketch.stop';

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
 * @returns {Sketch}
 */
EasySketch.Sketch.prototype.__attachListeners = function () {
    "use strict";

    var startPainting = this.__startPainting.bind(this);
    var paint = this.__paint.bind(this);
    var stopPainting = this.__stopPainting.bind(this);

    // Canvas listeners
    this.canvas.on('mousedown touchstart', startPainting);
    this.canvas.on('mousemove touchmove', paint);
    this.canvas.on('mouseup mouseleave mouseout touchend touchcancel', stopPainting);

    this.events.attach(this.START_PAINTING_EVENT, function () {
        alert('test');
    });

    // Event manager listeners
    this.events.attach(EasySketch.Sketch.START_PAINTING_EVENT, startPainting);
    this.events.attach(EasySketch.Sketch.PAINT_EVENT, paint);
    this.events.attach(EasySketch.Sketch.STOP_PAINTING_EVENT, stopPainting);

    return this;
};

/**
 *
 * @param {Event} e
 * @returns {{x: Number, y: Number}}
 */
EasySketch.Sketch.prototype.__getPointerPosition = function (e) {
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
 * @param {Event} e
 * @param {Object=null} pos This is like a virtual mouse position when triggering this using the event manager
 * @returns {EasySketch.Sketch}
 */
EasySketch.Sketch.prototype.__startPainting = function (e, pos) {
    "use strict";

    // Adding some CSS in the mix
    this.canvas.css('cursor', 'pointer');

    // Getting to information
    var mouse = pos || this.__getPointerPosition(e);
    var color = this.options.color;

    // Setting the flag first
    this.painting = true;

    // Saving first to avoid changing other stuff
    this.context.save();

    if (this.eraser) {
        color = "rgba(0,0,0,0)";
        this.context.save();
        this.context.globalCompositeOperation = "copy";
    }

    // Applying our requirements
    this.context.strokeStyle = color;
    this.context.lineWidth = this.options.width;
    this.context.lineCap = "round";
    this.context.lineJoin = "round";

    // Beginning the path
    this.context.beginPath();
    this.context.moveTo(mouse.x, mouse.y);

    return this;
};

/**
 *
 * @param {Event} e
 * @param {Object=null} pos This is like a virtual mouse position when triggering this using the event manager
 * @returns {EasySketch.Sketch}
 */
EasySketch.Sketch.prototype.__paint = function (e, pos) {
    "use strict";

    // Fail safe
    if (this.painting === false) {
        return this;
    }

    var mouse = pos || this.__getPointerPosition(e);

    // Adding a new point to the path
    this.context.lineTo(mouse.x, mouse.y);
    this.context.stroke();

    return this;
};

/**
 *
 * @returns {EasySketch.Sketch}
 */
EasySketch.Sketch.prototype.__stopPainting = function () {
    "use strict";

    // Adding some CSS in the mix
    this.canvas.css('cursor', 'auto');

    this.painting = false;
    this.context.restore();
    this.context.restore();

    return this;
};
