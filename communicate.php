<?php

$m = isset($_GET['m']) ? $_GET['m'] : '';
$t = isset($_GET['t']) ? $_GET['t'] : '';
$pass = 'dHV0dTUxMTA';
$server = 'http://www.jingts.com/s/testsend.php?p=';

$result = file_get_contents($server.$pass.'&m='.$m);
echo 'success';

exit(0);

?>