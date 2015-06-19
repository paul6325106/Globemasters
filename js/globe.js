/***
 * Methods for initialising the globe.
 */

/**
 * Initialises the Cesium globe.
 * @post globe is initialised in container (but not necessarily finished
 *       loading).
 * @param {String} container The id of the container div.
 * @param {Visualisation} visualisation A Visualisation instance with a valid 
 *                                      strategy set.
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
    
    //remove the skybox, sun, moon and atmosphere
    //XXX maybe leave the cool blue outline from the skyAtmosphere
    var scene = viewer.scene;
    scene.skyBox.destroy();
    scene.skyBox = undefined;
    scene.sun.destroy();
    scene.sun = undefined;
    scene.moon.destroy();
    scene.moon = undefined;
    scene.skyAtmosphere.destroy();
    scene.skyAtmosphere = undefined;
    
    //set background to transparent
    scene.backgroundColor = new Cesium.Color(1.0, 1.0, 1.0, 0);
    
    //by default, rotation is constrained to keep the globe oriented north
    scene.camera.constrainedAxis = undefined;
    
    //set default view to Australia, why not
    scene.camera.setView({
        position : Cesium.Cartesian3.fromDegrees(135, -25, 10000000),
        heading : 0.0,
        pitch : -Cesium.Math.PI_OVER_TWO,
        roll : 0.0
    });
    
    var centrepoint = getCentrePoint();
    
    callOnMouseStop(function() {
        drillPick(centrepoint, visualisation);
    });
    
    overrideGlobeMovement();
    
    visualisation.onCesiumInstanceCreate(viewer);
}

/**
 * Retreives the centre point of the table, to pick countries entities from.
 * @returns {Cesium.Cartesian2} A 2D Cartesian point.
 */
function getCentrePoint() {
    var container = document.getElementById("body_container");
    return new Cesium.Cartesian2(
            container.offsetWidth / 2,
            container.offsetHeight / 2
    );
}

/**
 * Calls the specified function when the mouse stops.
 * @param {Function} func The function to call.
 */
function callOnMouseStop(func) {
    var movementTimeout;
    document.onmousemove = function(){
        clearTimeout(movementTimeout);
        movementTimeout = setTimeout(function(){
            func();
        }, 500);
    };
}

/**
 * Performs a drill pick where the visualisation.onEntityPick() method is called
 * for entities with a globemastersDatasetId property set. Other entities are
 * ignored. The visualisation.onEntityPick() method is only called when the
 * entity for a dataset changes (so that the same data is constantly reset).
 * @param {Cesium.Cartesian2} position window coordinates
 * @param {Visualisation} visualisation the visualisation context
 */
function drillPick(position, visualisation) {
    var entity;
    
    //drill baby drill
    var pickedObjects = viewer.scene.drillPick(position);
    if (Cesium.defined(pickedObjects)) {
        for (var i = 0; i < pickedObjects.length; ++i) {
            entity = pickedObjects[i].id;
            
            //if the entity has been given a globemastersDatasetId
            if (entity.hasOwnProperty("globemastersDatasetId")) {
                
                //dict holds key value pairs of dataset id and entity id
                //check if the dataset and entity are currently in the dict
                if (drillPick.dict[entity.globemastersDatasetId] !== entity.id){
                    
                    //set the dict with the current entity for the dataset
                    drillPick.dict[entity.globemastersDatasetId] = entity.id;
                    
                    //call the strategy method
                    visualisation.onEntityPick(entity);
                }
            }
        }
    }
}
drillPick.dict = [];

/**
 * Overrides the mouse movement listener for globe movement, so that it plays
 * nicely with PointerLock. Basically, this is trying to reimplement the default
 * rotation controller using reading from mousemoveevent.movementX & Y and
 * without having to hold down left click.
 */
function overrideGlobeMovement() {
    var container = document.getElementById("body_container");
    
    var flags = {
        looking : false
    };
    
    var prevMovementX = 0, prevMovementY = 0;
    
    // disable the default event handlers
    var scene = viewer.scene;
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;
    
    var activatePointerLock = function() {
        this.requestPointerLock = this.requestPointerLock
                || this.mozRequestPointerLock
                || this.webkitRequestPointerLock;
        this.requestPointerLock();
        flags.looking = true;
        //TODO flags.looking = false if Pointer Lock disabled
    };
    
    var mouseMoveListener = function(event) {
        var movementX = event.movementX ||
                event.mozMovementX      ||
                event.webkitMovementX   ||
                0,
        movementY = event.movementY     ||
                event.mozMovementY      ||
                event.webkitMovementY   ||
                0; 
        
        event.preventDefault();
        event.stopPropagation();
        
        prevMovementX = (prevMovementX + movementX) / 2;
        prevMovementY = (prevMovementY + movementY) / 2;
    };
    
    var applyMovement = function() {
        var camera = viewer.camera;
        
        if (flags.looking) {
            camera.rotateRight(prevMovementX * camera.defaultRotateAmount * -2);
            camera.rotateUp(prevMovementY * camera.defaultRotateAmount * -2);
            prevMovementX *= 0.75;
            prevMovementY *= 0.75;
        }
    };
    
    //apply listener functions
    container.addEventListener("click", activatePointerLock, false);
    this.addEventListener("mousemove", mouseMoveListener, false);
    viewer.clock.onTick.addEventListener(applyMovement);
}
