<?php
header('content-type: text/plain');

require "db_conf.php";

$dataset_id = filter_input(INPUT_GET, "dataset_id", FILTER_SANITIZE_NUMBER_INT);

$select_query = $db->prepare(
        "SELECT country_identifier " .
        "FROM datasets " .
        "WHERE dataset_id = :dataset_id;"
);

$select_params = array(':dataset_id' => $dataset_id);
$select_query -> execute($select_params);
echo $select_query -> fetch();

?>