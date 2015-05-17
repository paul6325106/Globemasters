<?php
/*
 * Retrieves the datasetId from GET, then queries the GM database for and echos
 * the type of data used to identify countries in the corresponding dataset.
 */

header('content-type: text/plain');
require_once "db_handler.php";

$datasetId = filter_input(INPUT_GET, "dataset_id", FILTER_SANITIZE_NUMBER_INT);
$dbh = new Globemasters\DatabaseHandler();
echo $dbh->getCountryIdentifier($datasetId);

?>