/***
 * A simple strategy to illustrate how to write your own.
 * Basically just takes passed information and writes to console.
 */

var ExampleStrategy = function() {
    
    this.onPageLoad = function(parameterString) {
        importimportCSSJS("css/visualisations/example.css");
        
        var vars = parameterString.split("&");
        for (var i = 0; i < vars.length; ++i) {
            var pair = vars[i].split("=");
            switch (pair[0]) {
                case "height":
                    console.log("height: " + pair[1]);
                    break;
                case "width":
                    console.log("width: " + pair[1]);
                    break;
                case "top":
                    console.log("top: " + pair[1]);
                    break;
                case "left":
                    console.log("left: " + pair[1]);
                    break;
                default:
                    //throw "Unrecognised parameter: " + pair[0];
                    console.log("Unrecognised parameter: " + pair[0]);
            }
        }
    },
    
    this.onCesiumInstanceCreate = function(viewer) {
        console.log("Cesium instance created.");
    },
    
    this.onCountryDetect = function(name, iso_a2, iso_a3, iso_n3) {
        console.log("Welcome to " + name + "!");
    }
    
};