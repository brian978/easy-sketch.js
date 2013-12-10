/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2013
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

$(function () {
    var sketcher = new EasySketch.Sketch("#drawing-canvas");

    // Disables the eraser
    $('#pencil').on('click', function () {
        sketcher.enableEraser(false);
    });

    // Enables the eraser
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

    // Getting the default color
    var defaultColor = sketcher.getOption('color');
    sketcher.context.font = "normal 20px Calibri";
    sketcher.context.fillText("Default brush color: " + defaultColor, 200, 50);

    // Predefined line
    sketcher.drawLine([
        {
            x: 10,
            y: 10
        },
        {
            x: 20,
            y: 50
        },
        {
            x: 40,
            y: 10
        }
    ]);

    // An event that is triggered when the user draws on the canvas
    // (this does not trigger when the DRAW_EVENT is called via the event manager)
    sketcher.getEventManager().attach(EasySketch.Sketch.NOTIFY_DRAW_EVENT, function(e, mouse){
        console.log('drawing at ' + JSON.stringify(mouse));
    });
});
