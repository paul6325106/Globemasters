/***
 * A simple strategy to illustrate how to write your own.
 * Basically just takes passed information and writes to console.
 */

var ExampleStrategy = function() {
    
    this.onPageLoad = function(parameterString) {
        console.log("GET parameters: " + parameterString);
    },
    
    this.onCesiumInstanceCreate = function(viewer) {
        console.log("Cesium instance created.");
    },
    
    this.onCountryDetect = function(name, iso_a2, iso_a3, iso_n3) {
        console.log("Welcome to " + name + "!");
    },
    
    this.onGlobeImageDetect = function(properties) {
        console.log("GlobeImage! " + properties);
    }
    
};