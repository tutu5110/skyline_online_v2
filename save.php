<?php

$raw = isset($_POST['raw']) ? $_POST['raw'] : '';
$filename = isset($_POST['filename']) ? $_POST['filename'] : '';

$data =json_decode(urldecode($raw));

echo $data;

echo file_put_contents($filename, $data);
?>