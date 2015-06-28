/***
 * To demonstrate how different datasets can be loaded onto the globe.
 * 
 * This particular example puts monster in the oceans, amongst other things.
 */

function SeaMonstersStrategy() {
    
    //these are to be json keys, so use strings
    var DATASET_SEAMONSTERS = "1";
    var DATASET_COUNTRIES = "2";
    var DATASET_TITANIC = "3";
    var DATASET_BERMUDATRIANGLE = "4";
    
    function onPageLoad(container) {
        //just a single container to show text output
        var textDisplay = document.createElement("div");
        textDisplay.id = "text_display";
        container.appendChild(textDisplay);
    }
    
    function onCesiumInstanceCreate(viewer) {
        
        //for demonstration purposes, we'll expand the code for adding a dataset
        
        //---
        
        //the filepath to the dataset, should be GeoJSON or KML.
        var path = "json/ne-countries-110m_no-abbreviations.json";
        
        /* XXX
         * Cesium.Scene.pick() and Cesium.Scene.drillPick don't seem to work if
         * the entities are completely transparent, so use an alpha of 0.01.
         */
        var options = {
            stroke: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.75),
            fill: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.01)
        };
        
        //start by creating a Cesium data source object
        var dataSource = Cesium.GeoJsonDataSource.load(path, options);
        
        /* XXX
         * important bit!
         * formatEntities() must be run on each data source's entities
         * this adds the dataset id to the entities for drillPick identification
         */
        viewer.dataSources.add(dataSource).then(
                function(dataSource) {
                    applyDatasetId(DATASET_COUNTRIES, dataSource.entities);
                }
        );
        
        //---
        
        //it's less readable, but the preceeding code can be reduced to this:
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load(
                "json/visualisations/SeaMonsters/bermuda_triangle.json", {
            stroke: Cesium.Color.fromAlpha(Cesium.Color.HOTPINK, 1),
            fill: Cesium.Color.fromAlpha(Cesium.Color.PURPLE, 1)
        })).then(function(dataSource) {
            applyDatasetId(DATASET_BERMUDATRIANGLE, dataSource.entities);
        });
        
        //you can also modify the entities yourself in the promise
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load(
                "json/visualisations/SeaMonsters/sea_monsters.json", {
            stroke: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0),
            fill: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0)
        })).then(function(dataSource) {
            applyDatasetId(DATASET_SEAMONSTERS, dataSource.entities);
            applyImageMaterial(dataSource.entities);
        });
        
        //kml is also fine
        viewer.dataSources.add(Cesium.KmlDataSource.load(
                "kml/visualisations/SeaMonsters/titanic.kml"
        )).then(function(dataSource) {
            applyDatasetId(DATASET_TITANIC, dataSource.entities);
        });
        
    }
    
    function onMouseStop(latitude, longitude, entities) {
        var entity;
        
        //printing to console to demonstrate how the entity structure varies
        for (var datasetId in entities) {
            entity = entities[datasetId];
            switch(datasetId) {
                
                //the sea monsters geojson is using a tag as data
                case DATASET_SEAMONSTERS:
                    console.log(DATASET_SEAMONSTERS
                            + " " + entity.properties.tag
                    );
                    break;
                    
                //the countries geojson has the name and a few ISO codes
                case DATASET_COUNTRIES:
                    console.log(DATASET_COUNTRIES
                            + " " + entity.properties.name
                            + " " + entity.properties.iso_a2
                            + " " + entity.properties.iso_a3
                            + " " + entity.properties.iso_n3
                    );
                    break;
                    
                //the bermuda triangle geojson also has different properties
                case DATASET_BERMUDATRIANGLE:
                    console.log(DATASET_BERMUDATRIANGLE
                            + " " + entity.properties.quality
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
        }
        
        //now let's actually write something to the display area
        //there's simple behaviour here to only write one thing at a time
        //but you could combine data from multiple picked entities if you liked
        
        var outputText = "";
        
        //there's a few ways to check if a json property exists
        if (entities.hasOwnProperty(DATASET_SEAMONSTERS)) {
            outputText = "OH NO A SEA MONSTER";
        }
        else if (typeof entities[DATASET_TITANIC] !== "undefined") {
            outputText = entities[DATASET_TITANIC].name;
        }
        else if (DATASET_BERMUDATRIANGLE in entities) {
            outputText = entities[DATASET_BERMUDATRIANGLE].name;
        }
        else if (entities.hasOwnProperty(DATASET_COUNTRIES)) {
            outputText = entities[DATASET_COUNTRIES].properties.name;
        }
        else {
            outputText = latitude.toFixed(5) + "," + longitude.toFixed(5);
            
        }
        orbitText("text_display", true, 25, outputText);
        
    }
    
    /**
     * For each entity with a valid image path in entity.properties.image, the
     * image is applied as a Material.
     * @param {Cesium.EntityCollection} entities The collection of entities.
     */
    function applyImageMaterial(entities) {

        //for each entity
        var id, entity;
        for (var i = 0; i < entities.values.length; ++i) {

            //get a modifiable entity instance
            id = entities.values[i].id;
            entity = entities.getById(id);

            //apply image material if appropriate
            if (entity.properties.hasOwnProperty("image")) {
                entity.polygon.material = new Cesium.ImageMaterialProperty({
                    image : entity.properties.image
                });
            }
        }
    }
    
    //if not using this.method syntax, need to expose strategy 
    return {
        onPageLoad: onPageLoad,
        onCesiumInstanceCreate: onCesiumInstanceCreate,
        onMouseStop: onMouseStop
    };
    
};