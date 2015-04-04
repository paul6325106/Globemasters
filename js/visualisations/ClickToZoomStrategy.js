/***
 * A simple strategy to show how a single click (perhaps triggered by pressing
 * down on the trackball) can be used to cycle through levels of zoom.
 */

var ClickToZoomStrategy = function() {
    
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
    
    this.onCesiumInstanceCreate = function(viewer) {
        var screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        screenSpaceHandler.setInputAction(zoomHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    
    this.onPageLoad = function() {},
    this.onCountryDetect = function() {}
    
};