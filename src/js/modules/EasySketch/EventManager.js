/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license https://github.com/brian978/easy-sketch.js/blob/master/LICENSE New BSD License
 */

define(["./EasySketch", "./Event"], function (EasySketch) {

    /**
     *
     * @constructor
     */
    EasySketch.EventManager = function () {
        /**
         *
         * @type {Array}
         * @protected
         */
        this.events = {};
    };

    EasySketch.EventManager.prototype = {

        /**
         *
         * @param {String|Array} event
         * @returns {Array}
         * @private
         */
        _prepareEvent: function (event) {
            if (typeof event == "string") {
                if (event.indexOf(" ") !== -1) {
                    event = event.split(" ");
                } else {
                    event = [event];
                }
            }

            return event;
        },

        /**
         * Alias for attach()
         *
         * @param {String|Array} event
         * @param {Function} callback
         * @returns {EasySketch.EventManager}
         */
        on: function (event, callback) {
            return this.attach(event, callback);
        },

        /**
         *
         * @param {String|Array} event
         * @param {Function} callback
         * @returns {EasySketch.EventManager}
         */
        attach: function (event, callback) {
            var evt;
            var events = this._prepareEvent(event);
            for (var key in events) {
                if (events.hasOwnProperty(key)) {
                    evt = events[key];
                    if (this.events.hasOwnProperty(evt) === false) {
                        this.events[evt] = [];
                    }

                    this.events[evt].push(callback);
                }
            }

            return this;
        },

        /**
         * Alias for detach()
         *
         * @param {String|Array} event
         * @param {Function} callback
         * @returns {EasySketch.EventManager}
         */
        off: function (event, callback) {
            return this.detach(event, callback);
        },

        /**
         *
         * @param {String|Array} event
         * @param {Function} callback
         * @returns {EasySketch.EventManager}
         */
        detach: function (event, callback) {
            var evt;
            var events = this._prepareEvent(event);
            for (var key in events) {
                if (events.hasOwnProperty(key)) {
                    evt = events[key];
                    if (this.events.hasOwnProperty(evt)) {
                        for (var evtKey in this.events[evt]) {
                            if (this.events[evt].hasOwnProperty(evtKey) && this.events[evt][evtKey] === callback) {
                                this.events[evt][evtKey] = null;
                                delete this.events[evt][evtKey];
                            }
                        }
                    }
                }
            }

            return this;
        },

        /**
         *
         * @param {String} event
         * @param {Object} target
         * @param {Object} params
         * @returns {EasySketch.Event|null}
         */
        trigger: function (event, target, params) {
            var eventObject = null;
            if (this.events.hasOwnProperty(event)) {
                eventObject = new EasySketch.Event(event, target, params);
                for (var key in this.events[event]) {
                    if (this.events[event].hasOwnProperty(key)) {
                        this.events[event][key].call(null, eventObject);
                    }
                }

            }

            return eventObject;
        }
    };

    return EasySketch.EventManager;
});
