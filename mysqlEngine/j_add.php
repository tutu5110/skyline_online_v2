<?php
/*
	[UCenter Home] (C) 2007-2008 Comsenz Inc.
	$Id: space_index.php 10806 2008-12-23 07:14:20Z zhengqingpeng $
*/

if(!defined('FROM_INDEX')) {
	exit('Access Denied');
}

$GLOBALS['catname'] = array('Art','Professional');
$GLOBALS['subcatfilename']= array('cspace','web','photo','pt_graphic','installation');
$GLOBALS['subcatname']= array('Commercial Space','Web Projects','Photography','Print & Graphics','New Genre');
$GLOBALS['year'] = array(2014,2013,2012,2011);
if(isset($_POST['submit'])){
	
	$name = safe($_POST['name']);
	$filename = safe($_POST['filename']);
	$cat = safe($_POST['cat']);
	$catname = getcatname($cat);
	$subcat = safe($_POST['subcat']);
	$subcatname = getsubcatname($subcat);
	$subcatfilename = getsubcatfilename($subcat);
	$year = getyear(safe($_POST['year']));
	$vide = safe($_POST['video']);
	$arr = array(
				 'name' =>$name,
				 'filename' => $filename,
				 'cat' => $cat,
				 'catname' => $catname,
				 'subcat' => $subcat,
				 'subcatname' => $subcatname,
				 'subcatfilename' => $subcatfilename,
				 'year'=>$year,
				 'time' => $_SGLOBAL['timestamp']
				 );
		$success = inserttable('work',$arr,1);
		if($success){
		echo 'New Artwork created successfully!';
		echo '<script language=\'javascript\'>window.location.href=\'index.php?do=add\'</script>';
		if($video){
			copy('template/default/wavelet.htm','template/default/'.$filename.'.htm');	
		} else{
			copy('template/default/laulan.htm','template/default/'.$filename.'.htm');	
		}
		// create image directory
		$path = 'image/'.$filename;
		if (!file_exists($path)) {
			mkdir($path, 0777, true);
		}
		//copy default htm without video
	}
	
}


function getyear($year){
	return $GLOBALS['year'][intval($year)-1];	
}
function getsubcatname($subcat){
	
	return $GLOBALS['subcatname'][intval($subcat)-1];
}

function getsubcatfilename($subcat){
	return $GLOBALS['subcatfilename'][intval($subcat)-1];	
}
function getcatname($cat){
	return $GLOBALS['catname'][intval($cat)-1];	
}
	
	$blogtitle[0]['desc'] = htmlspecialchars_decode(nl2br($blogtitle[0]['desc']));
	
$siteDesc  = 'Official Site | Blog and daily life of JING QIAN';
include_once template("j_add");


?>
