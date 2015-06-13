/***
 * Methods to assist with typical Globemasters visualisations.
 */

/**
 * Loads a JavaScript or CSS file. The intention is that imports are defined
 * inside the strategy, to simplify the imports on the index page in the case
 * that several strategies are loaded and one is selected on page load.
 * @param {String} filename Path to JS or CSS file, relative to index.
 * @param {String} filetype (Optional) The file type.
 * @returns {Boolean} True if a file was imported, false otherwise.
 */
function importCSSJS(filename, filetype) {
    if (typeof filetype === "undefined") {
        filetype = filename.substr(filename.lastIndexOf('.') + 1);
    }
    filetype = filetype.toLowerCase();
    
    if (filetype == "js") {
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (filetype == "css") {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    
    if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref);
        return true;
    }
    else {
        return false;
    }
}

/**
 * Sets text to a container, then sets it in a circle.
 * The text is appears on the inside of the circle's circumference.
 * TODO move the styling into Less where appropriate.
 * TODO programmatically determine a reasonable default from CSS values.
 * @post: contents of container, if any exist, are replaced.
 *        If text is not defined, container innerHTMl is rotated instead.
 * @param {String} containerId The id of the container div.
 * @param {boolean} outwards (optional) true if text faces outwards from globe,
 *                                      false otherwise.
 * @param {int} maxChars (optional) Maximum allowable number of characters.
 * @param {String} text (optional) The string to set to the container.
 */
function orbitText(containerId, outwards, maxChars, text) {
    var container = document.getElementById(containerId);
    
    maxChars = (typeof maxChars === "undefined") ? 50 : maxChars;
    outwards = (typeof outwards === "undefined") ? true : outwards;
    text = (typeof text === "undefined") ? container.innerHTML : text;
    text += "   "; //we always want a space between
    
    var radius = parseInt(window.getComputedStyle(container).height, 10) / 2;
    var repeats = Math.max(1, Math.floor(maxChars / text.length));
    var angleIncrement = Math.PI * 2 / (repeats * text.length);
    
    var width = 20;
    var top = (outwards) ? radius - width/2 : 0;
    var left = radius - width/2;
    
    var transformOrigin = (outwards) ? "top" : "bottom";
    var spanPlacement = (outwards) ? "bottom" : "top";
    
    var output = "";
    var angle = 0;
    var rotation = 0;
    
    for (var n = 0; n < repeats; ++n) {
        for (var i = 0; i < text.length; ++i) {
            rotation = (angle * 180 / Math.PI);
            output += "<div style=\""
                    + " font: 26pt Monaco, MonoSpace;"
                    + " transform: rotate(" + rotation + "deg);"
                    + " -webkit-transform: rotate(" + rotation + "deg);"
                    + " transform-origin: " + transformOrigin + " center;"
                    + " -webkit-transform-origin: " + transformOrigin + " center;"
                    + " height: " + radius + "px;"
                    + " width: " + width + "px;"
                    + " position: absolute;"
                    + " top: " + top + "px;"
                    + " left: " + left + "px;"
                    + " \">"
                    + "<span style=\"position: absolute; " + spanPlacement + ": 0;\">"
                    + text[i]
                    + "</span>"
                    + "</div>";
            angle += (outwards) ? -angleIncrement : angleIncrement;
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