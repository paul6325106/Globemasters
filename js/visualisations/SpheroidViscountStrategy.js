/***
 * This visualisation is meant to be a recreation of the original Globemasters
 * visualisation, and was developed as part of the web reimplementation
 * prototype. The name of the prototype was 'SpheroidViscount', and that name
 * survives here.
 */

var SpheroidViscountStrategy = function() {
    
    
    this.onPageLoad = function() {
        var container = document.getElementById("table_container");
        
        var imageRotator = document.createElement("div");
        imageRotator.id = "image_rotator";
        imageRotator.className = "rotator";
        container.appendChild(imageRotator);
        
        var nameRotator = document.createElement("div");
        nameRotator.id = "name_rotator";
        nameRotator.className = "rotator";
        container.appendChild(nameRotator);
        
        //set initial data
        orbitText("name_rotator", true, 50, "Australia");
        loadFromFlickr("image_rotator", "Australia", 12);
    },
    
    
    
    this.onCesiumInstanceCreate = function() {},
    
    
    
    this.onCountryDetect = function(name) {
        orbitText("name_rotator", true, 50, name);
        loadFromFlickr("image_rotator", name, 12);
    };
    
    
    
    /**
     * Loads images from Flickr, sets them to the container and rotates them.
     * TODO I am confident that I can read the image size and programmatically
     *      determine the maximum number of images to set.
     * @post TODO
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
    
    
};
