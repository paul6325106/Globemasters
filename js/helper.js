/***
 * Methods to assist with typical Globemasters visualisations.
 */

/**
 * 
 * TODO refactor this method
 * @param {type} datasetId
 * @param {type} path
 * @param {type} options
 * @returns {undefined}
 */
function loadGlobeData(datasetId, path, options, hasImage) {
    hasImage = (typeof hasImage === "undefined") ? false : hasImage;
    
    var ext = path.substr(path.lastIndexOf('.') + 1).toLowerCase(); 
    switch (ext) {
        
        case "json":
            viewer.dataSources.add(
                    Cesium.GeoJsonDataSource.load(path, options)
            ).then(function(dataSource) {
                var id, entity;
                for (var i = 0; i < dataSource.entities.values.length; ++i) {
                    id = dataSource.entities.values[i].id;
                    entity = dataSource.entities.getById(id);
                    entity.addProperty("globemastersDatasetId");
                    entity.globemastersDatasetId = datasetId;
                    if (hasImage && entity.properties.hasOwnProperty("image")){
                        entity.polygon.material = new Cesium.ImageMaterialProperty({
                            image : entity.properties.image
                        });
                    }
                }
            });
            return;
            
        case "kml":
            viewer.dataSources.add(
                    Cesium.KmlDataSource.load(path, options)
            ).then(function(dataSource){
                var id, entity;
                for (var i = 0; i < dataSource.entities.values.length; ++i) {
                    id = dataSource.entities.values[i].id;
                    entity = dataSource.entities.getById(id);
                    entity.addProperty("globemastersDatasetId");
                    entity.globemastersDatasetId = datasetId;
                }
            });
            return;
        
        default:
            console.log("Unsupported data: " + path);
            return
    }
}

/**
 * Applies rotation to a container of letters such that the letters can be
 * arranged in a circle. This method only applies rotation, no shifting. For the
 * shifting to take effect, the .orbit_text() Less mixin should be applied to
 * the container.
 * TODO programmatically determine a reasonable default from CSS values.
 * @post: If text is defined, contents of container, if any exist, are replaced.
 *        If text is not defined, container innerHTMl is rotated instead.
 * @param {String} containerId The id of the container div.
 * @param {boolean} outwards (optional) true if text faces outwards from globe,
 *                                      false otherwise.
 * @param {int} maxChars (optional) Maximum allowable number of characters.
 * @param {String} text (optional) The string to set to the container.
 */
function orbitText(containerId, outwards, maxChars, text) {
    var container = document.getElementById(containerId);
    
    //process function parameters
    maxChars = (typeof maxChars === "undefined") ? 50 : maxChars;
    outwards = (typeof outwards === "undefined") ? true : outwards;
    text = (typeof text === "undefined") ? container.innerHTML : text;
    text += "   "; //we always want a space between
    
    var repeats = Math.max(1, Math.floor(maxChars / text.length));
    
    var angleIncrement = Math.PI * 2 / (repeats * text.length);
    if (outwards) angleIncrement *= -1;
    
    var output = "";
    var angle = 0;
    var rotation = 0;
    
    for (var n = 0; n < repeats; ++n) {
        for (var i = 0; i < text.length; ++i) {
            rotation = (angle * 180 / Math.PI);
            output += "<div style=\""
                    + " transform: rotate(" + rotation + "deg);"
                    + " -webkit-transform: rotate(" + rotation + "deg);"
                    + "\">"
                    + "<span>"
                    + text[i]
                    + "</span>"
                    + "</div>";
            angle += angleIncrement;
        }
    }
    
    container.innerHTML = output;
}

/**
 * For a container of elements (such as <div> or <img> elements, for example),
 * the divs are moved into a circle and rotated so that each element is
 * orientated towards the center.
 * The images appear on the inside of the circle's circumference.
 * TODO move the styling into Less where appropriate.
 * @param {String} containerId The id of div containing each element to rotate.
 */
function orbitElements(containerId) {
    var container = document.getElementById(containerId);
    var satellites = container.children;
    
    //if there's no satellites, there's nothing to do
    if (satellites.length == 0) return;
    
    //coordinates and orientation
    var left = 0;
    var top = 0;
    var angle = 0;
    var rotation = 0;
    
    //determine the radius from the size of the container
    var radius = Math.min(
            parseInt(window.getComputedStyle(container).height, 10),
            parseInt(window.getComputedStyle(container).width, 10)
            ) / 2;
    
    //adjust for image height
    radius -= parseInt(window.getComputedStyle(satellites[0]).height, 10) / 2;
    
    var increment = Math.PI * 2 / satellites.length;
    
    //set each elements initial position
    for (var n = 0; n < satellites.length; ++n) {
        var satellite = satellites[n];
        
        left = radius * Math.cos(angle) + radius;
        top = radius * Math.sin(angle) + radius;
        rotation = (angle * 180 / Math.PI) - 90;
        
        satellite.style.position = "absolute";
        satellite.style.left = left + "px";
        satellite.style.top = top + "px";
        satellite.style.webkitTransform = 'rotate(' + rotation + 'deg)';
        satellite.style.transform = 'rotate(' + rotation + 'deg)';
        satellite.style.webkitTransformOrigin = "center";
        satellite.style.transformOrigin = "center";
        
        angle += increment;
    }
    
}

/**
 * Loads a GlobeImageCollection into the Cesium viewer.
 * TODO check format of JSON file.
 * TODO better JSON format - rectangles are finicky, switch to centre point and height + width, then convert here
 * TODO make this consistent with other viewer data source adding methods
 * @param {Cesium.Viewer} viewer
 * @param {JSON} json
 */
/*
function loadGlobeImageJSON(viewer, jsonPath, datasetId) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", jsonPath, false);
    xmlhttp.send(null);
    var json = JSON.parse(xmlhttp.responseText);
    
    var globeImageFormatted, globeImage;
    
    for (var i = 0; i < json.GlobeImages.length; i++) {
        globeImage = json.GlobeImages[i];
        globeImageFormatted = {
            rectangle : {
                coordinates : Cesium.Rectangle.fromDegrees(
                    globeImage.coordinates[0],
                    globeImage.coordinates[1],
                    globeImage.coordinates[2],
                    globeImage.coordinates[3]
                ),
                material : new Cesium.ImageMaterialProperty({
                    image : globeImage.imagepath
                })
            },
            properties : globeImage.properties,
            globemastersDatasetId : datasetId
        };
        console.log(globeImageFormatted);
        viewer.entities.add(globeImageFormatted);
    }
}
*/

/**
 * Function throttle implementation in JS, with default parameters, using closures.
 * throttle(func,ms,context) returns a function that can't be called more than once every ms milliseconds.
 * context and ms parameters are optionnal.
 * source: https://gist.github.com/Eartz/9585ebfd5290078df3e2
 * author: Camille Hodoul
 */
var throttle = (function(window){
  var defaultMs=50;
  return function (func,ms,context){
  	var to;
  	var wait=false;
  	return function(){
  	  var args = Array.prototype.slice.call(arguments);
  	  var later = function(){
  		  func.apply(context || window,args);
  	  };
  	  if(!wait)  {
  		  later();
  		  wait = true;
  		  to = setTimeout(function() {
  		    wait = false;
  		  },ms || defaultMs);
  	  }
  	};
  };
})(window);
