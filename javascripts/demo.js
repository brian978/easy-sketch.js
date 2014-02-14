/**
 * easy-sketch.js
 *
 * @link https://github.com/brian978/easy-sketch.js
 * @copyright Copyright (c) 2014
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

$(function () {
    var sketcher = new EasySketch.Sketch("#drawing-canvas", {doubleBuffering: false});

    // Disables the eraser
    $('#pencil-btn').on('click', function () {
        sketcher.enableEraser(false);
    });

    // Enables the eraser
    $('#eraser-btn').on('click', function () {
        sketcher.enableEraser(true);
    });

    // Enables the eraser
    $('#clear-btn').on('click', function () {
        sketcher.clear();
    });

    $('#line-width-control').on('change', function () {
        // Adjusting the line width of the drawing
        var lineWidth = $(this).val();
        sketcher.setOptions({width: lineWidth});

        // Informational purposes
        $('.line-width-controls').find('.info').html(lineWidth + "px");
    });

    $('#line-color-control').on('change', function () {
        // Adjusting the line width of the drawing
        var lineColor = $(this).val();
        sketcher.setOptions({color: lineColor});
    });

    $('#line-opacity-control').on('change', function () {
        // Adjusting the line width of the drawing
        var lineOpacity = $(this).val();
        sketcher.setOptions({alpha: lineOpacity});

        // Informational purposes
        $('.line-opacity-controls').find('.info').html((lineOpacity * 100) + "%");
    });

    // Getting the default color
    var defaultColor = sketcher.getOption('color');
    sketcher.context.font = "normal 20px Calibri";
    sketcher.context.fillText("Default brush color: " + defaultColor, 200, 50);

    // Predefined line
    sketcher.setOptions({alpha: 0.1});
    sketcher.drawLine([
                          {
                              x: 20,
                              y: 10
                          },
                          {
                              x: 40,
                              y: 100
                          },
                          {
                              x: 60,
                              y: 10
                          }
                      ]);
    sketcher.drawLine([
                          {
                              x: 5,
                              y: 10
                          },
                          {
                              x: 15,
                              y: 50
                          },
                          {
                              x: 30,
                              y: 10
                          }
                      ]);
    sketcher.setOptions({alpha: 1});

    // An event that is triggered when the user draws on the canvas
    // (this does not trigger when the DRAW_EVENT is called via the event manager)
    sketcher.getEventManager().attach(EasySketch.Sketch.NOTIFY_DRAW_EVENT, function (e, mouse) {
        console.log('drawing at ' + JSON.stringify(mouse));
    });
});
