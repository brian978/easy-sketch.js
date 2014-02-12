easy-sketch.js
===================

easy-sketch.js allows you to draw on canvas without having to dig into the HTML 5 API. It's very easy to use, very flexible, very small (9KB - uncompressed, 5KB - compressed) and can be extended with ease if needed.

A demo can be found here: http://brian.hopto.org/easy-sketch.js/demo.html


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

To get an option you can call the getOption() method with the option name you desire. By default it will return null if it does not
find it, but that can be changed using the second parameter:

    sketcher.getOption("color");

or with the default changed

    sketcher.getOption("some option", "value to return if option is not found");


### Drawing without user input

The object also comes with it's own event manager that allows you to trigger the 3 main events (draw start, draw, draw stop) without the user's input. To trigger the events you can do something like this:

    sketcher.getEventManager().trigger(EasySketch.Sketch.START_PAINTING_EVENT, [{x: 10, y: 10}]);
    sketcher.getEventManager().trigger(EasySketch.Sketch.PAINT_EVENT, [{x: 10, y: 10}]);
    sketcher.getEventManager().trigger(EasySketch.Sketch.STOP_PAINTING_EVENT);

As you can see the first 2 triggered events have a second parameter which is an array with a single element. The element is used to tell the sketcher where to start the drawing and where to paint the next point.

### Events triggered by the class

When the painting starts the *EasySketch.Sketch.NOTIFY_START_EVENT* event is triggered. The event is fired 1 parameter: an object containing the mouse position (x & y)

After the painting has started and the user moves the pointer, the *EasySketch.Sketch.NOTIFY_PAINT_EVENT* event is triggered. The event is fired 1 parameter: an object containing the mouse position (x & y)

When the user releases the mouse button the *EasySketch.Sketch.NOTIFY_STOP_EVENT* event is triggered. The event has no parameters.

### Setting a custom object to bind to

In case you need a custom object to bind the events on, you can pass it to the constructor in the options:

    var sketcher = new EasySketch.Sketch("#someId", {bindingObject: $("#customElement")});

**This option CANNOT be set after the creation of the object because the method that attaches the listeners is called in the constructor.**

### Manual binding

Let's say that for some reason you want to attach the listeners on the object later and not when the object is created. You can
switch to manual binding by setting the option **autoBind** to false when creating the object:

    var sketcher = new EasySketch.Sketch("#someId", {autoBind: false});

### Detaching the listeners

By default, when the object is created, a series of listeners are attached on the canvas or the object that was provided for
binding. You can remove those listeners by calling the detachListeners() method:

    sketcher.detachListeners();

### Clearing the canvas

To clear the canvas all you need to do is call the *clear()* method:

    sketcher.clear();
