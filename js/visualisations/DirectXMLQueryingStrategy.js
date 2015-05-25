/***
 * Queries an XML file directly for data.
 * Just because you can, doesn't mean you should.
 */

var DirectXMLQueryingStrategy = function() {
    
    CountryIdentifierEnum = {
        NAME: "name",
        ISO_A2: "iso_a2",
        ISO_A3: "iso_a3",
        ISO_N3: "iso_n3"
    };
    
    var xml = null;
    var countryIdentifier = null;
    var countryField = null;
    var textField = null;
    var imageField = null;
    
    var textRotator;
    var imageRotator;
    
    this.onPageLoad = function(parameterString) {
        importCSSJS("css/visualisations/DirectXMLQueryingStrategy.css");
        createHTMLElements();
        setPaths(parameterString);
    },
    
    this.onCesiumInstanceCreate = function(viewer) {
        
    },
    
    this.onCountryDetect = function(name, iso_a2, iso_a3, iso_n3) {
        var texts;
        var imagePaths;
        
        var countryDetected = getRelevantCountryValue(name, iso_a2, iso_a3, iso_n3);
        var countries = xml.getElementsByTagName(countryField);
        
        for (var i = 0; i < countries.length; ++i) {
            if (countryDetected === countries[i].childNodes[0].nodeValue) {
                texts = readNestedFields(countries[i], textField);
                imagePaths = readNestedFields(countries[i], imageField);
                break;
            }
        }
        
        //TODO write to rotators (if data found)
    };
    
    /**
     * Creates the HTML elements for this strategy.
     */
    function createHTMLElements() {
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
     * Sets the various paths from GET.
     * @param {string} parameterString GET parameters from the URL.
     */
    function setPaths(parameterString) {
        var vars = parameterString.split("&");
        for (var i = 0; i < vars.length; ++i) {
            var pair = vars[i].split("=");
            switch (pair[0]) {
                case "xml":
                    xml = loadXMLDoc(pair[1]);
                    break;
                case "country_identifier":
                    countryIdentifier = pair[1];
                    break;
                case "country_field":
                    countryField = pair[1];
                    break;
                case "text_field":
                    textField = pair[1];
                    break;
                case "image_field":
                    imageField = pair[1];
                    break;
                default:
                    //throw "Unrecognised parameter: " + pair[0];
                    console.log("Unrecognised parameter: " + pair[0]);
            }
        }
        
        //TODO alert and exception if data is unset
    }
    
    /**
     * Loads an XML document from its filepath.
     * @param {string} filepath Filepath to the XML document.
     * @returns {Node|Document} Top level node of the XML document.
     */
    function loadXMLDoc(filepath) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", filepath, false);
        xmlhttp.send();
        return xmlhttp.responseXML;
    }
    
    /**
     * Returns the correct country data for this dataset.
     * @pre countryIdentifier has been set.
     * @see setPaths() for how countryIdentifier is set.
     * @param {String} name The country's name.
     * @param {String} iso_a2 The country's ISO 3166 Alpha-2 code.
     * @param {String} iso_a3 The country's ISO 3166 Alpha-3 code.
     * @param {String} iso_n3 The country's ISO 3166 Alpha-4 code.
     * @returns {string} The correct country data for this dataset.
     */
    function getRelevantCountryValue(name, iso_a2, iso_a3, iso_n3) {
        switch (countryIdentifier) {
            case CountryIdentifierEnum.NAME:
                return name;
            case CountryIdentifierEnum.ISO_A2:
                return iso_a2;
            case CountryIdentifierEnum.ISO_A3:
                return iso_a3;
            case CountryIdentifierEnum.ISO_N3:
                return iso_n3;
            default:
                throw "Invalid countryIdentifier";
        }
    }
    
    /**
     * Reads the data of a nested field into an array.
     * @param {Node} parentElement The top level node to search from.
     * @param {string} nestedFieldName A backslash separated string describing
     *                                 the hierarchy of fields to read.
     * @returns {Array|string} An array containing the contents of all instances
     *                         of the nested field as descendants of the parent.
     */
    function readNestedFields(parentElement, nestedFieldName) {
        var output = new Array();
        
        var splitIndex = nestedFieldName.indexOf("/");
        var nextChildName = (splitIndex > 0) ? nestedFieldName.substring(0, splitIndex) : nestedFieldName;
        var nextNestedField = nestedFieldName.substring(splitIndex + 1, nestedFieldName.length);
        var childElements = parentElement.getElementsByTagName(nextChildName);

        for (var i = 0; i < childElements.length; ++i) {
            if (childElements[i].nodeName === nextChildName) {
                if (splitIndex < 0) {
                    output.push(childElements[i].childNodes[0].nodeValue);
                }
                else {
                    output = output.concat(readNestedField(childElements[i], nextNestedField));
                }
            }
        }
        return output;
    }
    
};