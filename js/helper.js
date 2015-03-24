/***
 * Methods to assist with typical Globemasters visualisations.
 */

/**
 * Sets text to a container, then sets it in a circle.
 * @post: contents of container, if any exist, are replaced.
 *        If text is not defined, container innerHTMl is rotated instead.
 * @param {String} containerId The id of the container div.
 * @param {boolean} outwards (optional) true if text faces outwards from globe,
 *                                      false otherwise.
 * @param {int} maxChars (optional) Maximum allowable number of characters.
 * @param {String} text (optional) The string to set to the container.
 */
function orbitText(containerId, outwards, maxChars, text) {
    
    //TODO: programmatically determine a reasonable default from CSS values
    maxChars = (typeof maxChars === "undefined") ? 50 : maxChars;
    
    outwards = (typeof outwards === "undefined") ? true : outwards;
    
    var container = document.getElementById(containerId);
    
    text = (typeof text === "undefined") ? container.innerHTML : text;
    
    //TODO radius is slightly off - need to account for text height
    var radius = Math.min(
                    parseInt(window.getComputedStyle(container).height, 10),
                    parseInt(window.getComputedStyle(container).width, 10)
                    ) / 2;
    
    text += "   "; //we always want a space between
    
    var output = "";
    var left = 0;
    var top = 0;
    var angle = 0;
    var rotation = 0;
    
    var repeats = Math.max(1, Math.floor(maxChars / text.length));
    var angleIncrement = Math.PI * 2 / (repeats * text.length);

    for (var n = 0; n < repeats; ++n) {
        for (var i = 0; i < text.length; ++i) {
            left = (radius * Math.cos(angle) + radius);
            top = (radius * Math.sin(angle) + radius);
            rotation = (angle * 180 / Math.PI) + ((outwards) ? -90 : 90);
            output += "<span style=\"\
                    transform: rotate(" + rotation + "deg); \
                    -webkit-transform: rotate(" + rotation + "deg); \
                    transform-origin: top; \
                    -webkit-transform-origin: top; \
                    position: absolute; \
                    top: " + top + "px; \
                    left: " + left + "px; \
                    \">" + text[i] + "</span>";
            angle += (outwards) ? -angleIncrement : angleIncrement;
        }
    }
    
    container.innerHTML = output;
}


/**
 * For a container of elements (such as <div> or <img> elements, for example),
 * the divs are moved into a circle and rotated so that each element is
 * orientated towards the center. The outer radius of the circle is the maximum
 * that will fit within the bounds of the container's height/width.
 * @param {String} containerId The id of div containing each element to rotate.
 */
function orbitElements(containerId) {
    var container = document.getElementById(containerId);
    var satellites = container.children;
    
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
 * Moves a HTML element to a position orbiting a centre point.
 * @param {String} elementId The id of the element.
 * @param {Number} angle The angle in radians.
 * @param {Number} radius The distance from the centre at which to place.
 * @param {boolean} outwards true if the element should face outwards, false otherwise.
 */
function orbitSingleElement(elementId, angle, radius, outwards) {
    //TODO programmatically get offset for centering
    
    outwards = (typeof outwards === "undefined") ? true : outwards;
    
    var element = document.getElementById(elementId);
    
    var left = (radius * Math.cos(angle) + radius);
    var top = (radius * Math.sin(angle) + radius);
    var rotation = (angle * 180 / Math.PI) + ((outwards) ? -90 : 90);
    
    element.style.position = "absolute";
    element.style.left = left + "px";
    element.style.top = top + "px";
    element.style.webkitTransform = 'rotate(' + rotation + 'deg)';
    element.style.transform = 'rotate(' + rotation + 'deg)';
    element.style.webkitTransformOrigin = "center";
    element.style.transformOrigin = "center";
}

/**
 * A simple function to remove the crosshair, if you don't like it.
 * Call this in your strategy instead of changing the index HTML.
 */
function disableCrosshair() {
    var crosshair = document.getElementById("crosshair");
    crosshair.parentNode.removeChild(crosshair);
}

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