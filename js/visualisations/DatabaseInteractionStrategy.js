/***
 * An untested - UNTESTED! - strategy for interacting with a database. The
 * intention is that a system for loading data is being developed by another
 * student, and it will hopefully intersect with this work eventually.
 */

var DatabaseInteractionStrategy = function() {
    
    CountryIdentifierEnum = {
        NAME: "name",
        ISO_A2: "iso_a2",
        ISO_A3: "iso_a3",
        ISO_N3: "iso_n3"
    };
    
    var countryIdentifier = null;
    
    var datasetId = null;
    var fieldIdText = null;
    var fieldIdImage = null;
    
    var textRotator;
    var imageRotator;
    
    this.onPageLoad = function(parameterString) {
        createHTMLElements();
        setDataIds(parameterString);
        setCountryIdentifier(datasetId);
        //setTextFromDatabase(country)
        //setImagesFromDatabase(country)
    },
    
    this.onCesiumInstanceCreate = function(viewer) {
        //do nothing lol
    },
    
    this.onCountryDetect = function(name, iso_a2, iso_a3, iso_n3) {
        var country;
        
        switch (countryIdentifier) {
            case CountryIdentifierEnum.NAME:
                country = name;
                break;
            case CountryIdentifierEnum.ISO_A2:
                country = iso_a2;
                break;
            case CountryIdentifierEnum.ISO_A3:
                country = iso_a3;
                break;
            case CountryIdentifierEnum.ISO_N3:
                country = iso_n3;
                break;
            default:
                throw "Invalid countryIdentifier";
        }
        
        setTextFromDatabase(country);
        setImagesFromDatabase(country);
    };
    
    /**
     * Creates the HTML elements for this strategy.
     */
    function createHTMLElements() {
        importCSSJS("css/visualisations/DatabaseInteractionStyle.css");
        
        var container = document.getElementById("table_container");
        
        imageRotator = document.createElement("div");
        imageRotator.id = "image_rotator";
        imageRotator.className = "rotator";
        container.appendChild(imageRotator);
        
        textRotator = document.createElement("div");
        textRotator.id = "text_rotator";
        textRotator.className = "rotator";
        container.appendChild(textRotator);
    }
    
    /**
     * Reads the dataset and field ids from GET, and sets the variables
     * accordingly.
     * @param {String} parameterString The GET parameters set to the page.
     * @post datasetId, fieldIdText and fieldIdImage are set if all GET
     *       parameters were set and valid, an alert is displayed otherwise.
     */
    function setDataIds(parameterString) {
        var vars = parameterString.split("&");
        for (var i = 0; i < vars.length; ++i) {
            var pair = vars[i].split("=");
            switch (pair[0]) {
                case "dataset_id":
                    datasetId = pair[1];
                    break;
                case "field_id_text":
                    fieldIdText = pair[1];
                    break;
                case "field_id_image":
                    fieldIdImage = pair[1];
                    break;
                default:
                    //throw "Unrecognised parameter: " + pair[0];
                    console.log("Unrecognised parameter: " + pair[0]);
            }
        }
        
        if (datasetId === null || fieldIdText === null || fieldIdImage === null) {
            alert("Required GET parameters: dataset_id, field_id_text, field_id_image.");
            return;
        }
    }
    
    /**
     * Sets the country identifier enum by querying the database
     * @param {int} datasetId The id associated with the desired dataset.
     * @post countryIdentifier is set with a value of the enum
     *       CountryIdentifierEnum if valid data was returned, an alert is
     *       displayed otherwise. 
     */
    function setCountryIdentifier(datasetId) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                switch (xmlhttp.responseText) {
                    case "name":
                        countryIdentifier = CountryIdentifierEnum.NAME;
                        return;
                    case "iso_a2":
                        countryIdentifier = CountryIdentifierEnum.ISO_A2;
                        return;
                    case "iso_a3":
                        countryIdentifier = CountryIdentifierEnum.ISO_A3;
                        return;
                    case "iso_n3":
                        countryIdentifier = CountryIdentifierEnum.ISO_N3;
                        return;
                    default:
                        alert("No valid country identifier found.");
                        return;
                }
            }
        };
        var getUrl = "php/db_get_country_identifier.php?dataset_id=" + datasetId;
        xmlhttp.open("GET", getUrl, true);
        xmlhttp.send();
    }
    
    /**
     * Queries the database for the associated dataset and field, then sets the
     * retrieved text to the text rotator.
     * @pre datasetId and fieldIdText have been set.
     *      countryIdentifier is in the correct format for the dataset.
     * @see setCountryIdentifier for obtaining the correct datatype for 
     *      identifying the country.
     * @param {string} country The data identifying the country.
     */
    function setTextFromDatabase(country) {
        var xmlhttp = new XMLHttpRequest();
        
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                
                //TODO set text to textRotator
                
            }
        };
        
        var getUrl = "php/db_get_data.php"
                + "?dataset_id=" + datasetId
                + "&field_id=" + fieldIdText
                + "&country=" + country;
        xmlhttp.open("GET", getUrl, true);
        xmlhttp.send();
    }
    
    /**
     * Queries the database for the associated dataset and field, then sets the
     * retrieved image(s) to the image rotator.
     * @pre datasetId and fieldIdImage have been set.
     *      countryIdentifier is in the correct format for the dataset.
     * @see setCountryIdentifier for obtaining the correct datatype for 
     *      identifying the country.
     * @param {string} country The data identifying the country.
     */
    function setImagesFromDatabase(country) {
        var xmlhttp = new XMLHttpRequest();
        
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                
                //TODO set images to imageRotator
                
            }
        };
        
        var getUrl = "php/db_get_data.php"
                + "?dataset_id=" + datasetId
                + "&field_id=" + fieldIdImage
                + "&country=" + country;
        xmlhttp.open("GET", getUrl, true);
        xmlhttp.send();
    }
    
};