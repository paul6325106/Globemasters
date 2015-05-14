<?php
header('content-type: text/plain');

require "db_conf.php";

ob_start("htmlspecialchars");

$dataset_id = filter_input(INPUT_GET, "dataset_id", FILTER_SANITIZE_NUMBER_INT);
$field_id = filter_input(INPUT_GET, "field_id", FILTER_SANITIZE_NUMBER_INT);
//TODO choose an intelligent filter
$country = filter_input(INPUT_GET, "country");

$select_params = array(
        ":dataset_id" => $dataset_id,
        ":field_id" => $field_id,
        ":country" => $country
);

$select_stmt = 
        "SELECT de.val " .
        "FROM data_entries de " .
        "INNER JOIN fields f " .
        "ON de.field_id = f.field_id " .
        "INNER JOIN countries c " .
        "ON de.country_id = c.country_id " .
        "WHERE de.dataset_id = :dataset_id " .
        "AND de.field_id = :field_id " .
        "AND de.country = :country";

if ( isset($_GET("limit")) && is_int($_GET("limit")) ) {
    $limit = filter_input(INPUT_GET, "dataset_id", FILTER_SANITIZE_NUMBER_INT);
    $select_stmt .= " LIMIT $limit;";
}
else {
    $select_stmt .= ";";
}

$select_query = $db -> prepare($select_stmt);
$select_query -> execute($select_params);

echo implode("<br>", $select_query -> fetchAll());
ob_flush();

?>