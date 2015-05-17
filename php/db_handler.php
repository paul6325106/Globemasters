<?php

namespace Globemasters;

/***
 * Class for connecting to the GM database for generic data.
 */
class DatabaseHandler {
    
    //database information
    private static $host = "localhost";
    private static $name = "globemasters";
    private static $username = "root";
    private static $password = "";
    
    //options for the PDO connection
    private static $options = array(
        PDO::ATTR_PERSISTENT => true
    );
    
    //PDO instance
    private $db;
    
    public function __construct() {
        $dsn = sprintf("mysql:host=%s;dbname=%s", $this->host, $this->name);
        
        $this->db = new PDO(
                $dsn, 
                $this->username, 
                $this->password,
                $this->options
        );
    }
    
    /**
     * Retrieves the type of data used to identify countries in this dataset.
     * @param int $datasetId The id corresponding to the desired dataset.
     * @return string The type of data used to identify the country.
     */
    public function getCountryIdentifier($datasetId) {
        $selectQuery = $this->db->prepare(
                "SELECT country_identifier " .
                "FROM datasets " .
                "WHERE dataset_id = :dataset_id;"
        );
        
        $selectParams = array(':dataset_id' => $datasetId);
        $selectQuery->execute($selectParams);
        return $selectQuery->fetch();
    }
    
    /**
     * Retrieves the data for a field and country in a dataset. May return
     * multiple values, in the event of duplicate fields.
     * @see getCountryIdentifier for obtaining the type of data used to identify
     *      countries in the dataset.
     * @param int $datasetId The id corresponding to the desired dataset.
     * @param int $fieldId The id corresponding to the desired field.
     * @param string $country The name or code of the country.
     * @param int $limit (optional) The maximum number of results to retrieve.
     * @return array Array of data corresponding to the country and field.
     */
    public function getFieldData($datasetId, $fieldId, $country, $limit = NULL) {
        $selectParams = array(
                ":dataset_id" => $datasetId,
                ":field_id" => $fieldId,
                ":country" => $country
        );
        
        $selectStmt = "SELECT de.val"
                . " FROM data_entries de"
                . " INNER JOIN fields f"
                . " ON de.field_id = f.field_id"
                . " INNER JOIN countries c"
                . " ON de.country_id = c.country_id"
                . " WHERE de.dataset_id = :dataset_id"
                . " AND de.field_id = :field_id"
                . " AND de.country = :country";
        
        if ($limit !== NULL ) {
            $selectParams[":limit"] = $limit;
            $selectStmt .= " LIMIT :limit;";
        }
        else {
            $selectStmt .= ";";
        }
        
        $selectQuery = $this->db->prepare($selectStmt);
        $selectQuery->execute($selectParams);
        
        return $selectQuery->fetchAll();
    }
    
}

?>