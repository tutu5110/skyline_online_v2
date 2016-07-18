<?php
/*
	[UCenter Home] (C) 2007-2008 Comsenz Inc.
	$Id: space_index.php 10806 2008-12-23 07:14:20Z zhengqingpeng $
*/

if(!defined('FROM_INDEX')) {
	exit('Access Denied');
}

if(isset($_POST['submit'])){
	$posted = true;
	$message = safe($_POST['content']);
	$username = safe($_POST['username']);
	$contact = safe($_POST['email']);
	$arr = array(
				 'username' =>$username,
				 'message' => $message,
				 'contact' => $contact,
				 'dateline' => $_SGLOBAL['timestamp']
				 );
	if($message == ''){
		$message = 'Sorry, Please leave something for me :)';
		$class = 'class="red"';
	} else {
		$re = inserttable('contact',$arr,1);	
		$message = 'Message sent successfully!';
		$class = 'class="green"';
	}
	
	
}

if(isset($_POST['publish'])){
	$arr = array(
				 'username' => 'Jing.Q',
				 'title' => safe($_POST['title']),
				 'desc' => safe($_POST['content']),
				 'dateline' => $_SGLOBAL['timestamp']
				  );
	$success = inserttable('blog',$arr,1);
		if($success){
		echo 'New Blog published succesfully';
		echo '<script language=\'javascript\'>window.location.href=\'index.php?do=blog\'</script>';
		}
	
	
	}


if(intval($_GET['admin']) == 875110){
	$adminmode = true;
	include_once template("j_blog");
	exit;
}

$blogtitle = array();
	$query = $_SGLOBAL['db']->query("SELECT * FROM ".tname('blog')." ORDER BY `dateline` DESC LIMIT 0,3");
	while ($value = $_SGLOBAL['db']->fetch_array($query)) {
			$blogtitle[] = $value;
	}
	
	$blogtitle[0]['desc'] = htmlspecialchars_decode(nl2br($blogtitle[0]['desc']));
	
$siteDesc  = 'Official Site | Blog and daily life of JING QIAN';

	
	
include_once template("j_blog");


?>
