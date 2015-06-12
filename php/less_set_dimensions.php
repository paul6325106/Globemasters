<?php

/* TODO
 * Prefixing
 * Stop preg_replace-ing the same substring over and over
 */

require_once "./less.php/Less.php";

$options = array(
    "compress" => true
);

$dimensions = readDimensionsIntoArray();

try {
    $parser = new Less_Parser($options);
    $parser->ModifyVars($dimensions);
    parseLessFolder($parser, "../less/");
}
catch(Exception $e){
    die($e->getMessage());
}





/**
 * Reads the GET parameters into an array. Keys are the corresponding LESS
 * parameters. Values have the "px" suffix, as is the appropriate CSS notation.
 * @pre "inner" and "outer" are set, "top", "left" and "rotate" are optional.
 * @return array An array with the GET values set.
 */
function readDimensionsIntoArray() {
    if (isset($_GET["top"])) {
        $top_displacement = filter_input(INPUT_GET, "top", FILTER_SANITIZE_NUMBER_INT);
    }
    else {
        $top_displacement = 0;
    }
    
    if (isset($_GET["left"])) {
        $left_displacement = filter_input(INPUT_GET, "left", FILTER_SANITIZE_NUMBER_INT);
    }
    else {
        $left_displacement = 0;
    }
    
    if (isset($_GET["inner"])) {
        $inner_diameter = filter_input(INPUT_GET, "inner", FILTER_SANITIZE_NUMBER_INT);
    }
    else {
        die("'inner' is not set.");
    }
    
    if (isset($_GET["outer"])) {
        $outer_diameter = filter_input(INPUT_GET, "outer", FILTER_SANITIZE_NUMBER_INT);
    }
    else {
        die("'outer' is not set.");
    }
    
    if (isset($_GET["outer"])) {
        $outer_diameter = filter_input(INPUT_GET, "outer", FILTER_SANITIZE_NUMBER_INT);
    }
    else {
        die("'outer' is not set.");
    }
    
    if (isset($_GET["rotate"])) {
        $perspective_rotate = filter_input(INPUT_GET, "rotate", FILTER_SANITIZE_NUMBER_INT);
    }
    else {
        $perspective_rotate = 0;
    }
    
    return array(
        "displacement_top"  => $top_displacement    . "px",
        "displacement_left" => $left_displacement   . "px",
        "diameter_inner"    => $inner_diameter      . "px",
        "diameter_outer"    => $outer_diameter      . "px",
        "perspective_rotate"=> $perspective_rotate  . "deg"
    );
}

/**
 * Recursively searches a folder for Less files, then parses any found. The
 * filepath is translated such that the file extension and any folder named
 * "less" case insensitive is translated to "css".
 * @throws Exception on Less_Parser error.
 * @param Less_Parser $parser The less parser instance.
 * @param string $dir_less Path to the directory containing Less files.
 */
function parseLessFolder($parser, $dir_less) {
    
    //get files, slice "." and ".." directories
    $files_less = scandir($dir_less, SCANDIR_SORT_ASCENDING);
    $files_less = array_slice($files_less, 2);
    
    foreach ($files_less as $file_less) {
        
        $path_less = stitchDirFile($dir_less, $file_less);
        
        if (is_dir($path_less)) {
            parseLessFolder($parser, $path_less);
        }
        else {
            createCSSFolder($dir_less);
            parseLessFile($parser, $path_less);
        }
    }
}

/**
 * Stitches the dir and file together into a filepath. Inserts a forward slash
 * if necessary.
 * @param string $dir The directory path.
 * @param string $file The file name, with extension.
 * @return string The filepath.
 */
function stitchDirFile($dir, $file) {
    if (substr($dir, -1) == '/' || $file{0} == '/') {
        return $dir.$file;
    }
    else {
        return $dir.'/'.$file;
    }
}

/**
 * Creates a folder for CSS files if it doesn't exist yet. The filepath is
 * translated from a directory intended for Less files.
 * @param string $dir_less Path to the directory containing Less files.
 */
function createCSSFolder($dir_less) {
    $patterns = array(
        '/(?<=\.)less$/i',  //extension
        '/less(?=\/)/i'     //folder
    );
    $replacement = 'css';
    
    //create css folder is it doesn't exist
    $dir_css = preg_replace($patterns, $replacement, $dir_less);
    if (!file_exists($dir_css)) {
        mkdir($dir_css, 0777, true);
    }
}

/**
 * Parses a Less file, and outputs a CSS file to a translated filepath. The
 * filepath is translated such that the file extension and any folder named
 * "less" case insensitive is translated to "css".
 * @throws Exception on Less_Parser error.
 * @param Less_Parser $parser The less parser instance.
 * @param string $path_less Path to the Less file.
 */
function parseLessFile($parser, $path_less) {
    $patterns = array(
        '/(?<=\.)less$/i',  //extension
        '/less(?=\/)/i'     //folder
    );
    $replacement = 'css';
    
    $path_css = preg_replace($patterns, $replacement, $path_less);
    $parser->parseFile($path_less, "");
    $css = $parser->getCss();
    file_put_contents($path_css, $css);
}

?>