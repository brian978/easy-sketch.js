requirejs([
    "EasySketch/Sketch",
    "EasySketch/Addon/Redo",
    "EasySketch/Addon/Undo",
    "EasySketch/Addon/UndoRedoDataStore"
], function (Sketch, RedoAddon, UndoAddon, UndoRedoDataStore) {
    var sketcher = new Sketch("#drawing-canvas", {doubleBuffering: true});

    // Initializing the addons
    var urDataStore = new UndoRedoDataStore(sketcher);
    var undo = new UndoAddon(urDataStore);
    var redo = new RedoAddon(urDataStore);

    sketcher.registerAddon(undo);
    sketcher.registerAddon(redo);

    // Disables the eraser
    $('#pencil').on('click', function () {
        sketcher.enableEraser(false);
    });

    // Enables the eraser
    $('#eraser').on('click', function () {
        sketcher.enableEraser(true);
    });

    // Clear button
    $('#clear').on('click', function () {
        sketcher.clear();
        urDataStore.clear();
    });

    // Undo button
    $("#undo").on('click', function () {
        undo.execute();
    });

    // Redo button
    $("#redo").on('click', function () {
        redo.execute();
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
    sketcher.getEventManager().attach(Sketch.NOTIFY_PAINT_EVENT, function (event) {
        console.log('drawing at ' + JSON.stringify(event.getParam(0)));
    });
});
