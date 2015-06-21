/***
 * A simple strategy to show how a single click (perhaps triggered by pressing
 * down on the trackball) could be used to cycle through levels of zoom, and the
 * scroll wheel could be mapped to globe twisting for a full range of rotation.
 */

var DifferentMouseControlsStrategy = function() {
    
    var moveForwardAmount = 1500000;
    var moveForwardLevel = 0;
    var moveForwardMaxLevel = 5;
    
    var zoomHandler = function() {
        if (moveForwardLevel === moveForwardMaxLevel) {
            viewer.camera.moveBackward(moveForwardMaxLevel * moveForwardAmount);
            moveForwardLevel = 0;
        }
        else {
            viewer.camera.moveForward(moveForwardAmount);
            moveForwardLevel++;
        }
    };
    
    //var twistHandler = function(delta) { //Cesium.ScreenSpaceEventType.WHEEL
    var twistHandler = function(event) { //WheelEvent
        viewer.camera.twistRight(event.deltaY * viewer.camera.defaultLookAmount);
    };
    
    this.onCesiumInstanceCreate = function(viewer) {
        //var screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        //screenSpaceHandler.setInputAction(zoomHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //screenSpaceHandler.setInputAction(twistHandler, Cesium.ScreenSpaceEventType.WHEEL);
        document.addEventListener('click', zoomHandler);
        document.addEventListener('wheel', twistHandler);
    },
    
    this.onPageLoad = function() {},
    this.onMouseStop = function() {};
    
};