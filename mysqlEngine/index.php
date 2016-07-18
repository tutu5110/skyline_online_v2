<?php
/*
	[UCenter Home] (C) 2007-2008 Comsenz Inc.
	$Id: space.php 10953 2009-01-12 02:55:37Z liguode $
*/
@define('FROM_INDEX', TRUE);
//程序目录
define('S_ROOT', dirname(__FILE__).DIRECTORY_SEPARATOR);

include_once('common.php');


//允许动作
$dos = array('cv', 'pf', 'mood', 'blog','contact','blog','add','all');
$do = (!empty($_GET['do']) && in_array($_GET['do'], $dos))?$_GET['do']:'pf';

//$do = 'pf';
$active_pf = 'class="active_pf"';

$css = '@import url(css/pf.css);';

include_once(S_ROOT."./source/j_{$do}.php");




?>