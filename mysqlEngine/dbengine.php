<?php
$_SGLOBAL = $_SCONFIG = $_SBLOCK = $_TPL = $_SCOOKIE = $_SN = $space = array();

define('S_ROOT', dirname(__FILE__).DIRECTORY_SEPARATOR);

$mtime = explode(' ', microtime());

$_SGLOBAL['timestamp'] = $mtime[1];

$_SGLOBAL['supe_starttime'] = $_SGLOBAL['timestamp'] + $mtime[0];

$_SC = array();
$_SC['dbhost']  		= 'localhost'; 
$_SC['dbuser']  		= 'root'; 
$_SC['dbpw'] 	 		= '';
$_SC['dbcharset'] 		= 'utf8'; 
$_SC['pconnect'] 		= 0; 
$_SC['dbname']  		= 'portfolio'; 
$_SC['tablepre'] 		= 'group_'; 
$_SC['charset'] 		= 'utf-8'; 


require_once('class_mysql.php');
require_once('function_common.php');

dbconnect();

/*

CREATE TABLE `Portfolio`.`group_1` ( `id` INT NOT NULL AUTO_INCREMENT , `code` TEXT NOT NULL , `name` TEXT NOT NULL , `purchasePrice` FLOAT NOT NULL , `currentPrice` FLOAT NOT NULL , `nos` INT NOT NULL , `currentCost` FLOAT NOT NULL , `timestamp` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

*/

?>