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
     * @param {Strategy} strategy The visualisation strategy to be used.
     */
    setStrategy: function(strategy) {
        this.strategy = strategy;
    },
    
    /**
     * To be called when the page is loaded.
     * @param {String} parameterString The GET parameters set to the page
     */
    onPageLoad: function(parameterString) {
        this.strategy.onPageLoad(parameterString);
    },
    
    /**
     * To be called after the Cesium instance has been created.
     * @param {Cesium.Viewer} viewer The base Cesium widget.
     */
    onCesiumInstanceCreate: function(viewer) {
        this.strategy.onCesiumInstanceCreate(viewer);
    },
    
    //TODO onPageLoadingFinish
    
    /**
     * To be called when an entity is picked from the centre point. The entity
     * must have a globemastersDatasetId property. The easiest way to ensure
     * this isto use the loadGlobeData() helper method.
     * @param {Cesium.Entity} entity The picked entity.
     */
    onEntityPick: function(entity) {
        this.strategy.onEntityPick(entity);
    }
    
};
