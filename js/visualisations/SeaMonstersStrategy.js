/***
 * To demonstrate a generic JSON format which can be used to load images onto
 * the globe's surface.
 * 
 * This particular example puts monster in the oceans.
 */

var SeaMonstersStrategy = function() {
    
    //TODO priority and cooldown system
    
    var DATASET_SEAMONSTERS = 1;
    var DATASET_COUNTRIES = 2;
    var DATASET_TITANIC = 3;
    
    this.onPageLoad = function() {},
            
    this.onCesiumInstanceCreate = function(viewer) {
        //TODO make options optional, return list of entities or promise
        //TODO alternative: define function for to run in promise instead?
        
        //XXX scene.pick doesn't seem to work if the entities are completely transparent, so use 0.01
        //XXX 50m dataset seems to cause memory problems sometimes, beware
        loadGlobeData(DATASET_COUNTRIES, "json/ne-countries-110m_no-abbreviations.json", {
            stroke: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.75),
            fill: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.01)
        });
        
        loadGlobeData(DATASET_TITANIC, "kml/visualisations/SeaMonsters/titanic.kml", {});
        
        loadGlobeData(DATASET_SEAMONSTERS, "json/visualisations/SeaMonsters/sea_monsters.json", {
            stroke: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0),
            fill: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0)
        }, true);
    },
    
    this.onEntityPick = function(entity) {
        switch(entity.globemastersDatasetId) {
            
            //the sea monsters dataset is using a tag as data
            //but the tag isn't that informative
            //so we'll just search for sea monsters
            case DATASET_SEAMONSTERS:
                console.log(DATASET_SEAMONSTERS
                        + " " + entity.properties.tag
                );
                break;
                
            //the countries dataset has the name and a few ISO codes
            case DATASET_COUNTRIES:
                console.log(DATASET_COUNTRIES
                        + " " + entity.properties.name
                        + " " + entity.properties.iso_a2
                        + " " + entity.properties.iso_a3
                        + " " + entity.properties.iso_n3
                );
                break;
                
            //the titanic kml has no properties, just a name and description
            case DATASET_TITANIC:
                console.log(DATASET_TITANIC
                        + " " + entity.name
                        + " " + entity.description
                );
                break;
        }
    };
    
};