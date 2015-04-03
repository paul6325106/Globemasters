/***
 * Methods for initialising the globe.
 */

var viewer;
var scene;

/**
 * Initialises the Cesium globe.
 * @post globe is initialised in container, but not necessarily finished loading.
 * @param {String} container the id of the container div
 */
function initialiseCesium(container, visualisation) {
    
    viewer = new Cesium.Viewer(container, {
        
        //disable all the widgets
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        
        //alpha required for transparent background
        contextOptions: {
            alpha: true
        }
        
    });
    
    //TODO disable credits widget (sorry Cesium devs!)
    //not a high priority; it's currently hidden by the mask anyway
    
    scene = viewer.scene;
    
    //remove the skybox, sun, moon and atmosphere
    //XXX maybe leave the cool blue outline from the atmosphere
    scene.skyBox.destroy();
    scene.skyBox = undefined;
    scene.sun.destroy();
    scene.sun = undefined;
    scene.moon.destroy();
    scene.moon = undefined;
    scene.skyAtmosphere.destroy();
    scene.skyAtmosphere = undefined;
    
    //set background to transparent white
    scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0);
    
    //by default, rotation is constrained to keep the globe oriented north
    scene.camera.constrainedAxis = undefined;
    
    //set default view to Australia, why not
    scene.camera.setView({
        position : Cesium.Cartesian3.fromDegrees(135, -25, 10000000),
        heading : 0.0,
        pitch : -Cesium.Math.PI_OVER_TWO,
        roll : 0.0
    });
    
    //load the country border geojson
    //XXX scene.pick doesn't seem to work if the entities are completely transparent, so use 0.01
    viewer.dataSources.add(Cesium.GeoJsonDataSource.load('json/ne-countries-110m.json', {
        stroke: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.75),
        fill: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.01)
    }));
    
    //we will want to pick entities at the center of the window
    var centrepoint = new Cesium.Cartesian2(
            document.getElementById(container).offsetWidth / 2,
            document.getElementById(container).offsetHeight / 2
    );
    
    //TODO move mouse movement behaviour into new mouse movement listener, maybe
    
    callOnMouseStop(function() {
        countryPick(centrepoint, visualisation);
    });
    
    /*
    callOnMouseMovement(function() {
        countryPick(centrepoint, visualisation);
    });
    */
    
}

function callOnMouseStop(func) {
    var movementTimeout;
    document.onmousemove = function(){
        clearTimeout(movementTimeout);
        movementTimeout = setTimeout(function(){
            func();
        }, 500);
    };
}

function callOnMouseMovement(func) {
    //create a throttled event handler for detecting country at centerpoint
    var throttledHandler = throttle(function(movement) {
        func();
    }, 250);
    
    //set the event listener for mouse movement
    //XXX check position at instance of time where mouse stops moving
    var screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    screenSpaceHandler.setInputAction(
            throttledHandler, 
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
}

/* XXX
 * if multiple data sources are used on the globe, switch to
 * array pickedObjects = scene.drillPick(position)
 * and give country names a unique field name to simplify identification
 */
/**
 * Updates the current country if a different country to the currently set
 * country is found at the position. If the same country or no country at all
 * is found, no update occurs.
 * @pre: scene has been initialised. visualisation has had valid strategy set.
 * @post: TODO
 * @param {Cesium.Cartesian2} position window coordinates
 * @param {Visualisation} visualisation the visualisation context
 */
function countryPick(position, visualisation) {
    var pickedObject = scene.pick(position);
    
    /* XXX rough plan for drillPick()
     * get list of entities
     * for each entity
     * check properties length, field names
     * if match, get data
     */
    if (Cesium.defined(pickedObject)) {
        
        //read data from picked entity
        var entity = pickedObject.id;
        var newName   = entity.properties.name;
        var newIso_a2 = entity.properties.iso_a2;
        var newIso_a3 = entity.properties.iso_a3;
        var newIso_n3 = entity.properties.iso_n3;
        
        //if no current country is set, or new country is different from current
        //compare on shortest field
        if (!countryPick.currentIso_a2 || newIso_a2 && newIso_a2 !== countryPick.currentIso_a2) {
            
            //log and store new country data
            //console.log(newName + " " + newIso_a2 + " " + newIso_a3 + " " + newIso_n3);
            countryPick.currentName   = newName;
            countryPick.currentIso_a2 = newIso_a2;
            countryPick.currentIso_a3 = newIso_a3;
            countryPick.currentIso_n3 = newIso_n3;
            
            visualisation.onCountryDetection(newName, newIso_a2, newIso_a3, newIso_n3);
        }
    }
}

/**
 * Overrides the mouse movement listener for globe movement, so that it plays
 * nicely with PointerLock. Basically, this is trying to reimplement the default
 * rotation controller using reading from mousemoveevent.movementX & Y and
 * without having to hold down left click.
 */
function overrideGlobeMovement() {
    var canvas = viewer.canvas;
//    canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
//    canvas.onclick = function() {
//        canvas.focus();
//    };
    
    // disable the default event handlers
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;
    
    var flags = {
        looking : false
    };
    
    //doesn't start rotating until left click
    document.getElementById("body_container").addEventListener("click", function() {
        this.requestPointerLock = this.requestPointerLock ||
                         this.mozRequestPointerLock ||
                         this.webkitRequestPointerLock;
        this.requestPointerLock();
        flags.looking = true;
        //TODO flags.looking = false if Pointer Lock disabled
    }, false);
    
    var movementX = 0, movementY = 0;
    var movementTimeout, mouseStopped = false;
    
    //TODO make the inertia nice
    
    this.addEventListener("mousemove", function(e) {
        
        movementX = e.movementX     ||
                e.mozMovementX      ||
                e.webkitMovementX   ||
                0;
        movementY = e.movementY     ||
                e.mozMovementY      ||
                e.webkitMovementY   ||
                0;
        
        mouseStopped = false;
        clearTimeout(movementTimeout);
        movementTimeout = setTimeout(function() {
            mouseStopped = true;
        }, 250);
        
    }, false);
    
    viewer.clock.onTick.addEventListener(function(clock) {
        var camera = viewer.camera;
        
        if (flags.looking) {
            if (mouseStopped) {
                movementX *= 0.75;
                movementY *= 0.75;
            }
            camera.rotateRight(movementX * camera.defaultRotateAmount * 2);
            camera.rotateUp(movementY * camera.defaultRotateAmount * 2);
        }
    });
}