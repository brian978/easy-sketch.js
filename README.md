easy-sketch.js
===================

easy-sketch.js allows you to draw on canvas without having to dig into the HTML 5 API. It's very easy to use, very flexible, very small (7KB - uncompressed) and can be extended with ease if needed.

A demo can be found here: http://brian.hopto.org/easy-sketch.js/


Dependencies
-------------------
- HTML 5
- jQuery


Usage
-------------------

To create the class all you need to do is

    var sketcher = new EasySketch.Sketch("#drawing-canvas", options);


- the first parameter can be either a selector (class selector is not supported), element ID, jQuery object, JS object;
- the second parameter is optional and may be an object containing 2 properties: color, width; these parameters can also be set using the setOptions() method;


### Eraser


By default, after you create the sketch object you are able to draw on the canvas. To enable the eraser (or disable if for that matter) you can call the enableEraser() method with either the value true or false to enable or disable the eraser.

    sketcher.enableEraser(true); // Eraser enabled / Pencil disabled
    sketcher.enableEraser(false); // Pencil enabled / Eraser disabled
    

### Pencil / eraser options

For adjusting the width and color (the color can only be changed for the pencil) you can use the setOptions() method like so:

    sketcher.setOptions({width: 10, color: "#000"});
    
Or if you need to set them separately:

    sketcher.setOptions({width: 10});
    sketcher.setOptions({color: "#000"});
    

### Painting without user input

The object also comes with it's own event manager that allows you to trigger the 3 main events (paint start, paint, paint stop) without the user's input. To trigger the events you can do something like this:

    sketcher.getEventManager().trigger(EasySketch.Sketch.START_PAINTING_EVENT, [{x: 10, y: 10}]);
    sketcher.getEventManager().trigger(EasySketch.Sketch.PAINT_EVENT, [{x: 10, y: 10}]);
    sketcher.getEventManager().trigger(EasySketch.Sketch.STOP_PAINTING_EVENT);
    
As you can see the first 2 triggered events have a second parameter which is an array with a single element. The element is used to tell the sketcher where to start the painting and where to paint the next point.

