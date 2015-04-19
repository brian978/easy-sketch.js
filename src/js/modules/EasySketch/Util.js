/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2014
 * @license Creative Commons Attribution-ShareAlike 3.0
 */
define(["./EasySketch"], function (EasySketch) {

    EasySketch.Util = {
        /**
         *
         * @param {jQuery} object
         * @returns {String}
         */
        getScalePropertyName: function (object) {
            var property = "";
            var canvasStyle = object[0].style;

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

            return property;
        },

        /**
         *
         * @param {jQuery} object
         * @returns {{x: number, y: number}}
         */
        getScale: function (object) {
            var property = this.getScalePropertyName(object);
            var scale = {
                x: 1,
                y: 1
            };

            if (property !== null) {
                var matrix = String(object.css(property));
                if (matrix != "none") {
                    var regex = new RegExp("([0-9.-]+)", "g");
                    var matches = matrix.match(regex);
                    scale.x = parseFloat(matches[0]);
                    scale.y = parseFloat(matches[3]);
                }
            }

            return scale;
        },

        /**
         * Extends a child object from a parent
         *
         * @param {Object} parent
         * @param {Object} child
         */
        extend: function(parent, child)
        {

        }
    };

    return EasySketch.Util;
});
