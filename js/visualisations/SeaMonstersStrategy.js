/***
 * To demonstrate a generic JSON format which can be used to load images onto
 * the globe's surface.
 * 
 * This particular example puts monster in the oceans.
 */

var SeaMonstersStrategy = function() {
    
    this.onPageLoad = function() {},
            
    this.onCesiumInstanceCreate = function(viewer) {
        loadGlobeImageJSON(viewer, "json/visualisations/SeaMonsters/SeaMonsters.json");
    },
    
    this.onCountryDetect = function() {},
    
    this.onGlobeImageDetect = function(properties) {
        //properties doesn't have an enforced format
        //so, the file must be evaluated here
        //this is a contrast to the country entities, which are consistent
        alert(properties.tag);
    };
    
};