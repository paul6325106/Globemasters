<?php

/***
 * Info for connecting to the GM database for generic data.
 */

$databasehost = "localhost";
$databasename = "globemasters";
$databaseusername = "root";
$databasepassword = "";

$db = new PDO(
        sprintf("mysql:host=%s;dbname=%s", $databasehost, $databasename), 
        $databaseusername, 
        $databasepassword
        );

?>