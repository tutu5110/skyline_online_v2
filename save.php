<?php

$raw = isset($_POST['raw']) ? $_POST['raw'] : '';
$filename = isset($_POST['filename']) ? $_POST['filename'] : '';
$isJSONArr = isset($_POST['isJSONArr']) ? $_POST['isJSONArr'] : false;

if(!$isJSONArr)
	$data =json_decode(urldecode($raw));
else
	$data = $raw;

$t =  file_put_contents($filename, $data);

if($t>0)
	echo $filename.' save successful, new length: '. $t;
?>