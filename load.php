<?php

$filename = isset($_POST['filename']) ? $_POST['filename'] : '';
if($filename == '')
	exit('No_Filename_Specified');

$raw = file_get_contents($filename);

echo json_encode($raw);

?>