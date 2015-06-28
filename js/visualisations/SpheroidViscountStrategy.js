/***
 * This visualisation is meant to be a recreation of the original Globemasters
 * visualisation, and was developed as part of the web reimplementation
 * prototype. The name of the prototype was 'SpheroidViscount', and that name
 * survives here.
 * 
 * On selection of a country, the name of the country and images from Flickr are
 * displayed around the annulus.
 */

function SpheroidViscountStrategy() {
    
    var DATASET_COUNTRIES = "0";
    
    
    function onPageLoad(container) {
        var imageRotator = document.createElement("div");
        imageRotator.id = "image_rotator";
        container.appendChild(imageRotator);
        
        var nameRotator = document.createElement("div");
        nameRotator.id = "name_rotator";
        container.appendChild(nameRotator);
    }
    
    
    function onCesiumInstanceCreate(viewer) {
        
        var path = "json/ne-countries-110m_no-abbreviations.json";
        
        var options = {
            stroke: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.75),
            fill: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.01)
        };
        
        var dataSource = Cesium.GeoJsonDataSource.load(path, options);
        
        viewer.dataSources.add(dataSource).then(
            function(dataSource) {

                //apply dataset id to entities
                applyDatasetId(DATASET_COUNTRIES, dataSource.entities);

                //set initial data
                orbitText("name_rotator", true, 50, "Australia");
                loadFromFlickr("image_rotator", "Australia", 12);
            }
        );
    }
    
    
    function onMouseStop(latitude, longitude, entities) {
        if (entities.hasOwnProperty(DATASET_COUNTRIES)) {
            var entity = entities[DATASET_COUNTRIES];
            var name   = entity.properties.name;
            var iso_a2 = entity.properties.iso_a2;
            var iso_a3 = entity.properties.iso_a3;
            var iso_n3 = entity.properties.iso_n3;

            console.log("MOUSE STOPPED:"
                    + " " + latitude
                    + " " + longitude
                    + " " + name
                    + " " + iso_a2
                    + " " + iso_a3
                    + " " + iso_n3
            );

            //store the last tag, so that we don't keep reloading the same call
            if (this.onMouseStop.lastTag !== name) {
                this.onMouseStop.lastTag = name;
                
                //set data to display
                orbitText("name_rotator", true, 50, name);
                loadFromFlickr("image_rotator", name, 12);
            }
        }
    }
    onMouseStop.lastTag = "";
    
    
    /**
     * Loads images from Flickr, sets them to the container and rotates them.
     * TODO I am confident that I can read the image size and programmatically
     *      determine the maximum number of images to set.
     * @param {String} containerId The id of the container to load images into.
     * @param {String} searchTag The term to search Flickr for.
     * @param {int} maxImages The maximum number of images to retrieve from
     *                        Flickr.
     */
    function loadFromFlickr(containerId, searchTag, maxImages) {
        if (loadFromFlickr.inProgress) {
            //TODO store the most recent prevented call
            return;
        } else {
            loadFromFlickr.inProgress = true;
        }

        var apiKey = "ff121a160c54684540cf8d53b25ae4f4";
        var container = document.getElementById(containerId);

        var query = "https://api.flickr.com/services/rest/"
                + "?method=flickr.photos.search"
                + "&api_key=" + apiKey
                + "&tags=" + encodeURIComponent(searchTag) //+ ",landmark"
                + "&tag_mode=all"
                + "&sort=interestingness-desc"
                + "&per_page=" + maxImages
                + "&format=json"
                + "&nojsoncallback=1"
                + "&safe_search=1"
                + "&content_type=6"
                ;

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

                var photo, urlThumb, divDOM;

                var json = JSON.parse(xmlhttp.responseText);

                /* XXX
                 * the intention is to replace existing images where possible
                 * instead of deleting old elements and creating new ones in place
                 * it looks a bit better when images are loading
                 * only delete/create elements if loaded elements != imageCount
                 */

                var loadedImages = json.photos.photo.length;
                var createdImages = container.childNodes.length;

                //if loaded < current, remove remainder and orbit
                if (loadedImages < createdImages) {
                    for (var i = 0; i < createdImages - loadedImages; ++i) {
                        container.removeChild(container.lastChild);
                    }

                //if loaded > current, add empty images before setting and orbit
                } else if (loadedImages > createdImages) {
                    for (var i = 0; i < loadedImages - createdImages; ++i) {
                        divDOM = document.createElement("div");
                        divDOM.setAttribute("background", "");
                        container.appendChild(divDOM);
                    }
                }

                //if number of images changed, save count and re-orbit
                if (loadedImages != createdImages) orbitElements(containerId);

                for (var i = 0; i < loadedImages; i++) {
                    photo = json.photos.photo[i];

                    //urlPhoto = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
                    //XXX image sizes: http://www.flickr.com/services/api/misc.urls.html
                    urlThumb = "http://farm" + photo.farm + ".static.flickr.com/"
                            + photo.server + "/"
                            + photo.id + "_" + photo.secret + "_m.jpg";

                    //set the image
                    container.childNodes[i].style.background = "url(" + urlThumb + ")";
                }
            }

            //separate if test, in case of status 404
            if (xmlhttp.readyState == 4) {
                loadFromFlickr.inProgress = false;
                //TODO perform the latest stored call
            }
        };

        xmlhttp.open("GET", query, true);
        xmlhttp.send();
    }
    
    
    return {
        onPageLoad: onPageLoad,
        onCesiumInstanceCreate: onCesiumInstanceCreate,
        onMouseStop: onMouseStop
    };
    
};
