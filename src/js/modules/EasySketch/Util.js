/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2015
 * @license https://github.com/brian978/easy-sketch.js/blob/master/LICENSE New BSD License
 */

define(["./EasySketch"], function (EasySketch) {

    EasySketch.Util = {
        /**
         *
         * @param {jQuery} object
         * @returns {String}
         */
        getScalePropertyName: function (object) {
            let property = "";
            let canvasStyle = object[0].style;

            // Looking for the non-prefixed property first since it's easier
            if ("transform" in canvasStyle) {
                property = "transform";
            } else {
                // Determining the property to use
                let prefixes = ["-moz", "-webkit", "-o", "-ms"];
                let propertyName = "";
                for (let i = 0; i < prefixes.length; i++) {
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
            let property = this.getScalePropertyName(object);
            let scale = {
                x: 1,
                y: 1
            };

            if (property !== null) {
                let matrix = String(object.css(property));
                if ("none" !== matrix) {
                    let regex = new RegExp("([0-9.-]+)", "g");
                    let matches = matrix.match(regex);
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
        extend: function (parent, child) {
            // Inheriting the methods
            for (let method in parent.prototype) {
                if (parent.prototype.hasOwnProperty(method) && typeof parent.prototype[method] === "function") {
                    // We must not overwrite the methods in the child if they already exist
                    if(!child.prototype.hasOwnProperty(method)) {
                        child.prototype[method] = parent.prototype[method];
                    }
                }
            }

            // Inheriting the properties
            for (let property in parent) {
                if (parent.hasOwnProperty(property) && typeof parent.prototype[property] !== "function") {
                    child[property] = parent[property];
                }
            }
        }
    };

    return EasySketch.Util;
});
