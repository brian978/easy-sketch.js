/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2013
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

$(function () {
    var sketcher = new EasySketch.Sketch("#drawing-canvas");

    $('#pencil').on('click', function () {
        sketcher.enableEraser(false);
    });

    $('#eraser').on('click', function () {
        sketcher.enableEraser(true);
    });

    $('#line-width-control').on('change', function () {
        // Adjusting the line width of the drawing
        var lineWidth = $(this).val();
        sketcher.setOptions({width: lineWidth});

        // Informational purposes
        $('.line-width-controls').find('.info').html(lineWidth);
    });

    $('#line-color-control').on('change', function () {
        // Adjusting the line width of the drawing
        var lineColor = $(this).val();
        sketcher.setOptions({color: lineColor});
    });
});
