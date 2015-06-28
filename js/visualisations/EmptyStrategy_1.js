/***
 * An empty strategy to show how the strategy methods should be implemented.
 */

function EmptyStrategy() {
    
    function onPageLoad(container) {
        
    }
    
    function onCesiumInstanceCreate(viewer) {
        
    }
    
    function onMouseStop(latitude, longitude, entities) {
        
    }
    
    return {
        onPageLoad: onPageLoad,
        onCesiumInstanceCreate: onCesiumInstanceCreate,
        onMouseStop: onMouseStop
    };
    
};