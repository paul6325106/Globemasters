/***
 * Renders a compass (with markers) on the circular table.
 */

var CompassStrategy = function() {
    
    this.onPageLoad = function() {
        var container = document.getElementById("table_container");
        
        var markerNorth = document.createElement("div");
        markerNorth.id = "marker_north";
        markerNorth.className = "compass_marker";
        markerNorth.innerHTML = "N";
        container.appendChild(markerNorth);
        
        var markerEast = document.createElement("div");
        markerEast.id = "marker_east";
        markerEast.className = "compass_marker";
        markerEast.innerHTML = "E";
        container.appendChild(markerEast);
        
        var markerWest = document.createElement("div");
        markerWest.id = "marker_west";
        markerWest.className = "compass_marker";
        markerWest.innerHTML = "W";
        container.appendChild(markerWest);
        
        var markerSouth = document.createElement("div");
        markerSouth.id = "marker_south";
        markerSouth.className = "compass_marker";
        markerSouth.innerHTML = "S";
        container.appendChild(markerSouth);
        
        orbitSingleElement("marker_north", 3*Math.PI/2, 400);
        orbitSingleElement("marker_east" , 0, 400);
        orbitSingleElement("marker_west" , Math.PI/2, 400);
        orbitSingleElement("marker_south", Math.PI, 400);
    },
    
    this.onCountryDetection = function() {
        
        
//        orbitSingleElement("marker_north", north, 400);
//        orbitSingleElement("marker_east" ,  east, 400);
//        orbitSingleElement("marker_west" ,  west, 400);
//        orbitSingleElement("marker_south", south, 400);
    }
    
};