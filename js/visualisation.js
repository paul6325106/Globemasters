/*** 
 * We're using the Strategy pattern for swapping out table visualisations.
 * This class is the context.
 * Refer to visualisations/ExampleStrategy.js for hints on how to write you own
 * strategy for Globemasters visualisation. Then import your strategy into the
 * index page along with any associated files, and load it in initialise().
 */

var Visualisation = function() {
    this.strategy = "";
};

Visualisation.prototype = {
    
    /**
     * Sets the visualisation strategy.
     * 
     * @param {Strategy} strategy The visualisation strategy to be used.
     */
    setStrategy: function(strategy) {
        this.strategy = strategy;
    },
    
    /**
     * To be called when the page is loaded.
     * 
     * @param {Element} container The container for table HTML elements.
     */
    onPageLoad: function(container) {
        this.strategy.onPageLoad(container);
    },
    
    /**
     * To be called after the Cesium instance has been created.
     * 
     * @param {Cesium.Viewer} viewer The base Cesium widget.
     */
    onCesiumInstanceCreate: function(viewer) {
        this.strategy.onCesiumInstanceCreate(viewer);
    },
    
    //TODO onPageLoadingFinish
    
    /**
     * To be called when the mouse stops. The latitude and longitude at the
     * centre point are passed on. The entities (obtained with
     * Scene.drillPick()) are also passed on in key/value pairs, where the key
     * is the globemasters_dataset_id. The globemasters_dataset_id value can be
     * hardcoded to the dataset or set with the applyDatasetId() helper method.
     * 
     * @param {Number} latitude  The latitude at the centre point.
     * 
     * @param {Number} longitude The longitude at the centre point.
     * 
     * @param {JSON}   entities  Key/values pairs of the dataset id and entity.
     */
    onMouseStop: function(latitude, longitude, entities) {
        this.strategy.onMouseStop(latitude, longitude, entities);
    }
    
};
