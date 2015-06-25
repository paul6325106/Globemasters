/***
 * Methods for initialising the globe.
 */

/**
 * Initialises the Cesium globe.
 * 
 * @post globe is initialised in container (but not necessarily finished
 *       loading).
 *       
 * @param {String}        containerId   The id of the container div.
 * 
 * @param {Visualisation} visualisation A Visualisation instance with a valid 
 *                                      strategy set.
 */
function initialiseCesium(containerId, visualisation) {
    
    viewer = new Cesium.Viewer(containerId, {
        
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
    
    var container = document.getElementById(containerId);
    
    overrideGlobeMovement(container);
    
    var centrepoint = getCentrePoint(container);
    
    callOnMouseStop(function() {
        readDataFromPoint(centrepoint, visualisation);
    });
    
    visualisation.onCesiumInstanceCreate(viewer);
}

/**
 * Retrieves the centre point of the table, to pick countries entities from.
 * 
 * @param container The HTML element to find the centre point of.
 * 
 * @returns {Cesium.Cartesian2} A 2D Cartesian point.
 */
function getCentrePoint(container) {
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
 * 
 * @param {Cesium.Cartesian2} position      Window coordinates.
 * 
 * @param {Visualisation}     visualisation The visualisation context.
 */
function readDataFromPoint(position, visualisation) {
    var entity, entities = {};
    
    //for reading the coordinates
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartesian = viewer.camera.pickEllipsoid(position, ellipsoid);
    
    //for reading the entities
    var pickedObjects = viewer.scene.drillPick(position);
    
    //if valid point on globe
    if (cartesian && Cesium.defined(pickedObjects)) {
        
        //convert to cartographic
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        var longitude = +Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = +Cesium.Math.toDegrees(cartographic.latitude);
        
        //for each entity
        for (var i = 0; i < pickedObjects.length; ++i) {
            entity = pickedObjects[i].id;
            
            //if the entity has been given a globemasters_dataset_id, store
            if (entity.hasOwnProperty("globemasters_dataset_id")) {
                entities[entity.globemasters_dataset_id] = entity;
            }
        }
        
        //pass the data onto the strategy
        visualisation.onMouseStop(latitude, longitude, entities);
    }
}

/**
 * Overrides the mouse movement listener for globe movement, so that it plays
 * nicely with PointerLock. Basically, this is trying to reimplement the default
 * rotation controller using reading from mousemoveevent.movementX & Y and
 * without having to hold down left click.
 * 
 * @param container The HTML element to apply Pointer Lock to.
 */
function overrideGlobeMovement(container) {
    
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
    
    var activatePointerLock = function(container) {
        container.requestPointerLock = container.requestPointerLock
                || container.mozRequestPointerLock
                || container.webkitRequestPointerLock;
        container.requestPointerLock();
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
    this.addEventListener("keydown", function() {
        activatePointerLock(container);
    }, false);
    this.addEventListener("mousemove", mouseMoveListener, false);
    viewer.clock.onTick.addEventListener(applyMovement);
}
