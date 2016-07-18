<?php
/*
	[Ucenter Home] (C) 2007-2008 Comsenz Inc.
	$Id: config.new.php 9293 2008-10-30 06:44:42Z liguode $
*/

//Ucenter Home配置参数
$_SC = array();
$_SC['dbhost']  		= 'tutu5110.db.9025065.hostedresource.com'; //服务器地
$_SC['dbuser']  		= 'tutu5110'; //用户
$_SC['dbpw'] 	 		= 'Tutu875110'; //密码
$_SC['dbcharset'] 		= 'utf8'; //字符集
$_SC['pconnect'] 		= 0; //是否持续连接
$_SC['dbname']  		= 'tutu5110'; //数据库
$_SC['tablepre'] 		= 'jing_'; //表名前缀
$_SC['charset'] 		= 'utf-8'; //页面字符集

$_SC['gzipcompress'] 	= 0; //启用gzip

$_SC['cookiepre'] 		= 'jing_'; //COOKIE前缀
$_SC['cookiedomain'] 	= ''; //COOKIE作用域
$_SC['cookiepath'] 		= '/'; //COOKIE作用路径

$_SC['attachdir']		= './attachment/'; //附件本地保存位置(服务器路径, 属性 777, 必须为 web 可访问到的目录, 相对目录务必以 "./" 开头, 末尾加 "/")
$_SC['attachurl']		= 'attachment/'; //附件本地URL地址(可为当前 URL 下的相对地址或 http:// 开头的绝对地址, 末尾加 "/")

$_SC['siteurl']			= ''; //站点的访问URL地址(http:// 开头的绝对地址, 末尾加 "/")，为空的话，系统会自动识别。

$_SC['tplrefresh']		= 0; //判断模板是否更新的效率等级，数值越大，效率越高; 设置为0则永久不判断



?>