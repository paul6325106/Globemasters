<?php
/*
 * Retrieves the datasetId, fieldId, country and optionally the limit from GET.
 * Then queries the GM database for the corresponding field data and echos.
 */

header('content-type: text/plain');
require_once "db_handler.php";

ob_start("htmlspecialchars");

$datasetId = filter_input(INPUT_GET, "dataset_id", FILTER_SANITIZE_NUMBER_INT);
$fieldId = filter_input(INPUT_GET, "field_id", FILTER_SANITIZE_NUMBER_INT);
$country = filter_input(INPUT_GET, "country", FILTER_SANITIZE_STRING);
    
$dbh = new Globemasters\DatabaseHandler();

if ( isset($_GET["limit"]) && is_int($_GET["limit"]) ) {
    $limit = filter_input(INPUT_GET, "dataset_id", FILTER_SANITIZE_NUMBER_INT);
    $output = $dbh->getFieldData($datasetId, $fieldId, $country, $limit);
}
else {
    $output = $dbh->getFieldData($datasetId, $fieldId, $country);
}

echo implode("<br>", $output);

ob_flush();

?>
